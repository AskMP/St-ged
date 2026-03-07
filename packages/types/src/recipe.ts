// Recipe types - see prd-01-data-schema
export interface Ingredient {
  name: string
  quantity?: number
  unit?: string
}

export interface NutritionInfo {
  calories: number
  fat?: number
  carbs?: number
  protein?: number
}

export interface Recipe {
  id: string
  title: string
  description?: string
  ingredients?: Ingredient[]
  nutrition_per_serving?: NutritionInfo
  [key: string]: any // allow extension until full schema defined
}
