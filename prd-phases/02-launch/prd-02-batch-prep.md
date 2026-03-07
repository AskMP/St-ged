---
task: "Launch feature -- batch prep mode with combined lists, sequencing, and portioning"
branch: "stg-02-batch-prep/batch-prep"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "02-dietary-adaptation"
requires: ["01-verify-runtime"]
parallel_safe: false
group: 2
manifest_id: "02-batch-prep"
---

# PRD: Batch Prep Mode

## Context for Agent

### What This PRD Does

Adds batch-prep planning across multiple recipes with combined ingredient lists, sequencing support, and portioning guidance for meal-prep sessions.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-plans | Recipe-to-list generation and servings overrides | `apps/api/src/services/plan-service.ts` |
| 01-pages-planning | Weekly planning UI | `apps/web/src/pages/planning/` |
| 01-verify-runtime | Runtime-tested MVP base | `apps/web/tests/e2e/runtime.spec.ts` |

### Key Files to Read First

- `docs/features.md` -- F14
- `apps/web/src/pages/planning/`
- `apps/api/src/services/plan-service.ts`

### Patterns to Follow

- Start by implementing sequencing and combined-list logic; add tests afterward to confirm behavior
- Combined ingredient logic must be deterministic
- Validate the prep session in a browser flow, not only with planner math

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Implement combined-list and sequencing logic** `[BD:STG-161]`
  - **Type**: feature
  - **Do**: Build the backend and UI flows for selecting multiple recipes, generating a combined list, and sequencing prep work.
  - **Files**: `apps/api/src/services/`, `apps/web/src/pages/`, `apps/web/src/components/`
  - **Verify**: Integration tests pass once added
  - **Accept**: Users can create a batch-prep session from real recipe data

- [ ] **Task 2: Add batch-prep tests** `[BD:STG-160]`
  - **Type**: task
  - **Do**: Add tests for multi-recipe selection, combined lists, prep sequencing, and portioning output.
  - **Files**: `apps/api/tests/batch-prep/`, `apps/web/tests/e2e/batch-prep.spec.ts`
  - **Verify**: The batch-prep tests pass against the implemented logic
  - **Accept**: Prep-session requirements are confirmed before code changes

- [ ] **Task 3: Refactor portioning and prep-visibility UX** `[BD:STG-162]`
  - **Type**: task
  - **Do**: Refine portioning output, sequencing explanations, and prep-state visibility so the feature is understandable mid-session.
  - **Files**: `apps/web/src/components/`, `apps/api/src/services/`
  - **Verify**: Tests remain green after UX/state cleanup
  - **Accept**: Batch prep feels production-grade rather than algorithm-only

- [ ] **Task 4: Verify batch-prep sessions in browser runtime** `[BD:STG-163]`
  - **Type**: task
  - **Do**: Run browser E2E for selecting recipes, viewing combined lists, and stepping through prep sequencing.
  - **Files**: `apps/web/tests/e2e/batch-prep.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep batch`
  - **Accept**: Batch prep is proven in real runtime use

- [ ] **Task 5: Update manifest** `[BD:STG-164]`
  - **Type**: chore
  - **Do**: Mark `02-batch-prep` complete in `prd-phases/manifest.md` and update Current State to `29 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "02-batch-prep" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next launch PRD

---

## Discovered Tasks

_None yet._
