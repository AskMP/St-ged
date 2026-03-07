---
task: "Traction feature -- technique-based discovery and age-appropriate step tagging"
branch: "stg-03-discovery/discovery"
test_command: "pnpm test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "03-hardware"
requires: ["02-fulfillment-v2"]
parallel_safe: false
group: 3
manifest_id: "03-discovery"
---

# PRD: Technique-Based Discovery

## Context for Agent

### What This PRD Does

Expands recipe discovery with technique-based search and age-appropriate step tagging, making discovery smarter for skill-building and family use cases.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 01-pages-recipes | Searchable recipe pages | `apps/web/src/pages/recipes/` |
| 02-coaching | Technique and ingredient coaching primitives | `apps/web/src/components/`, `apps/web/src/pages/recipes/` |

### Key Files to Read First

- `docs/features.md` -- F24 and F25
- `apps/api/src/services/recipe-service.ts`
- `apps/web/src/pages/recipes/`

### Patterns to Follow

- Start with failing discovery/tagging tests
- Keep search semantics grounded in real recipe metadata
- Validate route-level discovery in browser runtime

### Skills and Commands

| Action | Command |
|--------|---------|
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Add failing discovery and tagging tests** `[BD:STG-200]`
  - **Type**: task
  - **Do**: Add failing tests for technique-based search, age-appropriate step tagging, and discovery UI filters.
  - **Files**: `apps/api/tests/discovery/`, `apps/web/tests/e2e/discovery.spec.ts`
  - **Verify**: The discovery suite fails before implementation
  - **Accept**: Discovery/tagging behavior is explicit before code changes

- [ ] **Task 2: Implement search metadata and route behavior** `[BD:STG-201]`
  - **Type**: feature
  - **Do**: Build backend and frontend support for technique-based discovery and age-appropriate step tags.
  - **Files**: `apps/api/src/`, `apps/web/src/pages/recipes/`, `packages/types/src/`
  - **Verify**: Integration tests pass
  - **Accept**: Users can discover recipes by technique and step suitability

- [ ] **Task 3: Refactor search UX and tagging semantics** `[BD:STG-202]`
  - **Type**: task
  - **Do**: Tighten search UX, labeling, and metadata presentation so discovery remains understandable.
  - **Files**: `apps/web/src/components/`, `apps/api/src/services/`
  - **Verify**: Tests remain green after cleanup
  - **Accept**: Discovery feels intentional rather than bolted on

- [ ] **Task 4: Verify discovery flows in browser runtime** `[BD:STG-203]`
  - **Type**: task
  - **Do**: Run browser E2E for technique-based search and tagged recipe exploration.
  - **Files**: `apps/web/tests/e2e/discovery.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e --grep discovery`
  - **Accept**: Discovery features are proven in runtime recipe use

- [ ] **Task 5: Update manifest** `[BD:STG-204]`
  - **Type**: chore
  - **Do**: Mark `03-discovery` complete in `prd-phases/manifest.md` and update Current State to `37 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "03-discovery" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated for the final PRD

---

## Discovered Tasks

_None yet._
