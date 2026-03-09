// Minimal recipe service implementations for MVP tests
// Full functionality will be added in subsequent tasks.

import type { PantryItem, Recipe } from "@staged/types";
import type { CostResult } from "@staged/types";
import {
  computeNutritionPerServing,
  scaleIngredients,
  suggestSubstitutions,
} from "@staged/usda";

// naive in-memory "database" for early development
export const RECIPES: Recipe[] = [];

export async function listRecipes(
  householdId: string,
  filters: Record<string, any> = {},
): Promise<{ recipes: Recipe[] }> {
  // ignore householdId/filters for now; return everything in memory
  return { recipes: RECIPES };
}

export async function getRecipe(id: string): Promise<Recipe> {
  const found = RECIPES.find((r) => r.id === id);
  if (!found) throw new Error("not found");
  return found;
}

export async function createRecipe(data: Partial<Recipe>): Promise<Recipe> {
  // when creating a recipe, compute nutrition if ingredients are present
  const id =
    data.id ||
    // prefer builtin crypto if available (Node 24+ or browser shim)
    (typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `recipe-${Math.random().toString(36).slice(2)}`);
  const recipe: Recipe = { id, title: data.title ?? "", ...data };
  RECIPES.push(recipe);
  if (recipe.ingredients) {
    recipe.nutrition_per_serving = computeNutritionPerServing(recipe);
  }
  return recipe;
}

export async function importRecipeFromUrl(
  url: string,
  jsonLd: any,
): Promise<Recipe> {
  // structured import: normalize JSON-LD and compute nutrition
  const title =
    typeof jsonLd === "object" && jsonLd.name ? jsonLd.name : "imported";
  const recipe: Recipe = {
    id: "imported",
    title,
    ingredients: jsonLd.recipeIngredient || [],
  };
  RECIPES.push(recipe);
  recipe.nutrition_per_serving = computeNutritionPerServing(recipe);
  return recipe;
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

export async function deleteRecipe(id: string) {
  const idx = RECIPES.findIndex((r) => r.id === id);
  if (idx !== -1) {
    RECIPES.splice(idx, 1);
  }
}

// ---------- cost-related helpers ----------

/**
 * Compute cost per serving for a given recipe, subtracting pantry deductions.
 * Simple heuristic: use recipe.cost_per_serving as base; for each pantry item
 * whose name appears in the recipe ingredients, deduct a flat $0.25 (configurable).
 * Pantry-aware logic will be refined in later iterations.
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
