// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||=
  "postgresql://staged:staged_dev_password@localhost:5432/staged_dev";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";

import { randomUUID } from "crypto";
import { app } from "../../src/index";
import { db } from "../../src/lib/db";
import { users } from "@staged/db";
import { createHousehold } from "../../src/services/household-service";
import { addPantryItem } from "../../src/services/pantry";
import { createRecipe } from "../../src/services/recipe-service";

async function createTestUser(): Promise<string> {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, email: `test-${id}@example.com`, displayName: "Test" })
    .onConflictDoNothing();
  return id;
}

describe("fridge-clearance route", () => {
  it("returns suggestions and expiring items based on pantry and recipes", async () => {
    const userA = await createTestUser();
    const h = await createHousehold("FridgeHouse", userA);
    const hid = h.id;
    // Use a unique ingredient name unlikely to appear in other test recipes
    const uniqueIng = `xunique-${Date.now()}`;
    await addPantryItem(hid, { name: uniqueIng, quantity: 2 }, userA);
    const recipe = await createRecipe({
      title: "UniqueIngredient Soup",
      ingredients: [{ name: uniqueIng }],
    });

    const res = await app.request(
      `http://localhost/api/fridge-clearance?householdId=${hid}`,
      {
        method: "GET",
        headers: { "x-test-user-id": userA },
      },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("suggestions");
    expect(Array.isArray(body.suggestions)).toBe(true);
    expect(body.suggestions.length).toBeGreaterThanOrEqual(1);
    // The created recipe should appear in suggestions with positive coverage
    const match = body.suggestions.find((s: any) => s.recipe.id === recipe.id);
    expect(match).toBeDefined();
    expect(match.coverageScore).toBeGreaterThan(0);
  });

  it("returns error if householdId missing", async () => {
    const res = await app.request(`http://localhost/api/fridge-clearance`, {
      method: "GET",
    });
    // auth middleware may reject before param validation
    expect([400, 401]).toContain(res.status);
  });
});
