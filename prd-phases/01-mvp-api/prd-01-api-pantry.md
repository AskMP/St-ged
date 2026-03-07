---
task: "MVP pantry API -- starter pantry templates, CRUD, and sync-ready contracts"
branch: "stg-01-api-pantry/pantry-api"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 9
chain_next: "01-api-lists"
requires: ["01-api-households"]
parallel_safe: false
group: 1
manifest_id: "01-api-pantry"
---

# PRD: MVP Pantry API

## Context for Agent

### What This PRD Does

Implements pantry CRUD and starter pantry templates so onboarding can persist real pantry data instead of a one-off form artifact. This PRD lays the MVP foundation for pantry-aware planning and the later fridge-clearance feature.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-households | Household authorization and invite flows | `apps/api/src/services/household-service.ts` |
| 01-data-schema | Pantry and pantry item tables | `packages/db/src/schema/pantry.ts` |
| 00e | Pantry route skeleton | `apps/api/src/routes/pantry.ts` |

### Key Files to Read First

- `apps/api/src/routes/pantry.ts`
- `packages/db/src/schema/pantry.ts`
- `docs/features.md` -- onboarding and pantry-related requirements

### Patterns to Follow

- Pantry is household-scoped, not user-scoped
- Starter pantry templates must be reusable by onboarding and future pantry editing screens
- Use real HTTP tests; pantry behavior should not be validated only through DB calls

### Skills and Commands

| Action | Command |
|--------|---------|
| Run API tests | `pnpm --filter api test` |
| Type check | `pnpm --filter api type-check` |
| Seed DB fixtures | `pnpm --filter @staged/db seed` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Start with failing pantry route tests before implementing services
2. Keep starter pantry templates explicit and versionable
3. Preserve household authorization boundaries from the household service
4. If pantry quantity/expiry modeling needs new helper types, add them here before UI wiring

---

## Tasks

- [ ] **Task 1: Add failing pantry and starter-template tests** `[BD:STG-80]`
  - **Type**: task
  - **Do**: Add real HTTP tests for fetching a household pantry, adding/removing items, updating quantities/expiry dates, and applying starter pantry templates during onboarding. Include unauthorized and cross-household access failures.
  - **Files**: `apps/api/tests/pantry/pantry-routes.test.ts`
  - **Verify**: The pantry suite fails before service implementation
  - **Accept**: Pantry API expectations are explicit before code changes

- [ ] **Task 2: Implement pantry CRUD services and routes** `[BD:STG-81]`
  - **Type**: feature
  - **Do**: Implement pantry services and routes for household pantry fetch, create/update/remove item mutations, and idempotent starter pantry application. Return stable payloads the onboarding and planning UIs can consume directly.
  - **Files**: `apps/api/src/routes/pantry.ts`, `apps/api/src/services/pantry-service.ts`, `packages/db/src/queries/pantry.ts`
  - **Verify**: Pantry CRUD tests pass against the real API
  - **Accept**: Household pantry data is persisted and accessible through the API

- [ ] **Task 3: Add starter pantry templates and helper catalogs** `[BD:STG-82]`
  - **Type**: feature
  - **Do**: Create reusable starter pantry template definitions keyed by household profile or onboarding choices. Ensure templates can be expanded into concrete pantry items without duplicating UI-specific logic in the route layer.
  - **Files**: `apps/api/src/services/pantry-template-service.ts`, `packages/types/src/pantry.ts`
  - **Verify**: Starter pantry tests pass with multiple template selections
  - **Accept**: Onboarding can seed pantry contents with consistent starter data

- [ ] **Task 4: Verify pantry flows against seeded households** `[BD:STG-83]`
  - **Type**: task
  - **Do**: Run pantry tests against seeded multi-household fixtures, confirm isolation between households, and verify starter pantry application is idempotent.
  - **Files**: `apps/api/tests/pantry/`, `.env.local`
  - **Verify**: `pnpm --filter api test -- pantry`
  - **Accept**: Pantry behavior is proven with realistic household data

- [ ] **Task 5: Update manifest** `[BD:STG-84]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-api-pantry`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-api-pantry`, progress = `14 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-api-pantry" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and onboarding has a real pantry API dependency

---

## Discovered Tasks

_None yet._
