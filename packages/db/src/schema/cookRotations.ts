import { pgTable, uuid, text, jsonb, date } from "drizzle-orm/pg-core";
import { households } from "./households";

export const cookRotations = pgTable("cook_rotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .unique()
    .references(() => households.id, { onDelete: "cascade" }),
  frequency: text("frequency").notNull().default("weekly"), // 'weekly' | 'biweekly'
  members: jsonb("members").notNull().default([]),
  startDate: date("start_date").notNull(),
});
