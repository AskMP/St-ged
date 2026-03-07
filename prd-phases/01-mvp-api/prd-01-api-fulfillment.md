---
task: "MVP fulfillment API -- Instacart deep links, attribution, and smart bundles"
branch: "stg-01-api-fulfillment/fulfillment-api"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 9
chain_next: "01-ui-pwa"
requires: ["01-api-plans"]
parallel_safe: false
group: 1
manifest_id: "01-api-fulfillment"
---

# PRD: MVP Fulfillment API

## Context for Agent

### What This PRD Does

Implements the MVP Instacart fulfillment surface: deep-link generation from grocery lists, affiliate attribution metadata, and smart bundle suggestions. This PRD turns planning output into a monetizable fulfillment handoff.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-plans | Plan-to-list generation | `apps/api/src/services/plan-service.ts`, `apps/api/src/services/list-service.ts` |
| 00e | Fulfillment route skeleton | `apps/api/src/routes/fulfillment.ts` |

### Key Files to Read First

- `apps/api/src/routes/fulfillment.ts`
- `docs/features.md` -- F05 Deliver Me This requirements
- `docs/project-brief.md` -- Instacart IDP and Impact.com notes

### Patterns to Follow

- MVP uses official deep-link construction, not a pretend full-cart API
- Keep attribution and partner disclosure data explicit in the API response
- Smart bundles should be additive suggestions, not hidden cart mutations

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

1. Start with failing fulfillment route tests and link-shape assertions
2. Keep partner and attribution assumptions explicit so UI can display disclosures
3. Do not silently replace the MVP deep-link model with unsupported cart API behavior
4. If bundle heuristics need more product data later, keep the MVP suggestion model simple and documented

---

## Tasks

- [ ] **Task 1: Add failing fulfillment route tests** `[BD:STG-97]`
  - **Type**: task
  - **Do**: Add real HTTP tests for Instacart deep-link generation, affiliate attribution token inclusion, redirect-token behavior, and smart-bundle suggestion payloads derived from a grocery list. Include invalid-list and unauthorized access failures.
  - **Files**: `apps/api/tests/fulfillment/fulfillment-routes.test.ts`
  - **Verify**: The fulfillment suite fails before service implementation
  - **Accept**: Fulfillment API expectations are explicit before the route logic changes

- [ ] **Task 2: Implement deep-link and attribution services** `[BD:STG-98]`
  - **Type**: feature
  - **Do**: Implement the fulfillment service and routes for Instacart deep-link generation and redirect/attribution payloads. Pull from real list data and include partner-disclosure metadata the UI can surface directly.
  - **Files**: `apps/api/src/routes/fulfillment.ts`, `apps/api/src/services/fulfillment-service.ts`
  - **Verify**: Deep-link and attribution tests pass
  - **Accept**: Grocery lists can be transformed into valid MVP fulfillment links

- [ ] **Task 3: Add smart bundle suggestion logic** `[BD:STG-99]`
  - **Type**: feature
  - **Do**: Add simple, transparent smart-bundle suggestions based on planned meals and list contents. Ensure suggestions are returned as optional upsells rather than silently merged into the base list.
  - **Files**: `apps/api/src/services/fulfillment-service.ts`, `packages/types/src/list.ts`
  - **Verify**: Bundle-suggestion tests pass with seeded meal-plan fixtures
  - **Accept**: The API returns monetizable but user-visible bundle suggestions

- [ ] **Task 4: Refactor partner configuration and safety checks** `[BD:STG-100]`
  - **Type**: task
  - **Do**: Centralize partner IDs, link-generation config, and compliance checks so future Kroger/Instacart full-cart work can extend the service without rewriting the MVP path.
  - **Files**: `apps/api/src/services/fulfillment-service.ts`, `apps/api/src/lib/env.ts`, `docs/`
  - **Verify**: `pnpm --filter api type-check && pnpm --filter api test`
  - **Accept**: Fulfillment config is explicit and extension-ready

- [ ] **Task 5: Verify fulfillment flows against seeded weekly plans** `[BD:STG-101]`
  - **Type**: task
  - **Do**: Run the fulfillment suite against seeded plans/lists, confirm the API returns usable deep links and bundle suggestions, and verify attribution data is present for UI display.
  - **Files**: `apps/api/tests/fulfillment/`, `.env.local`
  - **Verify**: `pnpm --filter api test -- fulfillment`
  - **Accept**: Fulfillment handoff is proven with real grocery list payloads

- [ ] **Task 6: Update manifest** `[BD:STG-102]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-api-fulfillment`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-api-fulfillment`, progress = `17 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-api-fulfillment" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and fulfillment UI work can proceed on a real API

---

## Discovered Tasks

_None yet._
