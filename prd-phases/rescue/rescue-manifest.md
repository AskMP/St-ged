---
task: "Rescue Staged -- Foundation-up rebuild"
branch: "stg-rescue"
test_command: "pnpm test"
completion_promise: "COMPLETE"
max_iterations: 120
---

# Staged Rescue Manifest

**Repository**: `staged`
**Initiated**: 2026-03-08
**Trigger**: RESCUE_PROTOCOL.md + CODE_REVIEW_2026-03-08.md

---

## Why This Manifest Exists

The main PRD manifest (`prd-phases/manifest.md`) shows 33/38 PRDs as "complete."
That status is inaccurate. A Lead Architect audit on 2026-03-08 found that the
Foundation layer was never actually built -- it was marked complete based on file
creation, not functional verification.

**The root problem**: `packages/db/src/schema/index.ts` is a placeholder comment.
No Drizzle table definitions exist. No migrations exist. Every PRD above Group 0
was built against a database schema that does not exist in code -- only in the
agent's imagination.

Do NOT read the original `prd-phases/manifest.md` completion statuses as truth.
Treat all code as "broken until proven functional" per RESCUE_PROTOCOL.md.

### Evidence

Full findings are in `CODE_REVIEW_2026-03-08.md` at the project root.
Summary: 11 `[block]` severity issues, 3 `[warn]`, 2 `[nit]`.

Key blockers:

- `SCHEMA-001/005`: All 15 Drizzle table definitions missing
- `SCHEMA-002`: No migration files (only `.gitkeep`)
- `SCHEMA-003`: `drizzle.config.ts` missing `dbCredentials` -- migrate command aborts
- `AUTH-001`: `getSessionUser` always returns null -- login permanently broken
- `AUTH-002`: signup throws `column "password" does not exist`
- `AUTH-003`: `authRouter` mounted twice on `/api/auth`
- `AUTH-004`: Three independent DB connection pools -- Supabase limit risk

---

## How This Rescue System Works

### Starting / Resuming

1. Read this manifest -- it is the jump-off point for every session.
   Run `/ralph prd-phases/rescue/rescue-manifest.md` and Ralph will automatically
   select the first `status: pending` PRD whose `requires` are all `status: complete`.
2. Before editing files, create or verify every embedded BD task in the target PRD
   using `bd create --id <embedded-id> ...`
3. Open the PRD file and execute its tasks sequentially
4. The final task in every PRD updates THIS manifest (marks the entry complete)
5. Return to step 1

### Mandatory Protocol

Every rescue PRD reads three documents before writing a line of code:

1. `RESCUE_PROTOCOL.md` -- mandate and CORRECTION_LOG requirement
2. `CODE_REVIEW_2026-03-08.md` -- the full audit with file:line findings
3. This manifest -- current rescue state

### Build-then-Verify Pattern

Same as the original manifest. Implement completely, then verify in one pass.
Do not interleave test writing with implementation.

### CORRECTION_LOG.md Requirement (from RESCUE_PROTOCOL.md)

Every rescue PRD has a final task that appends to `CORRECTION_LOG.md` in the
project root. Format:

| Feature/Component | Status Origin       | Action      | Rationale                      | Persona Alignment | Validation           |
| ----------------- | ------------------- | ----------- | ------------------------------ | ----------------- | -------------------- |
| Drizzle schema    | Missing/placeholder | Implemented | Foundation for all data layers | All personas      | pnpm migrate exits 0 |

Create `CORRECTION_LOG.md` if it does not exist (PRD rescue-00 creates it).

### Stop-on-Spin Guardrail

If three consecutive verify attempts fail on the same issue: stop, create a
Discovered Task in the PRD's Discovered Tasks section, add a guardrail note to
`.claude/ralph/guardrails.md`, and advance to the next PRD if possible.

---

## What to Preserve vs. Rebuild

### Preserve (working code worth keeping)

- Turborepo monorepo structure and all `package.json` configurations
- Hono API server setup (`apps/api/src/index.ts` routing skeleton)
- Socket.io setup (`apps/api/src/lib/socket.ts`)
- CORS, rate-limit middleware
- All service files (business logic) -- they use raw SQL now but will be migrated
  to Drizzle ORM in PRD rescue-03
- `packages/types/src/` -- shared types (will be aligned with schema in rescue-00)
- `apps/api/src/lib/env.ts` -- env validation
- PWA config, Vite config, Tailwind config (verified working)
- Playwright and Vitest test scaffolding

### Fix (known broken, surgical repair)

- `packages/db/src/schema/` -- write from scratch per PRD rescue-00 spec
- `packages/db/drizzle.config.ts` -- add `dbCredentials`
- `apps/api/src/services/auth-service.ts` -- `getSessionUser` fix (AUTH-001)
- `apps/api/src/routes/auth.ts` -- password column fix (AUTH-002), imports
- `apps/api/src/index.ts` -- remove duplicate route (AUTH-003)
- DB pool consolidation across auth.ts, auth-service.ts, index.ts (AUTH-004)

### Rebuild (UX ground-up)

- All React route components under `apps/web/src/routes/`
- Login, Signup, Onboarding flows
- Core app pages: Recipes, Planning, Pantry, Fulfillment, Household
- Design system application (Tailwind v4, Radix UI, persona-driven)
- PRD rescue-04 owns this entirely via `/ux-rebuild` skill

---

## Current State

| Field                | Value                      |
| -------------------- | -------------------------- |
| Last completed PRD   | rescue-04                  |
| Current rescue phase | COMPLETE                   |
| Progress             | 5 / 5 rescue PRDs complete |
| Foundation status    | GREEN                      |

---

## PRD Registry

### Phase R0: Schema (Critical Blocker)

- [x] **rescue-00** | `prd-phases/rescue/prd-rescue-00-schema.md` | Drizzle schema ground-up: all 15 tables, migration, config, seeds, type alignment | status: complete | requires: none |

### Phase R1: Auth Repair (Critical Blocker)

- [x] **rescue-01** | `prd-phases/rescue/prd-rescue-01-auth.md` | Fix all 11 [block] auth issues: pool consolidation, signup, getSessionUser, /me, routes | status: complete | requires: rescue-00 |

### Phase R2: Foundation Verification (Green Gate)

- [x] **rescue-02** | `prd-phases/rescue/prd-rescue-02-verify.md` | Green gate: register -> login -> /me -> household in real browser; type-check passes | status: complete | requires: rescue-01 |

### Phase R3: Service Layer Migration (Quality)

- [x] **rescue-03** | `prd-phases/rescue/prd-rescue-03-service-layer.md` | Migrate all raw-SQL services to Drizzle ORM type-safe queries | status: complete | requires: rescue-02 |

### Phase R4: UX Rebuild (Frontend)

- [x] **rescue-04** | `prd-phases/rescue/prd-rescue-04-ux-rebuild.md` | Ground-up persona-driven frontend rebuild via /ux-rebuild skill | status: complete | requires: rescue-02 |

> Note: rescue-03 and rescue-04 both require rescue-02 but are independent of each
> other. If running parallel agents, they may execute concurrently on separate branches.

---

## Totals

| Metric            | Count |
| ----------------- | ----- |
| Total rescue PRDs | 5     |
| Complete          | 5     |
| Pending           | 0     |
| Blocked           | 0     |
