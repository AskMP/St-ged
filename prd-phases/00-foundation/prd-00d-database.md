---
task: "Database setup -- PostgreSQL + Drizzle schema + Better Auth + USDA FDC dataset"
branch: "stg-00d/database"
test_command: "pnpm --filter @staged/db migrate"
completion_promise: "COMPLETE"
max_iterations: 12
chain_next: "00e"
requires: ["00b"]
parallel_safe: true
group: 0
manifest_id: "00d"
---

# PRD: Database Setup

## Context for Agent

### What This PRD Does

Sets up the full database layer: PostgreSQL connection (via Supabase for prod, local Docker for dev), Drizzle ORM schema skeleton with core tables, Better Auth integration, and the USDA FoodData Central dataset download + PostgreSQL import. By the end of this PRD, the DB schema exists and can be migrated, Better Auth tables are created, and the USDA FDC ingredient table is populated.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00b | Monorepo with `@staged/db` package skeleton, `packages/db/src/schema/index.ts` placeholder | `packages/db/` |

### Key Files to Read First

- `CLAUDE.md` -- data model section (Section 2.3 of project brief), USDA FDC self-hosted requirement
- `packages/db/package.json` -- current db package setup
- `packages/db/drizzle.config.ts` -- drizzle config

### Patterns to Follow

```typescript
// packages/db/src/schema/users.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  authProvider: text('auth_provider').notNull().default('email'),
  skillLevel: text('skill_level').notNull().default('beginner'), // beginner | intermediate | advanced
  dietaryProfile: jsonb('dietary_profile').notNull().default({}),
  householdId: uuid('household_id'), // FK added after households table
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

```typescript
// packages/db/src/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })
export * from './schema'
```

```bash
# USDA FDC download (script to be created)
# FoodData Central bulk download: https://fdc.nal.usda.gov/download-datasets.html
# Foundation Foods + SR Legacy JSON files
# Total size: ~200MB compressed, ~700K food entries
```

### Skills and Commands

| Action | Command |
|--------|---------|
| Generate migration | `pnpm --filter @staged/db generate` |
| Run migration | `pnpm --filter @staged/db migrate` |
| Open Drizzle Studio | `pnpm --filter @staged/db studio` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Set up local PostgreSQL for development** `[BD:STG-19]`
  - **Type**: task
  - **Do**: Create `docker-compose.yml` at the project root with a PostgreSQL 16 service: image `postgres:16-alpine`, env vars `POSTGRES_DB=staged_dev`, `POSTGRES_USER=staged`, `POSTGRES_PASSWORD=staged_dev_password`, port `5432:5432`, named volume `postgres_data`. Create `.env.example` at the project root with `DATABASE_URL=postgresql://staged:staged_dev_password@localhost:5432/staged_dev` and other placeholder env vars (ANTHROPIC_API_KEY, BETTER_AUTH_SECRET, INSTACART_IDP_AFFILIATE_ID). Document in README: "Copy `.env.example` to `.env.local` and run `docker compose up -d` to start local DB."
  - **Files**: `docker-compose.yml`, `.env.example`
  - **Verify**: `docker compose up -d` starts PostgreSQL; `psql postgresql://staged:staged_dev_password@localhost:5432/staged_dev -c "SELECT 1"` returns 1
  - **Accept**: Local PostgreSQL running; connection string works

- [ ] **Task 2: Implement Drizzle schema -- core tables** `[BD:STG-20]`
  - **Type**: task
  - **Do**: Create the following schema files in `packages/db/src/schema/`. Each file defines its table and exports it. Export all from `schema/index.ts`.

    `households.ts`: `households` table -- id (uuid pk), name (text), inviteCode (text unique), createdBy (uuid FK users), createdAt, updatedAt.
    `householdMembers.ts`: `householdMembers` table -- householdId, userId, role (text: owner|member|guest), joinedAt.
    `users.ts`: `users` table as shown in patterns above. Add FK `householdId` -> `households.id`.
    `recipes.ts`: `recipes` table -- id (uuid pk), title, description, sourceUrl, servingsBase (integer), cookTimeMinutes, prepTimeMinutes, skillLevel, dietaryTags (text[]), zeroWasteScore (real), nutritionPerServing (jsonb), nutritionSource (text), techniqueTags (text[]), isLicensed (boolean default false), importSource (text), createdBy (uuid FK users nullable), createdAt, updatedAt.
    `recipeIngredients.ts`: `recipeIngredients` table -- id (uuid pk), recipeId (FK recipes), sortOrder (integer), name (text), quantityValue (real), quantityUnit (text), usdaFdcId (integer nullable), isBulkAvailable (boolean default false).
    `substitutions.ts`: `substitutions` table -- id (uuid pk), ingredientId (FK recipeIngredients), category (text), replacementName (text), quantityModifier (real default 1.0), note (text nullable).
    `groceryLists.ts`: `groceryLists` table -- id (uuid pk), householdId (FK households), name, createdAt, lastModifiedAt.
    `groceryListItems.ts`: `groceryListItems` table -- id (uuid pk), listId (FK groceryLists), ingredientName, quantityValue (real nullable), quantityUnit (text nullable), isChecked (boolean default false), checkedBy (uuid FK users nullable), checkedAt (timestamp nullable), sourceRecipeId (uuid FK recipes nullable), sortOrder (integer default 0).
    `mealPlans.ts`: `mealPlans` table -- id (uuid pk), householdId (FK households), weekStart (date), createdAt.
    `mealPlanEntries.ts`: `mealPlanEntries` table -- id (uuid pk), planId (FK mealPlans), date (date), recipeId (FK recipes), servingsOverride (integer nullable).
    `pantry.ts`: `pantry` table -- id (uuid pk), householdId (FK households unique), createdAt. `pantryItems` table -- id (uuid pk), pantryId (FK pantry), ingredientName, quantityValue (real nullable), quantityUnit (text nullable), expiryDate (date nullable), usdaFdcId (integer nullable).
    `syncQueue.ts`: `syncQueue` table -- id (uuid pk), householdId (FK households), userId (uuid FK users), mutationType (text), payload (jsonb), createdAt, syncedAt (timestamp nullable), status (text default 'pending').
    `userRecipeLibrary.ts`: `userRecipeLibrary` table -- userId (FK users), recipeId (FK recipes), savedAt (timestamp defaultNow), personalNotes (text nullable), variantOf (uuid FK recipes nullable). Primary key: (userId, recipeId).
    `usdaIngredients.ts`: `usdaIngredients` table -- fdcId (integer pk), description (text), brandOwner (text nullable), foodCategory (text nullable), energyKcal (real nullable), proteinG (real nullable), fatG (real nullable), carbsG (real nullable), fiberG (real nullable), searchVector (tsvector) -- populated by trigger.

  - **Files**: All files in `packages/db/src/schema/`, `packages/db/src/schema/index.ts`
  - **Verify**: `pnpm --filter @staged/db generate` exits 0 and creates a migration file in `packages/db/src/migrations/`
  - **Accept**: Drizzle schema valid; migration file generated without errors

- [ ] **Task 3: Run initial migration** `[BD:STG-21]`
  - **Type**: task
  - **Do**: Ensure local PostgreSQL is running (`docker compose up -d`). Create `packages/db/src/migrate.ts` script that calls `drizzle-kit migrate` or uses the Drizzle migrator directly. Set `DATABASE_URL` in `.env.local` (copy from `.env.example`). Run `pnpm --filter @staged/db migrate`. Add FTS index SQL: after migration runs, execute `CREATE INDEX IF NOT EXISTS usda_ingredients_search_idx ON usda_ingredients USING gin(search_vector)` and create a trigger to auto-update `search_vector` from `description`. Document the FTS trigger SQL in `packages/db/src/schema/usdaIngredients.ts` as a comment.
  - **Files**: `packages/db/src/migrate.ts`
  - **Verify**: `pnpm --filter @staged/db migrate` exits 0; `psql ... -c "\dt"` shows all tables created
  - **Accept**: All schema tables exist in local PostgreSQL; FTS index created on `usda_ingredients`

- [ ] **Task 4: Integrate Better Auth** `[BD:STG-22]`
  - **Type**: task
  - **Do**: Add `better-auth` to `apps/api` dependencies (if not already). Create `apps/api/src/lib/auth.ts` that initializes Better Auth with: PostgreSQL adapter (using the db pool from `@staged/db`), email/password provider, magic link provider (stub -- email sending in prd-01-api-auth), Google OAuth provider (stub credentials), Apple OAuth provider (stub credentials), session expiry 30 days. Better Auth auto-creates its own tables (users, sessions, accounts, verification_tokens) via its migration -- run `auth.api.getMigration()` and apply it. Ensure Better Auth tables do NOT conflict with our `users` table -- use Better Auth's `users` as the auth record and our `users` table for app-level profile data, linked by matching `id`/email.
  - **Files**: `apps/api/src/lib/auth.ts`, `packages/db/src/schema/index.ts` (update if needed)
  - **Verify**: Better Auth migrations run without error; auth-related tables visible in DB
  - **Accept**: Better Auth initialized; auth tables created; `auth.api.signUpEmail` callable (will be wired to routes in prd-01-api-auth)

- [ ] **Task 5: Download and import USDA FoodData Central dataset** `[BD:STG-23]`
  - **Type**: task
  - **Do**: Create `packages/usda/src/download.ts` with a complete implementation of `downloadAndImportFDC()`:
    1. Download the USDA FoodData Central "Foundation Foods" + "SR Legacy" JSON files from `https://fdc.nal.usda.gov/fdc-datasets/` (public download, no auth required). Target files: `FoodData_Central_foundation_food_json_2024-10-31.zip` and `FoodData_Central_sr_legacy_food_json_2021-10-28.zip`.
    2. Unzip to `packages/usda/src/data/` (gitignored).
    3. Parse JSON: extract `fdcId`, `description`, `brandOwner`, `foodCategory`, and from `foodNutrients`: energy (nutrient ID 1008), protein (1003), fat (1004), carbs (1005), fiber (1079).
    4. Batch insert into `usda_ingredients` table via Drizzle, 500 rows at a time, using `onConflictDoUpdate` for idempotency.
    5. Log progress every 10,000 rows.
    Add `packages/usda/package.json` script: `"import-fdc": "tsx src/download.ts"`. Add note: if download fails due to URL change, manually download from https://fdc.nal.usda.gov/download-datasets.html and place zip files in `packages/usda/src/data/`.
  - **Files**: `packages/usda/src/download.ts`, `packages/usda/package.json`
  - **Verify**: `pnpm --filter @staged/usda import-fdc` runs and imports > 100,000 rows into `usda_ingredients`
  - **Accept**: `SELECT COUNT(*) FROM usda_ingredients` returns > 100,000; FTS search `SELECT * FROM usda_ingredients WHERE search_vector @@ to_tsquery('flour')` returns results

- [ ] **Task 6: Export db client for apps** `[BD:STG-24]`
  - **Type**: task
  - **Do**: Update `packages/db/src/index.ts` to export: the `db` Drizzle instance, all schema tables, and a `pool` export for Better Auth's adapter. Add `@staged/db` as a dependency in `apps/api/package.json`. Import `db` in `apps/api/src/index.ts` to verify the import resolves (no actual use yet -- just `import { db } from '@staged/db'` at the top with a comment `// DB client ready`).
  - **Files**: `packages/db/src/index.ts`, `apps/api/package.json`, `apps/api/src/index.ts`
  - **Verify**: `pnpm --filter api type-check` passes; no import errors on `@staged/db`
  - **Accept**: `db` client importable from `@staged/db`; API type-checks clean

- [ ] **Task 7: Update manifest** `[BD:STG-25]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00d`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `00d`, increment progress appropriately. Confirm `00e` (requires: 00d) and `01-data-schema` (requires: 00d) are now unblocked.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00d" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated; 00e and 01-data-schema unblocked

---

## Discovered Tasks

_None yet._
