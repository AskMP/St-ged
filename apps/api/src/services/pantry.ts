import type { PantryItem } from "@staged/types";
import { db } from "../lib/db";
import { pantry, pantryItems } from "@staged/db";
import { eq } from "drizzle-orm";
import { verifyHouseholdAccess } from "./household-service";

// Helper: get or create the pantry container for a household
async function getOrCreatePantryContainer(
  householdId: string,
): Promise<string> {
  let [record] = await db
    .select({ id: pantry.id })
    .from(pantry)
    .where(eq(pantry.householdId, householdId))
    .limit(1);

  if (!record) {
    [record] = await db
      .insert(pantry)
      .values({ householdId })
      .returning({ id: pantry.id });
  }

  return record!.id;
}

// Map DB row to PantryItem API shape
function mapItem(
  row: typeof pantryItems.$inferSelect,
  householdId: string,
): PantryItem {
  return {
    id: row.id,
    householdId,
    name: row.ingredientName,
    quantity: row.quantityValue ?? 1,
    unit: row.quantityUnit ?? undefined,
    expiresAt: row.expiryDate ?? undefined,
  };
}

export async function getPantry(
  householdId: string,
  userId?: string,
): Promise<PantryItem[]> {
  if (userId) {
    await verifyHouseholdAccess(householdId, userId);
  }

  const pantryId = await getOrCreatePantryContainer(householdId);

  const rows = await db
    .select()
    .from(pantryItems)
    .where(eq(pantryItems.pantryId, pantryId));

  return rows.map((r) => mapItem(r, householdId));
}

export async function addPantryItem(
  householdId: string,
  data: Partial<PantryItem>,
  userId?: string,
): Promise<PantryItem> {
  if (userId) {
    await verifyHouseholdAccess(householdId, userId);
  }

  const pantryId = await getOrCreatePantryContainer(householdId);

  const [row] = await db
    .insert(pantryItems)
    .values({
      pantryId,
      ingredientName: data.name || "unnamed",
      quantityValue: data.quantity ?? 1,
      quantityUnit: data.unit ?? null,
      expiryDate: data.expiresAt ?? null,
    })
    .returning();

  return mapItem(row!, householdId);
}

export async function removePantryItem(
  itemId: string,
  userId?: string,
): Promise<void> {
  // Fetch the item to get pantryId (and through it householdId for auth check)
  const [item] = await db
    .select()
    .from(pantryItems)
    .where(eq(pantryItems.id, itemId))
    .limit(1);

  if (!item) {
    const err: any = new Error("Not found");
    err.status = 404;
    throw err;
  }

  if (userId) {
    // Get householdId from the pantry container
    const [container] = await db
      .select({ householdId: pantry.householdId })
      .from(pantry)
      .where(eq(pantry.id, item.pantryId))
      .limit(1);

    if (container) {
      await verifyHouseholdAccess(container.householdId, userId);
    }
  }

  await db.delete(pantryItems).where(eq(pantryItems.id, itemId));
}
