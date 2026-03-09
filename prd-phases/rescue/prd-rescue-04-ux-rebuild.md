---
task: "UX ground-up rebuild -- persona-driven frontend from Login through core app pages"
branch: "stg-rescue-04/ux-rebuild"
test_command: "pnpm --filter web test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 25
chain_next: null
requires: ["rescue-02"]
parallel_safe: true
group: "rescue"
manifest_id: "rescue-04"
---

# PRD Rescue-04: UX Ground-Up Rebuild

## Mandatory Pre-Read

Before writing a line of UI code:

1. `RESCUE_PROTOCOL.md` -- mandate; persona-first design requirement
2. `CODE_REVIEW_2026-03-08.md` -- existing auth bugs and what was fixed
3. `prd-phases/rescue/rescue-manifest.md` -- current rescue state; confirm rescue-02 is GREEN
4. `docs/personas/_summary.md` -- all 14 personas; read this in full
5. `docs/personas/jordan-the-first-apartment.md` -- primary new-user persona
6. `docs/personas/darius-the-household-conductor.md` -- primary household/planning persona
7. `docs/personas/maya-the-eco-planner.md` -- primary eco/zero-waste persona

**You must not proceed to Phase 2 (building pages) until you have read and
internalized the 3 primary personas above. Every design decision is anchored to
a real user need from the research.**

**Role**: You are the Lead Frontend Engineer + UX Designer. You have full
authority to delete and rewrite every file under `apps/web/src/`. Treat existing
UI code as "broken until proven functional" (RESCUE_PROTOCOL.md).

---

## Context for Agent

### What This PRD Does

Rebuilds the entire React frontend from scratch. The existing UI has a
"Register-but-no-Login" bug in auth flow (fixed in rescue-01 on the API side)
and generic, un-designed page components that do not reflect the personas or
product vision. This PRD creates:

1. A production-quality login and signup flow (the front door)
2. A persona-driven onboarding flow (skill level, household size, dietary profile, starter pantry)
3. The core app shell (navigation, offline indicator, A2HS prompt)
4. The five core pages: Recipes, Planning, Pantry, Household, Fulfillment

### What You Will Keep From Existing Code

- `apps/web/vite.config.ts` -- PWA config; keep unless it is broken
- `apps/web/src/lib/dexie.ts` -- IndexedDB setup; keep
- `apps/web/src/lib/sync-queue.ts` -- offline sync queue; keep
- `apps/web/src/lib/api-client.ts` -- API client; update to use new `/me` fields
- `apps/web/src/components/InstallPrompt.tsx` -- A2HS prompt; keep if functional
- `apps/web/src/components/ui/` -- Radix UI primitives; keep

### What You Will Replace

- All files in `apps/web/src/routes/` (Login.tsx, Onboarding.tsx, Planning.tsx, etc.)
- `apps/web/src/App.tsx` (routing configuration)
- Any component in `apps/web/src/components/` that is not a Radix primitive or
  InstallPrompt (RecipeCard, GroceryItem, etc. -- rebuild per design below)

### Design Principles (derived from personas)

These are non-negotiable. Every component you write should satisfy at least one.

1. **Jordan's Confidence Rule**: Every recipe card shows skill level with a visual
   indicator (colored badge: green=beginner, yellow=intermediate, red=advanced).
   Jordan (23, first apartment) needs to know before she taps whether she can make it.

2. **Darius's 5pm Rule**: The weekly planning view must show the week at a glance
   with today highlighted and "tonight's meal" visible without scrolling. Darius
   (42, family of 4) is making decisions under time pressure.

3. **Maya's Zero-Waste Signal**: Any recipe that is zero-waste eligible (all
   ingredients bulk-available) shows a green leaf icon. Maya (31, eco-anxious) wants
   this signal to be effortless to find, not buried in a filter menu.

4. **Sam's Fridge Rule**: The pantry page shows expiring items first, sorted by
   expiry date ascending, with a visual urgency indicator (red for <3 days, yellow
   for <7 days). Sam (27, fridge forager) uses this to decide what to cook.

5. **Offline First**: Every page must display its last-known data when the network
   is unavailable (Dexie.js reads). The offline indicator in the shell must be
   visible without being annoying (small bottom-of-screen banner, not a modal).

6. **No Dead Ends**: If a user is unauthenticated and hits any protected route,
   redirect to login with the return path preserved. No silent 401s in the UI.

### Tech Stack Constraints

- **Tailwind CSS v4** -- use the v4 syntax; `@import "tailwindcss"` not `@tailwind base`
- **Radix UI** -- use Radix primitives for all interactive components (dialogs, dropdowns,
  checkboxes, etc.); never build raw accessible components from scratch
- **React Router v7** -- use `<Link>` and `useNavigate`, `loader`/`action` pattern optional
- **Zustand** -- lightweight global state for auth session, offline status, onboarding
- **Dexie.js** -- all reads should prefer Dexie (IndexedDB) first; write to API + queue Dexie sync
- **No CSS-in-JS** -- Tailwind only; no styled-components, no inline style objects for layout

### API Contracts (post-rescue-01 fixes)

The API endpoints the UI calls:

| Endpoint                                  | Method      | Auth     | Response shape                                       |
| ----------------------------------------- | ----------- | -------- | ---------------------------------------------------- |
| `/api/auth/signup`                        | POST        | None     | `{ message: string }`                                |
| `/api/auth/signin`                        | POST (form) | None     | session cookie set                                   |
| `/api/auth/me`                            | GET         | Required | `{ id, email, name, householdId, skillLevel, role }` |
| `/api/auth/signout`                       | POST        | None     | clears session                                       |
| `/api/auth/guest`                         | POST        | None     | `{ token, guestId }`                                 |
| `/api/recipes`                            | GET         | Optional | `Recipe[]`                                           |
| `/api/recipes/:id`                        | GET         | Optional | `Recipe` with ingredients                            |
| `/api/households`                         | POST        | Required | `Household`                                          |
| `/api/households/:id`                     | GET         | Required | `Household` with members                             |
| `/api/households/:id/pantry`              | GET         | Required | `PantryItem[]`                                       |
| `/api/households/:id/lists`               | GET         | Required | `GroceryList[]`                                      |
| `/api/plans/:householdId/week/:weekStart` | GET         | Required | `MealPlan` with entries                              |

Import `apiClient` from `@/lib/api-client` for all API calls. Update the client if any
endpoints have changed since the audit (check against current `apps/api/src/routes/`).

### /ux-rebuild Skill Reference

This PRD uses the `/ux-rebuild` skill pattern (see `.claude/commands/ux-rebuild.md`).
The skill pattern is:

- Phase 0: Ingest docs/personas
- Phase 1: Map broken flows to persona needs
- Phase 2: Rebuild -- one route at a time, browser-verified

Use the `frontend` agent type for component implementation tasks.
Use the `mcp__claude-in-chrome__*` tools for browser verification after each major route.

---

## Phase 0: Foundation Audit

### Task 1: Audit existing web app state `[BD:stg-65b]` [x]

- **Type**: task
- **Do**: Before writing any code, document the current state of the web app:
  1. Run `pnpm --filter web dev` and open http://localhost:5173
  2. Navigate to every route and document what renders vs. what throws
  3. Open the browser console and list all uncaught errors
  4. Check the network tab: which API calls succeed and which fail
  5. Run `pnpm --filter web type-check` and capture error count
  6. Record findings in `bd` notes for this task

  Categorize each route:
  - Working: renders correctly, no console errors
  - Broken (fixable): renders but has auth/data errors that rescue-01 fixes
  - Broken (rebuild needed): fundamentally broken UI, wrong data shape, unusable

  This audit drives prioritization for Phase 1.

- **Verify**: Audit complete; every route categorized
- **Accept**: Know which pages are salvageable and which need full rebuild

---

### Task 2: Auth state management (Zustand store) `[BD:stg-4s3]` [x]

- **Type**: task
- **Do**: Create `apps/web/src/lib/auth-store.ts`:

  ```typescript
  import { create } from "zustand";
  import { persist } from "zustand/middleware";

  interface AuthUser {
    id: string;
    email: string;
    name: string;
    householdId: string | null;
    skillLevel: string;
    role: string;
  }

  interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    setUser: (user: AuthUser | null) => void;
    setLoading: (loading: boolean) => void;
    clear: () => void;
  }

  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        clear: () => set({ user: null }),
      }),
      { name: "staged-auth" },
    ),
  );
  ```

  Create a `useCurrentUser()` hook in `apps/web/src/lib/hooks/use-current-user.ts`
  that: checks the store first; if user is null, calls `GET /api/auth/me`; on 401,
  redirects to login. This is the single source of truth for auth state.

  Update `apps/web/src/lib/api-client.ts` to reflect the new `/me` response shape:
  `{ id, email, name, householdId, skillLevel, role }`.

- **Files**: `apps/web/src/lib/auth-store.ts`, `apps/web/src/lib/hooks/use-current-user.ts`, `apps/web/src/lib/api-client.ts`
- **Verify**: Store types match the API response; useCurrentUser hook compiles
- **Accept**: Auth state management foundation is complete

---

## Phase 1: Authentication UI

### Task 3: Login page rebuild `[BD:stg-eax]` [x]

- **Type**: feature
- **Do**: Rewrite `apps/web/src/routes/Login.tsx` from scratch. Design requirements:

  **Visual design**:
  - Centered card layout, max-width 440px, centered vertically on desktop
  - App logo/wordmark "Stàged" at the top (text-based is fine; use the accent
    on the 'a' as the brand differentiator)
  - Tagline below logo: "Meal planning that works with your kitchen."
  - Email and password inputs with floating labels (Radix Input primitive)
  - "Sign in" primary CTA button (full width, prominent)
  - "Don't have an account? Sign up" link below
  - "Continue as guest" text link (lower visual weight)
  - Google OAuth button (secondary style, only if GOOGLE_CLIENT_ID is configured)

  **Behavior**:
  - On successful signin: fetch `/api/auth/me`, store in `useAuthStore`, navigate to
    `/planning` if user has a household, or `/onboarding` if `householdId` is null
  - On 401: show inline error "Incorrect email or password"
  - On network error: show "Connection problem -- check your internet connection"
  - Show loading state on the button during request (spinner or "Signing in...")
  - Disable form during loading to prevent double-submit

  **Persona alignment**: Jordan (first-time user) needs to feel that this app is
  approachable. No dark patterns, no forced account creation wall. Guest mode is
  visible but not the primary CTA.

- **Files**: `apps/web/src/routes/Login.tsx`
- **Verify**: Browser test -- open incognito, navigate to /login, sign in with seed user, confirm redirect to /planning
- **Accept**: Login works end-to-end in browser; `useAuthStore` populated after login

---

### Task 4: Signup page rebuild `[BD:stg-cxg]` [x]

- **Type**: feature
- **Do**: Rewrite or create `apps/web/src/routes/SignUp.tsx`. Design requirements:

  **Fields**:
  - Display name (text, required, placeholder "How should we call you?")
  - Email (email type, required)
  - Password (password type, required, min 8 chars)
  - Password confirmation (required, must match)

  **Behavior**:
  - Client-side validation before submit (show inline error per field)
  - On successful `POST /api/auth/signup` (201): automatically sign in via
    `POST /api/auth/signin` with the same credentials, then navigate to `/onboarding`
  - On 409 (email taken): "An account with this email already exists. Sign in?"
    (link the "Sign in?" to /login)
  - On 400 (validation): show server error message inline

  **Visual design**: Same card layout as Login. Progress steps if desired but not required.

- **Files**: `apps/web/src/routes/SignUp.tsx`
- **Verify**: Register a new user in the browser; confirm redirect to /onboarding; confirm row in DB
- **Accept**: Signup flow functional; no Postgres errors; auto-signin after register works

---

## Phase 2: Onboarding Flow

### Task 5: Onboarding flow rebuild `[BD:stg-3wb]` [x]

- **Type**: feature
- **Do**: Rewrite `apps/web/src/routes/Onboarding.tsx` as a multi-step flow.
  The onboarding flow has 4 steps:

  **Step 1: Skill Level** (Jordan's Confidence Rule)
  - Heading: "How comfortable are you in the kitchen?"
  - Three cards (not radio buttons -- make them tappable visually):
    - Beginner: "I follow recipes carefully. Simple dishes."
    - Home Cook: "I improvise sometimes. Most recipes work."
    - Confident Cook: "I adapt recipes, handle complex techniques."
  - Use visual icons (emoji are fine for now: chef hat levels or similar)
  - One selected state (highlighted card, checkmark)
  - Jordan persona: she needs to select "Beginner" without feeling embarrassed.
    Language is encouraging, not diminishing.

  **Step 2: Household Setup**
  - Heading: "Is anyone else eating with you?"
  - Two paths:
    - "Just me" -- creates a solo household, no invite needed
    - "I cook for others" -- shows household name input + creates household
  - If "I cook for others": show invite link after creation so user can share
  - Darius persona: he wants the household set up immediately, not as an afterthought

  **Step 3: Dietary Profile**
  - Heading: "Any dietary needs?"
  - Multi-select chips (toggle on/off):
    vegan, vegetarian, gluten-free, dairy-free, nut-free, halal, kosher, low-carb
  - "Skip for now" text link -- this is optional
  - Save selection to `PATCH /api/users/me` or equivalent profile update endpoint

  **Step 4: Starter Pantry**
  - Heading: "Let's stock your pantry"
  - Sub-heading: "Check what you have. We'll use this to filter recipes you can make today."
  - Pre-populated list of common pantry staples (from `packages/db/src/seeds/`):
    olive oil, salt, pepper, garlic, onions, butter, eggs, flour, sugar, soy sauce, etc.
  - Checkboxes (large, tappable) for each item
  - "Add to my pantry" CTA saves selected items via POST /api/households/:id/pantry/bulk
  - This is the A2HS trigger point: after the user taps "Add to my pantry",
    show the A2HS prompt with framing:
    "Add Stàged to your Home Screen to keep your recipes available offline --
    even without signal."

  **Navigation**:
  - "Back" and "Continue" buttons on each step
  - Progress indicator (step X of 4, or dots)
  - Last step "Continue" navigates to /planning

  **Persona alignment**:
  - Jordan: step 1 removes confidence barrier; step 4 makes the app immediately useful
  - Darius: step 2 sets up shared household; step 4 seeds the pantry for Fridge Clearance
  - Maya: dietary profile captures eco/vegan preferences for zero-waste filtering

- **Files**: `apps/web/src/routes/Onboarding.tsx`
- **Verify**: Full onboarding flow in browser (incognito, fresh user); all 4 steps complete; household created; pantry items saved; A2HS prompt shown
- **Accept**: Onboarding flow runs end-to-end; DB reflects chosen skill level, household, and pantry items

---

## Phase 3: App Shell

### Task 6: App shell and routing `[BD:STG-266]`

- **Type**: feature
- **Do**: Rewrite `apps/web/src/App.tsx` with the production routing configuration:

  **Route structure**:

  ```
  / -- redirect to /planning if authed, else /login
  /login -- Login page (unauthenticated only)
  /signup -- SignUp page (unauthenticated only)
  /onboarding -- Onboarding flow (requires auth, requires no householdId or fresh login)
  /planning -- Weekly planning view (requires auth)
  /recipes -- Recipe library (public browse; requires auth for save/plan)
  /recipes/:id -- Recipe detail + cooking view (public)
  /pantry -- Pantry management (requires auth)
  /household -- Household settings, members, invite link (requires auth)
  /lists -- Grocery list view (requires auth)
  /fulfillment -- Deliver Me This flow (requires auth)
  ```

  **Auth guard**: Create `apps/web/src/components/AuthGuard.tsx`:

  ```typescript
  // Wraps protected routes. Redirects to /login with ?returnTo= if unauthenticated.
  // Shows loading spinner while checking session (useCurrentUser hook).
  ```

  **App shell layout** (for authenticated pages):
  - Bottom navigation bar (mobile-first): Planning, Recipes, Pantry, Household icons
  - Top bar: app name "Stàged", notification bell placeholder, avatar (initials)
  - Offline indicator: small banner at bottom when `navigator.onLine` is false
    Text: "You're offline. Showing saved data." -- auto-hides when back online.

  **Offline indicator logic**:

  ```typescript
  // apps/web/src/components/OfflineIndicator.tsx
  // Listen to window 'online' and 'offline' events
  // Show/hide the indicator; do NOT use a modal or block interaction
  ```

- **Files**: `apps/web/src/App.tsx`, `apps/web/src/components/AuthGuard.tsx`, `apps/web/src/components/OfflineIndicator.tsx`, `apps/web/src/components/AppShell.tsx`
- **Verify**: Navigate between routes; auth guard redirects unauthenticated users; bottom nav works; turn network off and confirm offline indicator appears
- **Accept**: Routing works; auth guard prevents unauthorized access; offline mode shows indicator not error

---

## Phase 4: Core Pages

### Task 7: Recipe library page `[BD:STG-267]`

- **Type**: feature
- **Do**: Rebuild `apps/web/src/routes/Recipes.tsx` and recipe-related components.

  **Recipe library** (`/recipes`):
  - Filter bar at top: skill level chips (Beginner / Home Cook / Confident),
    dietary filter chips (Vegan, Gluten-free, etc.), Zero-Waste filter toggle (Maya)
  - Recipe grid (2 columns mobile, 3 columns tablet)
  - Each RecipeCard shows:
    - Title
    - Skill level badge (color-coded per Jordan's Confidence Rule)
    - Cook + prep time
    - Zero-waste leaf icon if applicable (Maya's Zero-Waste Signal)
    - Servings
    - "Save to Library" heart icon (requires auth; shows login prompt if guest)
  - Offline: reads from Dexie.js recipe cache; shows "Offline -- showing saved recipes"
  - Search input: filters by title (client-side on cached data)

  **Recipe detail** (`/recipes/:id`):
  - Full recipe view with ingredients list and step-by-step instructions
  - Scale servings selector (tap +/- to adjust from servingsBase)
  - "Add to This Week's Plan" CTA (opens day picker)
  - "Deliver Me This" CTA (navigates to /fulfillment with this recipe pre-selected)
  - Screen Wake Lock request when user enters step-by-step mode
    (`navigator.wakeLock.request('screen')`)
  - Ingredient substitution hints shown inline (from substitutions table)

  **Persona alignment**:
  - Jordan: skill badge is the #1 filter signal; beginner filter should be the default
  - Maya: zero-waste filter is prominent, not buried
  - Felix: technique tags visible on detail page

- **Files**: `apps/web/src/routes/Recipes.tsx`, `apps/web/src/routes/RecipeDetail.tsx`, `apps/web/src/components/RecipeCard.tsx`
- **Verify**: Recipe list renders; skill filter works; zero-waste icon shows correctly; Wake Lock requested when entering step view
- **Accept**: Recipe library functions end-to-end; filters work; offline mode shows cached recipes

---

### Task 8: Weekly planning page `[BD:STG-268]`

- **Type**: feature
- **Do**: Rebuild `apps/web/src/routes/Planning.tsx`.

  **Weekly calendar view**:
  - 7-day horizontal scroll (Mon-Sun), today's column highlighted
  - Each day slot shows assigned recipe title + cook time, or "Add a meal" placeholder
  - Tap an empty slot -> recipe picker modal (search + browse current library)
  - Tap an assigned meal -> detail options: change, remove, scale servings

  **Grocery list side panel** (or bottom sheet on mobile):
  - Auto-generated from all recipes in the current week plan
  - Checkbox per item; real-time sync via Socket.io (checked items sync to all household members)
  - Offline: Dexie writes first, sync on reconnect

  **"Deliver Me This Week" CTA**:
  - Prominent button below the list
  - Takes all unchecked items -> navigates to /fulfillment

  **Darius's 5pm Rule**: Today's meal is the visually dominant element. If it's
  past 5pm, show a nudge: "Tonight: [recipe name]" in a highlighted strip at the top.

  **Persona alignment**:
  - Darius: 5pm rule, shared list with real-time sync
  - Nadia: batch prep from multiple recipes (link to /batch-prep if that route exists)
  - Alex & Riley: shared recipe queue visible in the planner

- **Files**: `apps/web/src/routes/Planning.tsx`
- **Verify**: Load planning page; assign a recipe to a day; confirm grocery list updates; check an item; confirm it stays checked after refresh (Dexie persist)
- **Accept**: Planning page functional; meal assignment works; grocery list reflects plan; checked state persists offline

---

### Task 9: Pantry page `[BD:STG-269]`

- **Type**: feature
- **Do**: Rebuild or create `apps/web/src/routes/Pantry.tsx`.

  **Pantry view**:
  - List of pantry items, sorted by expiry date ascending (Sam's Fridge Rule)
  - Expiry urgency visual: red background/border for <3 days, yellow for <7 days
  - Add item form (ingredient name, quantity, unit, expiry date picker)
  - Remove item (swipe-to-delete or x button)
  - "What can I make?" CTA -- links to /recipes with pantry-available filter active

  **Starter pantry quick-add** (for users who skipped onboarding step 4):
  - Banner if pantry is empty: "Your pantry is empty. Add staples to discover
    recipes you can make today." + "Add starter pantry" button

  **Persona alignment**:
  - Sam: expiry sorting is the primary value; must be visible without scrolling
  - Jordan: empty state is encouraging, not a dead end
  - Maya: pantry-aware recipe filtering enables zero-waste mode

- **Files**: `apps/web/src/routes/Pantry.tsx`
- **Verify**: Add items; confirm sort order; confirm expiry urgency indicators; empty state is shown correctly
- **Accept**: Pantry page functional; items sorted by expiry; urgency indicators visible

---

### Task 10: Fulfillment (Deliver Me This) page `[BD:STG-270]`

- **Type**: feature
- **Do**: Rebuild `apps/web/src/routes/FulfillmentPage.tsx`.

  **Flow**:
  1. Shows the current week's unchecked grocery list items
  2. User can deselect items they already have
  3. "Send to Instacart" CTA -- constructs the Instacart IDP deep link and opens it
  4. Attribution disclosure (required by Instacart IDP terms):
     "Stàged earns a commission on orders placed through Instacart."
  5. "Copy list" fallback button -- copies items to clipboard as plain text

  **Persona alignment**:
  - Darius: "Deliver Me This" is the #2 core feature after planning
  - Nadia: one-tap from batch prep list to cart

  **Note**: The deep-link construction logic is in `fulfillment-service.ts` on
  the API. The UI calls `POST /api/fulfillment/instacart-link` (or whatever the
  current endpoint is -- read the fulfillment route to confirm).

- **Files**: `apps/web/src/routes/FulfillmentPage.tsx`
- **Verify**: Fulfillment page shows grocery items; deselect works; Instacart link opens (or shows correct URL in non-test browser)
- **Accept**: Fulfillment page functional; attribution disclosure visible

---

## Phase 5: Verification

### Task 11: Playwright E2E -- core persona flows `[BD:STG-271]`

- **Type**: task (RESCUE_PROTOCOL.md browser validation)
- **Do**: Write E2E tests in `apps/web/tests/e2e/` covering the three primary persona flows:

  **Jordan flow** (`tests/e2e/onboarding.spec.ts`):
  1. Register new account
  2. Complete onboarding (skill: beginner, solo household, no dietary profile, add starter pantry)
  3. Confirm pantry has items
  4. Navigate to /recipes; confirm beginner recipes visible; skill badge visible

  **Darius flow** (`tests/e2e/planning.spec.ts`):
  1. Login as seed `owner@staged.test`
  2. Navigate to /planning; confirm week view renders
  3. Assign a recipe to today's slot
  4. Confirm grocery list updates with recipe ingredients
  5. Navigate to /fulfillment; confirm items visible

  **Maya flow** (`tests/e2e/recipes.spec.ts`):
  1. Login
  2. Navigate to /recipes; toggle Zero-Waste filter
  3. Confirm only zero-waste-eligible recipes show (if any exist in seed data)
  4. Toggle off; confirm all recipes return

  **Offline smoke test** (`tests/e2e/pwa-shell.spec.ts`):
  1. Login
  2. Navigate to /recipes (populate Dexie cache)
  3. Set network to offline in browser (Playwright's `page.context().setOffline(true)`)
  4. Navigate to /recipes again
  5. Confirm recipes still visible (from Dexie cache)
  6. Confirm offline indicator is visible

- **Files**: `apps/web/tests/e2e/onboarding.spec.ts`, `apps/web/tests/e2e/planning.spec.ts`, `apps/web/tests/e2e/recipes.spec.ts`, `apps/web/tests/e2e/pwa-shell.spec.ts`
- **Verify**: `pnpm --filter web test:e2e` passes all 4 spec files
- **Accept**: Persona flows verified in real browser; offline smoke test passes

---

### Task 12: A2HS and PWA installability check `[BD:STG-272]`

- **Type**: task (CLAUDE.md "A2HS is a functional requirement")
- **Do**: Per CLAUDE.md: "The Add-to-Home-Screen prompt is NOT optional UX polish.
  iOS evicts non-installed PWA cache after 7 days."

  Verify:
  1. Open http://localhost:5173 in Chrome DevTools
  2. Go to Application tab -> Service Workers -> confirm SW is registered
  3. Go to Application tab -> Manifest -> confirm manifest.json is valid
  4. Go to Application tab -> Manifest -> "Add to homescreen" check shows no errors
  5. In the onboarding flow, confirm the A2HS prompt appears after step 4

  If the manifest or SW is broken, fix `apps/web/public/manifest.json` and
  `apps/web/vite.config.ts` PWA plugin config. The service worker is Workbox-managed
  via vite-plugin-pwa -- do not handwrite service worker code.

- **Verify**: Chrome DevTools shows no manifest errors; SW registered; A2HS prompt appears in onboarding
- **Accept**: PWA installability checks green in Chrome DevTools

---

### Task 13: Update CORRECTION_LOG.md and rescue manifest `[BD:STG-273]`

- **Type**: chore
- **Do**:
  1. Append to `CORRECTION_LOG.md`:
     ```
     | Login page | Register-but-no-Login (API bug fixed in rescue-01; UI needed rebuild) | Rebuilt | Persona-driven design; householdId routing; error states | Jordan (primary), all personas | E2E login spec passes |
     | Signup page | Was calling account.password (API bug); auto-signin missing | Rebuilt | Auto-signin after register; household routing | Jordan | E2E onboarding spec passes |
     | Onboarding flow | 4 steps missing: skill/household/dietary/pantry | Rebuilt | Jordan Confidence Rule; Darius household setup; Maya dietary; Sam pantry | Jordan, Darius, Maya, Sam | Full E2E flow verified |
     | App shell | No auth guard; no offline indicator | Rebuilt | Auth redirect; offline banner; bottom nav | All personas | Offline smoke test passes |
     | Recipe library | No skill filter; no zero-waste signal | Rebuilt | Jordan skill badge; Maya leaf icon; filters | Jordan, Maya, Felix | E2E recipes spec passes |
     | Planning page | Grocery list not real-time; no 5pm rule | Rebuilt | Darius 5pm rule; Socket.io sync; Dexie offline | Darius, Nadia | E2E planning spec passes |
     | Pantry page | No expiry sorting; no urgency indicators | Rebuilt | Sam Fridge Rule (expiry sort, urgency colors) | Sam, Maya, Jordan | E2E verified |
     | Fulfillment page | Attribution disclosure missing (IDP requirement) | Rebuilt | Instacart link; attribution note; copy fallback | Darius, Nadia | E2E fulfillment spec passes |
     ```
  2. Update `prd-phases/rescue/rescue-manifest.md`: mark `rescue-04` complete,
     progress = `5 / 5 rescue PRDs complete`.
  3. Add a final entry to `CORRECTION_LOG.md`:
     ```
     | RESCUE COMPLETE | Manifest claimed 33/38 PRDs done; foundation was non-functional | All rescue PRDs executed | Schema built, auth fixed, service layer typed, UX rebuilt persona-first | All 14 personas | All E2E specs passing; Foundation green gate confirmed |
     ```
- **Files**: `CORRECTION_LOG.md`, `prd-phases/rescue/rescue-manifest.md`
- **Verify**: Manifest shows 5/5 complete; all 14 correction log entries present
- **Accept**: Rescue is documented; project is in a functional, testable, shippable state

---

## Discovered Tasks

_None yet._

---

## Notes for Future Sessions

If this PRD runs across multiple Ralph sessions, Ralph will pick up from the first
task that is not `[x]` in this file. Each task is self-contained enough to resume
from any point. The state to recover:

1. Run `bd list --status=in_progress` to see the active task
2. Read `prd-phases/rescue/rescue-manifest.md` for overall progress
3. Read `CORRECTION_LOG.md` for what was changed so far
4. Run `pnpm --filter web dev` and open the browser to see current UI state

The green gate (rescue-02) must be confirmed before Phase 4 pages are built.
If you are resuming mid-way through this PRD and the green gate has not been
confirmed yet, stop and complete rescue-02 first.
