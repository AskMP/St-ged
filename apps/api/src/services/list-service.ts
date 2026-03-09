import type { GroceryList } from "@staged/types";
import { v4 as uuidv4 } from "uuid";
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

const LISTS: GroceryList[] = [];
const ITEMS: GroceryListItem[] = [];

export async function createList(householdId: string, userId: string) {
  await verifyHouseholdAccess(householdId, userId);
  const list: GroceryList = { id: uuidv4(), householdId };
  LISTS.push(list);
  return list;
}

export async function getLists(householdId: string, userId: string) {
  await verifyHouseholdAccess(householdId, userId);
  return LISTS.filter((l) => l.householdId === householdId);
}

export async function getList(listId: string) {
  return LISTS.find((l) => l.id === listId);
}

export async function addItem(listId: string, name: string, userId: string) {
  // locate list and check membership
  const list = LISTS.find((l) => l.id === listId);
  if (!list) {
    const err: any = new Error("List not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(list.householdId, userId);

  // deterministic dedupe by lowercased name
  const existing = ITEMS.find(
    (i) => i.listId === listId && i.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) {
    existing.updatedAt = Date.now();
    return existing;
  }

  const item: GroceryListItem = {
    id: uuidv4(),
    listId,
    name,
    checked: false,
    updatedAt: Date.now(),
  };
  ITEMS.push(item);
  // broadcast to household room
  try {
    getIO().to(`household:${list.householdId}`).emit("list:item:add", { item });
  } catch {
    /* ignore if IO not initialized */
  }
  return item;
}

export async function getItems(listId: string, userId: string) {
  const list = LISTS.find((l) => l.id === listId);
  if (!list) {
    const err: any = new Error("List not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(list.householdId, userId);
  return ITEMS.filter((i) => i.listId === listId);
}

export async function toggleItem(itemId: string, userId: string) {
  const item = ITEMS.find((i) => i.id === itemId);
  if (!item) {
    const err: any = new Error("Item not found");
    err.status = 404;
    throw err;
  }
  const list = LISTS.find((l) => l.id === item.listId);
  if (!list) {
    const err: any = new Error("List not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(list.householdId, userId);
  item.checked = !item.checked;
  item.updatedAt = Date.now();
  try {
    getIO().to(`household:${list.householdId}`).emit("list:item:check", {
      itemId: item.id,
      checked: item.checked,
    });
  } catch {
    /* ignore if IO not initialized */
  }
  return item;
}

export async function deleteItem(itemId: string, userId: string) {
  const idx = ITEMS.findIndex((i) => i.id === itemId);
  if (idx === -1) {
    const err: any = new Error("Item not found");
    err.status = 404;
    throw err;
  }
  const item = ITEMS[idx]!;
  const list = LISTS.find((l) => l.id === item.listId);
  if (!list) {
    const err: any = new Error("List not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(list.householdId, userId);
  ITEMS.splice(idx, 1);
  try {
    getIO().to(`household:${list.householdId}`).emit("list:item:remove", {
      itemId,
    });
  } catch {
    /* ignore if IO not initialized */
  }
}
