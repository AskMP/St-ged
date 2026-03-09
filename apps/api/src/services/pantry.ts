import type { PantryItem } from "@staged/types";
import { v4 as uuidv4 } from "uuid";
import { verifyHouseholdAccess } from "./household-service";

// naive in‑memory pantry store for MVP; keyed by id
const PANTRY: PantryItem[] = [];

export async function getPantry(householdId: string, userId?: string) {
  // optional authorization; callers that supply a userId will be checked
  if (userId) {
    await verifyHouseholdAccess(householdId, userId);
  }
  return PANTRY.filter((i) => i.householdId === householdId);
}

export async function addPantryItem(
  householdId: string,
  data: Partial<PantryItem>,
  userId?: string,
) {
  if (userId) {
    await verifyHouseholdAccess(householdId, userId);
  }
  const item: PantryItem = {
    id: uuidv4(),
    householdId,
    name: data.name || "unnamed",
    quantity: data.quantity ?? 1,
    unit: data.unit,
    expiresAt: data.expiresAt,
  };
  PANTRY.push(item);
  return item;
}

export async function removePantryItem(itemId: string, userId?: string) {
  const idx = PANTRY.findIndex((i) => i.id === itemId);
  if (idx === -1) {
    const err: any = new Error("Not found");
    err.status = 404;
    throw err;
  }
  const item = PANTRY[idx]!;
  if (userId) {
    await verifyHouseholdAccess(item.householdId, userId);
  }
  PANTRY.splice(idx, 1);
}
