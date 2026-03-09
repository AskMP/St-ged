import { randomUUID } from "crypto";
import { db } from "../../src/lib/db";
import { users, recipes } from "@staged/db";
import { createHousehold } from "../../src/services/household-service";
import * as listService from "../../src/services/list-service";
import {
  addMealEntry,
  copyWeek,
  createPlan,
  generateList,
  getWeeklyPlan,
  removeMealEntry,
} from "../../src/services/plan-service";

// Insert a real recipe into the DB (needed for FK constraint on meal_plan_entries)
async function createTestRecipe(title: string): Promise<{ id: string }> {
  const [row] = await db
    .insert(recipes)
    .values({
      title,
      servingsBase: 4,
      skillLevel: "beginner",
      dietaryTags: [],
      techniqueTags: [],
      isLicensed: false,
    })
    .returning({ id: recipes.id });
  return row!;
}

async function createTestUser(): Promise<string> {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, email: `test-${id}@example.com`, displayName: "Test" })
    .onConflictDoNothing();
  return id;
}

describe("plan service", () => {
  let userId: string;
  let hid: string;

  beforeAll(async () => {
    userId = await createTestUser();
    const h = await createHousehold("PlanHouse", userId);
    hid = h.id;
  });

  it("creates and retrieves a weekly plan", async () => {
    const week = "2025-01-06";
    const plan = await createPlan(hid, week, userId);
    expect(plan.householdId).toBe(hid);
    expect(plan.weekStart).toBe(week);
    const fetched = await getWeeklyPlan(hid, week);
    expect(fetched).not.toBeNull();
    expect(fetched?.plan.id).toBe(plan.id);
    expect(fetched?.entries).toHaveLength(0);
  });

  it("adds and removes entries", async () => {
    const week = "2025-01-06";
    const { plan } = (await getWeeklyPlan(hid, week))!;
    const recipe = await createTestRecipe("Toast");
    const entry = await addMealEntry(plan.id, {
      recipeId: recipe.id,
      date: "2025-01-07",
      servings: 2,
    });
    expect(entry.planId).toBe(plan.id);
    const later = await getWeeklyPlan(hid, week);
    expect(later?.entries.length).toBeGreaterThanOrEqual(1);
    await removeMealEntry(entry.id);
    const afterDel = await getWeeklyPlan(hid, week);
    // entry should no longer appear
    expect(afterDel?.entries.some((e) => e.id === entry.id)).toBe(false);
  });

  it("can copy a week", async () => {
    const w1 = "2025-01-06";
    const w2 = "2025-01-13";
    const { plan } = (await getWeeklyPlan(hid, w1))!;
    const recipe = await createTestRecipe("Soup");
    await addMealEntry(plan.id, {
      recipeId: recipe.id,
      date: "2025-01-08",
      servings: 1,
    });
    const dest = await copyWeek(hid, w1, w2, userId);
    expect(dest.weekStart).toBe(w2);
    const second = await getWeeklyPlan(hid, w2);
    expect(second?.entries.length).toBeGreaterThanOrEqual(1);
  });

  it("generates a grocery list", async () => {
    const w = "2025-01-20";
    const plan = await createPlan(hid, w, userId);
    const recipe = await createTestRecipe("Salad");
    await addMealEntry(plan.id, {
      recipeId: recipe.id,
      date: "2025-01-21",
      servings: 3,
    });
    const list = await generateList(plan.id, userId);
    expect(list).toBeDefined();
    await listService.getItems(list.id, userId);
  });
});
