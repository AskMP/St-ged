// Dietary adaptation types
export type DietaryProfile = 'vegan' | 'vegetarian' | 'dairy-free' | 'gluten-free'

export interface Substitution {
  original: string
  replacement: string
  reason: string
}

export interface AdaptedRecipe {
  originalRecipeId: string
  adaptedRecipe: {
    id: string
    title: string
    description?: string
    ingredients?: (string | { name: string; quantity?: number; unit?: string })[]
    nutrition_per_serving?: { calories: number; fat?: number; carbs?: number; protein?: number }
    cost_per_serving?: number
    ingredient_costs?: Record<string, number>
    dietary_tags?: DietaryProfile[]
    [key: string]: any
  }
  profile: DietaryProfile
  substitutions: Substitution[]
}
