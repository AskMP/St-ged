import type { BatchPrepItem, BatchPrepResult } from '@staged/types'
import { getRecipe } from './recipe-service'

// naive in-memory helper; real implementation will consider quantities, units
export async function combineRecipes(recipeIds: string[]): Promise<BatchPrepResult> {
  const ingredientCounts: Record<string, number> = {}
  for (const id of recipeIds) {
    try {
      const recipe = await getRecipe(id)
      const ingredients: string[] = []
      if (recipe.ingredients) {
        for (const ing of recipe.ingredients) {
          if (typeof ing === 'string') ingredients.push(ing)
          else if (typeof ing === 'object' && ing.name) ingredients.push(ing.name as string)
        }
      }
      // dedupe per recipe
      const unique = Array.from(new Set(ingredients.map((n) => n.toLowerCase())))
      unique.forEach((name) => {
        ingredientCounts[name] = (ingredientCounts[name] || 0) + 1
      })
    } catch {
      // ignore missing recipe
    }
  }
  const items: BatchPrepItem[] = Object.entries(ingredientCounts).map(
    ([name, count]) => ({ name, count })
  )
  // deterministic sort by name
  items.sort((a, b) => a.name.localeCompare(b.name))
  return { items, sequence: recipeIds }
}
