// Minimal USDA helpers for early development.  Real implementations will
// query the preloaded FDC dataset and compute per-serving nutrients.

export interface NutritionInfo {
  calories: number
  fat?: number
  carbs?: number
  protein?: number
}

export function computeNutritionPerServing(recipe: any): NutritionInfo {
  // stub: always return fixed values
  return { calories: 123, fat: 5, carbs: 20, protein: 7 }
}

export function scaleIngredients(ingredients: any[], factor: number) {
  // simplistic scaling: multiply quantity if numeric
  return ingredients.map((ing) => {
    const scaled = { ...ing }
    if (typeof scaled.quantity === 'number') {
      scaled.quantity = scaled.quantity * factor
    }
    return scaled
  })
}

export function suggestSubstitutions(ingredientName: string) {
  // stub: return a generic substitution list
  return [
    { name: `${ingredientName} (alternative)` },
    { name: `${ingredientName} (other)` },
  ]
}
