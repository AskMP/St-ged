---
task: "MVP data schema -- finalize Drizzle relations, constraints, and seed fixtures"
branch: "stg-01-data-schema/mvp-schema"
test_command: "pnpm --filter @staged/db migrate && pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "01-data-usda"
requires: ["00d"]
parallel_safe: false
group: 1
manifest_id: "01-data-schema"
---

# PRD: MVP Data Schema

## Context for Agent

### What This PRD Does

Finalizes the application-facing Drizzle schema so every MVP feature has the tables, relations, indexes, and constraints it actually needs. This PRD turns the foundation skeleton into a stable contract for auth, recipes, pantry, planning, grocery lists, and offline sync.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00d | Initial DB package, migration path, NextAuth (Auth.js) integration, USDA table scaffold | `packages/db/src/`, `apps/api/src/lib/auth.ts` |

### Key Files to Read First

- `docs/project-brief.md` -- canonical entities and relationships
- `packages/db/src/schema/` -- current schema files
- `packages/types/src/` -- shared types that must match the DB contract

### Patterns to Follow

- Keep Drizzle schema in `packages/db/src/schema/`; raw SQL belongs only in migrations
- Use explicit relations, unique constraints, and household scoping on shared entities
- Add test fixtures and seed helpers so later API/UI PRDs can run against realistic data

### Skills and Commands

| Action | Command |
|--------|---------|
| Generate migration | `pnpm --filter @staged/db generate` |
| Run migration | `pnpm --filter @staged/db migrate` |
| Run API tests | `pnpm --filter api test` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Start with a failing schema or migration check before changing table definitions
2. Keep schema and shared types in sync; do not let `packages/types` drift from DB reality
3. If a missing entity is discovered, add it here before downstream API/UI PRDs depend on guesses
4. If local DB tooling is unavailable, record the blocker in `bd` and continue with static validation only as a temporary fallback

---

## Tasks

- [x] **Task 1: Add failing schema verification checks** `[BD:STG-51]`
  - **Type**: task
  - **Do**: Create schema-level tests or verification scripts that fail until the final MVP relationships exist. Cover household membership, pantry uniqueness per household, saved recipe variants, grocery list item provenance, meal-plan entry uniqueness, and sync-queue status handling.
  - **Files**: `packages/db/tests/schema.test.ts`, `packages/db/tests/fixtures/`
  - **Verify**: `pnpm --filter @staged/db test` fails before schema changes are applied
  - **Accept**: The missing MVP constraints are explicit and failing before implementation work starts

- [x] **Task 2: Implement the full MVP relational schema** `[BD:STG-52]`
  - **Type**: feature
  - **Do**: Update `packages/db/src/schema/` to include the final MVP tables, enums, relations, composite keys, and indexes for users, households, household members, recipes, recipe ingredients, substitutions, pantry, pantry items, grocery lists, grocery list items, meal plans, meal plan entries, user recipe library, and sync queue. Add the migration generated from these changes.
  - **Files**: `packages/db/src/schema/*.ts`, `packages/db/src/schema/index.ts`, `packages/db/src/migrations/`
  - **Verify**: `pnpm --filter @staged/db generate` succeeds and creates a clean migration
  - **Accept**: All MVP entities in the project brief exist with enforceable relational rules

- [x] **Task 3: Add seed data and reset helpers** `[BD:STG-53]`
  - **Type**: task
  - **Do**: Create seed/reset helpers for a realistic household fixture set, including at least one multi-member household, one guest-access household, starter pantry entries, saved recipes, a meal plan, and a grocery list. Expose scripts that downstream PRDs and E2E tests can call deterministically.
  - **Files**: `packages/db/src/seeds/index.ts`, `packages/db/src/seeds/fixtures.ts`, `packages/db/package.json`
  - **Verify**: The seed script can populate a fresh local database without manual SQL edits
  - **Accept**: Later PRDs have stable fixture data for browser and API verification

- [x] **Task 4: Refactor shared types and query helpers around the final schema** `[BD:STG-54]`
  - **Type**: task
  - **Do**: Update `packages/types/src/` and any schema-adjacent helpers so the generated runtime shape and the shared TypeScript types line up with the new schema. Add lightweight query helpers only where they remove duplication for later route/service work.
  - **Files**: `packages/types/src/*.ts`, `packages/db/src/index.ts`, `packages/db/src/queries/`
  - **Verify**: `pnpm type-check` passes without duplicated or contradictory entity definitions
  - **Accept**: Shared types are sourced from the finalized schema contract rather than hand-waved placeholders

- [x] **Task 5: Verify migrations and fixtures against a fresh database** `[BD:STG-55]`
  - **Type**: task
  - **Do**: Run a fresh-db cycle: reset local DB, apply migrations, seed fixtures, and run the schema verification tests. Confirm the resulting dataset supports the onboarding, recipes, planning, pantry, and fulfillment flows expected by downstream PRDs.
  - **Files**: `packages/db/`, `.env.local` (if needed for local execution)
  - **Verify**: `pnpm --filter @staged/db migrate && pnpm --filter @staged/db test && pnpm --filter api test`
  - **Accept**: The MVP schema is migration-safe and ready for application-layer development

- [x] **Task 6: Update manifest** `[BD:STG-56]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-data-schema`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-data-schema`, progress = `9 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-data-schema" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and `01-data-usda` is unblocked

---

## Discovered Tasks

_None yet._
