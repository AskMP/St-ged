---
task: "MVP verification -- persona flows, offline smoke, and regression gate"
branch: "stg-01-verify/mvp-verify"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 12
chain_next: "01-verify-runtime"
requires: ["01-pages-fulfillment"]
parallel_safe: false
group: 1
manifest_id: "01-verify"
---

# PRD: MVP Verification

## Context for Agent

### What This PRD Does

Runs the first true MVP regression gate against persona journeys rather than isolated feature tests. This PRD proves the product works for Jordan, Maya, and Darius across onboarding, recipes, planning, fulfillment, and offline recovery.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-fulfillment | End-to-end MVP page set | `apps/web/src/pages/`, `apps/web/src/routes/` |
| 01-api-* | Full MVP API surface | `apps/api/src/routes/`, `apps/api/src/services/` |

### Key Files to Read First

- `docs/personas/jordan-the-first-apartment.md`
- `docs/personas/maya-the-eco-planner.md`
- `docs/personas/darius-the-household-conductor.md`
- `apps/web/tests/e2e/`

### Patterns to Follow

- Use seeded fixtures and the real app stack
- Persona verification must cross multiple routes and systems, not isolated page checks
- Offline smoke must be part of the regression gate, not a separate optional pass

### Skills and Commands

| Action | Command |
|--------|---------|
| Run all tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Run offline smoke | `pnpm test:offline` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Add or refine persona flows before fixing any discovered gaps
2. Prefer real seeded data and the full app stack over mocks
3. If a persona flow exposes a missing feature, create discovered tasks or a new PRD rather than burying the gap
4. Record concrete reproduction steps for every failure found during verification

---

## Tasks

- [x] **Task 1: Author persona E2E flows** `[BD:STG-134]`
  - **Type**: task
  - **Do**: Create Playwright specs for Jordan (first-run onboarding to saved recipe), Maya (eco/dietary filters and offline recipe access), and Darius (planning to shared list to fulfillment). Ensure the specs cover the full journeys so gaps are visible during implementation.
  - **Files**: `apps/web/tests/e2e/personas/jordan.spec.ts`, `apps/web/tests/e2e/personas/maya.spec.ts`, `apps/web/tests/e2e/personas/darius.spec.ts`
  - **Verify**: The persona suite passes against the current codebase
  - **Accept**: Full-user regression expectations are explicit before final MVP hardening

- [x] **Task 2: Add shared fixture/reset support for persona runs** `[BD:STG-135]`
  - **Type**: task
  - **Do**: Add repeatable seed/reset helpers so each persona flow starts from known data and environment state. Make sure the browser suite can bring up the app and API against those fixtures consistently.
  - **Files**: `packages/db/src/seeds/`, `apps/web/tests/e2e/helpers/`
  - **Verify**: Persona tests can reset and rerun without manual DB cleanup
  - **Accept**: Verification runs are deterministic enough to act as a release gate

- [x] **Task 3: Run persona and offline regression passes** `[BD:STG-136]`
  - **Type**: task
  - **Do**: Run the persona suites and offline smoke tests against the real local stack. Capture failures, fix them within scope when appropriate, and create discovered tasks for anything newly uncovered that does not belong in the current PRD.
  - **Files**: `apps/web/tests/e2e/`, `bd` task notes
  - **Verify**: `pnpm --filter web test:e2e && pnpm test:offline`
  - **Accept**: MVP persona journeys are green against the real app stack

- [x] **Task 4: Verify browser console, network, and regression hygiene** `[BD:STG-137]`
  - **Type**: task
  - **Do**: Confirm the persona flows run without unexpected console errors, unhandled promise rejections, or repeated failed network requests. Tighten tests or app behavior where noisy failures remain.
  - **Files**: `apps/web/tests/e2e/`, `apps/web/src/`
  - **Verify**: Playwright runs complete cleanly with console/network assertions enabled
  - **Accept**: Passing persona tests also represent a clean runtime signal, not a noisy one

- [x] **Task 5: Update manifest** `[BD:STG-138]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-verify`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-verify`, progress = `24 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-verify" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and runtime validation is unblocked

---

## Discovered Tasks

_None yet._
