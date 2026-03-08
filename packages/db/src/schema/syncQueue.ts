import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { households } from "./households";
import { users } from "./users";

export const syncQueue = pgTable("sync_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mutationType: text("mutation_type").notNull(), // 'list_item_check' | 'list_item_add' | 'plan_assign' etc.
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  syncedAt: timestamp("synced_at"),
  status: text("status").notNull().default("pending"), // 'pending' | 'synced' | 'failed'
});
