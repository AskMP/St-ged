import { describe, expect, it } from "vitest";
import { combineRecipes } from "../../src/services/batch-prep-service";
import { createRecipe } from "../../src/services/recipe-service";

describe("batch-prep service", () => {
  it("combines ingredients across recipes", async () => {
    const r1 = await createRecipe({
      title: "A",
      ingredients: [{ name: "tomato" }, { name: "water" }],
    });
    const r2 = await createRecipe({
      title: "B",
      ingredients: [{ name: "tomato" }, { name: "basil" }],
    });
    const res = await combineRecipes([r1.id, r2.id]);
    expect(res.sequence).toEqual([r1.id, r2.id]);
    expect(res.items).toEqual([
      { name: "basil", count: 1 },
      { name: "tomato", count: 2 },
      { name: "water", count: 1 },
    ]);
  });

  it("ignores unknown recipe ids", async () => {
    const r1 = await createRecipe({
      title: "A",
      ingredients: [{ name: "onion" }],
    });
    const missing = "00000000-0000-0000-0000-000000000000";
    const res = await combineRecipes([r1.id, missing]);
    expect(res.items).toEqual([{ name: "onion", count: 1 }]);
  });

  it("maintains sequence order regardless of item names", async () => {
    const r1 = await createRecipe({
      title: "A",
      ingredients: [{ name: "apple" }],
    });
    const r2 = await createRecipe({
      title: "B",
      ingredients: [{ name: "banana" }],
    });
    const res = await combineRecipes([r2.id, r1.id]);
    expect(res.sequence).toEqual([r2.id, r1.id]);
    expect(res.items.map((i) => i.name)).toEqual(["apple", "banana"]);
  });
});
