---
task: "Traction feature -- smart kitchen sensor hooks and webhook ingestion"
branch: "stg-03-hardware/hardware"
test_command: "pnpm test && pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: null
requires: ["03-intelligence"]
parallel_safe: false
group: 3
manifest_id: "03-hardware"
---

# PRD: Smart Kitchen Sensor Hooks

## Context for Agent

### What This PRD Does

Adds webhook/API hooks for smart kitchen sensor data so hardware-assisted weight or pantry signals can flow into the platform without rewriting core planning logic.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 03-intelligence | Nutrition and utilization intelligence foundation | `apps/api/src/services/`, `apps/web/src/pages/` |

### Key Files to Read First

- `docs/features.md` -- F26
- `apps/api/src/routes/`
- `packages/types/src/`

### Patterns to Follow

- Start with failing ingestion and authorization tests
- Keep hardware data ingress decoupled from UI state
- Validate the API surface with real HTTP tests before adding UI affordances

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run API tests | `pnpm --filter api test` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Add failing hardware-hook tests** `[BD:STG-205]`
  - **Type**: task
  - **Do**: Add failing tests for webhook ingestion, device authentication, payload validation, and downstream state updates from hardware-originated events.
  - **Files**: `apps/api/tests/hardware/`
  - **Verify**: The hardware suite fails before implementation
  - **Accept**: Hardware-hook behavior is explicit before code changes

- [ ] **Task 2: Implement hardware ingestion and webhook routes** `[BD:STG-206]`
  - **Type**: feature
  - **Do**: Build webhook/API endpoints, validation, and service logic for receiving supported hardware events and mapping them into app state.
  - **Files**: `apps/api/src/routes/`, `apps/api/src/services/`, `packages/types/src/`
  - **Verify**: Integration tests pass
  - **Accept**: The platform can receive and process supported hardware inputs

- [ ] **Task 3: Refactor device auth and event mapping** `[BD:STG-207]`
  - **Type**: task
  - **Do**: Tighten device-auth handling, event schemas, and state-mapping logic so hardware ingress remains maintainable.
  - **Files**: `apps/api/src/services/`, `packages/types/src/`
  - **Verify**: Tests remain green after cleanup
  - **Accept**: Hardware integration stays isolated and well-defined

- [ ] **Task 4: Verify webhook behavior with real HTTP requests** `[BD:STG-208]`
  - **Type**: task
  - **Do**: Run real HTTP tests or manual webhook calls against the local API to confirm supported hardware payloads are accepted and mapped correctly.
  - **Files**: `apps/api/tests/hardware/`, local webhook fixtures
  - **Verify**: `pnpm --filter api test -- hardware`
  - **Accept**: Hardware hooks are proven on the real API surface

- [ ] **Task 5: Update manifest** `[BD:STG-209]`
  - **Type**: chore
  - **Do**: Mark `03-hardware` complete in `prd-phases/manifest.md` and update Current State to `38 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "03-hardware" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest shows the full roadmap complete at 38/38

---

## Discovered Tasks

_None yet._
