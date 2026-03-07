---
task: "Traction feature -- advanced planning with month view, two-cook mode, and recipe voting"
branch: "stg-03-advanced-planning/advanced-planning"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "03-intelligence"
requires: ["02-fulfillment-v2"]
parallel_safe: false
group: 3
manifest_id: "03-advanced-planning"
---

# PRD: Advanced Planning

## Context for Agent

### What This PRD Does

Extends the planner with month view, two-cook coordination, and recipe voting queues for more complex household planning behavior.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-planning | Weekly planning baseline | `apps/web/src/pages/planning/` |
| 02-household-ops | Household coordination extensions | `apps/web/src/pages/`, `apps/api/src/services/` |

### Key Files to Read First

- `docs/features.md` -- F19, F20, F21
- `apps/web/src/pages/planning/`

### Patterns to Follow

- Start with failing advanced-planning tests
- Keep month view and collaboration state route-testable
- Validate multi-user planning behavior in browser runtime

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Add failing advanced-planning tests** `[BD:STG-190]`
  - **Type**: task
  - **Do**: Add failing tests for month view, two-cook coordination, and recipe voting queues.
  - **Files**: `apps/api/tests/advanced-planning/`, `apps/web/tests/e2e/advanced-planning.spec.ts`
  - **Verify**: The advanced-planning suite fails before implementation
  - **Accept**: Advanced-planning behavior is explicit before code changes

- [ ] **Task 2: Implement month view and two-cook coordination** `[BD:STG-191]`
  - **Type**: feature
  - **Do**: Build backend and frontend support for month view and parallel/two-cook planning modes.
  - **Files**: `apps/api/src/`, `apps/web/src/pages/`
  - **Verify**: Integration tests pass
  - **Accept**: Households can plan beyond a single-week view

- [ ] **Task 3: Implement recipe voting queue UX** `[BD:STG-192]`
  - **Type**: feature
  - **Do**: Add collaborative recipe voting and queue visibility to the planner.
  - **Files**: `apps/web/src/pages/`, `apps/api/src/services/`
  - **Verify**: Voting tests pass
  - **Accept**: Shared planning includes lightweight collective decision-making

- [ ] **Task 4: Verify advanced planning in browser runtime** `[BD:STG-193]`
  - **Type**: task
  - **Do**: Run browser E2E for month-view navigation, two-cook planning, and recipe voting.
  - **Files**: `apps/web/tests/e2e/advanced-planning.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep advanced-planning`
  - **Accept**: Advanced planning works in real browser use

- [ ] **Task 5: Update manifest** `[BD:STG-194]`
  - **Type**: chore
  - **Do**: Mark `03-advanced-planning` complete in `prd-phases/manifest.md` and update Current State to `35 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "03-advanced-planning" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next traction PRD

---

## Discovered Tasks

_None yet._
