import {
  pgTable,
  uuid,
  text,
  real,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { groceryLists } from "./groceryLists";
import { users } from "./users";
import { recipes } from "./recipes";

export const groceryListItems = pgTable("grocery_list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  listId: uuid("list_id")
    .notNull()
    .references(() => groceryLists.id, { onDelete: "cascade" }),
  ingredientName: text("ingredient_name").notNull(),
  quantityValue: real("quantity_value"),
  quantityUnit: text("quantity_unit"),
  isChecked: boolean("is_checked").notNull().default(false),
  checkedBy: uuid("checked_by").references(() => users.id, {
    onDelete: "set null",
  }),
  checkedAt: timestamp("checked_at"),
  sourceRecipeId: uuid("source_recipe_id").references(() => recipes.id, {
    onDelete: "set null",
  }),
  sortOrder: integer("sort_order").notNull().default(0),
});
