// Drizzle schema -- all MVP tables
// Single source of truth for database shape.
// If you add a table, add it here AND in the barrel exports below.

export * from "./households";
export * from "./householdMembers";
export * from "./users";
export * from "./recipes";
export * from "./recipeIngredients";
export * from "./substitutions";
export * from "./groceryLists";
export * from "./groceryListItems";
export * from "./mealPlans";
export * from "./mealPlanEntries";
export * from "./pantry";
export * from "./syncQueue";
export * from "./userRecipeLibrary";
export * from "./usdaIngredients";
export * from "./householdCosts";
export * from "./cookRotations";

// Drizzle relations -- used by relational query API (db.query.*)
import { relations } from "drizzle-orm";
import { households } from "./households";
import { householdMembers } from "./householdMembers";
import { users } from "./users";
import { recipes } from "./recipes";
import { recipeIngredients } from "./recipeIngredients";
import { substitutions } from "./substitutions";
import { groceryLists } from "./groceryLists";
import { groceryListItems } from "./groceryListItems";
import { mealPlans } from "./mealPlans";
import { mealPlanEntries } from "./mealPlanEntries";
import { pantry, pantryItems } from "./pantry";
import { syncQueue } from "./syncQueue";
import { userRecipeLibrary } from "./userRecipeLibrary";
import { householdCosts } from "./householdCosts";
import { cookRotations } from "./cookRotations";

export const householdsRelations = relations(households, ({ one, many }) => ({
  members: many(householdMembers),
  groceryLists: many(groceryLists),
  mealPlans: many(mealPlans),
  pantry: one(pantry),
  syncQueue: many(syncQueue),
}));

export const householdMembersRelations = relations(
  householdMembers,
  ({ one }) => ({
    household: one(households, {
      fields: [householdMembers.householdId],
      references: [households.id],
    }),
    user: one(users, {
      fields: [householdMembers.userId],
      references: [users.id],
    }),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
  savedRecipes: many(userRecipeLibrary),
  createdRecipes: many(recipes),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  ingredients: many(recipeIngredients),
  createdBy: one(users, {
    fields: [recipes.createdBy],
    references: [users.id],
  }),
  savedBy: many(userRecipeLibrary),
}));

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one, many }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
    substitutions: many(substitutions),
  }),
);

export const substitutionsRelations = relations(substitutions, ({ one }) => ({
  ingredient: one(recipeIngredients, {
    fields: [substitutions.ingredientId],
    references: [recipeIngredients.id],
  }),
}));

export const groceryListsRelations = relations(
  groceryLists,
  ({ one, many }) => ({
    household: one(households, {
      fields: [groceryLists.householdId],
      references: [households.id],
    }),
    items: many(groceryListItems),
  }),
);

export const groceryListItemsRelations = relations(
  groceryListItems,
  ({ one }) => ({
    list: one(groceryLists, {
      fields: [groceryListItems.listId],
      references: [groceryLists.id],
    }),
    checkedByUser: one(users, {
      fields: [groceryListItems.checkedBy],
      references: [users.id],
    }),
    sourceRecipe: one(recipes, {
      fields: [groceryListItems.sourceRecipeId],
      references: [recipes.id],
    }),
  }),
);

export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
  household: one(households, {
    fields: [mealPlans.householdId],
    references: [households.id],
  }),
  entries: many(mealPlanEntries),
}));

export const mealPlanEntriesRelations = relations(
  mealPlanEntries,
  ({ one }) => ({
    plan: one(mealPlans, {
      fields: [mealPlanEntries.planId],
      references: [mealPlans.id],
    }),
    recipe: one(recipes, {
      fields: [mealPlanEntries.recipeId],
      references: [recipes.id],
    }),
  }),
);

export const pantryRelations = relations(pantry, ({ one, many }) => ({
  household: one(households, {
    fields: [pantry.householdId],
    references: [households.id],
  }),
  items: many(pantryItems),
}));

export const pantryItemsRelations = relations(pantryItems, ({ one }) => ({
  pantry: one(pantry, {
    fields: [pantryItems.pantryId],
    references: [pantry.id],
  }),
}));

export const userRecipeLibraryRelations = relations(
  userRecipeLibrary,
  ({ one }) => ({
    user: one(users, {
      fields: [userRecipeLibrary.userId],
      references: [users.id],
    }),
    recipe: one(recipes, {
      fields: [userRecipeLibrary.recipeId],
      references: [recipes.id],
    }),
  }),
);

export const householdCostsRelations = relations(householdCosts, ({ one }) => ({
  household: one(households, {
    fields: [householdCosts.householdId],
    references: [households.id],
  }),
}));

export const cookRotationsRelations = relations(cookRotations, ({ one }) => ({
  household: one(households, {
    fields: [cookRotations.householdId],
    references: [households.id],
  }),
}));
