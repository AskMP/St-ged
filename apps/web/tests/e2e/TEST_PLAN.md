# Staged E2E Test Plan

## Executive Summary

This document is the master reference for all Playwright end-to-end tests in the Staged PWA.
Tests run against a live Vite dev server (localhost:5173) with API calls intercepted via
Playwright route mocking unless the relevant runtime env var is set (e.g. `API_URL`,
`FULFILLMENT_RUNTIME`, etc.). The test suite is structured around the five core user personas
and covers every major feature domain.

All tests follow the guardrail: inject Zustand auth state via `addInitScript` BEFORE
`page.goto()`. Never rely on network auth flows inside fast-running mocked tests.

---

## How to Run Tests

```bash
# All E2E tests (headless, default)
pnpm --filter web test:e2e

# Watch / interactive UI
pnpm --filter web test:e2e --ui

# List discovered tests without running
pnpm --filter web test:e2e --list

# Single file
pnpm --filter web test:e2e auth-flow.spec.ts

# Live-API tests (requires running servers)
API_URL=http://localhost:3000 pnpm --filter web test:e2e

# Runtime gated tests (individual features)
FULFILLMENT_RUNTIME=1 pnpm --filter web test:e2e fulfillment.spec.ts
BATCH_RUNTIME=1       pnpm --filter web test:e2e batch-prep.spec.ts
DIETARY_RUNTIME=1     pnpm --filter web test:e2e dietary-adaptation.spec.ts
HOUSEHOLD_RUNTIME=1   pnpm --filter web test:e2e household-ops.spec.ts
POTLUCK_RUNTIME=1     pnpm --filter web test:e2e potluck.spec.ts
```

## Environment Setup

| Variable                | Purpose                                     | Default        |
| ----------------------- | ------------------------------------------- | -------------- |
| `API_URL`               | Enables live-API tests (signup/login flows) | unset (mocked) |
| `FULFILLMENT_RUNTIME=1` | Enables real fulfillment API test           | unset          |
| `BATCH_RUNTIME=1`       | Enables real batch-prep flow test           | unset          |
| `DIETARY_RUNTIME=1`     | Enables real dietary adaptation flow test   | unset          |
| `HOUSEHOLD_RUNTIME=1`   | Enables real household-ops flow test        | unset          |
| `POTLUCK_RUNTIME=1`     | Enables real potluck claim flow test        | unset          |

**For mocked tests only**: just run `pnpm --filter web dev` (web server at :5173). No API needed.

**For live-API tests**: run both `pnpm --filter web dev` and `pnpm --filter api dev`.

---

## Persona-to-Test-File Mapping

| Persona | Description                      | Primary test files                                                                                                                |
| ------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Jordan  | First apartment, beginner cook   | `onboarding.spec.ts`, `jordan-beginner.spec.ts`, `personas/jordan.spec.ts`                                                        |
| Darius  | Family of 4, household conductor | `planning.spec.ts`, `darius-planning.spec.ts`, `personas/darius.spec.ts`                                                          |
| Sam     | Fridge forager, uses clearance   | `sam-fridge-clearance.spec.ts`, `fridge-clearance.spec.ts`                                                                        |
| Maya    | Eco-anxious planner              | `recipes.spec.ts`, `dietary-adaptation.spec.ts`, `personas/maya.spec.ts`                                                          |
| Nadia   | Batch prep power user            | `batch-prep.spec.ts`                                                                                                              |
| Brett   | Dietary-restricted user          | `dietary-adaptation.spec.ts`                                                                                                      |
| All     | Cross-persona features           | `auth-flow.spec.ts`, `pantry-management.spec.ts`, `offline-pwa.spec.ts`, `household-settings.spec.ts`, `fulfillment-flow.spec.ts` |

---

## Feature Coverage Matrix

| Feature                        | File(s)                                                                  | Status  |
| ------------------------------ | ------------------------------------------------------------------------ | ------- |
| Signup form validation         | `onboarding.spec.ts`                                                     | covered |
| Login form                     | `login.spec.ts`, `auth-flow.spec.ts`                                     | covered |
| Auth guard redirect            | `auth-flow.spec.ts`                                                      | covered |
| Signout flow                   | `auth-flow.spec.ts`, `household-settings.spec.ts`                        | covered |
| Onboarding: skill step         | `onboarding.spec.ts`, `personas/jordan.spec.ts`                          | covered |
| Onboarding: household step     | `onboarding.spec.ts`                                                     | covered |
| Onboarding: dietary step       | `onboarding.spec.ts`                                                     | covered |
| Onboarding: pantry starter     | `onboarding.spec.ts`                                                     | covered |
| Onboarding: A2HS prompt        | `jordan-beginner.spec.ts`                                                | partial |
| Recipe library                 | `recipes.spec.ts`, `personas/jordan.spec.ts`, `personas/maya.spec.ts`    | covered |
| Recipe search                  | `jordan-beginner.spec.ts`, `personas/jordan.spec.ts`                     | covered |
| Recipe detail                  | `jordan-beginner.spec.ts`, `personas/maya.spec.ts`                       | covered |
| Recipe cooking view            | `jordan-beginner.spec.ts`, `coaching.spec.ts`                            | covered |
| In-step coaching tooltips      | `coaching.spec.ts`                                                       | covered |
| Zero-waste filter              | `recipes.spec.ts`                                                        | covered |
| Skill-level filter             | `recipes.spec.ts`                                                        | covered |
| Dietary adaptation             | `dietary-adaptation.spec.ts`                                             | covered |
| Planning week view             | `planning.spec.ts`, `personas/darius.spec.ts`, `darius-planning.spec.ts` | covered |
| Week navigation                | `personas/darius.spec.ts`, `darius-planning.spec.ts`                     | covered |
| Meal slot assignment           | `darius-planning.spec.ts`                                                | covered |
| Generate grocery list          | `personas/darius.spec.ts`                                                | covered |
| Budget / weekly cost           | `cost-serving.spec.ts`, `darius-planning.spec.ts`                        | covered |
| Fulfillment / Instacart CTA    | `fulfillment.spec.ts`, `personas/darius.spec.ts`                         | covered |
| Fulfillment provider selector  | `fulfillment.spec.ts`, `fulfillment-flow.spec.ts`                        | covered |
| Attribution disclosure         | `fulfillment.spec.ts`, `personas/darius.spec.ts`                         | covered |
| Copy list fallback             | `fulfillment-flow.spec.ts`                                               | covered |
| Pantry management              | `pantry-management.spec.ts`                                              | covered |
| Pantry expiry color coding     | `pantry-management.spec.ts`, `sam-fridge-clearance.spec.ts`              | covered |
| Fridge clearance suggestions   | `fridge-clearance.spec.ts`, `sam-fridge-clearance.spec.ts`               | covered |
| Batch prep: combine + sequence | `batch-prep.spec.ts`                                                     | covered |
| Potluck: create + claim        | `potluck.spec.ts`                                                        | covered |
| Household ops: cost tracking   | `household-ops.spec.ts`                                                  | covered |
| Household ops: rotation        | `household-ops.spec.ts`                                                  | covered |
| Settings page                  | `household-settings.spec.ts`                                             | covered |
| Join household via invite code | `household-settings.spec.ts`                                             | covered |
| Switch active household        | `household-settings.spec.ts`                                             | covered |
| Offline banner                 | `pwa-shell.spec.ts`, `offline-pwa.spec.ts`, `personas/maya.spec.ts`      | covered |
| Offline: data persists         | `pwa-shell.spec.ts`, `offline-pwa.spec.ts`                               | covered |
| Service worker / PWA shell     | `offline-pwa.spec.ts`                                                    | partial |
| A2HS / install prompt          | `jordan-beginner.spec.ts`                                                | partial |
| Screen Wake Lock (cooking)     | --                                                                       | missing |
| PWA manifest validation        | --                                                                       | missing |
| Events page                    | `events.spec.ts`                                                         | covered |
| Lists page                     | --                                                                       | missing |
| Mobile viewport                | `fulfillment.spec.ts`                                                    | partial |

### Legend

- **covered** -- meaningful test(s) assert the behaviour
- **partial** -- test exists but coverage is surface-level
- **missing** -- no test yet; lower priority or requires hardware/OS capability

---

## File Inventory

| File                           | Scope                                                 | API mocking            |
| ------------------------------ | ----------------------------------------------------- | ---------------------- |
| `auth-flow.spec.ts`            | Auth guard, login/signup, signout                     | route intercept        |
| `jordan-beginner.spec.ts`      | Jordan full journey: onboarding -> cooking -> offline | route intercept        |
| `darius-planning.spec.ts`      | Darius full journey: planning -> list -> fulfillment  | route intercept        |
| `sam-fridge-clearance.spec.ts` | Sam: pantry -> fridge clearance                       | route intercept        |
| `pantry-management.spec.ts`    | Pantry CRUD, expiry, offline optimistic               | route intercept        |
| `fulfillment-flow.spec.ts`     | Fulfillment page (supplemental coverage)              | route intercept        |
| `household-settings.spec.ts`   | Settings page, household join/switch, signout         | route intercept        |
| `dietary-adaptation.spec.ts`   | Dietary adaptation (existing -- updated)              | route intercept        |
| `batch-prep.spec.ts`           | Batch prep (existing -- updated)                      | route intercept        |
| `offline-pwa.spec.ts`          | Offline-first behaviour (existing -- updated)         | route intercept        |
| `onboarding.spec.ts`           | Onboarding flow (existing)                            | route intercept        |
| `planning.spec.ts`             | Planning page (existing)                              | route intercept        |
| `recipes.spec.ts`              | Recipe library filters (existing)                     | route intercept        |
| `fulfillment.spec.ts`          | Fulfillment page (existing)                           | route intercept        |
| `fridge-clearance.spec.ts`     | Fridge clearance (existing)                           | route intercept        |
| `household-ops.spec.ts`        | Household ops (existing)                              | route intercept        |
| `potluck.spec.ts`              | Potluck slot locking (existing)                       | route intercept        |
| `coaching.spec.ts`             | Cooking step tooltips (existing)                      | route intercept        |
| `cost-serving.spec.ts`         | Weekly cost display (existing)                        | route intercept        |
| `events.spec.ts`               | Events page (existing)                                | route intercept        |
| `login.spec.ts`                | Login form (existing)                                 | live API               |
| `pwa-shell.spec.ts`            | Offline indicator + nav (existing)                    | route intercept        |
| `personas/jordan.spec.ts`      | Jordan recipe journey                                 | none / route intercept |
| `personas/darius.spec.ts`      | Darius planning journey                               | route intercept        |
| `personas/maya.spec.ts`        | Maya eco filtering journey                            | none                   |
| `helpers/fixtures.ts`          | Shared helpers and route mocks                        | --                     |

---

## Known Limitations

1. **A2HS / install prompt**: `BeforeInstallPromptEvent` is never fired in headless Chromium; tests
   can only verify the component mounts, not the OS-level prompt.
2. **Screen Wake Lock**: `navigator.wakeLock` is not available in Playwright headless context.
   Testing requires a real device or Chrome with `--enable-features=ScreenWakeLock`.
3. **Service Worker caching**: Playwright's request interception sits above the Service Worker
   layer; true SW cache testing requires a separate network condition test.
4. **PWA manifest**: Manifest validation is better served by Lighthouse CI, not Playwright.
5. **Socket.io**: All tests abort socket.io connections to prevent noise; real-time sync is not
   tested at the E2E layer.
6. **Live-API tests**: Require both dev servers running; skipped in CI unless env vars set.
7. **Clipboard API**: `navigator.clipboard.writeText` requires `permissions` in Playwright config;
   copy-list tests grant permission inline.
