import { describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import { db } from "../../src/lib/db";
import { users } from "@staged/db";
import { createHousehold } from "../../src/services/household-service";
import {
  addPantryItem,
  getPantry,
  removePantryItem,
} from "../../src/services/pantry";

async function createTestUser(): Promise<string> {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, email: `test-${id}@example.com`, displayName: "Test" })
    .onConflictDoNothing();
  return id;
}

describe("pantry service helpers", () => {
  it("crud pantry items when user is a member", async () => {
    const ownerId = await createTestUser();
    const { id } = await createHousehold("Pantryhouse", ownerId);
    const item = await addPantryItem(
      id,
      { name: "sugar", quantity: 3 },
      ownerId,
    );
    expect(item).toHaveProperty("id");

    const list = await getPantry(id, ownerId);
    expect(list).toEqual([item]);

    await removePantryItem(item.id, ownerId);
    const list2 = await getPantry(id, ownerId);
    expect(list2).toEqual([]);
  });

  it("throws when non-member tries actions", async () => {
    const owner2 = await createTestUser();
    const outsider = await createTestUser();
    const owner3 = await createTestUser();
    const { id } = await createHousehold("Private", owner2);
    await expect(
      addPantryItem(id, { name: "x", quantity: 1 }, outsider),
    ).rejects.toHaveProperty("status", 403);

    const { id: id2 } = await createHousehold("Public", owner3);
    const item2 = await addPantryItem(
      id2,
      { name: "foo", quantity: 1 },
      owner3,
    );
    await expect(removePantryItem(item2.id, owner2)).rejects.toHaveProperty(
      "status",
      403,
    );
  });
});
