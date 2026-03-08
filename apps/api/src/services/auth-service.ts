import jwt from "jsonwebtoken";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../lib/db";

export interface SessionUser {
  id: string;
  role: string;
  email?: string;
  name?: string;
}

// AUTH-001 fix: Previously checked token.user which Auth.js never sets.
// Auth.js JWT always populates token.sub with the user ID.
// We also check token.userId set by the jwt callback in authConfig.
// See CODE_REVIEW_2026-03-08.md AUTH-001.
export async function getSessionUser(
  req: Request,
): Promise<SessionUser | null> {
  const token = await getToken({
    req: req as Parameters<typeof getToken>[0]["req"],
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) return null;

  const id = (token.userId as string) ?? (token.sub as string);
  if (!id) return null;

  return {
    id,
    role: (token.role as string) ?? "member",
    email: token.email as string | undefined,
    name: token.name as string | undefined,
  };
}

export async function createGuestSession(): Promise<{
  token: string;
  guestId: string;
}> {
  const guestId = uuidv4();
  const payload = { role: "guest", guestId };
  const token = jwt.sign(payload, process.env.NEXTAUTH_SECRET ?? "", {
    expiresIn: "7d",
  });
  return { token, guestId };
}

export async function redeemInvite(
  inviteCode: string,
  userId: string,
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // find household by invite code
    const res = await client.query(
      "SELECT id FROM households WHERE invite_code = $1",
      [inviteCode],
    );
    if (res.rowCount === 0) {
      throw new Error("invite not found");
    }
    const householdId = res.rows[0].id as string;
    // add member
    await client.query(
      "INSERT INTO household_members (household_id, user_id, role, joined_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING",
      [householdId, userId, "member"],
    );
    // update user's householdId
    await client.query("UPDATE users SET household_id = $1 WHERE id = $2", [
      householdId,
      userId,
    ]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
