import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { households } from "./households";

export const groceryLists = pgTable("grocery_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Grocery List"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastModifiedAt: timestamp("last_modified_at").notNull().defaultNow(),
});
