---
task: "MVP USDA pipeline -- resilient import, nutrition helpers, and ingredient search"
branch: "stg-01-data-usda/usda-pipeline"
test_command: "pnpm --filter @staged/usda import-fdc && pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "01-api-auth"
requires: ["01-data-schema"]
parallel_safe: false
group: 1
manifest_id: "01-data-usda"
---

# PRD: MVP USDA Pipeline

## Context for Agent

### What This PRD Does

Hardens the USDA import pipeline so ingredient search, nutrition calculation, and recipe matching work repeatably without live API dependencies. This PRD makes the ingredient corpus fast enough and deterministic enough for later recipe and substitution work.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00d | Initial USDA download/import scaffold | `packages/usda/src/download.ts`, `packages/db/src/schema/usdaIngredients.ts` |
| 01-data-schema | Finalized schema and fixtures | `packages/db/src/schema/`, `packages/db/src/seeds/` |

### Key Files to Read First

- `packages/usda/src/download.ts`
- `packages/db/src/schema/usdaIngredients.ts`
- `docs/project-brief.md` -- nutrition architecture and performance targets

### Patterns to Follow

- Parse USDA datasets into normalized, idempotent inserts
- Keep fixture-driven parser tests ahead of live download steps
- Optimize for ingredient search and nutrition lookups that later API routes can call synchronously

### Skills and Commands

| Action | Command |
|--------|---------|
| Import dataset | `pnpm --filter @staged/usda import-fdc` |
| Run tests | `pnpm --filter api test` |
| Type check | `pnpm type-check` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Write or update fixture-based parser tests before changing importer logic
2. Prefer resumable/idempotent imports so reruns are cheap and safe
3. If USDA file naming changes, document the new source path instead of hardcoding fragile assumptions
4. Keep performance checks grounded in real query timings, not assumptions

---

## Tasks

- [ ] **Task 1: Add failing importer and search tests** `[BD:STG-57]`
  - **Type**: task
  - **Do**: Create fixture-based tests that fail until the importer correctly extracts nutrients, categories, and search text from representative Foundation Foods and SR Legacy records. Include search cases for pantry staples, produce, and ambiguous ingredient names.
  - **Files**: `packages/usda/tests/download.test.ts`, `packages/usda/tests/fixtures/`
  - **Verify**: The tests fail before parser updates are applied
  - **Accept**: Import expectations are explicit before the importer is changed

- [ ] **Task 2: Implement resilient USDA download and normalization** `[BD:STG-58]`
  - **Type**: feature
  - **Do**: Finish `packages/usda/src/download.ts` so it downloads or consumes local archive files, extracts the needed USDA datasets, normalizes nutrients into a consistent shape, and performs idempotent batch upserts into `usda_ingredients`.
  - **Files**: `packages/usda/src/download.ts`, `packages/usda/package.json`
  - **Verify**: `pnpm --filter @staged/usda import-fdc` completes successfully against the target dataset
  - **Accept**: The importer is rerunnable and produces a stable ingredient corpus

- [ ] **Task 3: Add nutrition and search helpers for later services** `[BD:STG-59]`
  - **Type**: task
  - **Do**: Add helper utilities for nutrient extraction, amount scaling, and ingredient search ranking so recipe services can compute `nutrition_per_serving` without duplicating SQL or nutrient parsing logic.
  - **Files**: `packages/usda/src/index.ts`, `packages/usda/src/search.ts`, `packages/usda/src/nutrition.ts`
  - **Verify**: Helper tests cover search ranking and nutrient math for representative ingredients
  - **Accept**: Recipe and pantry services have reusable USDA helpers ready for integration

- [ ] **Task 4: Refactor import flow for observability and recovery** `[BD:STG-60]`
  - **Type**: task
  - **Do**: Add clear progress logging, basic retry/recovery behavior, and docs for manual fallback import so future agents can recover from download URL changes or partial imports without ad hoc edits.
  - **Files**: `packages/usda/src/download.ts`, `docs/development-workflow.md` or `docs/` import notes
  - **Verify**: An interrupted import can be rerun without corrupting the table
  - **Accept**: The USDA pipeline is stable enough for repeated local and CI setup

- [ ] **Task 5: Verify counts, search quality, and query latency** `[BD:STG-61]`
  - **Type**: task
  - **Do**: Run the importer on a fresh database, confirm the row count is materially large, confirm search results for common ingredients are sensible, and capture basic timing for representative search queries.
  - **Files**: `packages/usda/`, `packages/db/`
  - **Verify**: `pnpm --filter @staged/usda import-fdc` plus manual `psql` or Drizzle query checks succeed
  - **Accept**: USDA data is ready for recipe search and nutrition work, not just imported blindly

- [ ] **Task 6: Update manifest** `[BD:STG-62]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-data-usda`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-data-usda`, progress = `10 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-data-usda" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and downstream recipe/auth work can proceed

---

## Discovered Tasks

_None yet._
