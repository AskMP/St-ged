import { pgTable, uuid, date, integer } from "drizzle-orm/pg-core";
import { mealPlans } from "./mealPlans";
import { recipes } from "./recipes";

export const mealPlanEntries = pgTable("meal_plan_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => mealPlans.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  servingsOverride: integer("servings_override"),
});
