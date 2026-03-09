import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSessionUser } from "../services/auth-service";
import { db } from "../lib/db";
import { users } from "@staged/db";

// UUID v4 regex -- test IDs must be valid UUIDs to satisfy DB FK constraints.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Deterministic stable UUIDs for well-known test-user aliases.
// Allows route tests to keep using short names while satisfying DB constraints.
const TEST_USER_MAP: Record<string, string> = {
  "test-user": "00000000-0000-4000-8000-000000000001",
  "test-user-1": "00000000-0000-4000-8000-000000000002",
  "test-user-2": "00000000-0000-4000-8000-000000000003",
  userA: "00000000-0000-4000-8000-000000000004",
  userB: "00000000-0000-4000-8000-000000000005",
  userX: "00000000-0000-4000-8000-000000000006",
  userY: "00000000-0000-4000-8000-000000000007",
  userZ: "00000000-0000-4000-8000-000000000008",
  user1: "00000000-0000-4000-8000-000000000009",
  user2: "00000000-0000-4000-8000-000000000010",
  user3: "00000000-0000-4000-8000-000000000011",
  owner: "00000000-0000-4000-8000-000000000012",
};

async function resolveTestUserId(raw: string): Promise<string> {
  // Use the alias map for well-known short names
  const resolved = TEST_USER_MAP[raw] ?? (UUID_RE.test(raw) ? raw : null);
  if (!resolved) {
    // Unknown non-UUID: skip ensurance, return as-is (will likely fail at DB layer)
    return raw;
  }
  // Ensure row exists in users table so FK constraints are satisfied
  await db
    .insert(users)
    .values({
      id: resolved,
      email: `test-${resolved}@test.local`,
      displayName: "Test User",
    })
    .onConflictDoNothing();
  return resolved;
}

const requireAuth: MiddlewareHandler = async (c, next) => {
  let user = await getSessionUser(c.req.raw);
  // test override header allows fake login in tests
  if (!user && process.env.NODE_ENV === "test") {
    const override = c.req.header("x-test-user-id");
    if (override) {
      const id = await resolveTestUserId(override);
      user = { id, role: "owner" } as any;
    }
  }
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  c.set("user", user);
  await next();
};

const optionalAuth: MiddlewareHandler = async (c, next) => {
  let user = await getSessionUser(c.req.raw);
  // test override header allows multiple fake users during tests
  if (process.env.NODE_ENV === "test") {
    const override = c.req.header("x-test-user-id");
    if (override) {
      const id = await resolveTestUserId(override);
      user = { id, role: "owner" } as any;
    }
  }
  if (user) {
    c.set("user", user);
  }
  await next();
};

export { optionalAuth, requireAuth };
