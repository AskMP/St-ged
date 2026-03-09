---
task: "Service layer persistence -- migrate all in-memory stores to Drizzle ORM"
branch: "stg-rescue-07/persistence"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 20
requires: ["rescue-06"]
group: "rescue"
manifest_id: "rescue-07"
---

# PRD Rescue-07: Service Layer Persistence

## Mandatory Pre-Read

1. `RESCUE_PROTOCOL.md` -- mandate
2. `prd-phases/rescue/rescue-manifest.md` -- current state
3. `apps/api/src/lib/db.ts` -- shared Drizzle client
4. `packages/db/src/schema/index.ts` -- all 15 table definitions

**Confidence**: High -- schema exists; migration pattern is established in rescue-03 PRD.

---

## Context for Agent

### Why This PRD Exists

Rescue-03 was documented as "Drizzle service migration complete" but the implementation never
happened. Every core service still uses module-level in-memory arrays:

| Service file           | In-memory store                                 | Impact                             |
| ---------------------- | ----------------------------------------------- | ---------------------------------- |
| `household-service.ts` | `HOUSEHOLDS[]`, `COST_ENTRIES[]`, `ROTATIONS[]` | All household data lost on restart |
| `pantry.ts`            | `PANTRY[]`                                      | Pantry items lost on restart       |
| `list-service.ts`      | `LISTS[]`, `ITEMS[]`                            | Grocery lists lost on restart      |
| `plan-service.ts`      | `PLANS[]`, `ENTRIES[]`                          | Meal plans lost on restart         |
| `recipe-service.ts`    | `RECIPES[]`                                     | All user recipes lost on restart   |

The Drizzle schema is fully defined in `packages/db/src/schema/`. The DB connection is
available via `import { db } from "../lib/db"`. This is purely a mechanical migration task.

**This is P0.** No user data persists across API restarts. All other features are broken
until this is fixed.

### Schema Reference

All tables available. Key mappings for the services in scope:

#### Households

```
households(id, name, inviteCode, createdBy, createdAt, updatedAt)
householdMembers(householdId, userId, role, joinedAt)
users(id, householdId, ...)  -- householdId is the "active" household FK
```

#### Pantry

The schema uses a two-table pattern -- one `pantry` row per household (container),
many `pantryItems` rows inside it:

```
pantry(id, householdId, createdAt)
pantryItems(id, pantryId, ingredientName, quantityValue, quantityUnit, expiryDate, usdaFdcId)
```

Note: `pantryItems.ingredientName` maps to what `PantryItem.name` in the types calls. The
current `PantryItem` type uses `{ name, quantity, unit, expiresAt }`. The DB uses
`{ ingredientName, quantityValue, quantityUnit, expiryDate }`. The service must map
between them -- the API response shape should stay as `{ name, quantity, unit, expiresAt }`
to avoid breaking the frontend.

#### Grocery Lists

```
groceryLists(id, householdId, createdAt, lastModifiedAt)
groceryListItems(id, listId, ingredientName, isChecked, checkedBy, checkedAt, sourceRecipeId, sortOrder)
```

Note: `groceryListItems.ingredientName` maps to `GroceryListItem.name` in the types.

#### Meal Plans

```
mealPlans(id, householdId, weekStart, createdAt)
mealPlanEntries(id, planId, date, recipeId, servingsOverride)
```

**Critical**: The DB schema uses `date` (column name) but the TypeScript `MealPlanEntry` type
uses `day` (field name). The `mealPlanEntries` schema also does NOT have a `mealType` column
even though the Planning.tsx frontend passes `mealType` (breakfast/lunch/dinner).

**Action required in Task 5**:

1. Add `mealType text` column to `mealPlanEntries` table schema + generate migration
2. Reconcile `MealPlanEntry.day` type field with DB `date` column (rename type field to `date`
   OR use Drizzle's column aliasing -- prefer renaming the type for clarity)
3. Update `plan-service.ts` to use `date` and `mealType`

#### Recipes

```
recipes(id, title, sourceUrl, createdBy, skillLevel, dietaryTags, servingsBase,
        nutritionPerServing, cookTimeMinutes, prepTimeMinutes, variantOf,
        personalNotes, createdAt, updatedAt)
recipeIngredients(id, recipeId, ingredientName, quantity, unit, fdcId, sortOrder)
```

### Migration Pattern

**Before (in-memory)**:

```typescript
const HOUSEHOLDS: HouseholdRecord[] = [];
export async function createHousehold(name: string, creatorId: string) {
  const record = { id: uuidv4(), name, inviteCode: generateInviteCode(), members: [...] };
  HOUSEHOLDS.push(record);
  return { id: record.id, inviteCode: record.inviteCode };
}
```

**After (Drizzle)**:

```typescript
import { db } from "../lib/db";
import { households, householdMembers, users } from "@staged/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function createHousehold(name: string, creatorId: string) {
  const inviteCode = nanoid(10);
  const [household] = await db
    .insert(households)
    .values({ name, inviteCode, createdBy: creatorId })
    .returning({ id: households.id, inviteCode: households.inviteCode });

  // Add creator as owner in householdMembers
  await db.insert(householdMembers).values({
    householdId: household.id,
    userId: creatorId,
    role: "owner",
  });

  // Update user's active householdId
  await db
    .update(users)
    .set({ householdId: household.id })
    .where(eq(users.id, creatorId));

  return { id: household.id, inviteCode: household.inviteCode };
}
```

### verifyHouseholdAccess

This is the authorization check used by every other service. It currently checks the
in-memory `HOUSEHOLDS` array. After this migration, it must check the DB:

```typescript
export async function verifyHouseholdAccess(
  householdId: string,
  userId: string,
) {
  const [member] = await db
    .select({ role: householdMembers.role })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!member) {
    const err: any = new Error("Not a member");
    err.status = 403;
    throw err;
  }
  return { role: member.role };
}
```

---

## Tasks

### Task 1: Migrate household-service.ts to Drizzle `[BD:stg-p90]`

- **Type**: task
- **Priority**: P0
- **Do**:
  Read `apps/api/src/services/household-service.ts` in full.

  Replace all in-memory operations with Drizzle:
  1. `createHousehold(name, creatorId)`:
     - INSERT into `households` with generated inviteCode (use `nanoid(10)`)
     - INSERT into `householdMembers` with role "owner"
     - UPDATE `users` set `householdId` to new household id
     - Return `{ id, inviteCode }`

  2. `joinHousehold(code, userId)`:
     - SELECT from `households` where `inviteCode = code`
     - INSERT into `householdMembers` (idempotent: `.onConflictDoNothing()`)
     - UPDATE `users` set `householdId` (if user has no active household)
     - Return `{ success: true }`

  3. `listMembers(householdId)`:
     - SELECT from `householdMembers` joined to `users` (for name/email)
     - Return array of `{ userId, role, name, email }`

  4. `changeMemberRole(householdId, userId, role, requesterId)`:
     - Verify requester is owner (SELECT from householdMembers)
     - UPDATE householdMembers set role
     - Return `{ success: true }`

  5. `getHouseholdByInvite(code)`:
     - SELECT from `households` where `inviteCode = code`
     - Return household or undefined

  6. `verifyHouseholdAccess(householdId, userId)`:
     - SELECT from `householdMembers` where both FK match
     - Throw 403 if not found (not 401 -- 401 means unauthenticated, 403 means unauthorized)

  7. `addCostEntry(householdId, total, weights)`:
     - The `households` schema has no cost table. Check `packages/db/src/schema/index.ts`
       for a `groceryCosts` or `householdCosts` table.
     - If no cost table exists: create `packages/db/src/schema/householdCosts.ts` with
       columns: `(id uuid pk, householdId uuid fk, total real, splits jsonb, date timestamp)`
       Export from schema index. Generate migration with `pnpm --filter @staged/db generate`
       then `pnpm --filter @staged/db migrate`.
     - INSERT into that table; return the entry.

  8. `getCostHistory(householdId)`:
     - SELECT from costs table WHERE householdId, ORDER BY date DESC

  9. `setRotation(householdId, frequency, members, startDate)`:
     - Check for a rotations table. If none exists: create
       `packages/db/src/schema/cookRotations.ts` with columns:
       `(id uuid pk, householdId uuid fk unique, frequency text, members jsonb, startDate date)`
       Export from index. Generate + run migration.
     - UPSERT using `.onConflictDoUpdate({ target: cookRotations.householdId, set: {...} })`

  10. `getRotation(householdId)`, `getRotationAssignments(householdId, weeks)`:
      - SELECT from rotations table; compute assignments in-process (same algorithm, no DB change)

  Remove `HOUSEHOLDS`, `COST_ENTRIES`, `ROTATIONS` arrays and the `uuid` import once replaced.
  Keep the `generateInviteCode` logic but use `nanoid(10)` instead of the random string approach.

- **Files**: `apps/api/src/services/household-service.ts`, possibly new schema files
- **Verify**: `pnpm --filter api type-check` passes; `pnpm --filter api test -- household` passes
- **Accept**: No `HOUSEHOLDS[]`, `COST_ENTRIES[]`, or `ROTATIONS[]` in household-service.ts

---

### Task 2: Migrate pantry service to Drizzle `[BD:STG-301]`

- **Type**: task
- **Priority**: P0
- **Do**:
  Read `apps/api/src/services/pantry.ts` in full.

  The DB schema has a two-level structure: `pantry` (one per household) and `pantryItems`
  (many per pantry). The service must use a "get or create" pattern for the pantry container.
  1. `getPantry(householdId, userId?)`:

     ```typescript
     // Get or create the pantry container for this household
     let [pantryRecord] = await db
       .select({ id: pantry.id })
       .from(pantry)
       .where(eq(pantry.householdId, householdId))
       .limit(1);

     if (!pantryRecord) {
       [pantryRecord] = await db
         .insert(pantry)
         .values({ householdId })
         .returning({ id: pantry.id });
     }

     const items = await db
       .select()
       .from(pantryItems)
       .where(eq(pantryItems.pantryId, pantryRecord.id));

     // Map DB shape to API shape (ingredientName -> name, quantityValue -> quantity, etc.)
     return items.map((i) => ({
       id: i.id,
       householdId,
       name: i.ingredientName,
       quantity: i.quantityValue ?? 1,
       unit: i.quantityUnit ?? undefined,
       expiresAt: i.expiryDate ?? undefined,
     }));
     ```

  2. `addPantryItem(householdId, data, userId?)`:
     - Get or create pantry container (same get-or-create logic)
     - INSERT into `pantryItems` with field mapping (name -> ingredientName, etc.)
     - Return mapped item (same shape as getPantry items)

  3. `removePantryItem(itemId, userId?)`:
     - SELECT pantryItem to get pantryId
     - If userId provided: SELECT pantry to get householdId, verify access
     - DELETE from pantryItems WHERE id = itemId

  Remove `PANTRY[]` array and `uuid` import.

- **Files**: `apps/api/src/services/pantry.ts`
- **Verify**: type-check passes; `pnpm --filter api test -- pantry` passes
- **Accept**: No `PANTRY[]` in pantry.ts; all operations persist to DB

---

### Task 3: Migrate list service to Drizzle `[BD:STG-302]`

- **Type**: task
- **Priority**: P0
- **Do**:
  Read `apps/api/src/services/list-service.ts` in full.

  The DB schema: `groceryLists(id, householdId, createdAt, lastModifiedAt)` and
  `groceryListItems(id, listId, ingredientName, isChecked, checkedBy, checkedAt, sourceRecipeId, sortOrder)`.

  Note `groceryListItems.ingredientName` is the DB column; the `GroceryListItem` type and
  frontend use `name`. Map in both directions.
  1. `createList(householdId, userId)`:
     - Verify access
     - INSERT into `groceryLists`; return `{ id, householdId }`

  2. `getLists(householdId, userId)`:
     - Verify access
     - SELECT from `groceryLists` WHERE householdId

  3. `getList(listId)`:
     - SELECT from `groceryLists` WHERE id; return or undefined

  4. `addItem(listId, name, userId)`:
     - Get list to find householdId; verify access
     - Deduplicate: SELECT from `groceryListItems` WHERE `listId = listId` AND
       `lower(ingredientName) = lower(name)`; if found, return existing
     - If not found: INSERT into `groceryListItems`
     - UPDATE `groceryLists` set `lastModifiedAt = now()` WHERE id = listId
     - Broadcast socket event (keep existing IO logic)
     - Return item with shape `{ id, listId, name, checked, updatedAt }`

  5. `getItems(listId, userId)`:
     - Get list; verify access
     - SELECT from `groceryListItems` WHERE listId ORDER BY sortOrder
     - Return mapped array

  6. `toggleItem(itemId, userId)`:
     - SELECT item; SELECT list; verify access
     - UPDATE `groceryListItems` set `isChecked = NOT isChecked`,
       `checkedBy = (userId if checking, null if unchecking)`,
       `checkedAt = (now() if checking, null if unchecking)`
     - UPDATE list `lastModifiedAt`
     - Broadcast socket event
     - Return mapped item

  7. `deleteItem(itemId, userId)`:
     - SELECT item; SELECT list; verify access
     - DELETE from `groceryListItems` WHERE id
     - Broadcast socket event

  Remove `LISTS[]` and `ITEMS[]` arrays.

- **Files**: `apps/api/src/services/list-service.ts`
- **Verify**: type-check passes; `pnpm --filter api test -- lists` passes
- **Accept**: No `LISTS[]` or `ITEMS[]` in list-service.ts

---

### Task 4: Fix MealPlanEntry type and schema alignment `[BD:STG-303]`

- **Type**: task
- **Priority**: P0
- **Do**:
  Two mismatches must be fixed before migrating plan-service.ts:

  **Mismatch 1 -- field name**: `MealPlanEntry.day` (TypeScript type) vs `date` (DB column name).
  Fix: Update `packages/types/src/plan.ts` to rename field `day` to `date`.
  Update all consumers: `apps/api/src/services/plan-service.ts` uses `entry.day` and
  `data.day!` -- change to `.date`. Check other consumers with:

  ```bash
  grep -r "\.day" apps/api/src --include="*.ts"
  grep -r "entry\.day\|\.day!" apps/web/src --include="*.tsx"
  ```

  **Mismatch 2 -- missing mealType**: Planning.tsx frontend sends `mealType`
  (breakfast/lunch/dinner) in addEntry requests. The DB `mealPlanEntries` table has no
  `mealType` column.
  Fix:
  1. Add `mealType: text("meal_type")` to `packages/db/src/schema/mealPlanEntries.ts`
  2. Update `MealPlanEntry` type to add `mealType?: string`
  3. Run `pnpm --filter @staged/db generate` to create migration file
  4. Run `pnpm --filter @staged/db migrate` to apply it
  5. Verify migration ran: check `packages/db/src/migrations/` for a new file

  The Planning.tsx route currently sends `mealType` in `addEntry` calls. The plan route
  handler should pass it through to the service.

- **Files**: `packages/types/src/plan.ts`, `packages/db/src/schema/mealPlanEntries.ts`,
  `apps/api/src/services/plan-service.ts`, `apps/api/src/routes/plans.ts`
- **Verify**: `pnpm type-check` passes across all packages; new migration file exists
- **Accept**: `MealPlanEntry` has `date` (not `day`); schema has `meal_type` column

---

### Task 5: Migrate plan service to Drizzle `[BD:STG-304]`

- **Type**: task
- **Priority**: P0
- **Do**:
  Read `apps/api/src/services/plan-service.ts` in full.

  After Task 4 fixes, migrate:
  1. `createPlan(householdId, weekStart, userId)`:
     - Verify access
     - Try SELECT existing plan; if found return it
     - Otherwise INSERT into `mealPlans`; return plan

  2. `getWeeklyPlan(householdId, startDate)`:
     - SELECT plan WHERE `householdId AND weekStart = startDate`; if none return null
     - SELECT entries WHERE planId; for each entry also SELECT recipe title
     - Return `{ plan, entries }` where entries include `recipeTitle` from join

  3. `addMealEntry(planId, data)`:
     - Verify plan exists
     - INSERT into `mealPlanEntries` using `data.date`, `data.mealType`, `data.recipeId`,
       `data.servings`
     - Also SELECT the recipe title to return enriched entry

  4. `removeMealEntry(entryId)`:
     - DELETE from `mealPlanEntries` WHERE id; throw 404 if not found

  5. `copyWeek(householdId, fromWeek, toWeek, userId)`:
     - Get source plan + entries
     - Create dest plan
     - Bulk INSERT entries for dest plan (same recipeId/mealType/date offset)

  6. `generateList(planId, userId)`:
     - Get plan with entries (using relational query)
     - For each entry: SELECT recipe + recipeIngredients
     - Create grocery list for household
     - For each ingredient: INSERT into `groceryListItems`
     - Return `{ id, items: [...] }` with the full item list

     The current implementation adds a `"RecipeTitle (xN)"` string as the list item --
     this is wrong. It should add the actual recipe ingredients. Use the relational
     query approach:

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

     Deduplicate ingredients by name before inserting.

  Remove `PLANS[]` and `ENTRIES[]` arrays.

- **Files**: `apps/api/src/services/plan-service.ts`
- **Verify**: type-check passes; `pnpm --filter api test -- plans` passes
- **Accept**: No `PLANS[]` or `ENTRIES[]` in plan-service.ts; generateList adds real ingredients

---

### Task 6: Migrate recipe service to Drizzle `[BD:STG-305]`

- **Type**: task
- **Priority**: P0
- **Do**:
  Read `apps/api/src/services/recipe-service.ts` in full.

  The DB schema: `recipes(id, title, sourceUrl, createdBy, skillLevel, dietaryTags, servingsBase,
nutritionPerServing, cookTimeMinutes, prepTimeMinutes, variantOf, personalNotes, createdAt, updatedAt)`
  and `recipeIngredients(id, recipeId, ingredientName, quantity, unit, fdcId, sortOrder)`.
  1. `listRecipes(householdId, filters)`:
     - SELECT from `recipes` (global library -- not household-scoped in MVP)
     - Apply filters: `skillLevel`, `dietaryTags` (array contains filter via
       `sql\`${recipes.dietaryTags} @> ARRAY[${tag}]::text[]\``)
     - Return `{ recipes }` with each recipe including its ingredients

  2. `getRecipe(id)`:
     - SELECT recipe WITH ingredients (Drizzle relational)
     - Map `recipeIngredients` to the `Recipe.ingredients` format expected by frontend

  3. `createRecipe(data)`:
     - INSERT into `recipes`; get returned id
     - If `data.ingredients` present: INSERT into `recipeIngredients` (bulk)
     - Compute `nutrition_per_serving` via `computeNutritionPerServing`; save to DB
     - Return full recipe

  4. `importRecipeFromUrl(url, jsonLd)`:
     - Normalize JSON-LD; INSERT recipe with `sourceUrl`
     - Parse `jsonLd.recipeIngredient` (string array) into ingredient rows
     - Return recipe

  5. `scaleRecipe(recipe, factor)`:
     - Pure function, no DB -- keep as-is

  6. `getSubstitutions(ingredientName)`:
     - Pure function, no DB -- keep as-is

  7. `deleteRecipe(id)`:
     - DELETE from `recipes` (cascade will remove recipeIngredients)

  8. `calculateRecipeCost(recipe, pantryItems)` and `getRecipeCost(id, pantryItems)`:
     - `calculateRecipeCost` is pure -- keep as-is
     - `getRecipeCost` now fetches recipe from DB

  Remove `RECIPES[]` array.

- **Files**: `apps/api/src/services/recipe-service.ts`
- **Verify**: type-check passes; `pnpm --filter api test -- recipes` passes
- **Accept**: No `RECIPES[]` in recipe-service.ts

---

### Task 7: Run full test suite and fix failures `[BD:STG-306]`

- **Type**: task
- **Do**:
  Run `pnpm --filter api test`. For each failure:
  1. Read the test carefully
  2. Is this a Drizzle query bug (wrong column name, missing destructure, wrong return shape)?
     Fix the service.
  3. Is this a test using `x-test-user-id` mock? Verify the mock household membership
     exists in test fixtures -- if mock auth bypasses the DB `householdMembers` check,
     the test fixture needs to INSERT a member row, OR `verifyHouseholdAccess` must respect
     the test header bypass.

  The existing tests use `x-test-user-id: test-user-1` as a bypass header. Check
  `apps/api/src/middleware/auth.ts` -- if the test bypass sets a fake userId but there
  is no household membership in the DB, every `verifyHouseholdAccess` call will throw 403.

  Fix: In the test middleware bypass path, also check if a household membership exists
  and create one if missing (only in test mode). Or, update each test file to pre-create
  the household membership via the API before running the test.

  Do NOT skip or comment out tests.

- **Verify**: `pnpm --filter api test` exits 0; `pnpm type-check` passes
- **Accept**: All API tests green

---

### Task 8: Smoke test critical paths via curl `[BD:STG-307]`

- **Type**: task
- **Do**:
  With the API running (`pnpm --filter api dev`), verify that data actually persists:
  1. **Register** a new user: `curl -X POST http://localhost:3000/api/auth/register ...`
  2. **Login**: `curl -X POST http://localhost:3000/api/auth/login ...` -- note the cookie
  3. **Create household**: `curl -X POST http://localhost:3000/api/households -H "Cookie: ..."` --
     returns `{ id, inviteCode }`
  4. **Add pantry item**: `curl -X POST http://localhost:3000/api/households/{id}/pantry/items ...`
  5. **Restart API** (`Ctrl+C`, `pnpm --filter api dev` again)
  6. **Fetch pantry**: `curl http://localhost:3000/api/households/{id}/pantry/items -H "Cookie: ..."` --
     should return the item from step 4 (not empty list)

  If step 6 returns the item -- persistence is working. Document the result.
  If step 6 returns empty -- investigate which service still uses in-memory storage.

- **Verify**: Data from step 4 survives the restart in step 5
- **Accept**: Pantry item persists across API restart

---

### Task 9: Update CORRECTION_LOG.md and rescue manifest `[BD:STG-308]`

- **Type**: chore
- **Do**:
  1. Append rows to `CORRECTION_LOG.md`:
     ```
     | household-service.ts | In-memory HOUSEHOLDS[] | Migrated to Drizzle households + householdMembers | Data loss on restart; authorization broke after any restart | All personas | curl restart test passes |
     | pantry.ts | In-memory PANTRY[] | Migrated to Drizzle pantry + pantryItems | Data loss on restart | Jordan, Sam personas | curl restart test passes |
     | list-service.ts | In-memory LISTS[] ITEMS[] | Migrated to Drizzle groceryLists + groceryListItems | Data loss on restart | All personas | curl restart test passes |
     | plan-service.ts | In-memory PLANS[] ENTRIES[] | Migrated to Drizzle mealPlans + mealPlanEntries | Data loss on restart | All personas | curl restart test passes |
     | recipe-service.ts | In-memory RECIPES[] | Migrated to Drizzle recipes + recipeIngredients | Data loss on restart | All personas | curl restart test passes |
     | MealPlanEntry type | field named "day" | Renamed to "date"; added mealType field | Type/schema mismatch caused silent data loss | All personas | type-check passes |
     ```
  2. Update `prd-phases/rescue/rescue-manifest.md`: mark `rescue-07` status complete,
     increment progress counter.

- **Files**: `CORRECTION_LOG.md`, `prd-phases/rescue/rescue-manifest.md`
- **Verify**: Manifest updated; rescue-07 marked complete
- **Accept**: All services persisted; manifest updated

---

## Discovered Tasks

_None yet._
