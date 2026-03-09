// Recipe service -- Drizzle ORM implementation
import type {
  Ingredient,
  NutritionInfo,
  PantryItem,
  Recipe,
} from "@staged/types";
import type { CostResult } from "@staged/types";
import {
  computeNutritionPerServing,
  scaleIngredients,
  suggestSubstitutions,
} from "@staged/usda";
import { db } from "../lib/db";
import { recipes, recipeIngredients } from "@staged/db";
import { eq } from "drizzle-orm";

// Map DB recipe row + ingredients to the Recipe interface
function mapRecipe(
  row: typeof recipes.$inferSelect,
  ingRows: (typeof recipeIngredients.$inferSelect)[] = [],
): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    ingredients: ingRows.map((i) => ({
      name: i.name,
      quantity: i.quantityValue ?? undefined,
      unit: i.quantityUnit ?? undefined,
    })),
    nutrition_per_serving:
      (row.nutritionPerServing as NutritionInfo) ?? undefined,
  };
}

export async function listRecipes(
  _householdId: string,
  _filters: Record<string, any> = {},
): Promise<{ recipes: Recipe[] }> {
  const rows = await db.select().from(recipes);
  // Fetch ingredients for all recipes in one batch
  const allIngredients = await db.select().from(recipeIngredients);
  const ingByRecipeId = new Map<
    string,
    (typeof recipeIngredients.$inferSelect)[]
  >();
  for (const ing of allIngredients) {
    const arr = ingByRecipeId.get(ing.recipeId) ?? [];
    arr.push(ing);
    ingByRecipeId.set(ing.recipeId, arr);
  }
  return {
    recipes: rows.map((r) => mapRecipe(r, ingByRecipeId.get(r.id) ?? [])),
  };
}

export async function getRecipe(id: string): Promise<Recipe> {
  const [row] = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1);

  if (!row) throw new Error("not found");

  const ingRows = await db
    .select()
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, id))
    .orderBy(recipeIngredients.sortOrder);

  return mapRecipe(row, ingRows);
}

export async function createRecipe(data: Partial<Recipe>): Promise<Recipe> {
  const nutrition = data.ingredients
    ? computeNutritionPerServing({ ingredients: data.ingredients })
    : undefined;

  const [recipeRow] = await db
    .insert(recipes)
    .values({
      title: data.title ?? "",
      description: (data as any).description ?? null,
      servingsBase: (data as any).servingsBase ?? 4,
      skillLevel: (data as any).skillLevel ?? "beginner",
      dietaryTags: (data as any).dietaryTags ?? [],
      techniqueTags: (data as any).techniqueTags ?? [],
      isLicensed: (data as any).isLicensed ?? false,
      nutritionPerServing: nutrition ?? null,
    })
    .returning();

  const ingRows: (typeof recipeIngredients.$inferSelect)[] = [];
  if (data.ingredients && data.ingredients.length > 0) {
    const insertedIngs = await db
      .insert(recipeIngredients)
      .values(
        data.ingredients.map((ing, idx) => ({
          recipeId: recipeRow!.id,
          name: typeof ing === "string" ? ing : ing.name,
          quantityValue:
            typeof ing === "string" ? null : (ing.quantity ?? null),
          quantityUnit: typeof ing === "string" ? null : (ing.unit ?? null),
          sortOrder: idx,
        })),
      )
      .returning();
    ingRows.push(...insertedIngs);
  }

  return mapRecipe(recipeRow!, ingRows);
}

export async function importRecipeFromUrl(
  url: string,
  jsonLd: any,
): Promise<Recipe> {
  const title =
    typeof jsonLd === "object" && jsonLd.name ? jsonLd.name : "imported";

  // Parse ingredients from JSON-LD (may be string[] or object[])
  const rawIngredients: Ingredient[] = (jsonLd.recipeIngredient || []).map(
    (ing: any) => {
      if (typeof ing === "string") return { name: ing };
      return {
        name: ing.name ?? String(ing),
        quantity: ing.quantity ?? undefined,
        unit: ing.unit ?? undefined,
      };
    },
  );

  const nutrition = computeNutritionPerServing({ ingredients: rawIngredients });

  const [recipeRow] = await db
    .insert(recipes)
    .values({
      title,
      servingsBase: 4,
      skillLevel: "beginner",
      dietaryTags: [],
      techniqueTags: [],
      isLicensed: false,
      nutritionPerServing: nutrition,
    })
    .returning();

  const ingRows: (typeof recipeIngredients.$inferSelect)[] = [];
  if (rawIngredients.length > 0) {
    const insertedIngs = await db
      .insert(recipeIngredients)
      .values(
        rawIngredients.map((ing, idx) => ({
          recipeId: recipeRow!.id,
          name: ing.name,
          quantityValue: ing.quantity ?? null,
          quantityUnit: ing.unit ?? null,
          sortOrder: idx,
        })),
      )
      .returning();
    ingRows.push(...insertedIngs);
  }

  return mapRecipe(recipeRow!, ingRows);
}

export async function scaleRecipe(
  recipe: Recipe,
  factor: number,
): Promise<Recipe> {
  const scaled: Recipe = { ...recipe };
  if (scaled.ingredients) {
    scaled.ingredients = scaleIngredients(scaled.ingredients, factor);
  }
  return scaled;
}

export async function getSubstitutions(ingredientName: string): Promise<any[]> {
  return suggestSubstitutions(ingredientName);
}

export async function deleteRecipe(id: string): Promise<void> {
  // CASCADE on recipeIngredients handles child rows
  await db.delete(recipes).where(eq(recipes.id, id));
}

// ---------- cost-related helpers ----------

/**
 * Compute cost per serving for a given recipe, subtracting pantry deductions.
 */
export async function calculateRecipeCost(
  recipe: Recipe,
  pantryItems: PantryItem[],
): Promise<CostResult> {
  const base = recipe.cost_per_serving ?? 0;
  const deductionPerMatch = 0.25;
  let matchedCount = 0;
  if (recipe.ingredients) {
    for (const ing of recipe.ingredients) {
      const name = typeof ing === "string" ? ing : ing.name;
      if (
        pantryItems.some((p) =>
          p.name.toLowerCase().includes(name.toLowerCase()),
        )
      ) {
        matchedCount++;
      }
    }
  }
  const pantryDeduction = matchedCount * deductionPerMatch;
  const costPerServing = Math.max(0, base - pantryDeduction);
  return { costPerServing, pantryDeduction };
}

export async function getRecipeCost(
  id: string,
  pantryItems: PantryItem[],
): Promise<CostResult> {
  const recipe = await getRecipe(id);
  return calculateRecipeCost(recipe, pantryItems);
}
