// Minimal recipe service implementations for MVP tests
// Full functionality will be added in subsequent tasks.

import { computeNutritionPerServing, scaleIngredients, suggestSubstitutions } from '@staged/usda'

export async function listRecipes(householdId: string, filters: Record<string, any> = {}) {
  // ignore params for now; return empty list
  return { recipes: [] }
}

export async function getRecipe(id: string) {
  return { id, title: 'stub' }
}

export async function createRecipe(data: any) {
  // when creating a recipe, compute nutrition if ingredients are present
  const recipe = { id: 'new-recipe', ...data }
  if (recipe.ingredients) {
    recipe.nutrition_per_serving = computeNutritionPerServing(recipe)
  }
  return recipe
}

export async function importRecipeFromUrl(url: string, jsonLd: any) {
  // structured import: normalize JSON-LD and compute nutrition
  const title = typeof jsonLd === 'object' && jsonLd.name ? jsonLd.name : 'imported'
  const recipe: any = { title, ingredients: jsonLd.recipeIngredient || [] }
  recipe.nutrition_per_serving = computeNutritionPerServing(recipe)
  return recipe
}

export async function scaleRecipe(recipe: any, factor: number) {
  const scaled = { ...recipe }
  if (scaled.ingredients) {
    scaled.ingredients = scaleIngredients(scaled.ingredients, factor)
  }
  return scaled
}

export async function getSubstitutions(ingredientName: string) {
  return suggestSubstitutions(ingredientName)
}

export async function deleteRecipe(id: string) {
  // noop
}
