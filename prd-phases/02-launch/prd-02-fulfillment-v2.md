---
task: "Launch feature -- fulfillment v2 with richer Instacart, Kroger, and Chicory integrations"
branch: "stg-02-fulfillment-v2/fulfillment-v2"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "03-events"
requires: ["01-verify-runtime"]
parallel_safe: false
group: 2
manifest_id: "02-fulfillment-v2"
---

# PRD: Fulfillment V2

## Context for Agent

### What This PRD Does

Extends the MVP fulfillment path with richer partner integrations, including the official Instacart cart API path, Kroger support, and Chicory-ready sponsored ingredient hooks.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-fulfillment | MVP deep-link fulfillment API | `apps/api/src/services/fulfillment-service.ts` |
| 01-pages-fulfillment | MVP fulfillment UI | `apps/web/src/pages/fulfillment/` |
| 01-verify-runtime | Runtime-tested MVP baseline | `apps/web/tests/e2e/runtime.spec.ts` |

### Key Files to Read First

- `docs/features.md` -- F05 phase-2 additions
- `docs/project-brief.md` -- partner integration notes
- `apps/api/src/services/fulfillment-service.ts`

### Patterns to Follow

- Start by implementing partner-specific fulfillment services; add tests afterward to confirm behavior
- Keep MVP deep-link fallback intact until richer integrations are proven
- Validate partner handoff paths in a real browser flow

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [x] **Task 1: Implement partner-specific fulfillment services** `[BD:STG-181]`
  - **Type**: feature
  - **Do**: Extend backend and frontend fulfillment flows for official-cart support where available, Kroger integration entry points, and sponsored ingredient placement hooks.
  - **Files**: `apps/api/src/services/`, `apps/web/src/routes/`, `packages/types/src/`
  - **Verify**: Integration tests pass once added
  - **Accept**: The app can support richer partner fulfillment without removing MVP fallback paths

- [ ] **Task 2: Add richer-fulfillment tests** `[BD:STG-180]`
  - **Type**: task
  - **Do**: Add tests for official-cart handoff behavior, partner selection, Kroger fallback/selection, and Chicory-ready sponsored ingredient slots.
  - **Files**: `apps/api/tests/fulfillment-v2/`, `apps/web/tests/e2e/fulfillment-v2.spec.ts`
  - **Verify**: The fulfillment-v2 tests pass against the implemented services
  - **Accept**: Richer fulfillment expectations are explicit before code changes

- [ ] **Task 3: Refactor fallback and partner-selection behavior** `[BD:STG-182]`
  - **Type**: task
  - **Do**: Tighten fallback logic, partner disclosure, and selection behavior so richer integrations remain understandable and robust.
  - **Files**: `apps/api/src/services/`, `apps/web/src/components/`
  - **Verify**: Tests remain green after cleanup
  - **Accept**: Partner expansion does not make fulfillment brittle

- [ ] **Task 4: Verify richer-fulfillment browser flows** `[BD:STG-183]`
  - **Type**: task
  - **Do**: Run browser E2E for partner selection and richer fulfillment handoff behavior, confirming fallback remains available.
  - **Files**: `apps/web/tests/e2e/fulfillment-v2.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep fulfillment-v2`
  - **Accept**: Expanded fulfillment works in real browser use

- [ ] **Task 5: Update manifest** `[BD:STG-184]`
  - **Type**: chore
  - **Do**: Mark `02-fulfillment-v2` complete in `prd-phases/manifest.md` and update Current State to `33 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "02-fulfillment-v2" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and Group 3 traction work can begin

---

## Discovered Tasks

_None yet._
