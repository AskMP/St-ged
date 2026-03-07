---
task: "Launch feature -- dietary adaptation mode for whole-recipe transformations"
branch: "stg-02-dietary-adaptation/dietary-adaptation"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "02-coaching"
requires: ["01-verify-runtime"]
parallel_safe: false
group: 2
manifest_id: "02-dietary-adaptation"
---

# PRD: Dietary Adaptation Mode

## Context for Agent

### What This PRD Does

Adds whole-recipe dietary adaptation so users can transform a recipe into vegan, vegetarian, dairy-free, or gluten-free variants without manual per-ingredient editing.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-recipes | Recipe substitutions and scaling | `apps/api/src/services/recipe-service.ts` |
| 01-pages-recipes | Recipe detail and substitution UI | `apps/web/src/pages/recipes/` |
| 01-verify-runtime | Runtime-tested MVP baseline | `apps/web/tests/e2e/runtime.spec.ts` |

### Key Files to Read First

- `docs/features.md` -- F15
- `apps/api/src/services/recipe-service.ts`
- `apps/web/src/pages/recipes/`

### Patterns to Follow

- Begin by implementing recipe adaptation services and UI; add tests afterward to confirm behavior
- Keep original recipes intact and save variants explicitly
- Verify adaptation in browser recipe flows

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [x] **Task 1: Implement recipe adaptation services and UI** `[BD:STG-166]`
  - **Type**: feature
  - **Do**: Build adaptation logic, variant persistence, and UI controls for transforming recipes into supported dietary profiles.
  - **Files**: `apps/api/src/services/`, `apps/web/src/pages/`, `packages/types/src/recipe.ts`
  - **Verify**: Integration tests pass once added
  - **Accept**: Users can generate whole-recipe dietary variants from real recipes

- [x] **Task 2: Add adaptation tests** `[BD:STG-165]`
  - **Type**: task
  - **Do**: Add service, route, and browser tests for whole-recipe adaptation, variant saving, and substitution explanations.
  - **Files**: `apps/api/tests/dietary-adaptation/`, `apps/web/tests/e2e/dietary-adaptation.spec.ts`
  - **Verify**: The adaptation tests pass against the implemented features
  - **Accept**: Dietary adaptation requirements are explicit before code changes

- [ ] **Task 3: Refactor adaptation explanations and accept/reject controls** `[BD:STG-167]`
  - **Type**: task
  - **Do**: Improve explainability, per-substitution review controls, and variant metadata so the feature remains trustworthy.
  - **Files**: `apps/web/src/components/`, `apps/api/src/services/`
  - **Verify**: Tests remain green after cleanup
  - **Accept**: Dietary adaptation feels understandable and controllable

- [ ] **Task 4: Verify adaptation flows in browser runtime** `[BD:STG-168]`
  - **Type**: task
  - **Do**: Run browser E2E for adapting a recipe, reviewing substitutions, and saving the resulting variant.
  - **Files**: `apps/web/tests/e2e/dietary-adaptation.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep dietary`
  - **Accept**: Adaptation works in a real recipe flow

- [ ] **Task 5: Update manifest** `[BD:STG-169]`
  - **Type**: chore
  - **Do**: Mark `02-dietary-adaptation` complete in `prd-phases/manifest.md` and update Current State to `30 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "02-dietary-adaptation" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next launch PRD

---

## Discovered Tasks

_None yet._
