---
task: "Service layer migration -- raw SQL to Drizzle ORM type-safe queries"
branch: "stg-rescue-03/service-layer"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 15
chain_next: "rescue-04"
requires: ["rescue-02"]
parallel_safe: true
group: "rescue"
manifest_id: "rescue-03"
---

# PRD Rescue-03: Service Layer Migration

## Mandatory Pre-Read

1. `RESCUE_PROTOCOL.md` -- mandate
2. `CODE_REVIEW_2026-03-08.md` -- context on why raw SQL is a risk
3. `prd-phases/rescue/rescue-manifest.md` -- current state
4. `apps/api/src/lib/db.ts` -- the shared db + query helper (created in rescue-01)

**Confidence**: High for the migration pattern; Medium for individual service
correctness (existing raw SQL may have column name bugs we discover in migration).

**Parallel**: This PRD may run concurrently with rescue-04 (UX rebuild) on
separate branches. Merge rescue-03 first if any API contracts change.

---

## Context for Agent

### Why This PRD Exists

After rescue-00 and rescue-01, the API services work -- but they use raw SQL
strings throughout. This means:

- Column name typos are runtime errors, not compile-time errors
- IDE has no autocomplete for query results
- `any` types are everywhere (CLAUDE.md prohibits `any`)
- Adding/renaming columns in the schema does not automatically reveal where
  queries need updating

The Drizzle ORM schema now exists (`@staged/db`). This PRD migrates each service
from `pool.query('SELECT ...')` to `db.select().from(table).where(...)`.

### Scope

Files to migrate (in priority order):

| File                                                | Priority | Reason                                                       |
| --------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `apps/api/src/services/auth-service.ts`             | High     | Already partially fixed in rescue-01; complete the migration |
| `apps/api/src/routes/auth.ts`                       | High     | Raw SQL in signup; used on every registration                |
| `apps/api/src/services/pantry.ts`                   | High     | Core user feature (pantry onboarding)                        |
| `apps/api/src/services/list-service.ts`             | High     | Core user feature (grocery lists)                            |
| `apps/api/src/services/plan-service.ts`             | High     | Core user feature (meal planning)                            |
| `apps/api/src/routes/households.ts`                 | Medium   | Household management                                         |
| `apps/api/src/routes/recipes.ts`                    | Medium   | Recipe library                                               |
| `apps/api/src/services/fulfillment-service.ts`      | Medium   | Instacart integration                                        |
| `apps/api/src/services/fridge-clearance-service.ts` | Low      | Phase 2 feature                                              |
| `apps/api/src/services/potluck-service.ts`          | Low      | Phase 2 feature                                              |
| `apps/api/src/services/event-service.ts`            | Low      | Phase 3 feature                                              |

**Out of scope**: Test files that use the `x-test-user-id` mock -- those stay
as-is since they are test infrastructure, not production code.

### Migration Pattern

Replace raw SQL with the Drizzle query builder. The pattern for every migration:

**Before (raw SQL)**:

```typescript
const rows = await pool.query(
  "SELECT id, name FROM households WHERE invite_code = $1",
  [inviteCode],
);
const household = rows.rows[0];
```

**After (Drizzle ORM)**:

```typescript
import { db } from "../lib/db";
import { households } from "@staged/db";
import { eq } from "drizzle-orm";

const [household] = await db
  .select({ id: households.id, name: households.name })
  .from(households)
  .where(eq(households.inviteCode, inviteCode))
  .limit(1);
```

**Key Drizzle imports**:

```typescript
import { db } from "../lib/db";
import { eq, and, or, inArray, isNull, desc, asc, sql } from "drizzle-orm";
import {
  users,
  households,
  householdMembers,
  recipes,
  recipeIngredients,
  groceryLists,
  groceryListItems,
  mealPlans,
  mealPlanEntries,
  pantry,
  pantryItems,
  syncQueue,
} from "@staged/db";
```

### Column Name Mapping (raw SQL snake_case -> Drizzle camelCase)

The Drizzle schema uses camelCase field names that map to snake_case columns.
Use the Drizzle field names in your queries:

| Raw SQL column          | Drizzle field name    |
| ----------------------- | --------------------- |
| `display_name`          | `displayName`         |
| `household_id`          | `householdId`         |
| `invite_code`           | `inviteCode`          |
| `created_by`            | `createdBy`           |
| `hashed_password`       | `hashedPassword`      |
| `source_url`            | `sourceUrl`           |
| `skill_level`           | `skillLevel`          |
| `dietary_tags`          | `dietaryTags`         |
| `dietary_profile`       | `dietaryProfile`      |
| `servings_base`         | `servingsBase`        |
| `nutrition_per_serving` | `nutritionPerServing` |
| `last_modified_at`      | `lastModifiedAt`      |
| `ingredient_name`       | `ingredientName`      |
| `is_checked`            | `isChecked`           |
| `checked_by`            | `checkedBy`           |
| `checked_at`            | `checkedAt`           |
| `source_recipe_id`      | `sourceRecipeId`      |
| `sort_order`            | `sortOrder`           |
| `week_start`            | `weekStart`           |
| `servings_override`     | `servingsOverride`    |
| `joined_at`             | `joinedAt`            |
| `mutation_type`         | `mutationType`        |
| `synced_at`             | `syncedAt`            |
| `personal_notes`        | `personalNotes`       |
| `variant_of`            | `variantOf`           |
| `fdc_id`                | `fdcId`               |
| `energy_kcal`           | `energyKcal`          |
| `search_vector`         | `searchVector`        |

### When to Keep Raw SQL

Some operations are better expressed in raw SQL than with the Drizzle query builder:

1. **Full-text search** against `usda_ingredients.search_vector`:

   ```typescript
   await query(
     "SELECT fdc_id, description FROM usda_ingredients WHERE search_vector @@ to_tsquery($1) LIMIT 20",
     [term],
   );
   ```

   Keep this as raw SQL -- tsvector queries are not in the Drizzle type system.

2. **Bulk inserts with conflict resolution** (e.g., USDA import): keep raw SQL
   or use Drizzle's `onConflictDoUpdate()` -- both are fine.

3. **Complex aggregations** (e.g., cost splitting sums): use `sql` template
   from Drizzle rather than raw pool.query:
   ```typescript
   import { sql } from "drizzle-orm";
   await db.select({ total: sql<number>`SUM(amount)` }).from(costs);
   ```

---

## Tasks

### Task 1: Migrate auth-service.ts to Drizzle `[BD:stg-phv]`

- **Type**: task
- **Do**: Open `apps/api/src/services/auth-service.ts`. Replace all raw SQL
  queries with Drizzle ORM equivalents:

  `redeemInvite`: currently uses raw SQL to find household by invite_code and
  insert into household_members. Migrate:

  ```typescript
  import { db } from "../lib/db";
  import { households, householdMembers, users } from "@staged/db";
  import { eq } from "drizzle-orm";

  export async function redeemInvite(
    inviteCode: string,
    userId: string,
  ): Promise<void> {
    const [household] = await db
      .select({ id: households.id })
      .from(households)
      .where(eq(households.inviteCode, inviteCode))
      .limit(1);

    if (!household) throw new Error("invite not found");

    // Insert household member (idempotent)
    await db
      .insert(householdMembers)
      .values({ householdId: household.id, userId, role: "member" })
      .onConflictDoNothing();

    // Update user's householdId
    await db
      .update(users)
      .set({ householdId: household.id })
      .where(eq(users.id, userId));
  }
  ```

  Remove the `pool` import from auth-service.ts -- the `db` instance from `lib/db`
  handles everything. Keep the `query` import only if there are remaining raw SQL
  calls (there should be none after this task).

- **Files**: `apps/api/src/services/auth-service.ts`
- **Verify**: `pnpm --filter api type-check` passes; `pnpm --filter api test -- auth` still passes
- **Accept**: No raw pool.query() calls remain in auth-service.ts

---

### Task 2: Migrate households route to Drizzle `[BD:STG-242]`

- **Type**: task
- **Do**: Open `apps/api/src/routes/households.ts`. Read the entire file first.
  Migrate all raw SQL queries to Drizzle. Key operations typically in this file:
  - GET /households -- list households for user
  - POST /households -- create household (generate inviteCode with nanoid or uuid)
  - GET /households/:id -- get household details with members
  - GET /households/:id/members -- list members
  - POST /households/:id/invite -- generate new invite link
  - PATCH /households/:id/rotation -- set cook rotation
  - POST /households/:id/costs -- log grocery cost split

  For each raw query, apply the migration pattern. If a query uses a column that
  is not in the schema (e.g., a column that was assumed but never defined), add
  it to the schema and generate a new migration.

- **Files**: `apps/api/src/routes/households.ts`
- **Verify**: `pnpm --filter api type-check` passes; no pool.query() calls remain
- **Accept**: All household route queries use Drizzle ORM

---

### Task 3: Migrate pantry service to Drizzle `[BD:STG-243]`

- **Type**: task
- **Do**: Open `apps/api/src/services/pantry.ts`. Migrate:
  - Get pantry for household (or create if not exists)
  - List pantry items
  - Add/update/remove pantry items
  - Apply starter pantry template (bulk insert)

  The `pantry` table has a unique constraint on `householdId`, so
  "get or create" can use `onConflictDoUpdate` or a simple
  select-then-insert pattern:

  ```typescript
  const existing = await db
    .select()
    .from(pantry)
    .where(eq(pantry.householdId, householdId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(pantry).values({ householdId });
  }
  ```

- **Files**: `apps/api/src/services/pantry.ts`
- **Verify**: type-check passes; pantry tests pass
- **Accept**: No raw SQL in pantry service

---

### Task 4: Migrate grocery list service to Drizzle `[BD:STG-244]`

- **Type**: task
- **Do**: Open `apps/api/src/services/list-service.ts`. Migrate:
  - Create list for household
  - Get list with items
  - Add/update/remove items
  - Toggle item checked status (with checkedBy and checkedAt)
  - Update lastModifiedAt on any mutation

  The `isChecked` toggle with `checkedAt` timestamp is important for real-time
  sync correctness. Use Drizzle's `.update().set()`:

  ```typescript
  await db
    .update(groceryListItems)
    .set({
      isChecked: checked,
      checkedBy: checked ? userId : null,
      checkedAt: checked ? new Date() : null,
    })
    .where(eq(groceryListItems.id, itemId));
  ```

- **Files**: `apps/api/src/services/list-service.ts`
- **Verify**: type-check passes; list tests pass
- **Accept**: No raw SQL in list service

---

### Task 5: Migrate meal plan service to Drizzle `[BD:STG-245]`

- **Type**: task
- **Do**: Open `apps/api/src/services/plan-service.ts`. Migrate:
  - Get or create weekly plan for household + weekStart date
  - Get plan with entries (join to recipes for title/skill/time)
  - Assign recipe to a date slot
  - Remove a plan entry
  - Generate grocery list from plan (collect all recipe ingredients, deduplicate)

  The grocery list generation from plan is the most complex query. It needs:
  1. All mealPlanEntries for the plan
  2. For each entry, recipeIngredients for that recipe
  3. Deduplicate by ingredientName (simple approach: collect all then upsert)

  Use Drizzle relational queries for this:

  ```typescript
  const planWithEntries = await db.query.mealPlans.findFirst({
    where: eq(mealPlans.id, planId),
    with: {
      entries: {
        with: { recipe: { with: { ingredients: true } } },
      },
    },
  });
  ```

- **Files**: `apps/api/src/services/plan-service.ts`
- **Verify**: type-check passes; plan tests pass
- **Accept**: No raw SQL in plan service

---

### Task 6: Migrate recipes route to Drizzle `[BD:STG-246]`

- **Type**: task
- **Do**: Open `apps/api/src/routes/recipes.ts`. Read fully before editing.
  Migrate:
  - List recipes (with pagination, skill filter, dietary filter)
  - Get single recipe with ingredients
  - Create recipe
  - Update recipe
  - Import from URL (only the DB write -- the JSON-LD parsing logic stays as-is)
  - Save recipe to user library
  - Search recipes (title LIKE or pg FTS if already using tsvector)

  For array field filtering (e.g., `dietaryTags contains 'vegan'`), use
  Drizzle's `sql` template:

  ```typescript
  import { sql } from 'drizzle-orm'
  // Filter by dietary tag
  .where(sql`${recipes.dietaryTags} @> ARRAY[${tag}]::text[]`)
  ```

- **Files**: `apps/api/src/routes/recipes.ts`
- **Verify**: type-check passes; recipe tests pass
- **Accept**: Recipes route uses Drizzle for all DB access

---

### Task 7: Migrate remaining services (fulfillment, fridge-clearance, potluck) `[BD:STG-247]`

- **Type**: task
- **Do**: Read each remaining service file and migrate raw SQL to Drizzle.
  Apply the same pattern. Priority is correctness over completeness -- if a
  service has complex logic that would take significant time to migrate without
  breaking, add it to Discovered Tasks and move on.

  Files: `apps/api/src/services/fulfillment-service.ts`,
  `apps/api/src/services/fridge-clearance-service.ts`,
  `apps/api/src/services/potluck-service.ts`,
  `apps/api/src/services/event-service.ts`

  Note: fulfillment-service.ts primarily constructs Instacart IDP URLs -- it may
  have minimal raw DB queries. Read first to assess actual scope.

- **Files**: All service files listed above
- **Verify**: type-check passes across all; no raw pool.query() calls outside of lib/db.ts
- **Accept**: All remaining services migrated or Discovered Tasks created for deferred items

---

### Task 8: Remove `query` wrapper from lib/db.ts if no longer needed `[BD:STG-248]`

- **Type**: task
- **Do**: After all services are migrated, check if any file still imports `query`
  from `lib/db.ts`:

  ```bash
  grep -r "from.*lib/db" apps/api/src --include="*.ts" | grep query
  ```

  If nothing uses `query` except for the `auth.ts` raw SQL calls (which are
  acceptable to keep in raw form for FTS and Auth.js integration), mark the
  `query` function with a `// keep for FTS and auth-layer raw queries` comment
  and leave it. If all usages are gone, remove the export.

  Also verify no service files have any `new Pool(...)` calls remaining:

  ```bash
  grep -r "new Pool(" apps/api/src --include="*.ts"
  ```

  This should return only `apps/api/src/lib/db.ts`. Any other matches are bugs.

- **Files**: `apps/api/src/lib/db.ts`, any files with lingering Pool instantiations
- **Verify**: Only one `new Pool(` in the entire API codebase
- **Accept**: Connection pool consolidation is complete

---

### Task 9: Run full API test suite and fix failures `[BD:STG-249]`

- **Type**: task
- **Do**: Run `pnpm --filter api test`. For each failing test:
  1. Read the failure carefully
  2. Determine if it's a Drizzle query bug (column name wrong, missing .limit(),
     return shape mismatch) or a pre-existing test bug
  3. Fix the query bug in the service file; update the test if the API response
     shape legitimately changed (e.g., camelCase vs snake_case in JSON)
  4. Do NOT skip or comment out tests -- fix the underlying issue

  Common Drizzle migration pitfalls:
  - `db.select()` returns an array; `.limit(1)` doesn't auto-destructure -- use
    `const [row] = await db.select()...` and check `if (!row)`
  - Drizzle `.insert().returning()` is available for INSERT with return values
  - `db.query.*` (relational API) requires schema to be passed to `drizzle()` -- confirm `lib/db.ts` does `drizzle(pool, { schema })`

- **Verify**: `pnpm --filter api test` exits 0
- **Accept**: All API tests pass; no tests skipped or commented out

---

### Task 10: Update CORRECTION_LOG.md and rescue manifest `[BD:STG-250]`

- **Type**: chore
- **Do**:
  1. Append to `CORRECTION_LOG.md` for each migrated service (condense to one row per service):
     ```
     | [Service file] | Raw SQL (type-unsafe, any-typed) | Migrated to Drizzle ORM | Type safety; compile-time column validation; removes any types | All personas | pnpm --filter api type-check passes |
     ```
  2. Update `prd-phases/rescue/rescue-manifest.md`: mark `rescue-03` complete,
     progress = `4 / 5 rescue PRDs complete` (or `5 / 5` if rescue-04 is also done).
- **Files**: `CORRECTION_LOG.md`, `prd-phases/rescue/rescue-manifest.md`
- **Verify**: Manifest updated; rescue-03 complete
- **Accept**: Service layer fully typed; API test suite green

---

## Discovered Tasks

_None yet._
