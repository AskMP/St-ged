---
task: "MVP recipe pages -- library, detail, import, scaling, substitutions, wake-lock cooking view"
branch: "stg-01-pages-recipes/recipe-pages"
test_command: "pnpm --filter web test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 12
chain_next: "01-pages-planning"
requires: ["01-pages-onboarding", "01-api-recipes"]
parallel_safe: false
group: 1
manifest_id: "01-pages-recipes"
---

# PRD: MVP Recipe Pages

## Context for Agent

### What This PRD Does

Builds the user-facing recipe experience: searchable library, recipe detail, structured import, scaling, substitutions, nutrition display, and the wake-lock-enabled cooking view. This PRD delivers the primary discovery and cooking workflow.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-onboarding | First-user journey and household state | `apps/web/src/pages/onboarding.tsx` |
| 01-api-recipes | Recipe CRUD/import/search/nutrition API | `apps/api/src/routes/recipes.ts` |
| 01-ui-components | Recipe-grade cards, filters, and badges | `apps/web/src/components/` |

### Key Files to Read First

- `docs/features.md` -- F01, F06, F07, F08, F09, F10
- `apps/web/src/routes/`
- `apps/web/src/components/`

### Patterns to Follow

- Prove pages through route and browser tests, not isolated component tests only
- Keep offline recipe viewing and wake-lock behavior explicit in the runtime validation
- Scaling, substitutions, and filters are MVP scope, not optional stretch items

### Skills and Commands

| Action | Command |
|--------|---------|
| Run web tests | `pnpm --filter web test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Run offline smoke | `pnpm test:offline` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Start with failing route/E2E tests for the recipe journeys
2. Keep page wiring honest: route resolution, navigation, and API integration must be tested together
3. Treat wake lock and offline viewing as functional behavior, not polish
4. If import legality or content gaps surface, add discovered tasks before papering over them in UI copy

---

## Tasks

- [ ] **Task 1: Add failing recipe-page route and E2E tests** `[BD:STG-119]`
  - **Type**: task
  - **Do**: Add route-level and Playwright tests for recipe library search/filtering, recipe detail, import flow, scaling controls, substitution UI, and step-by-step cooking mode.
  - **Files**: `apps/web/tests/unit/recipe-routes.test.tsx`, `apps/web/tests/e2e/recipes.spec.ts`
  - **Verify**: The recipe-page suite fails before implementation
  - **Accept**: Recipe journeys are explicit before the page layer is built

- [ ] **Task 2: Implement recipe library, detail, and import routes** `[BD:STG-120]`
  - **Type**: feature
  - **Do**: Build the library and detail routes plus the import entry point. Wire search, dietary/zero-waste/time/skill filters, saved-state handling, and nutrition display to the recipe API.
  - **Files**: `apps/web/src/pages/recipes/`, `apps/web/src/routes/`, `apps/web/src/lib/api-client.ts`
  - **Verify**: Route tests pass and browser smoke reaches each page
  - **Accept**: Users can discover, inspect, and import recipes through real routes

- [ ] **Task 3: Implement scaling, substitutions, and cooking mode** `[BD:STG-121]`
  - **Type**: feature
  - **Do**: Add scaling controls, substitution UI, and the step-by-step cooking view with wake-lock integration and graceful fallback. Ensure scaled ingredients and substitutions stay consistent with the API contract.
  - **Files**: `apps/web/src/pages/recipes/`, `apps/web/src/components/`, `apps/web/src/lib/wake-lock.ts`
  - **Verify**: E2E tests cover scaling, substitutions, and cooking mode
  - **Accept**: Core recipe interaction features are usable and test-proven

- [ ] **Task 4: Verify recipe flows offline and in-browser** `[BD:STG-122]`
  - **Type**: task
  - **Do**: Run the recipe journey in a real browser and in offline mode. Confirm saved recipes remain readable, filters render correctly, import failures are user-visible, and wake-lock behavior degrades safely when unsupported.
  - **Files**: `apps/web/tests/e2e/recipes.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep recipes && pnpm test:offline`
  - **Accept**: Recipe flows are proven as real runtime behavior

- [ ] **Task 5: Update manifest** `[BD:STG-123]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-pages-recipes`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-pages-recipes`, progress = `21 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-pages-recipes" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and planning flows can build on real recipe pages

---

## Discovered Tasks

_None yet._
