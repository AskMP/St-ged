---
task: "Database setup -- PostgreSQL + Drizzle schema + NextAuth (Auth.js) + USDA FDC dataset"
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

Sets up the full database layer: PostgreSQL connection (via Supabase for prod, local Docker for dev), Drizzle ORM schema skeleton with core tables, NextAuth (Auth.js v5) integration via `@hono/auth-js` and `@auth/drizzle-adapter`, and the USDA FoodData Central dataset download + PostgreSQL import. By the end of this PRD, the DB schema exists and can be migrated, Auth.js tables are created, and the USDA FDC ingredient table is populated.

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

- [x] **Task 1: Set up local PostgreSQL for development** `[BD:STG-19]`
  - **Type**: task
  - **Do**: Create `docker-compose.yml` at the project root with a PostgreSQL 16 service: image `postgres:16-alpine`, env vars `POSTGRES_DB=staged_dev`, `POSTGRES_USER=staged`, `POSTGRES_PASSWORD=staged_dev_password`, port `5432:5432`, named volume `postgres_data`. Create `.env.example` at the project root with `DATABASE_URL=postgresql://staged:staged_dev_password@localhost:5432/staged_dev` and other placeholder env vars (ANTHROPIC_API_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL=http://localhost:3000, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, INSTACART_IDP_AFFILIATE_ID). Document in README: "Copy `.env.example` to `.env.local` and run `docker compose up -d` to start local DB."
  - **Files**: `docker-compose.yml`, `.env.example`
  - **Verify**: `docker compose up -d` starts PostgreSQL; `psql postgresql://staged:staged_dev_password@localhost:5432/staged_dev -c "SELECT 1"` returns 1
  - **Accept**: Local PostgreSQL running; connection string works

- [x] **Task 2: Implement Drizzle schema -- core tables** `[BD:STG-20]`
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

- [x] **Task 3: Run initial migration** `[BD:STG-21]`
  - **Type**: task
  - **Do**: Ensure local PostgreSQL is running (`docker compose up -d`). Create `packages/db/src/migrate.ts` script that calls `drizzle-kit migrate` or uses the Drizzle migrator directly. Set `DATABASE_URL` in `.env.local` (copy from `.env.example`). Run `pnpm --filter @staged/db migrate`. Add FTS index SQL: after migration runs, execute `CREATE INDEX IF NOT EXISTS usda_ingredients_search_idx ON usda_ingredients USING gin(search_vector)` and create a trigger to auto-update `search_vector` from `description`. Document the FTS trigger SQL in `packages/db/src/schema/usdaIngredients.ts` as a comment.
  - **Files**: `packages/db/src/migrate.ts`
  - **Verify**: `pnpm --filter @staged/db migrate` exits 0; `psql ... -c "\dt"` shows all tables created
  - **Accept**: All schema tables exist in local PostgreSQL; FTS index created on `usda_ingredients`

- [x] **Task 4: Integrate NextAuth (Auth.js v5) via @hono/auth-js** `[BD:STG-22]`
  - **Type**: task
  - **Do**: Install `@hono/auth-js @auth/core @auth/drizzle-adapter next-auth` in `apps/api`. Create `apps/api/src/lib/auth.ts` with the following complete implementation:
    - Import `{ authHandler, initAuthConfig, verifyAuth }` from `@hono/auth-js`
    - Import `{ DrizzleAdapter }` from `@auth/drizzle-adapter`
    - Import `Credentials` from `@auth/core/providers/credentials`
    - Import `Google` from `@auth/core/providers/google`
    - Export an `authConfig` object with: `adapter: DrizzleAdapter(db)`, `providers: [Google, Credentials(...)]`, `session: { strategy: "jwt" }`, `secret: process.env.NEXTAUTH_SECRET`
    - The Credentials provider `authorize` function should return `null` for now -- full implementation in prd-01-api-auth
    - Export `getSession` helper: `import { getSession } from "@hono/auth-js"` re-exported for use in middleware
    - In `apps/api/src/index.ts`, register auth middleware before other routes: `app.use("*", initAuthConfig(() => authConfig))` and mount `app.all("/api/auth/*", authHandler())`
    - Auth.js with the Drizzle adapter auto-creates required tables (accounts, sessions, users, verification_tokens) on first use. Run `pnpm --filter api dev` briefly to trigger table creation, or apply the Auth.js Drizzle schema manually from `@auth/drizzle-adapter` docs.
    - Our `users` table in `packages/db/src/schema/users.ts` stores app-level profile data (skillLevel, dietaryProfile, householdId). Auth.js manages its own `users` table for auth identity. Link the two by matching email -- on first sign-in, create the app-level user record if it does not exist (stub for now; implemented fully in prd-01-api-auth).
  - **Files**: `apps/api/src/lib/auth.ts`, `apps/api/src/index.ts`, `apps/api/package.json`
  - **Verify**: `pnpm --filter api dev` starts without import errors; `GET http://localhost:3000/api/auth/providers` returns JSON with configured providers
  - **Accept**: Auth.js initialized; `/api/auth/*` routes respond; auth tables visible in DB

- [x] **Task 5: Download and import USDA FoodData Central dataset** `[BD:STG-23]`
  - **Type**: task
  - **Do**: Create `packages/usda/src/download.ts` with a complete implementation of `downloadAndImportFDC()`. Implement the full pipeline first, then verify it works end-to-end:
    1. Download the USDA FoodData Central "Foundation Foods" + "SR Legacy" JSON files from `https://fdc.nal.usda.gov/fdc-datasets/` (public download, no auth required). Target files: `FoodData_Central_foundation_food_json_2024-10-31.zip` and `FoodData_Central_sr_legacy_food_json_2021-10-28.zip`.
    2. Unzip to `packages/usda/src/data/` (gitignored).
    3. Parse JSON: extract `fdcId`, `description`, `brandOwner`, `foodCategory`, and from `foodNutrients`: energy (nutrient ID 1008), protein (1003), fat (1004), carbs (1005), fiber (1079).
    4. Batch insert into `usda_ingredients` table via Drizzle, 500 rows at a time, using `onConflictDoUpdate` for idempotency.
    5. Log progress every 10,000 rows.
    Add `packages/usda/package.json` script: `"import-fdc": "tsx src/download.ts"`. Add note: if download fails due to URL change, manually download from https://fdc.nal.usda.gov/download-datasets.html and place zip files in `packages/usda/src/data/`.
  - **Files**: `packages/usda/src/download.ts`, `packages/usda/package.json`
  - **Verify**: `pnpm --filter @staged/usda import-fdc` runs and imports > 100,000 rows into `usda_ingredients`
  - **Accept**: `SELECT COUNT(*) FROM usda_ingredients` returns > 100,000; FTS search `SELECT * FROM usda_ingredients WHERE search_vector @@ to_tsquery('flour')` returns results

- [x] **Task 6: Export db client for apps** `[BD:STG-24]`
  - **Type**: task
  - **Do**: Update `packages/db/src/index.ts` to export: the `db` Drizzle instance and all schema tables. Add `@staged/db` as a dependency in `apps/api/package.json`. Confirm `db` is already imported in `apps/api/src/lib/auth.ts` from Task 4. Verify the import resolves cleanly from the API package.
  - **Files**: `packages/db/src/index.ts`, `apps/api/package.json`, `apps/api/src/index.ts`
  - **Verify**: `pnpm --filter api type-check` passes; no import errors on `@staged/db`
  - **Accept**: `db` client importable from `@staged/db`; API type-checks clean

- [x] **Task 7: Update manifest** `[BD:STG-25]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00d`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `00d`, increment progress to `4 / 38 PRDs complete`. Confirm `00e` (requires: 00d) and `01-data-schema` (requires: 00d) are now unblocked.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00d" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated; 00e and 01-data-schema unblocked

---

## Discovered Tasks

_None yet._
