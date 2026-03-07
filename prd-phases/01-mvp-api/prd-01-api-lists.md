---
task: "MVP grocery lists API -- CRUD, dedupe, realtime broadcasts, and conflict handling"
branch: "stg-01-api-lists/lists-api"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 11
chain_next: "01-api-plans"
requires: ["01-api-households"]
parallel_safe: false
group: 1
manifest_id: "01-api-lists"
---

# PRD: MVP Grocery Lists API

## Context for Agent

### What This PRD Does

Implements the shared grocery list API that powers household collaboration: list CRUD, item mutations, deduplication, Socket.io broadcasts, and offline-conflict-aware reconciliation metadata. This PRD is the server half of the MVP collaboration loop.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-households | Household membership and guest boundaries | `apps/api/src/services/household-service.ts` |
| 01-api-pantry | Pantry-ready household item patterns | `apps/api/src/services/pantry-service.ts` |
| 00e | List route skeleton and Socket.io setup | `apps/api/src/routes/lists.ts`, `apps/api/src/lib/socket.ts` |

### Key Files to Read First

- `apps/api/src/routes/lists.ts`
- `apps/api/src/lib/socket.ts`
- `packages/db/src/schema/groceryLists.ts`
- `docs/features.md` -- F03 shared grocery list requirements

### Patterns to Follow

- List mutations are server-authoritative and broadcast after validation
- Deduplication must be deterministic so offline and online clients converge
- Expose enough metadata for polling fallback and conflict badges in the UI

### Skills and Commands

| Action | Command |
|--------|---------|
| Run API tests | `pnpm --filter api test` |
| Type check | `pnpm --filter api type-check` |
| Start API dev server | `pnpm --filter api dev` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Start with failing list and socket integration tests
2. Keep realtime fan-out and persistence concerns separate in the service layer
3. Prefer deterministic merge/dedupe rules over magical heuristics
4. If simultaneous-edit behavior uncovers new conflict states, add them now instead of punting to UI PRDs

---

## Tasks

- [ ] **Task 1: Add failing list CRUD and socket tests** `[BD:STG-85]`
  - **Type**: task
  - **Do**: Add route-level and socket-aware tests for list creation, fetch, add item, check/uncheck item, delete item, dedupe on duplicate additions, and unauthorized guest behavior. Include simultaneous-update scenarios that require explicit conflict metadata.
  - **Files**: `apps/api/tests/lists/list-routes.test.ts`, `apps/api/tests/lists/list-socket.test.ts`
  - **Verify**: The list suite fails before implementation changes
  - **Accept**: Grocery list behavior is defined before services are changed

- [ ] **Task 2: Implement list CRUD and item mutation services** `[BD:STG-86]`
  - **Type**: feature
  - **Do**: Implement list services and routes for household-scoped grocery list CRUD and item mutations. Add deterministic dedupe logic for ingredient-name collisions and return item timestamps/version data needed by offline clients.
  - **Files**: `apps/api/src/routes/lists.ts`, `apps/api/src/services/list-service.ts`, `packages/db/src/queries/lists.ts`
  - **Verify**: CRUD and mutation tests pass
  - **Accept**: Shared grocery lists can be modified reliably through the real API

- [ ] **Task 3: Wire realtime broadcasts and polling fallback metadata** `[BD:STG-87]`
  - **Type**: feature
  - **Do**: Broadcast validated list mutations through Socket.io household rooms and expose enough list metadata for a polling fallback path when sockets are unavailable. Ensure guest-add actions broadcast with the same server-authoritative payload shape as member actions.
  - **Files**: `apps/api/src/lib/socket.ts`, `apps/api/src/services/list-service.ts`, `packages/types/src/events.ts`
  - **Verify**: Socket tests confirm expected room emissions and payloads
  - **Accept**: Realtime sync and polling fallback contracts are both available to the client

- [ ] **Task 4: Refactor conflict-handling primitives** `[BD:STG-88]`
  - **Type**: task
  - **Do**: Centralize conflict/version metadata and timestamping so planning and offline sync features can reuse the same primitives instead of inventing separate reconciliation rules.
  - **Files**: `apps/api/src/services/list-service.ts`, `packages/types/src/list.ts`, `packages/db/src/schema/syncQueue.ts`
  - **Verify**: `pnpm --filter api type-check && pnpm --filter api test`
  - **Accept**: Conflict semantics are stable and reusable

- [ ] **Task 5: Verify multi-client list behavior** `[BD:STG-89]`
  - **Type**: task
  - **Do**: Run the list suite against seeded households and confirm two simulated clients can edit the same list while receiving consistent broadcasts and conflict metadata.
  - **Files**: `apps/api/tests/lists/`, `.env.local`
  - **Verify**: `pnpm --filter api test -- lists`
  - **Accept**: Shared grocery list behavior is proven beyond single-request tests

- [ ] **Task 6: Update manifest** `[BD:STG-90]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-api-lists`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-api-lists`, progress = `15 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-api-lists" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and planning can build on a real shared-list backend

---

## Discovered Tasks

_None yet._
