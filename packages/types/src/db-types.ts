// These types are derived from the Drizzle schema via InferSelectModel.
// They are the canonical runtime types for database rows.
// Use the DB-prefixed names to avoid conflicts with existing hand-written types.
// When the existing types are migrated to use these, the DB prefix can be removed.
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  households,
  householdMembers,
  recipes,
  recipeIngredients,
  substitutions,
  groceryLists,
  groceryListItems,
  mealPlans,
  mealPlanEntries,
  pantry,
  pantryItems,
  syncQueue,
  userRecipeLibrary,
  usdaIngredients,
} from "@staged/db";

export type DBUser = InferSelectModel<typeof users>;
export type DBNewUser = InferInsertModel<typeof users>;
export type DBHousehold = InferSelectModel<typeof households>;
export type DBNewHousehold = InferInsertModel<typeof households>;
export type DBHouseholdMember = InferSelectModel<typeof householdMembers>;
export type DBRecipe = InferSelectModel<typeof recipes>;
export type DBNewRecipe = InferInsertModel<typeof recipes>;
export type DBRecipeIngredient = InferSelectModel<typeof recipeIngredients>;
export type DBSubstitution = InferSelectModel<typeof substitutions>;
export type DBGroceryList = InferSelectModel<typeof groceryLists>;
export type DBGroceryListItem = InferSelectModel<typeof groceryListItems>;
export type DBMealPlan = InferSelectModel<typeof mealPlans>;
export type DBMealPlanEntry = InferSelectModel<typeof mealPlanEntries>;
export type DBPantry = InferSelectModel<typeof pantry>;
export type DBPantryItem = InferSelectModel<typeof pantryItems>;
export type DBSyncQueueEntry = InferSelectModel<typeof syncQueue>;
export type DBUserRecipeLibraryEntry = InferSelectModel<
  typeof userRecipeLibrary
>;
export type DBUsdaIngredient = InferSelectModel<typeof usdaIngredients>;
