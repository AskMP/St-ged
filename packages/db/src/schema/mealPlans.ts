import { pgTable, uuid, timestamp, date } from "drizzle-orm/pg-core";
import { households } from "./households";

export const mealPlans = pgTable("meal_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
