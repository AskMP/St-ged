import jwt from "jsonwebtoken";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { households, householdMembers, users } from "@staged/db";

export interface SessionUser {
  id: string;
  role: string;
  email?: string;
  name?: string;
  householdId?: string;
}

// AUTH-001 fix: Previously checked token.user which Auth.js never sets.
// Auth.js JWT always populates token.sub with the user ID.
// We also check token.userId set by the jwt callback in authConfig.
// See CODE_REVIEW_2026-03-08.md AUTH-001.
//
// AUTH-COOKIE fix (rescue-06): next-auth/jwt v4 getToken() reads req.cookies
// (Next.js IncomingMessage style). Web Fetch API Request objects have no
// .cookies property -- cookies are in the Cookie header. We parse the Cookie
// header into a plain object and attach it to a wrapper so SessionStore can
// read the session token.
export async function getSessionUser(
  req: Request,
): Promise<SessionUser | null> {
  // Parse the Cookie header into a { name: value } map.
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const name = part.slice(0, eqIdx).trim();
    const value = part.slice(eqIdx + 1).trim();
    cookies[name] = value;
  }

  // Construct a req-like object with cookies so getToken() can find the session.
  const reqWithCookies = {
    cookies,
    headers: req.headers,
  };

  const token = await getToken({
    req: reqWithCookies as unknown as Parameters<typeof getToken>[0]["req"],
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
  // Find household by invite code
  const [household] = await db
    .select({ id: households.id })
    .from(households)
    .where(eq(households.inviteCode, inviteCode))
    .limit(1);

  if (!household) {
    throw new Error("invite not found");
  }

  // Insert household member (idempotent via ON CONFLICT DO NOTHING)
  await db
    .insert(householdMembers)
    .values({ householdId: household.id, userId, role: "member" })
    .onConflictDoNothing();

  // Update user's householdId
  await db
    .update(users)
    .set({ householdId: household.id })
    .where(eq(users.id, userId));
}
