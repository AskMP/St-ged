# Project Brief — Stàged

**Generated:** 2026-03-06
**Agent:** product-owner
**Phase:** 4 — Architecture & Technical Requirements
**Status:** Draft (awaiting approval)
**Input artifacts:** vision.md (temper-hardened) + 14 personas + features.md (temper-hardened) + temper synthesis (56 research responses, 8 platforms)

---

## 1. Product Summary

**Stàged** (pronounced: *stahj-d*) is a free, offline-first Progressive Web App that replaces meal kit subscriptions with household meal coordination. Users discover and save recipes, plan weekly meals with their household, and convert ingredient lists to grocery deliveries in one tap via Instacart IDP.

**North Star Metric:** Weekly Active Households — households with ≥2 members interacting with a shared list or plan in a 7-day window.

**Monetization:** Instacart IDP affiliate commissions (5% of cart, ~$5.70/order) → Phase 2 CPG placements via Chicory → Phase 3 Stàge event tickets ($25–$45 consumer / $75–$150 corporate).

**Target users (14 personas, 6 household archetypes):**
1. Eco-anxious planners (Maya) — driven by digital pre-portioning, zero-waste mode
2. Household conductors (Darius) — driven by shared lists, weekly planning, one-tap fulfillment
3. Dinner party architects (Priya) — driven by recipe scaling, potluck coordination
4. Fridge foragers (Sam) — driven by AI fridge-clearance, expiration surfacing
5. Budget-conscious families (Marco, Linda) — driven by cost-per-serving, bulk utilization
6. Shared households / Greek houses (Marcus & The House) — driven by cost-splitting, cook rotation

**Temper-hardened claims in use:**
- Eco claim: "digital pre-portioning eliminates packaging while preserving food-waste-reduction benefit" (not "we're greener than meal kits" — U Michigan LCA 2019 shows meal kits have lower CO2 overall)
- Fulfillment: Instacart IDP only at MVP (5% flat; Amazon Fresh removed — no public API)
- Nutrition: USDA FoodData Central self-hosted + LLM-as-parser + Edamam for user-submitted only
- iOS sync: foreground-flush queue (Background Sync API not supported on iOS)
- A2HS is a functional requirement, not UX polish (7-day cache eviction for non-installed iOS)
- Event pricing: $25–$45 consumer / $75–$150 corporate ($5–$15 is below instructor cost floor)

---

## 2. Technical Requirements

### 2.1 Scale Requirements (Derived from Persona Analysis)

| Dimension | Requirement | Source |
|-----------|-------------|--------|
| Household size | 2–10 concurrent users per household | Marcus/The House (6–10 members), Darius (family of 4) |
| Recipe library at launch | 500–2,000 licensed seed recipes + unlimited user imports | F01 content plan |
| Recipe library target (Phase 2) | 10,000+ recipes | Growth milestone |
| Concurrent list editors | 2–10 per household (real-time WebSocket) | Darius, Marcus/The House flows |
| Grocery list size | 20–100 items per list | Linda (bulk family shopping) |
| Offline recipe cache per user | ~10,000 recipes target = ~50MB | F02, USDA FDC dataset |
| USDA FDC dataset | ~700K ingredient entries (self-hosted, indexed) | F07 nutrition architecture |
| Session count | Sunday batch-plan sessions (Nadia: 5 recipes × 8 ingredients = 40 items generated in one session) | F14 batch prep |
| MVP user target | 1,000–5,000 MAU (break-even on USDA self-hosting; Instacart IDP approval threshold) | Business model |
| Phase 2 scale target | 10,000+ MAU (Chicory CPG placement minimum for brand spend) | Monetization |

### 2.2 Real-Time Requirements (Derived from Features)

| Feature | Real-Time Need | Implementation |
|---------|---------------|----------------|
| F03 Shared Grocery Lists | Sub-second sync across household members | WebSocket (Socket.io) — handles polling fallback automatically |
| F04 Meal Scheduling | Collaborative calendar edits visible immediately | WebSocket + optimistic UI |
| F13 Potluck Slot Claims | Slot locks the moment a guest claims (prevent double-booking) | WebSocket pub/sub; lock write is server-authoritative |
| F11 AI Fridge-Clearance | Recipe match returns in <3s | LLM call (Claude Haiku) + recipe index query; asynchronous with skeleton UI |
| F07 Nutrition compute | Nutrition data available on first recipe view | Computed at recipe-save time; cached in IndexedDB; never re-called on view |
| F02 Offline sync | Mutations queued offline → flush when online | IndexedDB queue → flush on `online` + `visibilitychange` events |

**WebSocket Architecture:**
- Server maintains one Socket.io room per household
- Mutations: `list:item:add`, `list:item:check`, `list:item:delete`, `plan:recipe:assign`, `plan:recipe:remove`
- All mutations are server-authoritative (client sends intent → server validates → broadcasts to room)
- Conflict resolution: last-write-wins with server timestamp; conflict badge shown if simultaneous offline edits reconcile differently
- Polling fallback: HTTP long-poll at 5s interval when WebSocket unavailable

### 2.3 Data Model (Derived from Feature Scope)

**Core entities and relationships:**

```
User
  ├── id, email, display_name, auth_provider
  ├── skill_level: enum(beginner|intermediate|advanced)
  ├── household_id (FK → Household)
  └── dietary_profile: { vegetarian, vegan, gluten_free, dairy_free, nut_free, pescatarian }

Household
  ├── id, name, invite_code (short, regeneratable)
  ├── created_by (FK → User)
  └── members → HouseholdMember[]

HouseholdMember
  ├── household_id, user_id
  └── role: enum(owner|member|guest)   -- guests can add to list via link, no account

Recipe
  ├── id, title, description, source_url
  ├── servings_base (integer)
  ├── cook_time_minutes, prep_time_minutes
  ├── skill_level: enum(beginner|intermediate|advanced)
  ├── dietary_tags: string[]           -- vegetarian, vegan, gluten-free, etc.
  ├── zero_waste_score: float(0-1)     -- computed from ingredient bulk-availability tags
  ├── nutrition_per_serving: jsonb     -- cached at save time; { calories, protein_g, carbs_g, fat_g }
  ├── nutrition_source: enum(usda|edamam|llm_estimate)
  ├── technique_tags: string[]          -- sauté, braise, emulsify (Phase 3: F24)
  ├── is_licensed: boolean
  ├── import_source: enum(user|licensed_api|open_recipes)
  └── ingredients → RecipeIngredient[]

RecipeIngredient
  ├── recipe_id, sort_order
  ├── name (raw text, e.g. "2 cups all-purpose flour")
  ├── quantity_value, quantity_unit
  ├── usda_fdc_id (nullable; resolved by LLM-as-parser at save time)
  ├── is_bulk_available: boolean        -- Zero-Waste Mode data
  └── substitutions → Substitution[]

Substitution
  ├── ingredient_id, category: enum(dairy_free|gluten_free|vegan|nut_free|unavailable)
  ├── replacement_name, replacement_quantity_modifier (float)
  └── note (why it works / flavor impact)

UserRecipeLibrary
  ├── user_id, recipe_id
  ├── saved_at, personal_notes
  └── variant_of (FK → Recipe, nullable — for dietary adaptations)

GroceryList
  ├── id, household_id, name
  ├── created_at, last_modified_at
  └── items → GroceryListItem[]

GroceryListItem
  ├── list_id, ingredient_name
  ├── quantity_value, quantity_unit
  ├── is_checked: boolean, checked_by (FK → User, nullable)
  ├── checked_at, source_recipe_id (FK → Recipe, nullable)
  └── sort_order

MealPlan
  ├── id, household_id
  ├── week_start: date
  └── entries → MealPlanEntry[]

MealPlanEntry
  ├── plan_id, date: date
  ├── recipe_id (FK → Recipe)
  └── servings_override (nullable; if different from recipe base)

Pantry
  ├── id, household_id
  └── items → PantryItem[]

PantryItem
  ├── pantry_id, ingredient_name
  ├── quantity_value, quantity_unit
  ├── expiry_date (nullable)
  └── usda_fdc_id (nullable)

SyncQueue                               -- offline mutation queue (IndexedDB client; mirrored server-side for recovery)
  ├── id (client-generated UUID)
  ├── household_id, user_id
  ├── mutation_type: string             -- 'list:item:add', 'plan:recipe:assign', etc.
  ├── payload: jsonb
  ├── created_at, synced_at (nullable)
  └── status: enum(pending|synced|conflict)

-- Phase 2 additions --
Event                                   -- Potluck/Event Planner (F13)
  ├── id, host_user_id, name, date
  ├── guest_count, dietary_summary
  └── slots → EventSlot[]

EventSlot
  ├── event_id, category: enum(appetizer|main|side|dessert|drinks|custom)
  ├── claimed_by_name (no account required)
  ├── claimed_by_email (optional)
  └── dietary_restrictions: string[]
```

### 2.4 Integration Requirements

| Integration | Type | When | Auth / Notes |
|-------------|------|------|--------------|
| Instacart IDP | Affiliate deep-link (MVP) → full cart API (Phase 2) | MVP | Register at docs.instacart.com; affiliate enrollment via Impact.com; 5% commission, 7-day attribution window. Deep-link requires no server-side auth. |
| Kroger Developer API | Grocery fulfillment (Phase 2) | Phase 2 | developer.kroger.com; public API; OAuth 2.0 |
| USDA FoodData Central | Self-hosted dataset (CC0) | MVP | Download full dataset; host in PostgreSQL with full-text search; no API calls; no rate limits; no cost |
| Claude Haiku (Anthropic API) | LLM-as-parser: ingredient text → USDA FDC ID | MVP | Low-cost; called once at recipe-save time; result cached. Also used for F11 Fridge-Clearance recipe matching |
| Edamam Nutrition Analysis API | User-submitted recipe analysis (not for licensed recipes or USDA-matched ingredients) | MVP | Pay per new recipe analyzed (not per view); cache result in `nutrition_per_serving`; verify deletion clause in ToS |
| Open Food Facts | Packaged ingredient enrichment | MVP | Free, open license; REST API; supplement for branded items |
| Open Recipes (openrecip.es) | Seed recipe library (CC BY 3.0 license) | MVP | Download dataset; normalize into Recipe schema at ingest |
| Chicory (B2B CPG placement) | Featured ingredient ad placements | Phase 2 (10K+ MAU required) | B2B publisher API; initiate partnership application at 10K MAU |
| LiveKit (WebRTC SFU) | Live video for Stàge Events | Phase 3 | Managed WebRTC; Safari/iOS compatible; avoids custom streaming infrastructure |
| Impact.com | Affiliate tracking for Instacart IDP commissions | MVP | Required by Instacart IDP program; integration with affiliate link generation |

**Legal prerequisite (must complete before recipe import goes live):**
- Register DMCA designated agent at copyright.gov/dmca-agent/ (~$6/year)
- Add DMCA notice-and-takedown policy to Terms of Service
- Recipe import must fetch schema.org/Recipe JSON-LD only — not full-article HTML

### 2.5 Performance Requirements (Derived from Persona Contexts)

| Metric | Target | Rationale |
|--------|--------|-----------|
| FCP (from cache) | <1s | Grocery aisle context; users can't wait |
| FCP (from network, 3G) | <3s | Lighthouse target; grocery store signal conditions |
| Recipe → Instacart cart submission | <90s total flow | Vision guardrail |
| Offline recipe access success rate | >99% for installed (A2HS) PWA | Vision guardrail |
| App shell cache | Cache-First | Static assets always available |
| Recipe data | Stale-While-Revalidate | Fresh when online; cached when not |
| Live grocery lists | Network-First | Real-time accuracy required |
| WebSocket message latency | <100ms (p95) | Shared list editing feels real-time |
| Nutrition compute latency | 0ms on recipe view | Pre-computed at save; served from IndexedDB cache |
| LLM parser call (Haiku) | <2s | Called once at recipe-save only; not blocking UI |

---

## 3. Scaffold Hints (Tech Stack Recommendations)

### 3.1 Frontend — React PWA

**Recommendation:** React 19 + Vite + vite-plugin-pwa

**Rationale:**
- Largest ecosystem for long-term hiring; most component libraries
- vite-plugin-pwa provides first-class Workbox integration (specified in F02)
- React 19 server components not needed here; Vite is simpler than Next.js for offline-first
- Avoid Next.js: App Router complexity adds little value for a client-heavy, offline-first PWA
- Workbox 7+ for service worker management (specified in F02)
- Dexie.js for IndexedDB ORM (specified in F02); React hooks wrapper: `dexie-react-hooks`
- State management: Zustand (lightweight; pairs well with Dexie; avoids Redux complexity)
- Routing: React Router v7 (stable; works with Vite; SSR not needed)
- UI: Tailwind CSS v4 + Radix UI primitives (accessible, unstyled, composable)
- Real-time client: Socket.io client (matches server; handles polling fallback)
- Icon set: Lucide React
- Design language: "Chef-Noir" — black, white, stainless steel; high-contrast for kitchen environments

### 3.2 Backend — Node.js API Server

**Recommendation:** Node.js 22 LTS + Hono (HTTP server) + Socket.io (WebSocket)

**Rationale:**
- Hono: TypeScript-native, fast, edge-deployable, lightweight — better than Express/Fastify for this scale
- Socket.io: handles WebSocket + polling fallback automatically; rooms-per-household maps cleanly
- TypeScript throughout: shared types between frontend and backend via a `packages/types` workspace package
- Keep API surface minimal: REST for CRUD, WebSocket for real-time mutations only

**API structure:**
```
/api/auth/*          -- authentication (session management)
/api/recipes/*       -- recipe CRUD, search, import
/api/households/*    -- household management, invites
/api/lists/*         -- grocery list CRUD
/api/plans/*         -- meal plans
/api/pantry/*        -- pantry management
/api/nutrition/*     -- USDA lookup (internal only; not exposed externally)
/api/fulfillment/*   -- Instacart deep-link construction + affiliate link wrapping
ws://               -- Socket.io for real-time list/plan sync
```

### 3.3 Database — PostgreSQL + Drizzle ORM

**Recommendation:** PostgreSQL 16 + Drizzle ORM

**Rationale:**
- PostgreSQL: relational model fits the household → list → item hierarchy; JSONB for flexible payloads (nutrition cache, dietary profiles, sync queue mutations)
- Full-text search: PostgreSQL `tsvector` for recipe search (ingredient, title, cuisine) — no need for Elasticsearch at MVP scale
- USDA FDC dataset: ~700K rows in a `usda_ingredients` table; FTS index on `description` + `food_category`; query on recipe-save only
- Drizzle: TypeScript-first, no code generation step, fast, pairs well with Hono
- Avoid Prisma: heavier runtime, more magic, slower iteration for a data-dense schema like this

**Database hosting:** Supabase (managed PostgreSQL; row-level security built-in; realtime via their own channel — ignore that, use our Socket.io; free tier adequate for MVP; straightforward scaling path)

### 3.4 Authentication

**Recommendation:** Better Auth (self-hosted)

**Rationale:**
- Supports email/password + magic link + OAuth (Google, Apple) — covers all personas
- No per-MAU pricing (unlike Clerk)
- Guest/anonymous sessions: needed for F03 guest-add mode (no account required for shared list access)
- TypeScript-native, integrates cleanly with Hono
- Household invites work via short-lived JWT claim (invite_code → household_id); guest joins → upgrades to full account optionally

### 3.5 Monorepo Structure

**Recommendation:** pnpm workspaces + Turborepo

```
staged/
  apps/
    web/              -- React PWA (Vite)
    api/              -- Hono + Socket.io API server
  packages/
    types/            -- Shared TypeScript types (Recipe, Household, GroceryList, etc.)
    db/               -- Drizzle schema + migrations
    usda/             -- USDA FDC dataset loader + ingredient parser utilities
  docs/               -- Migrated from .claude/forge/staged/docs/ (vision, personas, features, brief)
  prd-phases/         -- PRD manifest + phase subdirectories
```

**Why monorepo:** Shared types package eliminates type drift between frontend and backend. The `packages/usda` package encapsulates the large USDA dataset concerns (download script, normalization, FTS indexing) separately from the API.

### 3.6 Deployment

**Recommendation:**
- **Web app:** Vercel (excellent Vite PWA support, HTTPS by default, CDN-native, Service Worker edge caching)
- **API + WebSocket:** Railway (managed Node.js with persistent WebSocket support, built-in PostgreSQL add-on, environment variable management)
- **Alternative:** Fly.io for API if Railway WebSocket handling proves limiting

**Why Vercel + Railway split:**
- Vercel's CDN is optimal for the PWA app shell (Cache-First serving from edge)
- Railway handles stateful WebSocket connections cleanly without Vercel's 25s timeout constraint
- Both are developer-friendly for small team iteration speed

### 3.7 Nutrition Pipeline Architecture

```
Recipe imported or saved
  → Extract ingredient list (raw text strings)
  → Call Claude Haiku with prompt: "Map each ingredient to USDA FDC ID and standardized quantity"
  → Haiku returns: [{ raw: "2 cups flour", fdc_id: 168936, qty_grams: 240 }]
  → Query local PostgreSQL (usda_ingredients table) by fdc_id
  → Compute: calories = fdc.energy_kcal * qty_grams / 100; protein = fdc.protein_g * qty_grams / 100; etc.
  → Sum across all ingredients → divide by servings_base
  → Store in recipe.nutrition_per_serving as JSONB
  → Source flagged: 'usda' if all ingredients resolved; 'edamam' if sent to Edamam; 'llm_estimate' if fallback
  → On recipe view: serve from recipe.nutrition_per_serving (IndexedDB cache on client)
  → Never re-call Haiku or USDA on recipe view — nutrition is always pre-computed
```

**Edamam path** (user-submitted recipes where USDA resolution confidence is low):
- Call Edamam Nutrition Analysis API with full ingredient list
- Cache result in recipe.nutrition_per_serving
- Note: verify Edamam ToS deletion clause — if contract lapses, stored data must be deleted. USDA path removes this dependency for all licensed recipes.

### 3.8 PWA Offline Sync Architecture

```
User action (e.g., check grocery item while offline):
  → Optimistic UI update immediately (Zustand state)
  → Write mutation to Dexie.js SyncQueue table: { id: uuid(), type: 'list:item:check', payload: {...}, created_at }
  → Visual indicator: "Changes saved locally"

Device comes online OR app foregrounded (visibilitychange):
  → Read all unsynced mutations from SyncQueue (status: 'pending')
  → POST /api/sync/flush with array of mutations
  → Server processes in order: validates, applies, broadcasts via Socket.io to household room
  → Mutations marked synced_at in SyncQueue
  → WebSocket resumes for real-time updates

Conflict resolution:
  → Server is authoritative; last-write-wins by server_timestamp
  → If conflict detected (same item modified by two offline users), show conflict badge
  → User resolves manually (show both values, pick one)
```

---

## 4. Feature → Persona Coherence Validation

Every Must Have feature traces to at least one primary persona pain point and JTBD. No orphaned features.

| Feature | Primary Persona | Persona Pain Addressed | JTBD |
|---------|----------------|----------------------|------|
| F01 Recipe Engine | Maya, Jordan, Felix | Scattered saves (847 screenshots); paywalled recipes | Unified library replaces fragmented saves |
| F02 Offline PWA | All 14 | App fails in grocery store (no signal) | Recipe access anywhere |
| F03 Shared Lists | Darius, Alex & Riley | Two separate lists; duplicate purchases | Household real-time coordination |
| F04 Meal Scheduling | Darius, Nadia, Claire | 5pm "what are we eating" panic; 55min pre-cook planning | Pre-planned week eliminates daily decisions |
| F05 Deliver Me This | Darius, Priya, Nadia | Manual cart re-entry every week | Recipe → grocery order in one tap |
| F06 Smart Substitutions | Maya, Brett, Claire | Partner dietary restrictions break shared meals | Adapt any recipe without losing the household |
| F07 Nutritional Intelligence | Nadia, Maya, Felix | Macro tracking requires a separate app | Informed planning without switching contexts |
| F08 Zero-Waste Mode | Maya | Guilt about unsustainable grocery behavior | Digital pre-portioning aligned with eco values |
| F09 Recipe Scaling | Priya, Felix, Linda | Manual scaling math errors for dinner parties | Accurate quantities for any group size |
| F10 Dietary Filtering | Rowan, Brett, Claire, Jordan | Search results include unusable recipes | Every result is immediately cookable |
| F17 Pantry Onboarding | Jordan | Fails first recipe attempt (missing staples) | Build functional pantry from zero |

**Pain → Feature map (every customer pain has a feature):**

| Pain (from vision) | Feature(s) |
|--------------------|------------|
| Meal kit cost ($10.99–$12.49/serving) | F08 + F12 (Phase 2) — digital pre-portioning + cost display |
| Recipes scattered across saves/paywalls | F01 — unified library |
| Grocery lists rebuilt from scratch weekly | F04 + F05 — schedule → auto-list → one-tap order |
| Household coordination requires multiple threads | F03 + F04 — shared real-time list + schedule |
| No bridge from "I want to cook this" to "groceries delivered" | F05 — Deliver Me This |
| Meal kit physical packaging | F08 — Zero-Waste Mode (digital pre-portioning framing) |
| Smart kitchen has no consumer app layer | F26 (Phase 3) — sensor hooks; F07 bridges in MVP |

---

## 5. MVP Scope (Phase 1 — Final)

**11 features, ~12–16 week build:**

| Code | Feature | Primary Personas |
|------|---------|----------------|
| F01 | Open Pantry Recipe Engine (JSON-LD import, search, offline, Screen Wake Lock) | Maya, Jordan, Felix |
| F02 | Offline-First PWA (Workbox, Dexie.js, foreground-flush sync, A2HS required) | All |
| F03 | The Pass: Shared Grocery Lists (WebSocket, guest-add, dedup) | Darius, Alex & Riley |
| F04 | Meal Scheduling (weekly calendar, recipe assignment, auto-list generation) | Darius, Nadia, Claire |
| F05 | Deliver Me This (Instacart IDP deep-link, 5% affiliate, Smart Bundling) | Darius, Priya, Nadia |
| F06 | Smart Substitutions (per-ingredient, dietary categories, quantity preservation) | Maya, Brett, Claire, Rowan |
| F07 | Nutritional Intelligence (USDA self-hosted + LLM-as-parser + Edamam fallback) | Nadia, Maya, Felix |
| F08 | Zero-Waste Mode (zero-waste score, bulk-availability filter, eco positioning) | Maya |
| F09 | Recipe Scaling (serving adjuster, proportional quantities, non-linear advisory) | Priya, Felix, Linda |
| F10 | Dietary & Preference Filtering (8 dietary tags, skill level, time, combined) | Rowan, Brett, Claire, Jordan |
| F17 | Pantry Setup Onboarding (starter pantry, first-launch flow) — RICE promoted to MVP | Jordan |

**Legal gate (must complete before F01 recipe import goes live):**
- DMCA designated agent registration at copyright.gov/dmca-agent/
- DMCA takedown policy in ToS

**MVP monetization:**
- Instacart IDP affiliate deep-link (5% commission via Impact.com)
- Smart Bundling to increase AOV (no tech dependency; link construction only)
- Featured ingredient placements: editorial format in MVP; Chicory API integration in Phase 2

---

## 6. Phased Roadmap Summary

### Phase 1 — MVP: "The Anti-Kit" (12–16 weeks)
Core loop: discover → plan → fulfill. Eco-conscious and household-coordinator early adopter acquisition.
**Revenue:** Instacart IDP affiliate only (~$5.70/order at 5% conversion target; stress-test at 2%)

### Phase 2 — "The Full Kitchen" (8–12 weeks post-MVP)
AI, social coordination, budget intelligence, full cart API. Activate Sam, Marco, Nadia, Priya.
**Key additions:** AI Fridge-Clearance (F11), Cost-per-Serving (F12), Potluck Planner (F13), Batch Prep (F14), Dietary Adaptation (F15), In-Step Coaching (F16), Grocery Cost Split (F27), Cook Rotation (F28), Instacart IDP full cart API, Kroger developer API, Chicory integration (at 10K+ MAU)
**Revenue:** + Kroger affiliate + Chicory CPG placements (requires scale proof)

### Phase 3 — "The Stàge" (12–16 weeks post-Phase 2)
Premium engagement, community, creator economy.
**Key additions:** Virtual Stàge Events (F18, $25–$45 consumer / $75–$150 corporate), Month-View Planning (F19), Two-Cook Mode (F20), Recipe Voting Queue (F21), Macro Tracking (F22), Bulk Utilization (F23), Technique Search (F24), Age-Step Tagging (F25), Smart Kitchen Hooks (F26)
**Revenue:** + Stàge event ticket revenue + hardware affiliate links

---

## 7. Business Model Projections (Conservative)

| Stream | Unit Economics | Scale Required |
|--------|---------------|----------------|
| Instacart IDP affiliate | 5% × $114 AOV = $5.70/order | 35K MAU × 5% conversion = $10K/mo |
| Instacart IDP (stress-test) | 5% × $114 × 2% conversion | 175K MAU needed for $10K/mo |
| Chicory CPG placements | CPC format; rates vary by brand | 10K MAU minimum to attract brand spend |
| Stàge Events (consumer) | $35/ticket × 40 attendees = $1,400; instructor cost $200–$500 = $900–$1,200 net | 1–2 events/month viable at target pricing |
| Stàge Events (corporate) | $100/person × 20 attendees = $2,000; net ~$1,500+ | High-margin; B2B booking path |

**Key assumption validated:** No single stream achieves sustainability at MVP scale. Long runway required. All streams need 10K–100K+ MAU before meaningful revenue.

---

## 8. Competitive Positioning (Temper-Hardened)

**Genuine, unoccupied differentiators (confirmed 8/8 platforms):**
1. **Eco/zero-waste filtering** — no competitor has a dedicated sustainability filter
2. **Potluck/event coordination** — genuine white space across all competitors
3. **Offline-first PWA** — all major competitors are native apps
4. **Free with no subscription** — Samsung Food, Mealime, SideChef all have paid tiers

**Table stakes (NOT differentiators):**
- Instacart integration — Samsung Food, AnyList, Mealime all have it
- Household sharing — Samsung Food added this; AnyList has had it

**Competitive threats to monitor:**
- Jow ($13M Series A; European recipe app expanding US with Instacart) — quarterly competitive review
- Zestyplan ("climate-friendly decisions" meal planning) — direct eco-positioning overlap; early-stage
- Samsung Food + Instacart CES 2025 partnership — 200M+ Galaxy users; active AI development
- Walmart "Dinner Tonight" (early 2025) — retailer-native recipe-to-cart

**Window:** Yummly shut down Dec 20, 2024; PlateJoy shut down July 1, 2025 — displaced user cohorts actively seeking alternatives. Move fast.

---

## 9. Open Questions for Scaffold

The following require answers before or during scaffold to configure the project skeleton:

| Question | Default (from brief) | Impact |
|----------|---------------------|--------|
| Project output directory | `staged/` in current working directory | Directory scaffold |
| Primary language | TypeScript throughout | tsconfig.json, package.json |
| Package manager | pnpm | .npmrc, workspace config |
| Target deployment | Vercel (web) + Railway (API) | ENV structure, deployment scripts |
| Database provider | Supabase (managed PostgreSQL) | DATABASE_URL, Drizzle config |
| Anthropic API key | User-supplied | ENV variable: ANTHROPIC_API_KEY |
| Instacart IDP affiliate ID | User-supplied post-registration | ENV variable: INSTACART_IDP_AFFILIATE_ID |
| Auth provider | Better Auth (self-hosted) | Auth config, session secret |
| USDA FDC dataset | Download script included in scaffold | `packages/usda/` setup |
| Test framework | Vitest (unit) + Playwright (e2e) | Test config |
| CI/CD | GitHub Actions | .github/workflows/ |

---

*All claims in this brief reflect temper-hardened research findings. Ghost stats removed. Amazon Fresh removed. Instacart IDP (not "Instacart Connect") used throughout. iOS Background Sync API exclusion confirmed. Event pricing revised to viable range.*
