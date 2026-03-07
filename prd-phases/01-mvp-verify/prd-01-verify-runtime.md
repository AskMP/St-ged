---
task: "MVP runtime validation -- production-like browser, PWA, performance, and device checks"
branch: "stg-01-verify-runtime/runtime-verify"
test_command: "pnpm build && pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 12
chain_next: "02-fridge-clearance"
requires: ["01-verify"]
parallel_safe: false
group: 1
manifest_id: "01-verify-runtime"
---

# PRD: MVP Runtime Validation

## Context for Agent

### What This PRD Does

Runs the production-like quality gate the project was missing: browser validation against built assets, installability and offline recovery checks, basic performance/accessibility audits, and real-device smoke when ADB is available. This PRD is the barrier between "tests pass" and "the platform is actually ready to be exercised."

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-verify | Persona-level regression suite | `apps/web/tests/e2e/personas/` |
| 00h | CI/deploy scaffolding and browser smoke in CI | `.github/workflows/ci.yml`, `vercel.json`, `railway.json` |

### Key Files to Read First

- `apps/web/playwright.config.ts`
- `docs/project-brief.md` -- performance and offline targets
- `docs/development-workflow.md`

### Patterns to Follow

- Validate built or preview-like artifacts, not just dev mode
- Treat PWA installability, offline recovery, and reconnect behavior as release gates
- When ADB is available, use it; when it is not, prompt the user and continue browser validation instead of blocking all work

### Skills and Commands

| Action | Command |
|--------|---------|
| Build project | `pnpm build` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Run device check | `pnpm test:device` |
| Run offline smoke | `pnpm test:offline` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Fail the runtime gate with explicit reproduction before fixing anything
2. Run against built or preview-like artifacts whenever feasible
3. Prompt the user to connect/authorize a device if ADB validation is unavailable, but keep browser validation moving
4. Any launch-blocking runtime issue found here must become a tracked discovered task before Phase 2 starts

---

## Tasks

- [ ] **Task 1: Add failing production-like runtime checks** `[BD:STG-139]`
  - **Type**: task
  - **Do**: Add or refine browser/runtime checks that fail until the built app proves installability, offline recovery, reconnect behavior, and stable navigation under production-like serving conditions.
  - **Files**: `apps/web/tests/e2e/runtime.spec.ts`, `apps/web/tests/e2e/helpers/`
  - **Verify**: The runtime suite fails before the gate is satisfied
  - **Accept**: Runtime expectations are explicit before final validation begins

- [ ] **Task 2: Validate built app behavior in a real browser** `[BD:STG-140]`
  - **Type**: task
  - **Do**: Run the built app or preview-like environment in a real browser and verify routing, PWA manifest/service worker presence, offline recovery, and reconnect behavior. Confirm the installed-or-installable experience behaves as expected.
  - **Files**: `apps/web/dist/`, preview server config, `apps/web/tests/e2e/runtime.spec.ts`
  - **Verify**: `pnpm build && pnpm --filter web test:e2e --grep runtime && pnpm test:offline`
  - **Accept**: The MVP works under production-like browser conditions, not only in dev mode

- [ ] **Task 3: Run device validation when ADB is available** `[BD:STG-141]`
  - **Type**: task
  - **Do**: Run `pnpm test:device`. If `adb` or an authorized device is unavailable, prompt the user to connect or expose the device tooling, record the blocker in `bd`, and continue the rest of this PRD. If a device is available, execute the relevant smoke flow and capture results.
  - **Files**: `scripts/check-adb-device.*`, `bd` notes
  - **Verify**: Device validation either runs successfully or exits with a clear, user-facing prompt and recorded blocker note
  - **Accept**: Device validation is handled explicitly rather than silently skipped

- [ ] **Task 4: Run performance and accessibility spot checks** `[BD:STG-142]`
  - **Type**: task
  - **Do**: Run lightweight performance/accessibility checks against the built app, including installability, offline indicators, route responsiveness, and any available Lighthouse/PWA metrics that can be automated reasonably at this stage.
  - **Files**: `apps/web/`, generated audit output if captured
  - **Verify**: Audit results are recorded and critical failures are addressed or tracked
  - **Accept**: The MVP is validated as a runtime platform, not only a test suite

- [ ] **Task 5: Gate launch readiness and document remaining blockers** `[BD:STG-143]`
  - **Type**: chore
  - **Do**: Review the outputs of persona, offline, browser, performance, and device checks. Any issue that prevents real-world testing must be fixed here or converted into a tracked blocker before Phase 2 begins.
  - **Files**: `bd` notes, `prd-phases/manifest.md`
  - **Verify**: There are no silent runtime blockers left untracked
  - **Accept**: Group 2 features cannot begin unless the MVP is genuinely testable in runtime conditions

- [ ] **Task 6: Update manifest** `[BD:STG-144]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-verify-runtime`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-verify-runtime`, progress = `25 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-verify-runtime" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and Phase 2 remains blocked until this runtime gate is satisfied

---

## Discovered Tasks

_None yet._
