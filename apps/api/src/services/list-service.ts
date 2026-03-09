import type { GroceryList } from "@staged/types";
import { db } from "../lib/db";
import { groceryLists, groceryListItems } from "@staged/db";
import { eq, and, sql } from "drizzle-orm";
import { getIO } from "../lib/socket";
import { verifyHouseholdAccess } from "./household-service";

export interface GroceryListItem {
  id: string;
  listId: string;
  name: string;
  checked: boolean;
  // timestamp or version for conflict resolution
  updatedAt: number;
}

// Map a DB groceryListItems row to the GroceryListItem interface
function mapItem(row: typeof groceryListItems.$inferSelect): GroceryListItem {
  return {
    id: row.id,
    listId: row.listId,
    name: row.ingredientName,
    checked: row.isChecked,
    updatedAt: row.checkedAt ? row.checkedAt.getTime() : Date.now(),
  };
}

export async function createList(
  householdId: string,
  userId: string,
): Promise<GroceryList> {
  await verifyHouseholdAccess(householdId, userId);

  const [list] = await db
    .insert(groceryLists)
    .values({ householdId, name: "Grocery List" })
    .returning({ id: groceryLists.id, householdId: groceryLists.householdId });

  return { id: list!.id, householdId: list!.householdId };
}

export async function getLists(
  householdId: string,
  userId: string,
): Promise<GroceryList[]> {
  await verifyHouseholdAccess(householdId, userId);

  const rows = await db
    .select({ id: groceryLists.id, householdId: groceryLists.householdId })
    .from(groceryLists)
    .where(eq(groceryLists.householdId, householdId));

  return rows;
}

export async function getList(
  listId: string,
): Promise<GroceryList | undefined> {
  const [row] = await db
    .select({ id: groceryLists.id, householdId: groceryLists.householdId })
    .from(groceryLists)
    .where(eq(groceryLists.id, listId))
    .limit(1);

  return row ?? undefined;
}

export async function addItem(
  listId: string,
  name: string,
  userId: string,
): Promise<GroceryListItem> {
  const list = await getList(listId);
  if (!list) {
    const err: any = new Error("List not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(list.householdId, userId);

  // Deterministic dedupe by lowercased name
  const [existing] = await db
    .select()
    .from(groceryListItems)
    .where(
      and(
        eq(groceryListItems.listId, listId),
        sql`lower(${groceryListItems.ingredientName}) = lower(${name})`,
      ),
    )
    .limit(1);

  if (existing) {
    // Update lastModifiedAt on the list and return existing item
    await db
      .update(groceryLists)
      .set({ lastModifiedAt: new Date() })
      .where(eq(groceryLists.id, listId));
    return mapItem(existing);
  }

  const [row] = await db
    .insert(groceryListItems)
    .values({ listId, ingredientName: name })
    .returning();

  await db
    .update(groceryLists)
    .set({ lastModifiedAt: new Date() })
    .where(eq(groceryLists.id, listId));

  try {
    getIO()
      .to(`household:${list.householdId}`)
      .emit("list:item:add", { item: mapItem(row!) });
  } catch {
    /* ignore if IO not initialized */
  }

  return mapItem(row!);
}

export async function getItems(
  listId: string,
  userId: string,
): Promise<GroceryListItem[]> {
  const list = await getList(listId);
  if (!list) {
    const err: any = new Error("List not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(list.householdId, userId);

  const rows = await db
    .select()
    .from(groceryListItems)
    .where(eq(groceryListItems.listId, listId))
    .orderBy(groceryListItems.sortOrder);

  return rows.map(mapItem);
}

export async function toggleItem(
  itemId: string,
  userId: string,
): Promise<GroceryListItem> {
  const [item] = await db
    .select()
    .from(groceryListItems)
    .where(eq(groceryListItems.id, itemId))
    .limit(1);

  if (!item) {
    const err: any = new Error("Item not found");
    err.status = 404;
    throw err;
  }

  const list = await getList(item.listId);
  if (!list) {
    const err: any = new Error("List not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(list.householdId, userId);

  const nowChecked = !item.isChecked;
  const [updated] = await db
    .update(groceryListItems)
    .set({
      isChecked: nowChecked,
      checkedBy: nowChecked ? userId : null,
      checkedAt: nowChecked ? new Date() : null,
    })
    .where(eq(groceryListItems.id, itemId))
    .returning();

  await db
    .update(groceryLists)
    .set({ lastModifiedAt: new Date() })
    .where(eq(groceryLists.id, item.listId));

  try {
    getIO()
      .to(`household:${list.householdId}`)
      .emit("list:item:check", { itemId, checked: nowChecked });
  } catch {
    /* ignore if IO not initialized */
  }

  return mapItem(updated!);
}

export async function deleteItem(
  itemId: string,
  userId: string,
): Promise<void> {
  const [item] = await db
    .select()
    .from(groceryListItems)
    .where(eq(groceryListItems.id, itemId))
    .limit(1);

  if (!item) {
    const err: any = new Error("Item not found");
    err.status = 404;
    throw err;
  }

  const list = await getList(item.listId);
  if (!list) {
    const err: any = new Error("List not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(list.householdId, userId);

  await db.delete(groceryListItems).where(eq(groceryListItems.id, itemId));

  await db
    .update(groceryLists)
    .set({ lastModifiedAt: new Date() })
    .where(eq(groceryLists.id, item.listId));

  try {
    getIO()
      .to(`household:${list.householdId}`)
      .emit("list:item:remove", { itemId });
  } catch {
    /* ignore if IO not initialized */
  }
}
