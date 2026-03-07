---
task: "MVP planning pages -- weekly calendar, shared grocery list, realtime sync, offline recovery"
branch: "stg-01-pages-planning/planning-pages"
test_command: "pnpm --filter web test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 12
chain_next: "01-pages-fulfillment"
requires: ["01-pages-recipes", "01-api-plans"]
parallel_safe: false
group: 1
manifest_id: "01-pages-planning"
---

# PRD: MVP Planning Pages

## Context for Agent

### What This PRD Does

Builds the weekly planning experience: calendar view, recipe assignment, shared grocery list UI, realtime sync feedback, and offline recovery behavior. This PRD is where the household coordination promise becomes visible to users.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-recipes | Recipe browsing and cooking flows | `apps/web/src/pages/recipes/` |
| 01-api-plans | Weekly plan and list-generation API | `apps/api/src/routes/plans.ts` |
| 01-api-lists | Shared grocery list and realtime contracts | `apps/api/src/routes/lists.ts`, `packages/types/src/events.ts` |

### Key Files to Read First

- `docs/features.md` -- F03 and F04
- `apps/web/src/lib/sync-queue.ts`
- `apps/web/src/routes/`

### Patterns to Follow

- Validate planning through route tests and multi-tab or multi-page browser flows
- Surface realtime status and conflict handling explicitly
- Offline edits must queue cleanly and reconcile visibly on reconnect

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

1. Start with failing planning and shared-list browser flows
2. Keep realtime/socket logic observable in the UI instead of hiding all state transitions
3. Treat offline queueing and conflict resolution as first-class behavior
4. Use at least one multi-client or multi-tab validation path

---

## Tasks

- [ ] **Task 1: Add failing planning route and collaboration tests** `[BD:STG-124]`
  - **Type**: task
  - **Do**: Add route-level and Playwright tests for weekly calendar rendering, recipe assignment, shared grocery list interactions, conflict messaging, and offline queue behavior. Include a multi-page or multi-tab flow to prove realtime updates.
  - **Files**: `apps/web/tests/unit/planning-routes.test.tsx`, `apps/web/tests/e2e/planning.spec.ts`
  - **Verify**: The planning suite fails before implementation
  - **Accept**: Planning and collaboration behavior is explicit before the page layer changes

- [ ] **Task 2: Implement weekly calendar and shared list routes** `[BD:STG-125]`
  - **Type**: feature
  - **Do**: Build the planning route, weekly calendar UI, recipe assignment interactions, and shared grocery list surface using the planning/list APIs.
  - **Files**: `apps/web/src/pages/planning/`, `apps/web/src/routes/`, `apps/web/src/lib/api-client.ts`
  - **Verify**: Planning route tests pass
  - **Accept**: Users can plan meals and see the corresponding shared grocery list in real routes

- [ ] **Task 3: Wire realtime sync, conflict states, and copy-week UX** `[BD:STG-126]`
  - **Type**: feature
  - **Do**: Connect Socket.io updates, offline queue state, conflict badges, and copy-week interactions so collaboration state is visible and actionable in the UI.
  - **Files**: `apps/web/src/pages/planning/`, `apps/web/src/lib/socket.ts`, `apps/web/src/lib/sync-queue.ts`
  - **Verify**: Browser tests cover realtime updates, copy-week, and conflict UI
  - **Accept**: Planning pages expose collaborative state clearly and correctly

- [ ] **Task 4: Verify planning in real browser collaboration flows** `[BD:STG-127]`
  - **Type**: task
  - **Do**: Run the planning experience in a real browser with multi-tab and offline/reconnect checks. Confirm updates propagate between clients, queued edits flush correctly, and conflict messaging is understandable.
  - **Files**: `apps/web/tests/e2e/planning.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep planning && pnpm test:offline`
  - **Accept**: Planning and list collaboration is proven in runtime conditions

- [ ] **Task 5: Update manifest** `[BD:STG-128]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-pages-planning`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-pages-planning`, progress = `22 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-pages-planning" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and fulfillment-page work can proceed

---

## Discovered Tasks

_None yet._
