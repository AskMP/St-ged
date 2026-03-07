---
task: "Build Stàged"
branch: "stg"
test_command: "pnpm test"
completion_promise: "COMPLETE"
max_iterations: 100
---

# Stàged -- PRD Manifest

**Repository**: `staged`

---

## Current State

| Field | Value |
|-------|-------|
| Last completed PRD | 01-verify-runtime |
| Timestamp | 2026-03-07 16:00:00 UTC |
| Current phase | 1 (MVP) |
| Progress | 25 / 38 PRDs complete |

---

## How This System Works

This manifest coordinates a multi-PRD build. Each PRD is a self-contained unit of work that an agent can execute independently -- no prior context required.

### Starting / Resuming

1. Read this manifest — **it is the jumping‑off point, not a checklist you manually pick from.**
   You can run `/ralph prd-phases/manifest.md` and the agent will automatically select
   the first eligible pending PRD for you; there is no need to manually scan or
   choose individual files.
2. (Implementation detail) Internally the agent finds the first `status: pending`
   entry in the PRD Registry whose `requires` are all `status: complete`.
3. Before editing files, create or verify every embedded BD task in that PRD using
   `bd create --id <embedded-id> ...` so task IDs match the PRD exactly
4. Open that PRD file and execute its tasks sequentially using a strict
   red/green/refactor loop
5. The final task in every PRD updates this manifest (marks the entry `status: complete`)
6. Return to step 2

### Execution Guardrails

Every PRD in this system is governed by the **Build-then-Verify** pattern. Do NOT interleave test writing with implementation -- complete the build phase fully before entering the verify phase.

#### Phase 1 -- Build

Implement the complete feature, module, or route set described in the PRD. Do not write or run tests during this phase. Do not pause to assess partial test coverage. Write real, working code against the full scope of the task.

#### Phase 2 -- Verify

After implementation is complete, write tests for the finished code. Tests should verify behavior that already exists, not guide implementation. Run the test suite once.

#### Phase 3 -- Triage

Fix any genuine failures found during verification. Failures mean "the implementation has a bug," not "the test was written before the code existed." If a test cannot pass because the feature was never built, the failure is a scope gap -- add a Discovered Task, do not iterate indefinitely.

#### Standing Rules (apply to all phases)

1. **Build before you test** -- never write a test for code that does not yet exist; finish the implementation first
2. **Single verify pass** -- run the test suite once after implementation, not after every function; excessive re-runs indicate the build phase is incomplete
3. **Real implementation tests required** -- mock-only tests are never sufficient; every feature must include at least one integration test that hits the real route, real component tree, real data layer, or real browser flow
4. **Browser validation required for UI work** -- any user-facing route or component PRD must be verified in an actual browser via Playwright or manual browser execution; route rendering and navigation wiring must be proven, not assumed
5. **Mobile/device validation when available** -- when `adb` and a connected device are available, run the relevant smoke flow on-device; if no device is connected or `adb` is unavailable, prompt the user to connect or expose the device tooling and continue with browser validation instead of blocking all work
6. **Offline/PWA checks are mandatory** -- any offline-first, sync, install, or caching work must be verified in offline mode, with reconnect behavior and installability explicitly tested
7. **Evidence must be captured** -- record commands, failures, fixes, browser/device validation notes, and follow-up gaps in `bd` notes as work proceeds
8. **Stop-on-spin guardrail** -- if three consecutive verify iterations still fail on the same issue, stop, add a Discovered Task or blocked note, and move on; do not spiral

### Reference Table

| Action | Command / Skill |
|--------|----------------|
| Execute next PRD | `/ralph prd-phases/manifest.md` |
| Execute specific PRD | `/ralph prd-phases/<group>/<file>.md` |
| Generate new PRD | `/prd-generate --manifest` |
| Check progress | Read this manifest's Current State + PRD Registry |
| Create tracked tasks | `bd create --id STG-123 -t task -d "DESC" "TITLE"` |

### Problem-Solving Protocol

When a task fails or a blocker is discovered:

1. **Try 3 times** with different approaches
2. **Add a guardrail** to `.claude/ralph/guardrails.md` documenting the failure
3. **If the blocker requires new work**: create a Discovered Tasks section in the current PRD with new atomic tasks inserted before the blocked task
4. **If the blocker requires a new PRD**: add a new entry to this manifest's PRD Registry with `status: pending` and appropriate `requires` dependencies, then create the PRD file following the standard template
5. **If unresolvable**: mark the current PRD `status: blocked` in the registry, note the reason, and move to the next eligible PRD

### Parallel Execution Rules

PRDs with `parallel_safe: true` and all `requires` satisfied may be executed concurrently by independent agents. Rules:

- Never run two PRDs that modify the same files simultaneously
- Each parallel agent gets its own branch using the active BD task ID plus a PRD slug, for example: `stg-STG-123/01-data-schema`
- Merge sequentially in registry order after completion
- If a merge conflict arises, the later PRD resolves it

---

## PRD Registry

> **Note:** the square‑bracket checkboxes here are derived from the `status:` field
> on each line. They are updated automatically by the final task of each PRD when
> it runs the “Update manifest” chore.  You should **never edit them manually** –
> change the `status:` value instead, and run `sed -i '' '/status: pending/ s/\- \[ \]/- [ ]/' prd-phases/manifest.md` or
> `bd` helper to resync.  Only PRD‑level entries are tracked; individual sub‑tasks
> remain inside their respective PRD files.


### Group 0: Foundation

- [x] **00a** | `prd-phases/00-foundation/prd-00a-task-management.md` | Task management setup (bd init + verification) | status: complete | requires: none |
- [x] **00b** | `prd-phases/00-foundation/prd-00b-project-init.md` | Turborepo monorepo init, workspace config, dev servers | status: complete | requires: 00a |
- [x] **00c** | `prd-phases/00-foundation/prd-00c-code-quality.md` | ESLint, Prettier, Husky, lint-staged, TypeScript strict | status: complete | requires: 00b |
- [x] **00d** | `prd-phases/00-foundation/prd-00d-database.md` | PostgreSQL + Drizzle schema + migrations + NextAuth (Auth.js) + USDA FDC dataset | status: complete | requires: 00b |
- [x] **00e** | `prd-phases/00-foundation/prd-00e-api-foundation.md` | Hono server + Socket.io setup + route skeleton + env validation | status: complete | requires: 00d |
- [x] **00f** | `prd-phases/00-foundation/prd-00f-styling.md` | Tailwind CSS v4 + Radix UI setup + frontend-design skill config | status: complete | requires: 00b |
- [x] **00g** | `prd-phases/00-foundation/prd-00g-testing.md` | Vitest config + Playwright config + browser/offline/device verification baseline | status: complete | requires: 00e, 00f |
- [x] **00h** | `prd-phases/00-foundation/prd-00h-cicd-deploy.md` | GitHub Actions + Docker + Vercel config + Railway config | status: complete | requires: 00c, 00g |

### Group 1: MVP (Must Have)

- [x] **01-data-schema** | `prd-phases/01-mvp-data/prd-01-data-schema.md` | Full Drizzle schema: users, households, recipes, lists, plans, pantry, sync queue | status: complete | requires: 00d |
- [x] **01-data-usda** | `prd-phases/01-mvp-data/prd-01-data-usda.md` | USDA FDC dataset download + PostgreSQL import + ingredient FTS index | status: complete | requires: 01-data-schema |
- [x] **01-api-auth** | `prd-phases/01-mvp-api/prd-01-api-auth.md` | NextAuth (Auth.js) routes: sign up, sign in, OAuth, JWT sessions, guest sessions, household invites | status: complete | requires: 01-data-schema |
- [x] **01-api-recipes** | `prd-phases/01-mvp-api/prd-01-api-recipes.md` | Recipe CRUD, URL import (JSON-LD), search, nutrition pipeline (Haiku + USDA) | status: complete | requires: 01-data-usda, 01-api-auth |
- [x] **01-api-households** | `prd-phases/01-mvp-api/prd-01-api-households.md` | Household create/join, member management, invite links, guest-add mode | status: complete | requires: 01-api-auth |
- [x] **01-api-pantry** | `prd-phases/01-mvp-api/prd-01-api-pantry.md` | Pantry CRUD, starter pantry templates, household pantry sync contract | status: complete | requires: 01-api-households |
- [x] **01-api-lists** | `prd-phases/01-mvp-api/prd-01-api-lists.md` | Grocery list CRUD + Socket.io real-time mutations + conflict resolution | status: complete | requires: 01-api-households |
- [x] **01-api-plans** | `prd-phases/01-mvp-api/prd-01-api-plans.md` | Meal plan CRUD + recipe-to-list auto-generation + weekly calendar | status: complete | requires: 01-api-lists |
- [x] **01-api-fulfillment** | `prd-phases/01-mvp-api/prd-01-api-fulfillment.md` | Instacart IDP deep-link construction + Smart Bundling + affiliate attribution | status: complete | requires: 01-api-plans |
- [x] **01-ui-pwa** | `prd-phases/01-mvp-ui/prd-01-ui-pwa.md` | PWA shell: Vite config, Workbox SW, A2HS prompt, offline indicator, Dexie setup, sync queue | status: complete | requires: 00f, 00g |
- [x] **01-ui-components** | `prd-phases/01-mvp-ui/prd-01-ui-components.md` | Design system components: RecipeCard, GroceryItem, HouseholdAvatar, FilterChip, NutritionBadge | status: complete | requires: 01-ui-pwa |
- [x] **01-pages-onboarding** | `prd-phases/01-mvp-pages/prd-01-pages-onboarding.md` | Onboarding flow: skill level, household size, dietary profile, Starter Pantry, A2HS prompt | status: complete | requires: 01-ui-components, 01-api-auth, 01-api-pantry |
- [x] **01-pages-recipes** | `prd-phases/01-mvp-pages/prd-01-pages-recipes.md` | Recipe library, search/filter, recipe detail, step-by-step cooking view (Wake Lock), URL import | status: complete | requires: 01-pages-onboarding, 01-api-recipes |
- [x] **01-pages-planning** | `prd-phases/01-mvp-pages/prd-01-pages-planning.md` | Weekly calendar, meal assignment, shared grocery list, real-time sync UI, offline-first | status: complete | requires: 01-pages-recipes, 01-api-plans |
- [x] **01-pages-fulfillment** | `prd-phases/01-mvp-pages/prd-01-pages-fulfillment.md` | Deliver Me This flow, Instacart IDP deep-link, Smart Bundle upsell, attribution display | status: complete | requires: 01-pages-planning, 01-api-fulfillment |
- [x] **01-verify** | `prd-phases/01-mvp-verify/prd-01-verify.md` | E2E persona flows: Maya (eco filter), Darius (plan->list->Instacart), Jordan (onboarding), offline smoke tests | status: complete | requires: 01-pages-fulfillment |
- [x] **01-verify-runtime** | `prd-phases/01-mvp-verify/prd-01-verify-runtime.md` | Production-like browser/runtime/device validation: installability, offline recovery, performance, ADB smoke checks | status: complete | requires: 01-verify |

### Group 2: Launch (Should Have)

- [x] **02-fridge-clearance** | `prd-phases/02-launch/prd-02-fridge-clearance.md` | AI Fridge-Clearance: pantry input, expiration tracking, Claude Haiku recipe matching (F11) | status: complete | requires: 01-verify-runtime |

Current State: Last completed PRD = 02-potluck, progress = 28 / 38 PRDs complete
- [x] **02-cost-serving** | `prd-phases/02-launch/prd-02-cost-serving.md` | Cost-per-serving display, budget targets, pantry-aware costing (F12) | status: complete | requires: 01-verify-runtime |
- [x] **02-potluck** | `prd-phases/02-launch/prd-02-potluck.md` | Potluck & Event Planner: event creation, slot claiming (no login), real-time locks (F13) | status: complete | requires: 01-verify-runtime |
- [ ] **02-batch-prep** | `prd-phases/02-launch/prd-02-batch-prep.md` | Batch Prep Mode: multi-recipe selection, cook sequencing, combined list, portioning view (F14) | status: pending | requires: 01-verify-runtime |
- [ ] **02-dietary-adaptation** | `prd-phases/02-launch/prd-02-dietary-adaptation.md` | Dietary Adaptation Mode: Make This Vegan/Dairy-Free, whole-recipe substitution (F15) | status: pending | requires: 01-verify-runtime |
- [ ] **02-coaching** | `prd-phases/02-launch/prd-02-coaching.md` | In-Step Contextual Coaching: technique glossary, ingredient explainers, inline tap-to-reveal (F16) | status: pending | requires: 01-verify-runtime |
- [ ] **02-household-ops** | `prd-phases/02-launch/prd-02-household-ops.md` | Grocery Cost Splitting + Cook Rotation Scheduling (F27, F28) | status: pending | requires: 01-verify-runtime |
- [ ] **02-fulfillment-v2** | `prd-phases/02-launch/prd-02-fulfillment-v2.md` | Instacart IDP full cart API (replace deep-link) + Kroger developer API + Chicory CPG integration | status: pending | requires: 01-verify-runtime |

### Group 3: Traction (Could Have)

- [ ] **03-events** | `prd-phases/03-traction/prd-03-events.md` | Virtual Stàge Events: LiveKit WebRTC, booking ($25-45/$75-150), B2B path, recording (F18) | status: pending | requires: 02-fulfillment-v2 |
- [ ] **03-advanced-planning** | `prd-phases/03-traction/prd-03-advanced-planning.md` | Month-view planning + Parallel Prep (Two-Cook Mode) + Recipe Voting Queue (F19, F20, F21) | status: pending | requires: 02-fulfillment-v2 |
- [ ] **03-intelligence** | `prd-phases/03-traction/prd-03-intelligence.md` | Macro Target Tracking + Bulk Utilization Tracking (F22, F23) | status: pending | requires: 02-fulfillment-v2 |
- [ ] **03-discovery** | `prd-phases/03-traction/prd-03-discovery.md` | Technique-Based Recipe Search + Age-Appropriate Step Tagging (F24, F25) | status: pending | requires: 02-fulfillment-v2 |
- [ ] **03-hardware** | `prd-phases/03-traction/prd-03-hardware.md` | Smart Kitchen Sensor Hooks: webhook/API for RP2040/ESP32 load-cell sensors (F26) | status: pending | requires: 03-intelligence |

---

## PRD File Contract

Every PRD file in this system MUST include:

1. **YAML frontmatter** with: `task`, `branch`, `test_command`, `completion_promise`, `max_iterations`, `chain_next`, `requires`, `parallel_safe`, `group`, `manifest_id`
2. **Context for Agent** section: what this PRD does, what was built before, key files to read, patterns to follow, skills/commands reference
3. **Tasks** section: atomic tasks with BD IDs, Type/Do/Files/Verify/Accept fields
4. **Final task**: "Update manifest" -- marks this PRD complete in the manifest registry
5. **Discovered Tasks** section (initially empty): for work discovered during execution
6. **Runtime verification requirement**: any UI-facing PRD must include an actual browser validation task; mobile/device validation is required when tooling and hardware are available
7. **Build-then-Verify requirement**: task ordering must complete all implementation work before tests are written or run; do not interleave test writing with feature building
8. **Branch naming note**: the `branch` field is the PRD slug; actual execution branches should still follow the active BD task ID convention from `AGENTS.md`

---

## Totals

| Metric | Count |
|--------|-------|
| Total PRDs | 38 |
| Foundation (Group 0) | 8 |
| MVP (Group 1) | 17 |
| Launch (Group 2) | 8 |
| Traction (Group 3) | 5 (including 03-hardware) |
| Complete | 4 |
| Pending | 38 |
| Blocked | 0 |
