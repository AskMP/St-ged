import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { pool, query, db } from "../lib/db";
import { users } from "@staged/db";
import { eq } from "drizzle-orm";
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
  const [profile] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      householdId: users.householdId,
      skillLevel: users.skillLevel,
    })
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);

  if (!profile) {
    throw new HTTPException(404, { message: "Profile not found" });
  }

  return c.json({
    id: profile.id,
    email: profile.email,
    name: profile.displayName,
    householdId: profile.householdId,
    skillLevel: profile.skillLevel,
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

  // Check if already registered (raw SQL -- Auth.js "user" table not in Drizzle schema)
  const existingRows = await query<{ id: string }>(
    'SELECT id FROM "user" WHERE email = $1',
    [email],
  );
  if (existingRows.length > 0) {
    throw new HTTPException(409, { message: "Email already registered" });
  }

  const hashed = await bcrypt.hash(password, 12);
  const userId = uuidv4();

  // Insert into Auth.js "user" table (identity record, not in Drizzle schema)
  // Raw SQL is intentional here -- Auth.js owns this table structure.
  await pool.query(
    'INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt") VALUES ($1,$2,$3,false,NOW(),NOW())',
    [userId, email, displayName],
  );

  // Insert app-level profile row with hashed_password via Drizzle.
  // We do NOT insert into the account table -- credentials are looked up
  // via users.hashed_password in the authorize callback. See AUTH-002.
  await db.insert(users).values({
    id: userId,
    email,
    displayName,
    skillLevel: "beginner",
    dietaryProfile: {},
    hashedPassword: hashed,
  });

  return c.json({ message: "Account created" }, 201);
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
