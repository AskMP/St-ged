---
task: "MVP onboarding page -- household setup, dietary profile, starter pantry, A2HS"
branch: "stg-01-pages-onboarding/onboarding-page"
test_command: "pnpm --filter web test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "01-pages-recipes"
requires: ["01-ui-components", "01-api-auth", "01-api-pantry"]
parallel_safe: false
group: 1
manifest_id: "01-pages-onboarding"
---

# PRD: MVP Onboarding Page

## Context for Agent

### What This PRD Does

Builds the onboarding flow that turns a first-time visitor into a household-ready user: auth handoff, skill level, household size, dietary profile, starter pantry selection, and A2HS/persistent-storage guidance. This PRD is the first real end-user journey.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-ui-components | Shared feature-grade components | `apps/web/src/components/` |
| 01-api-auth | Auth and guest-session APIs | `apps/api/src/routes/auth.ts` |
| 01-api-pantry | Starter pantry and pantry CRUD APIs | `apps/api/src/routes/pantry.ts` |

### Key Files to Read First

- `docs/personas/jordan-the-first-apartment.md`
- `docs/features.md` -- onboarding, A2HS, dietary profile requirements
- `apps/web/src/routes/`

### Patterns to Follow

- Onboarding must be resumable and route-level testable
- A2HS and persistent storage messaging are functional parts of the flow
- Use the pantry API, not local-only onboarding state, for starter pantry persistence

### Skills and Commands

| Action | Command |
|--------|---------|
| Run web tests | `pnpm --filter web test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Start dev server | `pnpm --filter web dev` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Implement the multi-step onboarding route and flow first; add route and E2E tests afterward to confirm the journey
2. Keep multi-step state in a recoverable form so refresh/back actions do not destroy progress
3. Treat A2HS/installability guidance as product logic, not a dismissible tooltip
4. Validate in a real browser and mobile emulation before moving on

---

## Tasks

- [x] **Task 1: Implement the multi-step onboarding route** `[BD:STG-115]`
  - **Type**: feature
  - **Do**: Build the onboarding route and step flow, including auth handoff, multi-step state management, and a polished first-run experience that matches the product aesthetic.
  - **Files**: `apps/web/src/pages/onboarding.tsx`, `apps/web/src/routes/`, `apps/web/src/lib/onboarding-store.ts`
  - **Verify**: Route and interaction tests pass once added
  - **Accept**: Users can move through onboarding end-to-end in the browser

- [x] **Task 2: Add onboarding route and flow tests** `[BD:STG-114]`
  - **Type**: task
  - **Do**: Add route-level and Playwright tests for the onboarding flow covering auth entry, skill level, household size, dietary preferences, starter pantry selection, and A2HS/persistent-storage messaging.
  - **Files**: `apps/web/tests/unit/onboarding-route.test.tsx`, `apps/web/tests/e2e/onboarding.spec.ts`
  - **Verify**: The onboarding tests pass against the implemented UI
  - **Accept**: The onboarding journey is confirmed by automated tests

- [x] **Task 3: Wire auth, pantry templates, and installability hooks** `[BD:STG-116]`
  - **Type**: feature
  - **Do**: Connect onboarding to the auth API, starter pantry templates, A2HS prompt state, and persistent-storage request flow. Ensure guest-to-member and household creation paths are supported.
  - **Files**: `apps/web/src/pages/onboarding.tsx`, `apps/web/src/lib/api-client.ts`, `apps/web/src/lib/install.ts`
  - **Verify**: E2E tests cover pantry selection and installability messaging
  - **Accept**: Onboarding persists real household/profile/pantry state, not placeholder data

- [x] **Task 4: Verify onboarding in browser and mobile emulation** `[BD:STG-117]`
  - **Type**: task
  - **Do**: Run the onboarding flow in a real browser and mobile-emulation viewport. Confirm step transitions, validation, storage prompts, and return/resume behavior all work without console errors.
  - **Files**: `apps/web/tests/e2e/onboarding.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep onboarding`
  - **Accept**: Onboarding is proven as a usable runtime flow, not just a form component

- [x] **Task 5: Update manifest** `[BD:STG-118]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-pages-onboarding`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-pages-onboarding`, progress = `20 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-pages-onboarding" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and recipe-page work can build on a real onboarding journey

---

## Discovered Tasks

_None yet._
