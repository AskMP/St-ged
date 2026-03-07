// Minimal recipe service implementations for MVP tests
// Full functionality will be added in subsequent tasks.

import { computeNutritionPerServing, scaleIngredients, suggestSubstitutions } from '@staged/usda'
import type { Recipe, NutritionInfo } from '@staged/types'

export async function listRecipes(householdId: string, filters: Record<string, any> = {}): Promise<{ recipes: Recipe[] }> {
  // ignore params for now; return empty list
  return { recipes: [] }
}

export async function getRecipe(id: string): Promise<Recipe> {
  return { id, title: 'stub' }
}

export async function createRecipe(data: Partial<Recipe>): Promise<Recipe> {
  // when creating a recipe, compute nutrition if ingredients are present
  const recipe: Recipe = { id: 'new-recipe', title: data.title ?? '', ...data }
  if (recipe.ingredients) {
    recipe.nutrition_per_serving = computeNutritionPerServing(recipe)
  }
  return recipe
}

export async function importRecipeFromUrl(url: string, jsonLd: any): Promise<Recipe> {
  // structured import: normalize JSON-LD and compute nutrition
  const title = typeof jsonLd === 'object' && jsonLd.name ? jsonLd.name : 'imported'
  const recipe: Recipe = { id: 'imported', title, ingredients: jsonLd.recipeIngredient || [] }
  recipe.nutrition_per_serving = computeNutritionPerServing(recipe)
  return recipe
}

export async function scaleRecipe(recipe: Recipe, factor: number): Promise<Recipe> {
  const scaled: Recipe = { ...recipe }
  if (scaled.ingredients) {
    scaled.ingredients = scaleIngredients(scaled.ingredients, factor)
  }
  return scaled
}

export async function getSubstitutions(ingredientName: string): Promise<any[]> {
  return suggestSubstitutions(ingredientName)
}

export async function deleteRecipe(id: string) {
  // noop
}
