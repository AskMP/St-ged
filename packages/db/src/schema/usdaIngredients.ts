import { pgTable, integer, text, real, customType } from "drizzle-orm/pg-core";

// tsvector is a PostgreSQL-native type not in drizzle-orm/pg-core by default.
// We declare a custom type so Drizzle knows the column exists, but we manage
// the search_vector population via a Postgres trigger (see Task 3 migration notes).
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const usdaIngredients = pgTable("usda_ingredients", {
  fdcId: integer("fdc_id").primaryKey(),
  description: text("description").notNull(),
  brandOwner: text("brand_owner"),
  foodCategory: text("food_category"),
  energyKcal: real("energy_kcal"),
  proteinG: real("protein_g"),
  fatG: real("fat_g"),
  carbsG: real("carbs_g"),
  fiberG: real("fiber_g"),
  // searchVector is populated by a Postgres trigger on INSERT/UPDATE.
  // drizzle-kit will include the column in the migration; the trigger is applied
  // separately in the post-migration script in packages/db/src/migrate.ts.
  searchVector: tsvector("search_vector"),
});
