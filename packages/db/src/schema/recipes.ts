import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  sourceUrl: text("source_url"),
  servingsBase: integer("servings_base").notNull().default(4),
  cookTimeMinutes: integer("cook_time_minutes"),
  prepTimeMinutes: integer("prep_time_minutes"),
  skillLevel: text("skill_level").notNull().default("beginner"), // 'beginner' | 'intermediate' | 'advanced'
  dietaryTags: text("dietary_tags").array().notNull().default([]),
  zeroWasteScore: real("zero_waste_score"),
  nutritionPerServing: jsonb("nutrition_per_serving"),
  nutritionSource: text("nutrition_source"), // 'usda' | 'edamam' | 'estimated'
  techniqueTags: text("technique_tags").array().notNull().default([]),
  isLicensed: boolean("is_licensed").notNull().default(false),
  importSource: text("import_source"), // 'url' | 'manual' | 'ai'
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
