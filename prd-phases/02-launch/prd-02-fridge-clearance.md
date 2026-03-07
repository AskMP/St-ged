---
task: "Launch feature -- AI fridge-clearance with pantry input and expiry-aware recipe matching"
branch: "stg-02-fridge-clearance/fridge-clearance"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "02-cost-serving"
requires: ["01-verify-runtime"]
parallel_safe: false
group: 2
manifest_id: "02-fridge-clearance"
---

# PRD: AI Fridge-Clearance

## Context for Agent

### What This PRD Does

Adds pantry-driven recipe matching with expiry awareness so users can turn what they already have into realistic recipe suggestions. This is the first launch feature layered on top of the validated MVP runtime.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-api-pantry | Pantry CRUD and starter templates | `apps/api/src/routes/pantry.ts` |
| 01-pages-recipes | Recipe browsing and cooking flows | `apps/web/src/pages/recipes/` |
| 01-verify-runtime | Runtime-tested MVP baseline | `apps/web/tests/e2e/runtime.spec.ts` |

### Key Files to Read First

- `docs/features.md` -- F11
- `apps/api/src/services/pantry-service.ts`
- `apps/web/src/pages/recipes/`

### Patterns to Follow

- Start with failing pantry-to-match tests
- Use real pantry data and recipe corpus; do not fake the end-to-end path
- Validate browser behavior and suggestion usefulness in runtime flows

### Skills and Commands

| Action | Command |
|--------|---------|
| Run all tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Add failing pantry-match tests** `[BD:STG-145]`
  - **Type**: task
  - **Do**: Add failing service, route, and browser tests for pantry input, expiry surfacing, recipe suggestions, and missing-ingredient deltas.
  - **Files**: `apps/api/tests/fridge-clearance/`, `apps/web/tests/e2e/fridge-clearance.spec.ts`
  - **Verify**: The fridge-clearance suite fails before implementation
  - **Accept**: The feature contract is explicit before code changes

- [ ] **Task 2: Implement pantry-to-recipe matching and expiry logic** `[BD:STG-146]`
  - **Type**: feature
  - **Do**: Build the API/service logic and UI flows for pantry input, expiry tracking, recipe matching, and missing-ingredient deltas.
  - **Files**: `apps/api/src/services/`, `apps/api/src/routes/`, `apps/web/src/pages/`
  - **Verify**: Integration tests pass
  - **Accept**: Users receive meaningful fridge-clearance suggestions from real pantry data

- [ ] **Task 3: Refactor suggestion quality and explainability** `[BD:STG-147]`
  - **Type**: task
  - **Do**: Refine ranking/explanations so users can see why recipes were suggested and what ingredients remain missing.
  - **Files**: `apps/api/src/services/`, `apps/web/src/components/`
  - **Verify**: Tests remain green after ranking cleanup
  - **Accept**: The feature is understandable, not just technically functional

- [ ] **Task 4: Verify in browser runtime flows** `[BD:STG-148]`
  - **Type**: task
  - **Do**: Run browser E2E for pantry entry, expiry surfacing, and recipe suggestion usage against the real app stack.
  - **Files**: `apps/web/tests/e2e/fridge-clearance.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep fridge`
  - **Accept**: Fridge-clearance is proven in a browser flow

- [ ] **Task 5: Update manifest** `[BD:STG-149]`
  - **Type**: chore
  - **Do**: Mark `02-fridge-clearance` complete in `prd-phases/manifest.md` and update Current State to `26 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "02-fridge-clearance" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and the next launch PRD remains unblocked

---

## Discovered Tasks

_None yet._
