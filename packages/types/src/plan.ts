// Plan types - see prd-01-data-schema
export interface MealPlan {
  id: string;
  householdId: string;
  // ISO date (YYYY-MM-DD) representing start of week (Monday)
  weekStart: string;
}

export interface MealPlanEntry {
  id: string;
  planId: string;
  recipeId: string;
  // ISO date for the calendar day (e.g. 2025-04-07)
  date: string;
  mealType?: string;
  servings: number;
}
