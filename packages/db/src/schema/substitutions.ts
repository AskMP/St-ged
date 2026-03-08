import { pgTable, uuid, text, real } from "drizzle-orm/pg-core";
import { recipeIngredients } from "./recipeIngredients";

export const substitutions = pgTable("substitutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ingredientId: uuid("ingredient_id")
    .notNull()
    .references(() => recipeIngredients.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'dairy-free' | 'vegan' | 'gluten-free' | 'budget'
  replacementName: text("replacement_name").notNull(),
  quantityModifier: real("quantity_modifier").notNull().default(1.0),
  note: text("note"),
});
