---
task: "MVP recipes API -- CRUD, JSON-LD import, search, substitutions, scaling, and nutrition"
branch: "stg-01-api-recipes/recipes-api"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 12
chain_next: "01-api-households"
requires: ["01-data-usda", "01-api-auth"]
parallel_safe: false
group: 1
manifest_id: "01-api-recipes"
---

# PRD: MVP Recipes API

## Context for Agent

### What This PRD Does

Builds the recipe API that powers the core product promise: recipe CRUD, structured import from URL, search/filtering, nutrition computation, recipe scaling, and smart substitutions. This PRD is where recipe discovery becomes a usable backend rather than a schema.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-data-usda | USDA ingredient corpus and nutrition helpers | `packages/usda/src/` |
| 01-api-auth | Authenticated and guest-capable API surface | `apps/api/src/routes/auth.ts`, `apps/api/src/services/auth-service.ts` |
| 00e | Recipe route skeleton | `apps/api/src/routes/recipes.ts` |

### Key Files to Read First

- `apps/api/src/routes/recipes.ts`
- `packages/usda/src/`
- `packages/db/src/schema/recipes.ts`
- `docs/features.md` -- F01, F06, F07, F08, F09, F10

### Patterns to Follow

- Import only schema.org/Recipe JSON-LD, never full-article scraping
- Compute nutrition at save/import time and persist the result
- Search/filter API must cover dietary, zero-waste, skill, and time filters used by the recipe UI

### Skills and Commands

| Action | Command |
|--------|---------|
| Run API tests | `pnpm --filter api test` |
| Type check | `pnpm --filter api type-check` |
| Seed DB fixtures | `pnpm --filter @staged/db seed` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Start with failing route tests for CRUD, import, and search before changing services
2. Keep DMCA/import legality explicit; do not relax the JSON-LD-only fence
3. Reuse USDA helpers rather than duplicating nutrition logic inside the API
4. If import coverage reveals new content-normalization needs, add them as discovered tasks before UI work starts

---

## Tasks

- [ ] **Task 1: Add failing recipe route and service tests** `[BD:STG-69]`
  - **Type**: task
  - **Do**: Add real HTTP tests covering recipe create/read/delete, JSON-LD import, search and filter combinations, nutrition persistence, recipe scaling, and substitution payloads. Include failure cases for invalid import payloads and unauthorized deletes.
  - **Files**: `apps/api/tests/recipes/recipes-routes.test.ts`, `apps/api/tests/recipes/import.test.ts`
  - **Verify**: The recipe suite fails before implementation changes are applied
  - **Accept**: Recipe API requirements are explicit before the service layer is written

- [ ] **Task 2: Implement recipe CRUD, search, and filter services** `[BD:STG-70]`
  - **Type**: feature
  - **Do**: Implement recipe services and routes for CRUD, saved-library access, and search/filter behavior. Support dietary tags, zero-waste preference, skill level, time filters, and ingredient/cuisine text search expected by the MVP UI.
  - **Files**: `apps/api/src/routes/recipes.ts`, `apps/api/src/services/recipe-service.ts`, `packages/db/src/queries/recipes.ts`
  - **Verify**: CRUD and search tests pass against the mounted API
  - **Accept**: Recipe library and filter endpoints are usable by the web app

- [ ] **Task 3: Implement structured import, nutrition, scaling, and substitutions** `[BD:STG-71]`
  - **Type**: feature
  - **Do**: Implement JSON-LD import normalization, nutrition computation using USDA helpers, scaled ingredient math, and substitution payload generation. Keep recipe import behind the legal scope fence: JSON-LD only, and document the DMCA prerequisite so the UI can stay feature-flagged if needed.
  - **Files**: `apps/api/src/services/recipe-import-service.ts`, `apps/api/src/services/recipe-service.ts`, `packages/usda/src/`, `docs/`
  - **Verify**: Import, nutrition, scaling, and substitution tests pass with realistic recipe fixtures
  - **Accept**: The API returns complete recipe data for viewing, planning, and fulfillment

- [ ] **Task 4: Refactor recipe contracts for downstream UI use** `[BD:STG-72]`
  - **Type**: task
  - **Do**: Tighten response shapes, pagination/filter typing, and error handling so recipe pages can consume the API without ad hoc transformations. Update shared types where useful.
  - **Files**: `packages/types/src/recipe.ts`, `apps/api/src/services/recipe-service.ts`, `apps/api/src/routes/recipes.ts`
  - **Verify**: `pnpm --filter api type-check && pnpm --filter api test`
  - **Accept**: Recipe API contracts are stable enough for the PWA to consume directly

- [ ] **Task 5: Verify recipe flows against seeded data** `[BD:STG-73]`
  - **Type**: task
  - **Do**: Run the recipe suite against the seeded database, confirm imported recipes persist nutrition and substitutions, and verify representative search/filter requests return sensible results.
  - **Files**: `apps/api/tests/recipes/`, `.env.local`
  - **Verify**: `pnpm --filter api test -- recipes`
  - **Accept**: Recipe API behavior is proven with realistic fixtures, not just unit-level mocks

- [ ] **Task 6: Update manifest** `[BD:STG-74]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-api-recipes`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-api-recipes`, progress = `12 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-api-recipes" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and recipe UI work can proceed on a real API

---

## Discovered Tasks

_None yet._
