---
task: "Launch feature -- in-step contextual coaching for techniques and ingredients"
branch: "stg-02-coaching/coaching"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "02-household-ops"
requires: ["01-verify-runtime"]
parallel_safe: false
group: 2
manifest_id: "02-coaching"
---

# PRD: In-Step Contextual Coaching

## Context for Agent

### What This PRD Does

Adds inline coaching and glossary support so users can tap techniques and ingredients during cooking to understand what they mean without leaving the recipe flow.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-recipes | Step-by-step cooking flow | `apps/web/src/pages/recipes/` |
| 01-verify-runtime | Runtime-tested MVP | `apps/web/tests/e2e/runtime.spec.ts` |

### Key Files to Read First

- `docs/features.md` -- F16
- `apps/web/src/pages/recipes/`

### Patterns to Follow

- Start with failing inline-coaching tests
- Keep explanations concise and in-context
- Verify the coaching interaction inside the real cooking flow

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Add failing coaching tests** `[BD:STG-170]`
  - **Type**: task
  - **Do**: Add failing tests for technique glossary lookups, inline reveal interactions, and ingredient explanation rendering inside recipe steps.
  - **Files**: `apps/web/tests/unit/coaching.test.tsx`, `apps/web/tests/e2e/coaching.spec.ts`
  - **Verify**: The coaching suite fails before implementation
  - **Accept**: Coaching expectations are explicit before code changes

- [ ] **Task 2: Implement glossary data and inline coaching UI** `[BD:STG-171]`
  - **Type**: feature
  - **Do**: Build the glossary/explainer data layer and inline recipe-step UI for technique and ingredient explanations.
  - **Files**: `apps/web/src/pages/recipes/`, `apps/web/src/components/`, `packages/types/src/`
  - **Verify**: Integration tests pass
  - **Accept**: Users can reveal coaching context during cooking

- [ ] **Task 3: Refactor reveal timing and readability** `[BD:STG-172]`
  - **Type**: task
  - **Do**: Tighten motion, content density, and interaction timing so coaching is useful without disrupting cooking flow.
  - **Files**: `apps/web/src/components/`, `apps/web/src/styles/`
  - **Verify**: Tests remain green after UX cleanup
  - **Accept**: Coaching feels like a production aid, not a content dump

- [ ] **Task 4: Verify coaching within browser cooking flows** `[BD:STG-173]`
  - **Type**: task
  - **Do**: Run browser E2E for tapping glossary terms during the step-by-step recipe flow and confirming context appears inline.
  - **Files**: `apps/web/tests/e2e/coaching.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep coaching`
  - **Accept**: Coaching is proven in runtime recipe use

- [ ] **Task 5: Update manifest** `[BD:STG-174]`
  - **Type**: chore
  - **Do**: Mark `02-coaching` complete in `prd-phases/manifest.md` and update Current State to `31 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "02-coaching" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the next launch PRD

---

## Discovered Tasks

_None yet._
