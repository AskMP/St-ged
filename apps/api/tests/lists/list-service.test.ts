import { randomUUID } from "crypto";
import { db } from "../../src/lib/db";
import { users } from "@staged/db";
import { createHousehold } from "../../src/services/household-service";
import {
  addItem,
  createList,
  deleteItem,
  getItems,
  getList,
  getLists,
  toggleItem,
} from "../../src/services/list-service";

async function createTestUser(): Promise<string> {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, email: `test-${id}@example.com`, displayName: "Test" })
    .onConflictDoNothing();
  return id;
}

describe("list service", () => {
  let userId: string;
  let hid: string;

  beforeAll(async () => {
    userId = await createTestUser();
    const house = await createHousehold("TestHouse", userId);
    hid = house.id;
  });

  it("can create and retrieve lists", async () => {
    const list = await createList(hid, userId);
    expect(list.householdId).toBe(hid);
    const all = await getLists(hid, userId);
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((l) => l.id === list.id)).toBe(true);
    const single = await getList(list.id);
    expect(single).toMatchObject({ id: list.id, householdId: hid });
  });

  it("can add items, dedupe, toggle, and delete", async () => {
    const list = await createList(hid, userId);
    const item1 = await addItem(list.id, "Apple", userId);
    expect(item1.listId).toBe(list.id);

    const itemDup = await addItem(list.id, "apple", userId);
    expect(itemDup.id).toBe(item1.id);

    const items = await getItems(list.id, userId);
    expect(items.some((i) => i.id === item1.id)).toBe(true);

    const toggled = await toggleItem(item1.id, userId);
    expect(toggled.checked).toBe(true);

    await deleteItem(item1.id, userId);
    const items3 = await getItems(list.id, userId);
    expect(items3.some((i) => i.id === item1.id)).toBe(false);
  });
});
