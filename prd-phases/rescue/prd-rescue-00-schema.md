---
task: "Drizzle schema ground-up -- all 15 MVP tables, migration, config, seeds, type alignment"
branch: "stg-rescue-00/schema"
test_command: "pnpm --filter @staged/db migrate && pnpm --filter @staged/db test"
completion_promise: "COMPLETE"
max_iterations: 15
chain_next: "rescue-01"
requires: []
parallel_safe: false
group: "rescue"
manifest_id: "rescue-00"
---

# PRD Rescue-00: Drizzle Schema Ground-Up

## Mandatory Pre-Read

Before writing a single line of code, read these three documents in full:

1. `RESCUE_PROTOCOL.md` -- the mandate for this rebuild
2. `CODE_REVIEW_2026-03-08.md` -- the audit that identified the gaps (SCHEMA-001 through SCHEMA-007)
3. `prd-phases/rescue/rescue-manifest.md` -- the rescue controller

**Role**: You are the Lead Database Engineer on a rescue mission. The codebase
was marked "complete" by a prior autonomous loop that created placeholder files
and moved on. The schema was never written. You are writing it now from scratch.

---

## Context for Agent

### The Situation

`packages/db/src/schema/index.ts` contains exactly two comment lines and nothing else.
`packages/db/src/migrations/` contains only `.gitkeep`.
`packages/db/drizzle.config.ts` has no `dbCredentials` field, so `drizzle-kit migrate`
aborts on every invocation.

**Every API route, service, and test in this repo operates against tables whose
Drizzle definitions do not exist.** The tables exist in Postgres because Auth.js
bootstrapped them at runtime, and because the signup route fires raw SQL -- but the
TypeScript compiler has no knowledge of them. Type safety, IDE completion, and
compile-time validation are completely absent.

This PRD fixes that. By the end of this PRD:

- 15 Drizzle table definitions exist in `packages/db/src/schema/`
- A clean migration has been generated and applied to the local database
- Seed fixtures exist for realistic test data
- `packages/types/src/` entity types are derived from `InferSelectModel` not guessed
- `pnpm type-check` passes on the db package
- `pnpm --filter @staged/db generate` produces a non-empty migration

### What Exists That You Will Keep

- `packages/db/src/index.ts` -- the 3-line Drizzle setup is correct; keep it
- `packages/db/drizzle.config.ts` -- correct except for missing `dbCredentials`; fix in Task 1
- `packages/db/src/queries/recipes.ts` -- stubs that throw; remove in Task 7
- `packages/types/src/*.ts` -- types exist but drift from reality; align in Task 6

### What You Are Building From Scratch

All files in `packages/db/src/schema/` except the index (which you will replace).

### Critical Design Decisions (read before writing tables)

1. **Drizzle column naming convention**: Use camelCase field names, snake_case column
   names. Example: `displayName: text('display_name')`. This makes the raw SQL in
   existing services (which uses snake_case) continue to work without change.

2. **Auth.js table ownership**: Auth.js (`@auth/drizzle-adapter`) auto-creates four
   tables: `user`, `account`, `session`, `verification_token`. DO NOT define these
   in the Drizzle schema -- Auth.js owns them. Our `users` table is the app-level
   profile table (skill level, dietary profile, householdId) -- it is separate and
   linked by matching email.

3. **Password storage decision**: Auth.js's `account` table does not have a `password`
   column. The prior code tried to insert a password there (see AUTH-002 in the audit).
   The fix (implemented in PRD rescue-01) is to add a `hashedPassword` nullable text
   column to OUR `users` table instead. Add that column here so rescue-01 can use it
   immediately.

4. **Foreign key order**: Define tables in dependency order (households before users,
   since users.householdId references households). Use `relations()` from drizzle-orm
   for the relation metadata.

5. **UUID primary keys**: All tables use `uuid().primaryKey().defaultRandom()` unless
   specified otherwise (usdaIngredients uses integer fdcId).

6. **Timestamps**: All tables use `createdAt: timestamp().notNull().defaultNow()` and
   `updatedAt: timestamp().notNull().defaultNow()` unless the table is a join table.

### Local Dev Environment

Assumes Docker Compose PostgreSQL is running:

```
docker compose up -d
# DATABASE_URL=postgresql://staged:staged_dev_password@localhost:5432/staged_dev
```

If Docker is not running, start it before Task 3. If `.env.local` does not exist,
copy from `.env.example` first.

### Skills and Commands

| Action             | Command                               |
| ------------------ | ------------------------------------- |
| Generate migration | `pnpm --filter @staged/db generate`   |
| Apply migration    | `pnpm --filter @staged/db migrate`    |
| Inspect tables     | `psql $DATABASE_URL -c "\dt"`         |
| Type check db pkg  | `pnpm --filter @staged/db type-check` |
| Run db tests       | `pnpm --filter @staged/db test`       |

---

## Tasks

### Task 1: Fix `drizzle.config.ts` to include `dbCredentials` `[BD:STG-200]`

- **Type**: task (SCHEMA-003 fix)
- **Do**: Open `packages/db/drizzle.config.ts`. The current content is:

  ```typescript
  import type { Config } from "drizzle-kit";
  export default {
    dialect: "postgresql",
    schema: "./src/schema/index.ts",
    out: "./src/migrations",
  } satisfies Config;
  ```

  Replace with:

  ```typescript
  import type { Config } from "drizzle-kit";

  export default {
    dialect: "postgresql",
    schema: "./src/schema/index.ts",
    out: "./src/migrations",
    dbCredentials: {
      url:
        process.env.DATABASE_URL ??
        "postgresql://staged:staged_dev_password@localhost:5432/staged_dev",
    },
  } satisfies Config;
  ```

  The fallback URL matches the docker-compose default so the command works without
  `.env.local` in CI. Do not hardcode credentials in production -- the `DATABASE_URL`
  env var will override the default in all real environments.

- **Files**: `packages/db/drizzle.config.ts`
- **Verify**: `pnpm --filter @staged/db generate` runs without throwing "missing db credentials"
- **Accept**: Command exits 0 (may produce empty migration if schema is still placeholder; that is fine at this step)

---

### Task 2: Write household and household_members tables `[BD:STG-201]`

- **Type**: feature (SCHEMA-001 partial)
- **Do**: Create `packages/db/src/schema/households.ts`:

  ```typescript
  import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

  export const households = pgTable("households", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    inviteCode: text("invite_code").notNull().unique(),
    createdBy: uuid("created_by"), // FK to users added via relations; circular ref handled below
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  });
  ```

  Create `packages/db/src/schema/householdMembers.ts`:

  ```typescript
  import {
    pgTable,
    uuid,
    text,
    timestamp,
    primaryKey,
  } from "drizzle-orm/pg-core";
  import { households } from "./households";

  export const householdMembers = pgTable(
    "household_members",
    {
      householdId: uuid("household_id")
        .notNull()
        .references(() => households.id, { onDelete: "cascade" }),
      userId: uuid("user_id").notNull(), // references users; set after users table exists
      role: text("role").notNull().default("member"), // 'owner' | 'member' | 'guest'
      joinedAt: timestamp("joined_at").notNull().defaultNow(),
    },
    (table) => [primaryKey({ columns: [table.householdId, table.userId] })],
  );
  ```

  Note: `userId` FK to `users` is declared via `relations()` in a later step to avoid
  circular dependency between households and users. The column type is still uuid so the
  constraint is enforced at the application level until the FK is added in a migration.

- **Files**: `packages/db/src/schema/households.ts`, `packages/db/src/schema/householdMembers.ts`
- **Verify**: TypeScript compiles these two files without error
- **Accept**: Files exist with correct column definitions

---

### Task 3: Write the users table `[BD:STG-202]`

- **Type**: feature (SCHEMA-001 partial + AUTH-002 pre-fix)
- **Do**: Create `packages/db/src/schema/users.ts`:

  ```typescript
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
  ```

  **Why `hashedPassword` is here and not in the `account` table**: Auth.js's
  DrizzleAdapter creates the `account` table without a password column. The prior
  signup code tried to insert `password` into `account` and threw a Postgres error.
  Storing the hash on our own `users` table (which we fully control) gives us a
  column we can add/migrate without touching Auth.js internals.

- **Files**: `packages/db/src/schema/users.ts`
- **Verify**: File compiles; `householdId` FK references `households.id`
- **Accept**: `users` table defined with all columns including `hashedPassword`

---

### Task 4: Write recipes and recipe_ingredients tables `[BD:STG-203]`

- **Type**: feature (SCHEMA-001 partial)
- **Do**: Create `packages/db/src/schema/recipes.ts`:

  ```typescript
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
  ```

  Create `packages/db/src/schema/recipeIngredients.ts`:

  ```typescript
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
  ```

  Create `packages/db/src/schema/substitutions.ts`:

  ```typescript
  import { pgTable, uuid, text, real } from "drizzle-orm/pg-core";
  import { recipeIngredients } from "./recipeIngredients";

  export const substitutions = pgTable("substitutions", {
    id: uuid("id").primaryKey().defaultRandom(),
    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => recipeIngredients.id, { onDelete: "cascade" }),
    category: text("category").notNull(), // 'dairy-free' | 'vegan' | 'gluten-free' | 'budget'
    replacementName: text("replacement_name").notNull(),
    quantityModifier: real("quantity_modifier").notNull().default(1.0),
    note: text("note"),
  });
  ```

- **Files**: `packages/db/src/schema/recipes.ts`, `packages/db/src/schema/recipeIngredients.ts`, `packages/db/src/schema/substitutions.ts`
- **Verify**: Files compile without circular-dependency errors
- **Accept**: Three files with correct FK chains: recipes -> users, recipeIngredients -> recipes, substitutions -> recipeIngredients

---

### Task 5: Write grocery list, meal plan, pantry, and supporting tables `[BD:STG-204]`

- **Type**: feature (SCHEMA-001 partial)
- **Do**: Create each file below.

  **`packages/db/src/schema/groceryLists.ts`**:

  ```typescript
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
  ```

  **`packages/db/src/schema/groceryListItems.ts`**:

  ```typescript
  import {
    pgTable,
    uuid,
    text,
    real,
    boolean,
    timestamp,
    integer,
  } from "drizzle-orm/pg-core";
  import { groceryLists } from "./groceryLists";
  import { users } from "./users";
  import { recipes } from "./recipes";

  export const groceryListItems = pgTable("grocery_list_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id")
      .notNull()
      .references(() => groceryLists.id, { onDelete: "cascade" }),
    ingredientName: text("ingredient_name").notNull(),
    quantityValue: real("quantity_value"),
    quantityUnit: text("quantity_unit"),
    isChecked: boolean("is_checked").notNull().default(false),
    checkedBy: uuid("checked_by").references(() => users.id, {
      onDelete: "set null",
    }),
    checkedAt: timestamp("checked_at"),
    sourceRecipeId: uuid("source_recipe_id").references(() => recipes.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
  });
  ```

  **`packages/db/src/schema/mealPlans.ts`**:

  ```typescript
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
  ```

  **`packages/db/src/schema/mealPlanEntries.ts`**:

  ```typescript
  import { pgTable, uuid, date, integer } from "drizzle-orm/pg-core";
  import { mealPlans } from "./mealPlans";
  import { recipes } from "./recipes";

  export const mealPlanEntries = pgTable("meal_plan_entries", {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => mealPlans.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    servingsOverride: integer("servings_override"),
  });
  ```

  **`packages/db/src/schema/pantry.ts`**:

  ```typescript
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
  ```

  **`packages/db/src/schema/syncQueue.ts`**:

  ```typescript
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
  ```

  **`packages/db/src/schema/userRecipeLibrary.ts`**:

  ```typescript
  import {
    pgTable,
    uuid,
    timestamp,
    text,
    primaryKey,
  } from "drizzle-orm/pg-core";
  import { users } from "./users";
  import { recipes } from "./recipes";

  export const userRecipeLibrary = pgTable(
    "user_recipe_library",
    {
      userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
      recipeId: uuid("recipe_id")
        .notNull()
        .references(() => recipes.id, { onDelete: "cascade" }),
      savedAt: timestamp("saved_at").notNull().defaultNow(),
      personalNotes: text("personal_notes"),
      variantOf: uuid("variant_of").references(() => recipes.id, {
        onDelete: "set null",
      }),
    },
    (table) => [primaryKey({ columns: [table.userId, table.recipeId] })],
  );
  ```

  **`packages/db/src/schema/usdaIngredients.ts`**:

  ```typescript
  import {
    pgTable,
    integer,
    text,
    real,
    customType,
  } from "drizzle-orm/pg-core";

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
  ```

- **Files**: All 8 files listed above
- **Verify**: All files compile; no circular import errors
- **Accept**: 8 table definitions exist covering grocery lists, meal plans, pantry, sync queue, user recipe library, and USDA ingredients

---

### Task 6: Update `schema/index.ts` to export all tables and define relations `[BD:STG-205]`

- **Type**: task (SCHEMA-001 final step)
- **Do**: Replace the entire contents of `packages/db/src/schema/index.ts` with:

  ```typescript
  // Drizzle schema -- all MVP tables
  // Single source of truth for database shape.
  // If you add a table, add it here AND in the barrel exports below.

  export * from "./households";
  export * from "./householdMembers";
  export * from "./users";
  export * from "./recipes";
  export * from "./recipeIngredients";
  export * from "./substitutions";
  export * from "./groceryLists";
  export * from "./groceryListItems";
  export * from "./mealPlans";
  export * from "./mealPlanEntries";
  export * from "./pantry";
  export * from "./syncQueue";
  export * from "./userRecipeLibrary";
  export * from "./usdaIngredients";

  // Drizzle relations -- used by relational query API (db.query.*)
  import { relations } from "drizzle-orm";
  import { households } from "./households";
  import { householdMembers } from "./householdMembers";
  import { users } from "./users";
  import { recipes } from "./recipes";
  import { recipeIngredients } from "./recipeIngredients";
  import { substitutions } from "./substitutions";
  import { groceryLists } from "./groceryLists";
  import { groceryListItems } from "./groceryListItems";
  import { mealPlans } from "./mealPlans";
  import { mealPlanEntries } from "./mealPlanEntries";
  import { pantry, pantryItems } from "./pantry";
  import { syncQueue } from "./syncQueue";
  import { userRecipeLibrary } from "./userRecipeLibrary";

  export const householdsRelations = relations(households, ({ one, many }) => ({
    members: many(householdMembers),
    groceryLists: many(groceryLists),
    mealPlans: many(mealPlans),
    pantry: one(pantry),
    syncQueue: many(syncQueue),
  }));

  export const householdMembersRelations = relations(
    householdMembers,
    ({ one }) => ({
      household: one(households, {
        fields: [householdMembers.householdId],
        references: [households.id],
      }),
      user: one(users, {
        fields: [householdMembers.userId],
        references: [users.id],
      }),
    }),
  );

  export const usersRelations = relations(users, ({ one, many }) => ({
    household: one(households, {
      fields: [users.householdId],
      references: [households.id],
    }),
    savedRecipes: many(userRecipeLibrary),
    createdRecipes: many(recipes),
  }));

  export const recipesRelations = relations(recipes, ({ one, many }) => ({
    ingredients: many(recipeIngredients),
    createdBy: one(users, {
      fields: [recipes.createdBy],
      references: [users.id],
    }),
    savedBy: many(userRecipeLibrary),
  }));

  export const recipeIngredientsRelations = relations(
    recipeIngredients,
    ({ one, many }) => ({
      recipe: one(recipes, {
        fields: [recipeIngredients.recipeId],
        references: [recipes.id],
      }),
      substitutions: many(substitutions),
    }),
  );

  export const substitutionsRelations = relations(substitutions, ({ one }) => ({
    ingredient: one(recipeIngredients, {
      fields: [substitutions.ingredientId],
      references: [recipeIngredients.id],
    }),
  }));

  export const groceryListsRelations = relations(
    groceryLists,
    ({ one, many }) => ({
      household: one(households, {
        fields: [groceryLists.householdId],
        references: [households.id],
      }),
      items: many(groceryListItems),
    }),
  );

  export const groceryListItemsRelations = relations(
    groceryListItems,
    ({ one }) => ({
      list: one(groceryLists, {
        fields: [groceryListItems.listId],
        references: [groceryLists.id],
      }),
      checkedByUser: one(users, {
        fields: [groceryListItems.checkedBy],
        references: [users.id],
      }),
      sourceRecipe: one(recipes, {
        fields: [groceryListItems.sourceRecipeId],
        references: [recipes.id],
      }),
    }),
  );

  export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
    household: one(households, {
      fields: [mealPlans.householdId],
      references: [households.id],
    }),
    entries: many(mealPlanEntries),
  }));

  export const mealPlanEntriesRelations = relations(
    mealPlanEntries,
    ({ one }) => ({
      plan: one(mealPlans, {
        fields: [mealPlanEntries.planId],
        references: [mealPlans.id],
      }),
      recipe: one(recipes, {
        fields: [mealPlanEntries.recipeId],
        references: [recipes.id],
      }),
    }),
  );

  export const pantryRelations = relations(pantry, ({ one, many }) => ({
    household: one(households, {
      fields: [pantry.householdId],
      references: [households.id],
    }),
    items: many(pantryItems),
  }));

  export const pantryItemsRelations = relations(pantryItems, ({ one }) => ({
    pantry: one(pantry, {
      fields: [pantryItems.pantryId],
      references: [pantry.id],
    }),
  }));

  export const userRecipeLibraryRelations = relations(
    userRecipeLibrary,
    ({ one }) => ({
      user: one(users, {
        fields: [userRecipeLibrary.userId],
        references: [users.id],
      }),
      recipe: one(recipes, {
        fields: [userRecipeLibrary.recipeId],
        references: [recipes.id],
      }),
    }),
  );
  ```

- **Files**: `packages/db/src/schema/index.ts`
- **Verify**: `pnpm --filter @staged/db type-check` passes
- **Accept**: Schema barrel exports all 15 tables; relations are fully declared

---

### Task 7: Generate migration and apply to local database `[BD:STG-206]`

- **Type**: task (SCHEMA-002 fix)
- **Do**:
  1. Ensure Docker Compose PostgreSQL is running: `docker compose up -d`
  2. Ensure `.env.local` exists with `DATABASE_URL` set
  3. Run: `pnpm --filter @staged/db generate`
     This should create a non-empty migration file in `packages/db/src/migrations/`.
     If you see `No schema changes detected`, the schema index is not exporting
     correctly -- go back and verify Task 6.
  4. Create `packages/db/src/migrate.ts` if it does not exist:

     ```typescript
     import { drizzle } from "drizzle-orm/node-postgres";
     import { migrate } from "drizzle-orm/node-postgres/migrator";
     import { Pool } from "pg";

     const pool = new Pool({ connectionString: process.env.DATABASE_URL });
     const db = drizzle(pool);

     async function main() {
       console.log("Running migrations...");
       await migrate(db, { migrationsFolder: "./src/migrations" });
       console.log("Migrations complete.");
       await pool.end();
     }

     main().catch((err) => {
       console.error(err);
       process.exit(1);
     });
     ```

  5. Add a `migrate` script to `packages/db/package.json`:
     ```json
     "scripts": {
       "migrate": "dotenv -e ../../.env.local -- tsx src/migrate.ts",
       "generate": "drizzle-kit generate",
       "studio": "drizzle-kit studio"
     }
     ```
     (install `dotenv-cli` if not present: `pnpm --filter @staged/db add -D dotenv-cli`)
  6. Run: `pnpm --filter @staged/db migrate`
  7. Verify tables: `psql $DATABASE_URL -c "\dt"` -- you should see all 15 app tables
     plus the 4 Auth.js tables (`user`, `account`, `session`, `verification_token`)
     if Auth.js has been initialized. The Auth.js tables are created separately by
     the adapter; they are not in our migrations.

  **Post-migration SQL**: After the migration applies, execute this SQL to add the
  FTS trigger for `usda_ingredients`. Either run it directly in psql or add it to
  a post-migration step in `migrate.ts`:

  ```sql
  CREATE INDEX IF NOT EXISTS usda_ingredients_search_idx
    ON usda_ingredients USING gin(search_vector);

  CREATE OR REPLACE FUNCTION usda_ingredients_search_update()
  RETURNS trigger AS $$
  BEGIN
    NEW.search_vector := to_tsvector('english', NEW.description);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS usda_ingredients_search_trigger ON usda_ingredients;
  CREATE TRIGGER usda_ingredients_search_trigger
    BEFORE INSERT OR UPDATE ON usda_ingredients
    FOR EACH ROW EXECUTE FUNCTION usda_ingredients_search_update();
  ```

- **Files**: `packages/db/src/migrate.ts`, `packages/db/package.json`, migration file in `packages/db/src/migrations/`
- **Verify**: `pnpm --filter @staged/db migrate` exits 0; `psql $DATABASE_URL -c "\dt"` shows all 15 app tables
- **Accept**: Database has all tables; migration file is non-empty and committed

---

### Task 8: Remove stub query helpers `[BD:STG-207]`

- **Type**: task (SCHEMA-004 fix)
- **Do**: Delete `packages/db/src/queries/recipes.ts`. It contains only three functions
  that throw `Error('not implemented')`. No production code imports from this file
  (verify with `grep -r "queries/recipes" apps/ packages/` -- if any imports exist,
  remove those import lines first). Real Drizzle query helpers will be added in
  rescue-03 when the service layer is migrated.
  If the `packages/db/src/queries/` directory becomes empty, delete it too.
- **Files**: `packages/db/src/queries/recipes.ts` (delete)
- **Verify**: `grep -r "from.*queries/recipes" apps/ packages/` returns nothing
- **Accept**: Stub file deleted; no broken imports remain

---

### Task 9: Write seed fixtures `[BD:STG-208]`

- **Type**: task (SCHEMA-006 fix)
- **Do**: Create `packages/db/src/seeds/fixtures.ts` with deterministic test data:

  ```typescript
  // Deterministic seed fixtures for development and E2E testing.
  // All IDs are fixed UUIDs so tests can reference them by constant.
  // Run: pnpm --filter @staged/db seed

  export const SEED = {
    households: {
      primary: {
        id: "11111111-0000-0000-0000-000000000001",
        name: "The Demo Household",
        inviteCode: "demo-invite-01",
      },
      guest: {
        id: "11111111-0000-0000-0000-000000000002",
        name: "Guest Household",
        inviteCode: "guest-invite-01",
      },
    },
    users: {
      owner: {
        id: "22222222-0000-0000-0000-000000000001",
        email: "owner@staged.test",
        displayName: "Demo Owner",
        skillLevel: "intermediate",
      },
      member: {
        id: "22222222-0000-0000-0000-000000000002",
        email: "member@staged.test",
        displayName: "Demo Member",
        skillLevel: "beginner",
      },
    },
    recipes: {
      pasta: {
        id: "33333333-0000-0000-0000-000000000001",
        title: "Classic Pasta Carbonara",
        skillLevel: "intermediate",
        servingsBase: 4,
      },
      salad: {
        id: "33333333-0000-0000-0000-000000000002",
        title: "Simple Green Salad",
        skillLevel: "beginner",
        servingsBase: 2,
      },
    },
  };
  ```

  Create `packages/db/src/seeds/index.ts`:

  ```typescript
  import { drizzle } from "drizzle-orm/node-postgres";
  import { Pool } from "pg";
  import * as schema from "../schema";
  import { SEED } from "./fixtures";

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  export async function seedDatabase() {
    console.log("Seeding database...");

    // households
    await db
      .insert(schema.households)
      .values([
        {
          id: SEED.households.primary.id,
          name: SEED.households.primary.name,
          inviteCode: SEED.households.primary.inviteCode,
          createdBy: SEED.users.owner.id,
        },
        {
          id: SEED.households.guest.id,
          name: SEED.households.guest.name,
          inviteCode: SEED.households.guest.inviteCode,
          createdBy: SEED.users.member.id,
        },
      ])
      .onConflictDoNothing();

    // users
    await db
      .insert(schema.users)
      .values([
        {
          id: SEED.users.owner.id,
          email: SEED.users.owner.email,
          displayName: SEED.users.owner.displayName,
          skillLevel: "intermediate",
          householdId: SEED.households.primary.id,
        },
        {
          id: SEED.users.member.id,
          email: SEED.users.member.email,
          displayName: SEED.users.member.displayName,
          skillLevel: "beginner",
          householdId: SEED.households.primary.id,
        },
      ])
      .onConflictDoNothing();

    // household members
    await db
      .insert(schema.householdMembers)
      .values([
        {
          householdId: SEED.households.primary.id,
          userId: SEED.users.owner.id,
          role: "owner",
        },
        {
          householdId: SEED.households.primary.id,
          userId: SEED.users.member.id,
          role: "member",
        },
      ])
      .onConflictDoNothing();

    // recipes
    await db
      .insert(schema.recipes)
      .values([
        {
          id: SEED.recipes.pasta.id,
          title: SEED.recipes.pasta.title,
          skillLevel: "intermediate",
          servingsBase: 4,
          dietaryTags: [],
          techniqueTags: ["sauté"],
          createdBy: SEED.users.owner.id,
        },
        {
          id: SEED.recipes.salad.id,
          title: SEED.recipes.salad.title,
          skillLevel: "beginner",
          servingsBase: 2,
          dietaryTags: ["vegan", "gluten-free"],
          techniqueTags: [],
          createdBy: SEED.users.owner.id,
        },
      ])
      .onConflictDoNothing();

    // pantry for primary household
    const pantryId = "aaaaaaaa-0000-0000-0000-000000000001";
    await db
      .insert(schema.pantry)
      .values([{ id: pantryId, householdId: SEED.households.primary.id }])
      .onConflictDoNothing();

    await db
      .insert(schema.pantryItems)
      .values([
        {
          pantryId,
          ingredientName: "Olive oil",
          quantityValue: 500,
          quantityUnit: "ml",
        },
        {
          pantryId,
          ingredientName: "Kosher salt",
          quantityValue: 1,
          quantityUnit: "box",
        },
        {
          pantryId,
          ingredientName: "Black pepper",
          quantityValue: 50,
          quantityUnit: "g",
        },
        {
          pantryId,
          ingredientName: "Garlic",
          quantityValue: 1,
          quantityUnit: "bulb",
        },
      ])
      .onConflictDoNothing();

    // grocery list
    const listId = "bbbbbbbb-0000-0000-0000-000000000001";
    await db
      .insert(schema.groceryLists)
      .values([
        {
          id: listId,
          householdId: SEED.households.primary.id,
          name: "This Week",
        },
      ])
      .onConflictDoNothing();

    await db
      .insert(schema.groceryListItems)
      .values([
        {
          listId,
          ingredientName: "Spaghetti",
          quantityValue: 400,
          quantityUnit: "g",
          sourceRecipeId: SEED.recipes.pasta.id,
        },
        {
          listId,
          ingredientName: "Pancetta",
          quantityValue: 150,
          quantityUnit: "g",
          sourceRecipeId: SEED.recipes.pasta.id,
        },
        {
          listId,
          ingredientName: "Eggs",
          quantityValue: 4,
          quantityUnit: "large",
          sourceRecipeId: SEED.recipes.pasta.id,
        },
      ])
      .onConflictDoNothing();

    console.log("Seed complete.");
    await pool.end();
  }

  // Run directly: pnpm --filter @staged/db seed
  if (process.argv[1] === new URL(import.meta.url).pathname) {
    seedDatabase().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  }
  ```

  Add `"seed": "dotenv -e ../../.env.local -- tsx src/seeds/index.ts"` to
  `packages/db/package.json` scripts.

- **Files**: `packages/db/src/seeds/fixtures.ts`, `packages/db/src/seeds/index.ts`, `packages/db/package.json`
- **Verify**: `pnpm --filter @staged/db seed` runs without error; sample data visible in db
- **Accept**: Seed inserts at least 2 households, 2 users, 2 recipes, pantry items, one grocery list

---

### Task 10: Align shared types with schema via InferSelectModel `[BD:STG-209]`

- **Type**: task (SCHEMA-007 fix)
- **Do**: In each `packages/types/src/*.ts` file, ensure the entity types derive from
  or at minimum are consistent with Drizzle's `InferSelectModel`. The goal is to
  eliminate silent drift between types and schema.

  For each core entity, add a re-export from the db package. Create
  `packages/types/src/db-types.ts`:

  ```typescript
  // These types are derived from the Drizzle schema via InferSelectModel.
  // They are the canonical runtime types for database rows.
  // Do not define separate interfaces for these entities -- import from here.
  import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
  import type {
    users,
    households,
    householdMembers,
    recipes,
    recipeIngredients,
    substitutions,
    groceryLists,
    groceryListItems,
    mealPlans,
    mealPlanEntries,
    pantry,
    pantryItems,
    syncQueue,
    userRecipeLibrary,
    usdaIngredients,
  } from "@staged/db";

  export type User = InferSelectModel<typeof users>;
  export type NewUser = InferInsertModel<typeof users>;
  export type Household = InferSelectModel<typeof households>;
  export type NewHousehold = InferInsertModel<typeof households>;
  export type HouseholdMember = InferSelectModel<typeof householdMembers>;
  export type Recipe = InferSelectModel<typeof recipes>;
  export type NewRecipe = InferInsertModel<typeof recipes>;
  export type RecipeIngredient = InferSelectModel<typeof recipeIngredients>;
  export type Substitution = InferSelectModel<typeof substitutions>;
  export type GroceryList = InferSelectModel<typeof groceryLists>;
  export type GroceryListItem = InferSelectModel<typeof groceryListItems>;
  export type MealPlan = InferSelectModel<typeof mealPlans>;
  export type MealPlanEntry = InferSelectModel<typeof mealPlanEntries>;
  export type Pantry = InferSelectModel<typeof pantry>;
  export type PantryItem = InferSelectModel<typeof pantryItems>;
  export type SyncQueueEntry = InferSelectModel<typeof syncQueue>;
  export type UserRecipeLibraryEntry = InferSelectModel<
    typeof userRecipeLibrary
  >;
  export type UsdaIngredient = InferSelectModel<typeof usdaIngredients>;
  ```

  Export this from `packages/types/src/index.ts`. Existing manual type definitions
  that duplicate these (e.g., a hand-written `Recipe` interface) should be replaced
  with or aliased to the `InferSelectModel` versions. If a manual type adds fields
  not in the DB (e.g., computed fields, API response shapes), keep those as separate
  `*Response` or `*View` types.

- **Files**: `packages/types/src/db-types.ts`, `packages/types/src/index.ts`
- **Verify**: `pnpm type-check` passes; no duplicate `Recipe`, `User`, `Household` type definitions
- **Accept**: Schema-derived types exported from `@staged/types`; `pnpm type-check` green

---

### Task 11: Create CORRECTION_LOG.md and update rescue manifest `[BD:STG-210]`

- **Type**: chore
- **Do**:
  1. Create `CORRECTION_LOG.md` at the project root with this content:

     ```markdown
     # Correction Log -- Staged Rescue

     Maintained per RESCUE_PROTOCOL.md. Every major change is logged here.

     | Feature / Component                  | Status Origin                                                                    | Action                            | Rationale                                                                       | Persona Alignment                      | Validation                                                         |
     | :----------------------------------- | :------------------------------------------------------------------------------- | :-------------------------------- | :------------------------------------------------------------------------------ | :------------------------------------- | :----------------------------------------------------------------- |
     | Drizzle schema (all 15 tables)       | Missing -- placeholder comment                                                   | Implemented from scratch          | Foundation for all data layers; prior loop marked complete without writing code | All personas (data layer)              | pnpm --filter @staged/db migrate exits 0; psql \dt shows 15 tables |
     | drizzle.config.ts dbCredentials      | Missing -- migrate command aborted                                               | Added dbCredentials field         | Without credentials drizzle-kit migrate throws and no migration can run         | All personas                           | pnpm --filter @staged/db generate exits 0                          |
     | hashedPassword column on users table | Missing -- prior code tried to insert into account.password which does not exist | Added to users table              | We own the users table; Auth.js account table has no password column            | All personas (auth)                    | Verified in rescue-01 when signup is fixed                         |
     | Database seed fixtures               | Missing                                                                          | Implemented                       | E2E tests need deterministic data; prior tests ran against empty DB             | Jordan (onboarding), Darius (planning) | pnpm --filter @staged/db seed exits 0                              |
     | Stub query helpers                   | Placeholder (throw not-implemented)                                              | Deleted                           | Throws unconditionally; will be replaced by Drizzle ORM queries in rescue-03    | N/A                                    | grep confirms no imports                                           |
     | packages/types db-types.ts           | Types derived independently of schema                                            | Added InferSelectModel derivation | Eliminates silent type drift between schema and runtime types                   | All personas                           | pnpm type-check passes                                             |
     ```

  2. Open `prd-phases/rescue/rescue-manifest.md`. Find the `rescue-00` registry entry.
     Change `status: pending` to `status: complete`. Update Current State:
     "Last completed PRD" = `rescue-00`, progress = `1 / 5 rescue PRDs complete`.

- **Files**: `CORRECTION_LOG.md` (create), `prd-phases/rescue/rescue-manifest.md`
- **Verify**: `CORRECTION_LOG.md` exists; manifest shows rescue-00 complete
- **Accept**: Log and manifest updated; rescue-01 is now unblocked

---

## Discovered Tasks

_None yet._
