import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { pool, query } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import {
  createGuestSession,
  getSessionUser,
  redeemInvite,
} from "../services/auth-service";

// we duplicate the shape here to avoid Hono context typing conflicts
interface SessionUser {
  id: string;
  role: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

const authRouter = new Hono();

// returns session user + profile; require authentication
// AUTH-005 fix: returns householdId from app-level users table
authRouter.get("/me", requireAuth, async (c) => {
  const sessionUser = (c as unknown as { get: (k: string) => unknown }).get(
    "user",
  ) as SessionUser | undefined;
  if (!sessionUser) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  // Fetch the app-level profile for householdId and displayName.
  // The session object alone does not carry householdId.
  const rows = await query<{
    id: string;
    email: string;
    display_name: string;
    household_id: string | null;
    skill_level: string;
  }>(
    "SELECT id, email, display_name, household_id, skill_level FROM users WHERE id = $1",
    [sessionUser.id],
  );
  const profile = rows[0];
  if (!profile) {
    throw new HTTPException(404, { message: "Profile not found" });
  }

  return c.json({
    id: profile.id,
    email: profile.email,
    name: profile.display_name,
    householdId: profile.household_id,
    skillLevel: profile.skill_level,
    role: sessionUser.role,
  });
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
});

// sign-up endpoint -- runs before Auth.js handles its own routes
// AUTH-002 fix: stores hashed_password in users table, not in account table.
// Auth.js DrizzleAdapter has no password column on account. The authorize
// callback now queries users.hashed_password directly.
authRouter.post("/signup", async (c) => {
  const raw = await c.req.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new HTTPException(400, { message: "invalid json" });
  }

  let email: string, password: string, displayName: string;
  try {
    ({ email, password, displayName } = signupSchema.parse(body));
  } catch (e: unknown) {
    const err = e as { errors?: Array<{ message: string }> };
    throw new HTTPException(400, {
      message: err.errors?.[0]?.message ?? "invalid input",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ensure not already registered in auth user table
    const existing = await client.query(
      'SELECT id FROM "user" WHERE email = $1',
      [email],
    );
    if ((existing.rowCount ?? 0) > 0) {
      throw new HTTPException(409, { message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // insert into Auth.js user table (identity record)
    await client.query(
      'INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt") VALUES ($1,$2,$3,false,NOW(),NOW())',
      [userId, email, displayName],
    );

    // insert app-level profile row with hashed_password.
    // We do NOT insert into the account table -- credentials are looked up
    // via users.hashed_password in the authorize callback. See AUTH-002.
    await client.query(
      "INSERT INTO users (id, email, display_name, skill_level, dietary_profile, hashed_password) VALUES ($1,$2,$3,$4,$5,$6)",
      [userId, email, displayName, "beginner", "{}", hashed],
    );

    await client.query("COMMIT");
    return c.json({ message: "Account created" }, 201);
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    if (err instanceof HTTPException) throw err;
    throw err;
  } finally {
    client.release();
  }
});

// create a guest session (public endpoint)
authRouter.post("/guest", async (c) => {
  const { token, guestId } = await createGuestSession();
  return c.json({ token, guestId });
});

// redeem household invite code; user must be authenticated
authRouter.post("/invite/:code", requireAuth, async (c) => {
  const sessionUser = (c as unknown as { get: (k: string) => unknown }).get(
    "user",
  ) as SessionUser | undefined;
  const code = c.req.param("code");
  try {
    if (!sessionUser?.id)
      throw new HTTPException(401, { message: "Unauthorized" });
    await redeemInvite(code, sessionUser.id);
    return c.text("ok");
  } catch (e) {
    if (e instanceof HTTPException) throw e;
    throw new HTTPException(404, { message: "Invite not found" });
  }
});

export default authRouter;
