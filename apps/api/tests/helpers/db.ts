import { randomUUID } from "crypto";
import { db } from "../../src/lib/db";
import { users } from "@staged/db";

/**
 * Create a real user row in the DB for testing.
 * Returns the UUID that can be passed to service functions.
 */
export async function createTestUser(
  opts: { email?: string; displayName?: string } = {},
): Promise<string> {
  const id = randomUUID();
  const email = opts.email ?? `test-${id}@example.com`;
  const displayName = opts.displayName ?? "Test User";

  await db
    .insert(users)
    .values({ id, email, displayName })
    .onConflictDoNothing();

  return id;
}
