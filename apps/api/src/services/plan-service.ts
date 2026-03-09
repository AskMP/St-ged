import type { MealPlan, MealPlanEntry } from "@staged/types";
import { v4 as uuidv4 } from "uuid";
import { verifyHouseholdAccess } from "./household-service";
import * as listService from "./list-service";
import * as recipeService from "./recipe-service";

// simple in-memory storage for early implementation
const PLANS: MealPlan[] = [];
const ENTRIES: MealPlanEntry[] = [];

export async function createPlan(
  householdId: string,
  weekStart: string,
  userId: string,
) {
  await verifyHouseholdAccess(householdId, userId);
  let existing = PLANS.find(
    (p) => p.householdId === householdId && p.weekStart === weekStart,
  );
  if (existing) return existing;
  const plan: MealPlan = { id: uuidv4(), householdId, weekStart };
  PLANS.push(plan);
  return plan;
}

export async function getWeeklyPlan(householdId: string, startDate: string) {
  const plan = PLANS.find(
    (p) => p.householdId === householdId && p.weekStart === startDate,
  );
  if (!plan) return null;
  const entries = ENTRIES.filter((e) => e.planId === plan.id);
  return { plan, entries };
}

export async function addMealEntry(
  planId: string,
  data: Partial<MealPlanEntry>,
) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    const err: any = new Error("Plan not found");
    err.status = 404;
    throw err;
  }
  // we assume caller has already verified access via household roughly via plan
  const entry: MealPlanEntry = {
    id: uuidv4(),
    planId,
    recipeId: data.recipeId!,
    date: data.date!,
    servings: data.servings ?? 1,
  };
  ENTRIES.push(entry);
  return entry;
}

export async function removeMealEntry(entryId: string) {
  const idx = ENTRIES.findIndex((e) => e.id === entryId);
  if (idx === -1) {
    const err: any = new Error("Entry not found");
    err.status = 404;
    throw err;
  }
  ENTRIES.splice(idx, 1);
}

// copy all entries from one week to another producing new plan
export async function copyWeek(
  householdId: string,
  fromWeek: string,
  toWeek: string,
  userId: string,
) {
  const source = await getWeeklyPlan(householdId, fromWeek);
  if (!source) {
    const err: any = new Error("Source week not found");
    err.status = 404;
    throw err;
  }
  const destPlan = await createPlan(householdId, toWeek, userId);
  source.entries.forEach((e) => {
    ENTRIES.push({ ...e, id: uuidv4(), planId: destPlan.id });
  });
  return destPlan;
}

// generate a grocery list for a plan, returns list object
export async function generateList(planId: string, userId: string) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    const err: any = new Error("Plan not found");
    err.status = 404;
    throw err;
  }
  await verifyHouseholdAccess(plan.householdId, userId);
  // create or reuse list for this week
  const list = await listService.createList(plan.householdId, userId);
  // for each entry, fetch recipe and add an item summarizing it
  const entries = ENTRIES.filter((e) => e.planId === planId);
  for (const e of entries) {
    try {
      const recipe = await recipeService.getRecipe(e.recipeId);
      const name = `${recipe.title} (x${e.servings})`;
      await listService.addItem(list.id, name, userId);
    } catch {
      // ignore missing recipes
    }
  }
  return list;
}
