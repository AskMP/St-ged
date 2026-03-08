import {
  pgTable,
  uuid,
  timestamp,
  real,
  text,
  date,
  integer,
} from "drizzle-orm/pg-core";
import { households } from "./households";

export const pantry = pgTable("pantry", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .unique()
    .references(() => households.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pantryItems = pgTable("pantry_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  pantryId: uuid("pantry_id")
    .notNull()
    .references(() => pantry.id, { onDelete: "cascade" }),
  ingredientName: text("ingredient_name").notNull(),
  quantityValue: real("quantity_value"),
  quantityUnit: text("quantity_unit"),
  expiryDate: date("expiry_date"),
  usdaFdcId: integer("usda_fdc_id"),
});
