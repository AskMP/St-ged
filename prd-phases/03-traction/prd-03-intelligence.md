---
task: "Traction feature -- macro targets and bulk utilization intelligence"
branch: "stg-03-intelligence/intelligence"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "03-discovery"
requires: ["02-fulfillment-v2"]
parallel_safe: false
group: 3
manifest_id: "03-intelligence"
---

# PRD: Macro and Utilization Intelligence

## Context for Agent

### What This PRD Does

Adds macro target tracking and bulk utilization intelligence so the product can guide planning around nutrition and ingredient usage over time.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-recipes | Nutrition-aware recipe API | `apps/api/src/services/recipe-service.ts` |
| 02-cost-serving | Budget-oriented planning signals | `apps/api/src/services/`, `apps/web/src/pages/` |

### Key Files to Read First

- `docs/features.md` -- F22 and F23
- `packages/usda/src/`
- `apps/web/src/pages/planning/`

### Patterns to Follow

- Start with failing macro/utilization tests
- Keep nutrition targets and utilization summaries explainable
- Validate the feature in planning/runtime UI flows

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Add failing macro and utilization tests** `[BD:STG-195]`
  - **Type**: task
  - **Do**: Add failing tests for macro targets, utilization tracking, and planner summaries.
  - **Files**: `apps/api/tests/intelligence/`, `apps/web/tests/e2e/intelligence.spec.ts`
  - **Verify**: The intelligence suite fails before implementation
  - **Accept**: Nutrition/utilization behavior is explicit before code changes

- [ ] **Task 2: Implement target tracking and utilization services** `[BD:STG-196]`
  - **Type**: feature
  - **Do**: Build backend and frontend support for macro targets, weekly plan summaries, and ingredient utilization tracking.
  - **Files**: `apps/api/src/`, `apps/web/src/pages/`, `packages/types/src/`
  - **Verify**: Integration tests pass
  - **Accept**: Users can plan against real macro and utilization signals

- [ ] **Task 3: Refactor summary presentation and threshold logic** `[BD:STG-197]`
  - **Type**: task
  - **Do**: Tighten thresholds, summary explanations, and planner visibility so the feature remains comprehensible.
  - **Files**: `apps/api/src/services/`, `apps/web/src/components/`
  - **Verify**: Tests remain green after cleanup
  - **Accept**: Intelligence features feel actionable, not abstract

- [ ] **Task 4: Verify intelligence flows in browser runtime** `[BD:STG-198]`
  - **Type**: task
  - **Do**: Run browser E2E for setting targets and viewing utilization/macro summaries in planning flows.
  - **Files**: `apps/web/tests/e2e/intelligence.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep intelligence`
  - **Accept**: Intelligence behavior is proven in runtime planning use

- [ ] **Task 5: Update manifest** `[BD:STG-199]`
  - **Type**: chore
  - **Do**: Mark `03-intelligence` complete in `prd-phases/manifest.md` and update Current State to `36 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "03-intelligence" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next traction PRD

---

## Discovered Tasks

_None yet._
