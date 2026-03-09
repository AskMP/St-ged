import type { MealPlan, MealPlanEntry } from "@staged/types";
import { db } from "../lib/db";
import { mealPlans, mealPlanEntries } from "@staged/db";
import { and, eq } from "drizzle-orm";
import { verifyHouseholdAccess } from "./household-service";
import * as listService from "./list-service";
import * as recipeService from "./recipe-service";

function mapEntry(row: typeof mealPlanEntries.$inferSelect): MealPlanEntry {
  return {
    id: row.id,
    planId: row.planId,
    recipeId: row.recipeId,
    date: row.date,
    mealType: row.mealType ?? undefined,
    servings: row.servingsOverride ?? 1,
  };
}

function mapPlan(row: typeof mealPlans.$inferSelect): MealPlan {
  return {
    id: row.id,
    householdId: row.householdId,
    weekStart: row.weekStart,
  };
}

export async function createPlan(
  householdId: string,
  weekStart: string,
  userId: string,
): Promise<MealPlan> {
  await verifyHouseholdAccess(householdId, userId);

  // Return existing plan for this week if one exists
  const [existing] = await db
    .select()
    .from(mealPlans)
    .where(
      and(
        eq(mealPlans.householdId, householdId),
        eq(mealPlans.weekStart, weekStart),
      ),
    )
    .limit(1);

  if (existing) return mapPlan(existing);

  const [plan] = await db
    .insert(mealPlans)
    .values({ householdId, weekStart })
    .returning();

  return mapPlan(plan!);
}

export async function getWeeklyPlan(
  householdId: string,
  startDate: string,
): Promise<{ plan: MealPlan; entries: MealPlanEntry[] } | null> {
  const [planRow] = await db
    .select()
    .from(mealPlans)
    .where(
      and(
        eq(mealPlans.householdId, householdId),
        eq(mealPlans.weekStart, startDate),
      ),
    )
    .limit(1);

  if (!planRow) return null;

  const entryRows = await db
    .select()
    .from(mealPlanEntries)
    .where(eq(mealPlanEntries.planId, planRow.id));

  return {
    plan: mapPlan(planRow),
    entries: entryRows.map(mapEntry),
  };
}

export async function addMealEntry(
  planId: string,
  data: Partial<MealPlanEntry>,
): Promise<MealPlanEntry> {
  const [planRow] = await db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.id, planId))
    .limit(1);

  if (!planRow) {
    const err: any = new Error("Plan not found");
    err.status = 404;
    throw err;
  }

  const [row] = await db
    .insert(mealPlanEntries)
    .values({
      planId,
      recipeId: data.recipeId!,
      date: data.date!,
      mealType: data.mealType ?? null,
      servingsOverride: data.servings ?? 1,
    })
    .returning();

  return mapEntry(row!);
}

export async function removeMealEntry(entryId: string): Promise<void> {
  const [deleted] = await db
    .delete(mealPlanEntries)
    .where(eq(mealPlanEntries.id, entryId))
    .returning({ id: mealPlanEntries.id });

  if (!deleted) {
    const err: any = new Error("Entry not found");
    err.status = 404;
    throw err;
  }
}

export async function copyWeek(
  householdId: string,
  fromWeek: string,
  toWeek: string,
  userId: string,
): Promise<MealPlan> {
  const source = await getWeeklyPlan(householdId, fromWeek);
  if (!source) {
    const err: any = new Error("Source week not found");
    err.status = 404;
    throw err;
  }

  const destPlan = await createPlan(householdId, toWeek, userId);

  if (source.entries.length > 0) {
    await db.insert(mealPlanEntries).values(
      source.entries.map((e) => ({
        planId: destPlan.id,
        recipeId: e.recipeId,
        date: e.date,
        mealType: e.mealType ?? null,
        servingsOverride: e.servings,
      })),
    );
  }

  return destPlan;
}

export async function generateList(
  planId: string,
  userId: string,
): Promise<{ id: string; householdId: string }> {
  const [planRow] = await db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.id, planId))
    .limit(1);

  if (!planRow) {
    const err: any = new Error("Plan not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(planRow.householdId, userId);

  const list = await listService.createList(planRow.householdId, userId);

  const entryRows = await db
    .select()
    .from(mealPlanEntries)
    .where(eq(mealPlanEntries.planId, planId));

  // Collect ingredient names across all entries; deduplicate by lowercased name
  const seen = new Set<string>();
  for (const e of entryRows) {
    try {
      const recipe = await recipeService.getRecipe(e.recipeId);
      const ingredients = recipe.ingredients ?? [];
      for (const ing of ingredients) {
        const name = typeof ing === "string" ? ing : ((ing as any).name ?? "");
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          await listService.addItem(list.id, name, userId);
        }
      }
    } catch {
      // ignore missing recipes
    }
  }

  return list;
}
