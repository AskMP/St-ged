// ensure required environment variables are set
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

describe("cost route", () => {
  it("returns cost data considering pantry", async () => {
    const userX = await createTestUser();
    const h = await createHousehold("CostHouse", userX);
    const hid = h.id;
    const recipe = await createRecipe({
      title: "Rice",
      cost_per_serving: 5,
    } as any);
    await addPantryItem(hid, { name: "rice", quantity: 1 }, userX);

    const res = await app.request(
      `http://localhost/api/recipes/${recipe.id}/cost?householdId=${hid}`,
      {
        method: "GET",
        headers: { "x-test-user-id": userX },
      },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("costPerServing");
    expect(body.costPerServing).toBeLessThanOrEqual(5);
  });
});
