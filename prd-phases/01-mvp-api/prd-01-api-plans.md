---
task: "MVP meal planning API -- weekly plans, copy-week, and recipe-to-list generation"
branch: "stg-01-api-plans/plans-api"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "01-api-fulfillment"
requires: ["01-api-lists"]
parallel_safe: false
group: 1
manifest_id: "01-api-plans"
---

# PRD: MVP Meal Planning API

## Context for Agent

### What This PRD Does

Implements weekly meal-plan CRUD, recipe assignment, servings overrides, copy-week behavior, and recipe-to-grocery-list generation. This PRD connects recipe discovery to the shared grocery workflow.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-lists | Shared grocery list behavior and realtime contracts | `apps/api/src/services/list-service.ts` |
| 01-api-recipes | Recipe CRUD, filters, nutrition, substitutions | `apps/api/src/services/recipe-service.ts` |
| 00e | Planning route skeleton | `apps/api/src/routes/plans.ts` |

### Key Files to Read First

- `apps/api/src/routes/plans.ts`
- `packages/db/src/schema/mealPlans.ts`
- `packages/db/src/schema/mealPlanEntries.ts`
- `docs/features.md` -- F04 scheduling requirements

### Patterns to Follow

- Planning is household-scoped and week-scoped
- Recipe assignment must be able to regenerate grocery list items deterministically
- Servings overrides belong to plan entries, not recipe records

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

1. Start with failing planning and list-generation tests
2. Keep planning logic in services, not in Hono routes
3. Preserve deterministic grocery generation so copy-week and offline sync stay stable
4. If list regeneration semantics need additional metadata, add it here before UI work starts

---

## Tasks

- [ ] **Task 1: Add failing planning and list-generation tests** `[BD:STG-91]`
  - **Type**: task
  - **Do**: Add real HTTP tests for weekly plan fetch/create, plan entry add/remove, servings override, copy-week behavior, and automatic grocery list generation from assigned recipes. Include duplicate assignment and authorization edge cases.
  - **Files**: `apps/api/tests/plans/plan-routes.test.ts`
  - **Verify**: The planning suite fails before service implementation
  - **Accept**: Planning requirements are explicit before the service layer changes

- [ ] **Task 2: Implement meal plan services and routes** `[BD:STG-92]`
  - **Type**: feature
  - **Do**: Implement planning services and routes for weekly plans, plan entries, and servings overrides. Ensure routes return enough data for the week-view UI without extra client stitching.
  - **Files**: `apps/api/src/routes/plans.ts`, `apps/api/src/services/plan-service.ts`, `packages/db/src/queries/plans.ts`
  - **Verify**: Planning CRUD tests pass
  - **Accept**: Weekly meal plans are manageable through the real API

- [ ] **Task 3: Implement recipe-to-list generation and copy-week logic** `[BD:STG-93]`
  - **Type**: feature
  - **Do**: Implement list-generation logic that expands planned recipes into grocery items, respects servings overrides, and can copy one week into the next without duplicating or corrupting grocery list state.
  - **Files**: `apps/api/src/services/plan-service.ts`, `apps/api/src/services/list-service.ts`
  - **Verify**: Plan-to-list and copy-week tests pass
  - **Accept**: The planning API drives real grocery list output rather than calendar-only state

- [ ] **Task 4: Refactor planning payloads for the calendar UI** `[BD:STG-94]`
  - **Type**: task
  - **Do**: Tighten planning response shapes and helper types so the weekly calendar UI can consume a single predictable plan payload with entries, recipes, and list linkage.
  - **Files**: `packages/types/src/plan.ts`, `apps/api/src/services/plan-service.ts`
  - **Verify**: `pnpm --filter api type-check && pnpm --filter api test`
  - **Accept**: Planning contracts are stable for the route-level UI work ahead

- [ ] **Task 5: Verify planning flows with seeded recipes and households** `[BD:STG-95]`
  - **Type**: task
  - **Do**: Run planning tests against seeded recipes and households, confirm grocery generation respects servings overrides, and verify copy-week behavior remains deterministic.
  - **Files**: `apps/api/tests/plans/`, `.env.local`
  - **Verify**: `pnpm --filter api test -- plans`
  - **Accept**: Meal planning is proven with realistic data and not just happy-path unit cases

- [ ] **Task 6: Update manifest** `[BD:STG-96]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-api-plans`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-api-plans`, progress = `16 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-api-plans" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and fulfillment/planning UI work is unblocked

---

## Discovered Tasks

_None yet._
