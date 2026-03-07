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
| Last completed PRD | -- |
| Timestamp | -- |
| Current phase | 0 (Foundation) |
| Progress | 0 / 29 PRDs complete |

---

## How This System Works

This manifest coordinates a multi-PRD build. Each PRD is a self-contained unit of work that an agent can execute independently -- no prior context required.

### Starting / Resuming

1. Read this manifest
2. Find the first `status: pending` entry in the PRD Registry whose `requires` are all `status: complete`
3. Open that PRD file and execute its tasks sequentially
4. The final task in every PRD updates this manifest (marks the entry `status: complete`)
5. Return to step 2

### Reference Table

| Action | Command / Skill |
|--------|----------------|
| Execute next PRD | `/ralph prd-phases/manifest.md` |
| Execute specific PRD | `/ralph prd-phases/<group>/<file>.md` |
| Generate new PRD | `/prd-generate --manifest` |
| Check progress | Read this manifest's Current State + PRD Registry |
| Create tracked tasks | `bd create -t task -d "DESC" "TITLE"` |

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
- Each parallel agent gets its own branch: `stg-<prd_id>`
- Merge sequentially in registry order after completion
- If a merge conflict arises, the later PRD resolves it

---

## PRD Registry

### Group 0: Foundation

- [ ] **00a** | `prd-phases/00-foundation/prd-00a-task-management.md` | Task management setup (bd init + verification) | status: pending | requires: none |
- [ ] **00b** | `prd-phases/00-foundation/prd-00b-project-init.md` | Turborepo monorepo init, workspace config, dev servers | status: pending | requires: 00a |
- [ ] **00c** | `prd-phases/00-foundation/prd-00c-code-quality.md` | ESLint, Prettier, Husky, lint-staged, TypeScript strict | status: pending | requires: 00b |
- [ ] **00d** | `prd-phases/00-foundation/prd-00d-database.md` | PostgreSQL + Drizzle schema + migrations + Better Auth + USDA FDC dataset | status: pending | requires: 00b |
- [ ] **00e** | `prd-phases/00-foundation/prd-00e-api-foundation.md` | Hono server + Socket.io setup + route skeleton + env validation | status: pending | requires: 00d |
- [ ] **00f** | `prd-phases/00-foundation/prd-00f-styling.md` | Tailwind CSS v4 + Radix UI setup + frontend-design skill config | status: pending | requires: 00b |
- [ ] **00g** | `prd-phases/00-foundation/prd-00g-testing.md` | Vitest config + Playwright config + sample tests + coverage baseline | status: pending | requires: 00e |
- [ ] **00h** | `prd-phases/00-foundation/prd-00h-cicd-deploy.md` | GitHub Actions + Docker + Vercel config + Railway config | status: pending | requires: 00g |

### Group 1: MVP (Must Have)

- [ ] **01-data-schema** | `prd-phases/01-mvp-data/prd-01-data-schema.md` | Full Drizzle schema: users, households, recipes, lists, plans, pantry, sync queue | status: pending | requires: 00d |
- [ ] **01-data-usda** | `prd-phases/01-mvp-data/prd-01-data-usda.md` | USDA FDC dataset download + PostgreSQL import + ingredient FTS index | status: pending | requires: 01-data-schema |
- [ ] **01-api-auth** | `prd-phases/01-mvp-api/prd-01-api-auth.md` | Better Auth routes: sign up, sign in, magic link, OAuth, guest sessions, household invites | status: pending | requires: 01-data-schema |
- [ ] **01-api-recipes** | `prd-phases/01-mvp-api/prd-01-api-recipes.md` | Recipe CRUD, URL import (JSON-LD), search, nutrition pipeline (Haiku + USDA) | status: pending | requires: 01-data-usda, 01-api-auth |
- [ ] **01-api-households** | `prd-phases/01-mvp-api/prd-01-api-households.md` | Household create/join, member management, invite links, guest-add mode | status: pending | requires: 01-api-auth |
- [ ] **01-api-lists** | `prd-phases/01-mvp-api/prd-01-api-lists.md` | Grocery list CRUD + Socket.io real-time mutations + conflict resolution | status: pending | requires: 01-api-households |
- [ ] **01-api-plans** | `prd-phases/01-mvp-api/prd-01-api-plans.md` | Meal plan CRUD + recipe-to-list auto-generation + weekly calendar | status: pending | requires: 01-api-lists |
- [ ] **01-api-fulfillment** | `prd-phases/01-mvp-api/prd-01-api-fulfillment.md` | Instacart IDP deep-link construction + Smart Bundling + affiliate attribution | status: pending | requires: 01-api-plans |
- [ ] **01-ui-pwa** | `prd-phases/01-mvp-ui/prd-01-ui-pwa.md` | PWA shell: Vite config, Workbox SW, A2HS prompt, offline indicator, Dexie setup, sync queue | status: pending | requires: 00f, 00g |
- [ ] **01-ui-components** | `prd-phases/01-mvp-ui/prd-01-ui-components.md` | Design system components: RecipeCard, GroceryItem, HouseholdAvatar, FilterChip, NutritionBadge | status: pending | requires: 01-ui-pwa |
- [ ] **01-pages-onboarding** | `prd-phases/01-mvp-pages/prd-01-pages-onboarding.md` | Onboarding flow: skill level, household size, dietary profile, Starter Pantry, A2HS prompt | status: pending | requires: 01-ui-components, 01-api-auth |
- [ ] **01-pages-recipes** | `prd-phases/01-mvp-pages/prd-01-pages-recipes.md` | Recipe library, search/filter, recipe detail, step-by-step cooking view (Wake Lock), URL import | status: pending | requires: 01-pages-onboarding, 01-api-recipes |
- [ ] **01-pages-planning** | `prd-phases/01-mvp-pages/prd-01-pages-planning.md` | Weekly calendar, meal assignment, shared grocery list, real-time sync UI, offline-first | status: pending | requires: 01-pages-recipes, 01-api-plans |
- [ ] **01-pages-fulfillment** | `prd-phases/01-mvp-pages/prd-01-pages-fulfillment.md` | Deliver Me This flow, Instacart IDP deep-link, Smart Bundle upsell, attribution display | status: pending | requires: 01-pages-planning, 01-api-fulfillment |
- [ ] **01-verify** | `prd-phases/01-mvp-verify/prd-01-verify.md` | E2E persona flows: Maya (eco filter), Darius (plan->list->Instacart), Jordan (onboarding), offline smoke tests | status: pending | requires: 01-pages-fulfillment |

### Group 2: Launch (Should Have)

- [ ] **02-fridge-clearance** | `prd-phases/02-launch/prd-02-fridge-clearance.md` | AI Fridge-Clearance: pantry input, expiration tracking, Claude Haiku recipe matching (F11) | status: pending | requires: 01-verify |
- [ ] **02-cost-serving** | `prd-phases/02-launch/prd-02-cost-serving.md` | Cost-per-serving display, budget targets, pantry-aware costing (F12) | status: pending | requires: 01-verify |
- [ ] **02-potluck** | `prd-phases/02-launch/prd-02-potluck.md` | Potluck & Event Planner: event creation, slot claiming (no login), real-time locks (F13) | status: pending | requires: 01-verify |
- [ ] **02-batch-prep** | `prd-phases/02-launch/prd-02-batch-prep.md` | Batch Prep Mode: multi-recipe selection, cook sequencing, combined list, portioning view (F14) | status: pending | requires: 01-verify |
- [ ] **02-dietary-adaptation** | `prd-phases/02-launch/prd-02-dietary-adaptation.md` | Dietary Adaptation Mode: Make This Vegan/Dairy-Free, whole-recipe substitution (F15) | status: pending | requires: 01-verify |
- [ ] **02-coaching** | `prd-phases/02-launch/prd-02-coaching.md` | In-Step Contextual Coaching: technique glossary, ingredient explainers, inline tap-to-reveal (F16) | status: pending | requires: 01-verify |
- [ ] **02-household-ops** | `prd-phases/02-launch/prd-02-household-ops.md` | Grocery Cost Splitting + Cook Rotation Scheduling (F27, F28) | status: pending | requires: 01-verify |
- [ ] **02-fulfillment-v2** | `prd-phases/02-launch/prd-02-fulfillment-v2.md` | Instacart IDP full cart API (replace deep-link) + Kroger developer API + Chicory CPG integration | status: pending | requires: 01-verify |

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

---

## Totals

| Metric | Count |
|--------|-------|
| Total PRDs | 29 |
| Foundation (Group 0) | 8 |
| MVP (Group 1) | 15 |
| Launch (Group 2) | 8 |
| Traction (Group 3) | 5 (including 03-hardware) |
| Complete | 0 |
| Pending | 29 |
| Blocked | 0 |
