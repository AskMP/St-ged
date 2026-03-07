---
task: "MVP households API -- create/join, invites, member roles, and guest-add rules"
branch: "stg-01-api-households/households-api"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "01-api-pantry"
requires: ["01-api-auth"]
parallel_safe: false
group: 1
manifest_id: "01-api-households"
---

# PRD: MVP Households API

## Context for Agent

### What This PRD Does

Implements the household coordination backbone: household creation, invites, joining by code, member role management, and the guest-add rules later shared by pantry and grocery list collaboration. This PRD establishes the multi-user boundaries the product depends on.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-auth | User, guest, and session flows | `apps/api/src/routes/auth.ts`, `apps/api/src/services/auth-service.ts` |
| 01-data-schema | Household/member tables and constraints | `packages/db/src/schema/households.ts`, `packages/db/src/schema/householdMembers.ts` |
| 00e | Household route skeleton | `apps/api/src/routes/households.ts` |

### Key Files to Read First

- `apps/api/src/routes/households.ts`
- `packages/db/src/schema/households.ts`
- `packages/db/src/schema/householdMembers.ts`
- `docs/features.md` -- F03 household collaboration requirements

### Patterns to Follow

- Keep household authorization server-authoritative
- Distinguish owner/member/guest permissions clearly in services
- Invitation and guest-add behavior must support later onboarding, pantry, and list PRDs without rewrites

### Skills and Commands

| Action | Command |
|--------|---------|
| Run API tests | `pnpm --filter api test` |
| Start API dev server | `pnpm --filter api dev` |
| Type check | `pnpm --filter api type-check` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Start with failing route tests for create/join/invite/member behavior
2. Keep invite codes and guest behavior stable because later UI and realtime flows depend on them
3. Do not push authorization decisions into the client
4. If room membership rules for sockets need new helpers, add them here before list/planning work begins

---

## Tasks

- [ ] **Task 1: Add failing household flow tests** `[BD:STG-75]`
  - **Type**: task
  - **Do**: Add real HTTP tests for household creation, invite generation, join-by-code, member listing, role changes, and guest-add permission boundaries. Cover invalid invite codes, duplicate joins, and unauthorized role changes.
  - **Files**: `apps/api/tests/households/household-routes.test.ts`
  - **Verify**: The household suite fails before service implementation
  - **Accept**: Household collaboration behavior is explicit before code changes

- [ ] **Task 2: Implement create/join/invite/member services** `[BD:STG-76]`
  - **Type**: feature
  - **Do**: Implement household services and routes for create, join, invite, and member lookup/mutation. Generate stable invite codes, enforce owner/member/guest permissions, and return typed household payloads that the web app can render directly.
  - **Files**: `apps/api/src/routes/households.ts`, `apps/api/src/services/household-service.ts`, `packages/db/src/queries/households.ts`
  - **Verify**: Household creation and join tests pass
  - **Accept**: Households can be created and joined safely through the real API

- [ ] **Task 3: Add guest-add and socket-ready authorization helpers** `[BD:STG-77]`
  - **Type**: feature
  - **Do**: Implement guest-add rules and helper utilities that later grocery-list and pantry routes can reuse for household-scoped access. Expose enough information to support room joins in Socket.io without duplicating membership queries everywhere.
  - **Files**: `apps/api/src/services/household-service.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/lib/socket.ts`
  - **Verify**: Guest-add and member-role tests pass
  - **Accept**: Household authorization is reusable for later realtime features

- [ ] **Task 4: Verify multi-user household behavior** `[BD:STG-78]`
  - **Type**: task
  - **Do**: Run the household suite against seeded users and confirm member roles, invite redemption, and guest boundaries behave correctly with multiple sessions.
  - **Files**: `apps/api/tests/households/`, `.env.local`
  - **Verify**: `pnpm --filter api test -- households`
  - **Accept**: Household coordination works as a real multi-user API surface

- [ ] **Task 5: Update manifest** `[BD:STG-79]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-api-households`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-api-households`, progress = `13 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-api-households" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and pantry/list work is unblocked

---

## Discovered Tasks

_None yet._
