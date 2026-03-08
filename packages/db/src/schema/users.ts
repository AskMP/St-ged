import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { households } from "./households";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull().default(""),
  authProvider: text("auth_provider").notNull().default("email"),
  skillLevel: text("skill_level").notNull().default("beginner"), // 'beginner' | 'intermediate' | 'advanced'
  dietaryProfile: jsonb("dietary_profile").notNull().default({}),
  householdId: uuid("household_id").references(() => households.id, {
    onDelete: "set null",
  }),
  // hashedPassword stores bcrypt hash for credentials-provider users.
  // Auth.js's account table does NOT have a password column -- we own this field.
  // See CODE_REVIEW_2026-03-08.md AUTH-002 for the bug this fixes.
  hashedPassword: text("hashed_password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
