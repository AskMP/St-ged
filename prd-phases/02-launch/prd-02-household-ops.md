---
task: "Launch feature -- household ops for cost splitting and cook rotation scheduling"
branch: "stg-02-household-ops/household-ops"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "02-fulfillment-v2"
requires: ["01-verify-runtime"]
parallel_safe: false
group: 2
manifest_id: "02-household-ops"
---

# PRD: Household Ops

## Context for Agent

### What This PRD Does

Adds household operations features for splitting grocery costs and scheduling cook rotation duties across shared households.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-planning | Shared planning and list UI | `apps/web/src/pages/planning/` |
| 01-api-households | Household roles and membership | `apps/api/src/services/household-service.ts` |
| 01-verify-runtime | Runtime-tested MVP | `apps/web/tests/e2e/runtime.spec.ts` |

### Key Files to Read First

- `docs/features.md` -- F27 and F28
- `apps/web/src/pages/planning/`
- `apps/api/src/services/household-service.ts`

### Patterns to Follow

- Start by implementing splitting and rotation features; add tests afterward to confirm behavior
- Keep payment and scheduling logic transparent
- Validate the flows through shared-household browser scenarios

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [x] **Task 1: Implement splitting and rotation features** `[BD:STG-176]`
  - **Type**: feature
  - **Do**: Build the backend and frontend flows for entering grocery totals, splitting costs, and rotating cooking assignments across household members.
  - **Files**: `apps/api/src/services/`, `apps/web/src/pages/`, `packages/types/src/`
  - **Verify**: Integration tests pass once added
  - **Accept**: Shared households can manage money and cooking duties through the real app

- [x] **Task 2: Add household-ops tests** `[BD:STG-175]`
  - **Type**: task
  - **Do**: Add API and browser tests for grocery cost splitting, custom weights, cook rotation scheduling, and household visibility of assignments.
  - **Files**: `apps/api/tests/household-ops/`, `apps/web/tests/e2e/household-ops.spec.ts`
  - **Verify**: The household-ops tests pass against the implemented features
  - **Accept**: Cost-splitting and rotation expectations are confirmed before code changes

- [x] **Task 3: Refactor reminders, fairness rules, and household visibility** `[BD:STG-177]`
  - **Type**: task
  - **Do**: Tighten fairness/rotation logic, reminder surfaces, and cost history visibility so the feature remains understandable over time.
  - **Files**: `apps/api/src/services/`, `apps/web/src/components/`
  - **Verify**: Tests remain green after cleanup
  - **Accept**: Household ops feels maintainable and trustworthy

- [x] **Task 4: Verify shared-household runtime flows** `[BD:STG-178]`
  - **Type**: task
  - **Do**: Run browser E2E for cost entry, splitting, and rotation viewing in a shared-household scenario.
  - **Files**: `apps/web/tests/e2e/household-ops.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep household`
  - **Accept**: Household ops is proven in a browser collaboration flow

- [ ] **Task 5: Update manifest** `[BD:STG-179]`
  - **Type**: chore
  - **Do**: Mark `02-household-ops` complete in `prd-phases/manifest.md` and update Current State to `32 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "02-household-ops" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next launch PRD

---

## Discovered Tasks

_None yet._
