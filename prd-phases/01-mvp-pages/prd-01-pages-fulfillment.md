---
task: "MVP fulfillment page -- Deliver Me This flow, attribution UI, and bundle upsells"
branch: "stg-01-pages-fulfillment/fulfillment-page"
test_command: "pnpm --filter web test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "01-verify"
requires: ["01-pages-planning", "01-api-fulfillment"]
parallel_safe: false
group: 1
manifest_id: "01-pages-fulfillment"
---

# PRD: MVP Fulfillment Page

## Context for Agent

### What This PRD Does

Builds the final MVP handoff page that turns planned meals and grocery lists into a user-visible fulfillment action. This PRD exposes Instacart deep links, attribution disclosure, and smart bundle suggestions in a way users can review before leaving the app.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-planning | Weekly planning and shared-list UI | `apps/web/src/pages/planning/` |
| 01-api-fulfillment | Deep-link generation and bundle suggestion API | `apps/api/src/routes/fulfillment.ts` |

### Key Files to Read First

- `docs/features.md` -- F05 Deliver Me This requirements
- `apps/web/src/routes/`
- `apps/web/src/lib/api-client.ts`

### Patterns to Follow

- Fulfillment UI must expose partner attribution and bundle additions clearly
- Browser tests should prove the user can review the handoff before leaving the app
- Mobile-friendly layout matters because fulfillment is often a phone flow

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

1. Start with failing route and E2E tests for the fulfillment journey
2. Keep partner disclosures visible and contract-driven
3. Do not let bundle suggestions silently mutate the base order state
4. Validate mobile viewport behavior in the browser before calling the flow complete

---

## Tasks

- [ ] **Task 1: Add failing fulfillment route and E2E tests** `[BD:STG-129]`
  - **Type**: task
  - **Do**: Add route-level and Playwright tests for the Deliver Me This page covering list summary rendering, Instacart handoff CTA, attribution disclosure, and smart bundle suggestion UI.
  - **Files**: `apps/web/tests/unit/fulfillment-route.test.tsx`, `apps/web/tests/e2e/fulfillment.spec.ts`
  - **Verify**: The fulfillment-page suite fails before implementation
  - **Accept**: Fulfillment page behavior is explicit before UI work begins

- [ ] **Task 2: Implement the fulfillment review and handoff page** `[BD:STG-130]`
  - **Type**: feature
  - **Do**: Build the fulfillment page route, grocery summary, partner disclosure area, smart bundle presentation, and CTA handoff state. Keep the interaction mobile-first and visually intentional.
  - **Files**: `apps/web/src/pages/fulfillment/`, `apps/web/src/routes/`
  - **Verify**: Route tests pass
  - **Accept**: Users can review and trigger grocery fulfillment from a real page

- [ ] **Task 3: Wire the fulfillment API and deep-link behavior** `[BD:STG-131]`
  - **Type**: feature
  - **Do**: Connect the page to the fulfillment API, render partner attribution metadata, and expose deep-link and redirect behavior without hiding errors or link-generation failures.
  - **Files**: `apps/web/src/pages/fulfillment/`, `apps/web/src/lib/api-client.ts`
  - **Verify**: E2E tests cover the data fetch and CTA path
  - **Accept**: The page uses real fulfillment data rather than mocked placeholders

- [ ] **Task 4: Verify fulfillment in desktop and mobile browser flows** `[BD:STG-132]`
  - **Type**: task
  - **Do**: Run the fulfillment flow in a real browser and mobile-emulation viewport. Confirm layout, CTA behavior, and disclosure visibility all hold up without console errors.
  - **Files**: `apps/web/tests/e2e/fulfillment.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep fulfillment`
  - **Accept**: Fulfillment is proven as a user-facing runtime flow

- [ ] **Task 5: Update manifest** `[BD:STG-133]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-pages-fulfillment`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-pages-fulfillment`, progress = `23 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-pages-fulfillment" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and the MVP verification PRDs are unblocked

---

## Discovered Tasks

_None yet._
