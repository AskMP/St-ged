---
task: "Traction feature -- virtual Stàge events with booking and LiveKit sessions"
branch: "stg-03-events/events"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "03-advanced-planning"
requires: ["02-fulfillment-v2"]
parallel_safe: false
group: 3
manifest_id: "03-events"
---

# PRD: Virtual Stàge Events

## Context for Agent

### What This PRD Does

Introduces bookable live cooking events with session scheduling, participant access, and the first B2B-ready event flow on top of the household product.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 02-fulfillment-v2 | Post-MVP partner and platform expansion | `apps/api/src/services/fulfillment-service.ts`, `apps/web/src/pages/fulfillment/` |

### Key Files to Read First

- `docs/features.md` -- F18
- `docs/project-brief.md` -- event pricing and LiveKit notes

### Patterns to Follow

- Start with failing booking/session tests
- Validate booking and join flows in the browser
- Keep pricing and scheduling explicit in the product logic

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Add failing event-booking and join tests** `[BD:STG-185]`
  - **Type**: task
  - **Do**: Add failing tests for event creation, booking, session join, and host/participant permissions.
  - **Files**: `apps/api/tests/events/`, `apps/web/tests/e2e/events.spec.ts`
  - **Verify**: The events suite fails before implementation
  - **Accept**: Virtual-event requirements are explicit before code changes

- [ ] **Task 2: Implement event scheduling, booking, and session wiring** `[BD:STG-186]`
  - **Type**: feature
  - **Do**: Build backend and frontend flows for event creation, booking, participant access, and LiveKit-backed session setup.
  - **Files**: `apps/api/src/`, `apps/web/src/pages/`, `packages/types/src/`
  - **Verify**: Integration tests pass
  - **Accept**: Users can schedule and join virtual events through the real app

- [ ] **Task 3: Refactor pricing, host controls, and recording affordances** `[BD:STG-187]`
  - **Type**: task
  - **Do**: Tighten event pricing display, host controls, and recording-related affordances without expanding beyond the intended scope.
  - **Files**: `apps/web/src/components/`, `apps/api/src/services/`
  - **Verify**: Tests remain green after cleanup
  - **Accept**: Event flows feel coherent and monetizable

- [ ] **Task 4: Verify event flows in browser runtime** `[BD:STG-188]`
  - **Type**: task
  - **Do**: Run browser E2E for booking and joining an event, confirming the route and session handoff work cleanly.
  - **Files**: `apps/web/tests/e2e/events.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep events`
  - **Accept**: Events are proven as real runtime flows

- [ ] **Task 5: Update manifest** `[BD:STG-189]`
  - **Type**: chore
  - **Do**: Mark `03-events` complete in `prd-phases/manifest.md` and update Current State to `34 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "03-events" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next traction PRD

---

## Discovered Tasks

_None yet._
