import { pgTable, uuid, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { households } from "./households";

export const householdCosts = pgTable("household_costs", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  total: real("total").notNull(),
  splits: jsonb("splits").notNull().default({}),
  date: timestamp("date").notNull().defaultNow(),
});
