---
task: "Launch feature -- potluck and event planner with guest claiming and realtime locks"
branch: "stg-02-potluck/potluck"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "02-batch-prep"
requires: ["01-verify-runtime"]
parallel_safe: false
group: 2
manifest_id: "02-potluck"
---

# PRD: Potluck and Event Planner

## Context for Agent

### What This PRD Does

Adds shareable potluck/event planning with guest claiming, no-login participation, and realtime lock behavior that prevents slot collisions.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-households | Guest-aware household auth patterns | `apps/api/src/services/household-service.ts` |
| 01-pages-planning | Collaborative planning UI patterns | `apps/web/src/pages/planning/` |
| 01-verify-runtime | Runtime-tested MVP base | `apps/web/tests/e2e/runtime.spec.ts` |

### Key Files to Read First

- `docs/features.md` -- F13
- `packages/db/src/schema/`
- `apps/web/src/routes/`

### Patterns to Follow

- Begin by implementing event, slot, and guest-claim flows; add tests afterward to confirm behavior
- Guest participation must work without a full account flow
- Realtime lock behavior must be verified in browser runtime

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Implement event, slot, and guest-claim flows** `[BD:STG-156]`
  - **Type**: feature
  - **Do**: Build the backend and frontend flows for event creation, slot management, guest claim entry, and host overview.
  - **Files**: `apps/api/src/`, `apps/web/src/pages/`, `packages/db/src/schema/`
  - **Verify**: Integration tests pass once added
  - **Accept**: Guests can claim slots without overlap through the real app

- [ ] **Task 2: Add event and slot-lock tests** `[BD:STG-155]`
  - **Type**: task
  - **Do**: Add API and browser tests for event creation, guest access, slot claiming, and no-overlap locking behavior.
  - **Files**: `apps/api/tests/potluck/`, `apps/web/tests/e2e/potluck.spec.ts`
  - **Verify**: The potluck tests pass against the implemented flows
  - **Accept**: Event-planning expectations are explicit before code changes

- [ ] **Task 3: Refactor realtime locking and host visibility UX** `[BD:STG-157]`
  - **Type**: task
  - **Do**: Tighten lock timing, host status visibility, and recovery behavior for abandoned claims or race conditions.
  - **Files**: `apps/api/src/services/`, `apps/web/src/components/`
  - **Verify**: Tests remain green after lock-handling cleanup
  - **Accept**: Realtime locking is reliable and understandable

- [ ] **Task 4: Verify guest claim flows in browser runtime** `[BD:STG-158]`
  - **Type**: task
  - **Do**: Run browser E2E for host creation and guest claiming, including concurrent-claim checks where feasible.
  - **Files**: `apps/web/tests/e2e/potluck.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep potluck`
  - **Accept**: Potluck planning is proven in real runtime conditions

- [ ] **Task 5: Update manifest** `[BD:STG-159]`
  - **Type**: chore
  - **Do**: Mark `02-potluck` complete in `prd-phases/manifest.md` and update Current State to `28 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "02-potluck" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next launch PRD

---

## Discovered Tasks

_None yet._
