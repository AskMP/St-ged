---
task: "Launch feature -- cost-per-serving, budget targets, and pantry-aware costing"
branch: "stg-02-cost-serving/cost-serving"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "02-potluck"
requires: ["01-verify-runtime"]
parallel_safe: false
group: 2
manifest_id: "02-cost-serving"
---

# PRD: Cost Per Serving

## Context for Agent

### What This PRD Does

Adds cost-per-serving visibility, weekly budget targets, and pantry-aware price deductions so planning becomes budget-conscious instead of recipe-only.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-planning | Weekly planning flow | `apps/web/src/pages/planning/` |
| 01-api-pantry | Pantry persistence | `apps/api/src/routes/pantry.ts` |
| 01-verify-runtime | Runtime-tested MVP | `apps/web/tests/e2e/runtime.spec.ts` |

### Key Files to Read First

- `docs/features.md` -- F12
- `apps/api/src/services/recipe-service.ts`
- `apps/web/src/pages/planning/`

### Patterns to Follow

- Start with failing cost-calculation tests
- Keep price logic transparent and pantry-aware
- Validate budget flows in real planning UI paths

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Add failing price and budget tests** `[BD:STG-150]`
  - **Type**: task
  - **Do**: Add failing service, route, and browser tests for recipe cost calculation, budget totals, and pantry-aware deductions.
  - **Files**: `apps/api/tests/cost-serving/`, `apps/web/tests/e2e/cost-serving.spec.ts`
  - **Verify**: The cost-serving suite fails before implementation
  - **Accept**: Budget behavior is explicit before code changes

- [ ] **Task 2: Implement costing services and UI surfaces** `[BD:STG-151]`
  - **Type**: feature
  - **Do**: Build cost-calculation services and surface per-serving and weekly budget information in recipe and planning flows.
  - **Files**: `apps/api/src/services/`, `apps/web/src/pages/`, `apps/web/src/components/`
  - **Verify**: Integration tests pass
  - **Accept**: Users can see meaningful cost data during planning

- [ ] **Task 3: Refactor price sources and budget explanation UX** `[BD:STG-152]`
  - **Type**: task
  - **Do**: Tighten calculation helpers, pantry deductions, and explanatory UI copy so price output is auditable rather than magical.
  - **Files**: `apps/api/src/services/`, `apps/web/src/components/`
  - **Verify**: Tests remain green after refactor
  - **Accept**: Costing feels credible and explainable

- [ ] **Task 4: Verify cost flows in browser planning sessions** `[BD:STG-153]`
  - **Type**: task
  - **Do**: Run browser E2E for viewing recipe cost, setting a budget, and seeing planning totals adjust with pantry data.
  - **Files**: `apps/web/tests/e2e/cost-serving.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep cost`
  - **Accept**: Budget behavior is proven in real runtime use

- [ ] **Task 5: Update manifest** `[BD:STG-154]`
  - **Type**: chore
  - **Do**: Mark `02-cost-serving` complete in `prd-phases/manifest.md` and update Current State to `27 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "02-cost-serving" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next launch PRD

---

## Discovered Tasks

_None yet._
