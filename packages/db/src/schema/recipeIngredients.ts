import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { recipes } from "./recipes";

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  name: text("name").notNull(),
  quantityValue: real("quantity_value"),
  quantityUnit: text("quantity_unit"),
  usdaFdcId: integer("usda_fdc_id"), // FK to usda_ingredients; nullable until USDA import runs
  isBulkAvailable: boolean("is_bulk_available").notNull().default(false),
});
