---
task: "UX gaps -- recipe search, connection status, planning add-meal, auth persistence"
branch: "stg-rescue-09/ux-gaps"
test_command: "pnpm test"
completion_promise: "COMPLETE"
max_iterations: 15
requires: ["rescue-08"]
group: "rescue"
manifest_id: "rescue-09"
---

# PRD Rescue-09: UX Gaps

## Mandatory Pre-Read

1. `RESCUE_PROTOCOL.md` -- mandate
2. `prd-phases/rescue/rescue-manifest.md` -- current state
3. `docs/personas/` -- all persona files (read to understand who uses these features)

**Confidence**: High for connection status and recipe search; Medium for planning calendar
(depends on rescue-07 mealType field being in place).

---

## Context for Agent

### Persona Audit Summary

14 personas were reviewed. The following use cases are not yet served by the current
implementation:

| Persona                  | Gap                                                                          | Impact                                             |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| Jordan (busy parent)     | Can't search/filter recipes; must scroll all                                 | High -- makes recipe discovery unusable            |
| Sam (student)            | Session lost on page refresh (not using localStorage persist)                | High -- login required every time                  |
| Alex (dietary needs)     | Dietary preference set in onboarding but never applied to recipe filtering   | High -- dietary safety concern                     |
| Quinn (batch prepper)    | Planning calendar shows + button but add-meal flow is incomplete post-rescue | Medium                                             |
| Riley (budget tracker)   | Connection badge was removed; users don't know when offline                  | Low (badge was confusing, but need some indicator) |
| The House (multi-member) | Socket connection status never "connected" (socket.io join never confirms)   | Medium                                             |

### Key Bugs Still Outstanding

1. **Auth state not persisted to localStorage**: On page refresh, `useAuthStore` loses the
   user and redirects to `/login`. The Zustand store needs `persist` middleware with
   localStorage so the user stays logged in across browser refreshes.

2. **Recipe search/filter missing**: The Recipes page shows all recipes (or an empty state
   for new accounts). No search bar. No filtering by skill level, dietary tag, or time.
   Persona Alex needs dietary tag filtering for safety reasons.

3. **Planning add-meal flow**: After rescue-04 UX rebuild, Planning.tsx has an inline
   `+` button in each cell that creates a "stub" recipe and adds it as a plan entry. The
   real flow should be: click `+` -> search existing recipes -> pick one -> add to slot.
   A stub recipe named after user input is acceptable for MVP but must persist to DB
   (after rescue-07 it will).

4. **Socket.io connection always "disconnected"**: The Socket.io client joins the household
   room on mount but the `onConnectionChange` handler never fires "connected" because the
   server-side join emits no acknowledgment. The Planning.tsx header shows an offline hint
   but it's based on socket state, not actual network state. Should use `navigator.onLine`
   as the primary offline indicator.

5. **Dietary adaptation**: Onboarding collects dietary preferences (step 4: dietary
   restrictions). These are saved to `user.dietaryProfile` during signup. But recipe
   listing (`GET /api/recipes`) never filters by the user's dietary profile. Recipes
   with allergens the user flagged should be deprioritized or labelled.

---

## Tasks

### Task 1: Add Zustand persist middleware to auth store `[BD:stg-ewo]` ✓

- **Type**: task
- **Priority**: P0
- **Do**:
  Read `apps/web/src/lib/auth-store.ts`.

  The store currently uses plain `create()` without persistence. On page refresh, the
  user state is lost and `AuthGuard` redirects to `/login` even with a valid JWT cookie.

  Wrap the store with `persist` middleware:

  ```typescript
  import { create } from "zustand";
  import { persist } from "zustand/middleware";

  interface AuthState {
    user: User | null;
    setUser: (user: User) => void;
    clear: () => void;
  }

  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        clear: () => set({ user: null }),
      }),
      {
        name: "staged-auth",
        // Only persist the user object; do not persist functions
        partialize: (state) => ({ user: state.user }),
      },
    ),
  );
  ```

  After this change, the user object survives page refreshes. The JWT cookie also persists
  independently (it's HttpOnly), so the combination means the user stays logged in.

  **Caveat**: If the JWT expires, the cookie will be rejected on the next API call. The
  `AuthGuard` should handle this: if any API call returns 401, call `clear()` and redirect
  to `/login`.

  Update `AuthGuard.tsx` to catch 401 errors and redirect:
  - Check if `useAuthStore` has a user; if yes, try `GET /api/auth/me` to validate
  - If `/api/auth/me` returns 401: call `clear()` and redirect to `/login`
  - If it returns 200: proceed (user is still valid)

- **Files**: `apps/web/src/lib/auth-store.ts`, `apps/web/src/components/AuthGuard.tsx`
- **Verify**: Log in; refresh the page; user is still logged in without redirect
- **Accept**: Auth state survives page refresh; 401 from API clears state and redirects

---

### Task 2: Add recipe search and filter to Recipes page `[BD:stg-wrs]` ✓

- **Type**: task
- **Priority**: P1
- **Do**:
  Read `apps/web/src/routes/Recipes.tsx` in full.

  Add a search bar and filter controls above the recipe grid:

  ```
  [Search recipes...          ] [Skill: All v] [Diet: All v] [Time: Any v]
  ```

  Frontend filtering (client-side for MVP -- no new API endpoint needed):
  1. On mount, fetch all recipes via `apiClient.recipes.list(householdId)`
  2. Store raw list in state
  3. Derive filtered list from search term + active filters:
     - Search: `recipe.title.toLowerCase().includes(term)`
     - Skill: exact match on `recipe.skillLevel`
     - Diet: check `recipe.dietaryTags?.includes(tag)`
     - Time: `(recipe.prepTimeMinutes + recipe.cookTimeMinutes) <= threshold`

  For the dietary filter, pull the user's dietary profile from `useAuthStore()` and
  pre-select the matching tag. This means if Alex is flagged as "gluten-free",
  the filter defaults to showing only gluten-free recipes (with a visible "Filtered by
  your dietary preferences" notice and a "Clear filter" link).

  Add `data-testid="recipe-search"` to the search input and `data-testid="recipe-filter-skill"`,
  `data-testid="recipe-filter-diet"` to the dropdowns.

- **Files**: `apps/web/src/routes/Recipes.tsx`
- **Verify**: Typing in search hides non-matching recipes in real time; dietary filter
  pre-selected based on user profile; `pnpm --filter web test` passes
- **Accept**: Search and filter functional; dietary auto-filter applied for users with profile

---

### Task 3: Fix planning add-meal to search existing recipes `[BD:stg-xn7]` ✓

- **Type**: task
- **Priority**: P1
- **Do**:
  Read `apps/web/src/routes/Planning.tsx` in full. Find the `handleAddMeal` function
  and the active-cell inline input.

  The current flow: user types a recipe name and presses Enter -> a stub recipe is created
  via `apiClient.recipes.create({ title: input })` -> stub is added to plan.

  This is acceptable for MVP but needs two improvements:
  1. **Autocomplete from existing recipes**: When the user types in the cell input, show
     a small dropdown of matching recipes from the recipe library (max 5 results).
     Filtering is client-side: on Planning mount, fetch all recipes and store in a ref
     (not state, to avoid re-renders).

     ```typescript
     const allRecipesRef = useRef<Recipe[]>([]);
     // on mount after loading plan:
     const { recipes } = await apiClient.recipes.list(householdId);
     allRecipesRef.current = recipes;
     ```

     On input change: filter `allRecipesRef.current` by title substring. Show up to 5 results
     in a dropdown below the input. Clicking a result picks that recipe (no stub created).

  2. **Pressing Enter without picking**: If the user presses Enter with text that doesn't
     match an existing recipe, create the stub as before (the current behavior). This
     keeps the quick-add flow working.

  Add `data-testid="meal-search-dropdown"` to the autocomplete dropdown.

- **Files**: `apps/web/src/routes/Planning.tsx`
- **Verify**: Typing "pasta" in a meal slot shows matching recipes from the library;
  selecting one adds it to the plan without creating a stub; tests pass
- **Accept**: Autocomplete dropdown functional; existing recipe selection works

---

### Task 4: Fix offline/connection status indicator `[BD:stg-80s]` ✓

- **Type**: task
- **Priority**: P2
- **Do**:
  The current Planning.tsx shows a "Not connected" hint based on Socket.io `socket.connected`.
  This is wrong for two reasons:
  1. Socket.io may be connecting (not yet confirmed) -- shows false negative
  2. The real question for offline-first UX is "can the user reach the network?" not
     "is the WebSocket open?"

  Fix: Replace the socket-based connection hint with `navigator.onLine` + a window
  event listener:

  ```typescript
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  ```

  Show the offline indicator **only when actually offline** (`!isOnline`). When online,
  show nothing -- no "Connected" badge cluttering the UI. The offline indicator should be
  subtle: a small amber banner at the top of the Planning page:
  `"You're offline -- changes will sync when you reconnect."`

  Extract this into a shared `useOnlineStatus()` hook in `apps/web/src/lib/` so other
  pages (Pantry, Lists) can use the same pattern. The hook is 10 lines -- do not over-engineer
  into a component.

  Also move the same offline banner to `Pantry.tsx` and `Lists.tsx` since those pages
  also mutate data.

- **Files**: `apps/web/src/lib/use-online-status.ts` (new hook),
  `apps/web/src/routes/Planning.tsx`, `apps/web/src/routes/Pantry.tsx`,
  `apps/web/src/routes/Lists.tsx`
- **Verify**: Toggling Chrome DevTools "Offline" mode shows the amber banner; going back
  online hides it
- **Accept**: Offline banner appears on offline; disappears on online; no "Connected" badge

---

### Task 5: Apply dietary profile to recipe listing API `[BD:STG-324]`

- **Type**: task
- **Priority**: P1
- **Do**:
  Read `apps/api/src/routes/recipes.ts` and `apps/api/src/services/recipe-service.ts`.

  The `GET /api/recipes` endpoint currently ignores filters. Add dietary tag filtering:

  Request: `GET /api/recipes?dietaryTag=gluten-free&skillLevel=beginner`

  In the route handler, parse query params and pass to the service's `listRecipes()`.
  In the service (post rescue-07, using Drizzle), apply:

  ```typescript
  let query = db.select().from(recipes);
  if (filters.skillLevel) {
    query = query.where(eq(recipes.skillLevel, filters.skillLevel));
  }
  if (filters.dietaryTag) {
    query = query.where(
      sql`${recipes.dietaryTags} @> ARRAY[${filters.dietaryTag}]::text[]`,
    );
  }
  ```

  Also update `apiClient.recipes.list()` in the web app to accept optional filters and
  pass them as query params.

  The Recipes page from Task 2 already filters client-side, which is fine for MVP. This
  server-side filtering is for correctness and future-proofing (when recipe library grows
  beyond what fits in one fetch).

- **Files**: `apps/api/src/routes/recipes.ts`, `apps/api/src/services/recipe-service.ts`,
  `apps/web/src/lib/api-client.ts`
- **Verify**: `GET /api/recipes?dietaryTag=vegan` returns only vegan recipes; type-check passes
- **Accept**: Server-side filtering works; client updates api-client.ts to match

---

### Task 6: Add seed recipes for testing `[BD:STG-325]`

- **Type**: task
- **Priority**: P2
- **Do**:
  New users see an empty Recipes page. Add a seed migration that inserts 6 starter recipes
  so the app is immediately useful.

  Create `packages/db/src/seeds/recipes.ts` with 6 recipes covering:
  - 2 beginner recipes (e.g., "Classic Scrambled Eggs", "Peanut Butter Toast")
  - 2 intermediate recipes (e.g., "Pasta Primavera", "Chicken Stir Fry")
  - 1 advanced recipe (e.g., "Beef Bourguignon")
  - 1 recipe tagged "vegan" (e.g., "Lentil Soup")

  Each recipe needs at minimum: `title`, `skillLevel`, `dietaryTags`, `servingsBase`,
  `prepTimeMinutes`, `cookTimeMinutes`, and 3-5 `ingredients` (name strings).

  Add a seed script to `packages/db/package.json`:

  ```json
  "seed": "tsx src/seeds/recipes.ts"
  ```

  The seed script should be idempotent (INSERT ... ON CONFLICT DO NOTHING based on title).

  Document in `packages/db/README.md` (create if not exists) how to run the seed:
  `pnpm --filter @staged/db seed`

- **Files**: `packages/db/src/seeds/recipes.ts`, `packages/db/package.json`
- **Verify**: `pnpm --filter @staged/db seed` exits 0; `GET /api/recipes` returns 6 recipes
- **Accept**: Seed runs without errors; new user sees populated recipe library

---

### Task 7: Add unit tests for new UX features `[BD:STG-326]`

- **Type**: task
- **Do**:
  1. `apps/web/tests/unit/auth-persist.test.tsx`:
     - AuthStore user persists to localStorage after `setUser`
     - Refreshing the store (creating new instance) restores from localStorage
  2. `apps/web/tests/unit/planning-routes.test.tsx` (add to existing):
     - Autocomplete dropdown appears when typing in meal slot input
     - Selecting from dropdown calls `apiClient.plans.addEntry` with the recipe id
  3. `apps/api/tests/recipes/filter.test.ts`:
     - `GET /api/recipes?skillLevel=beginner` returns only beginner recipes
     - `GET /api/recipes?dietaryTag=vegan` returns only vegan-tagged recipes

- **Verify**: `pnpm test` passes; no skipped tests
- **Accept**: New tests cover the auth persistence and recipe filter paths

---

### Task 8: Update CORRECTION_LOG.md and rescue manifest `[BD:STG-327]`

- **Type**: chore
- **Do**:
  1. Append to `CORRECTION_LOG.md`:
     ```
     | useAuthStore | No persistence | Added Zustand persist middleware | Session lost on page refresh | Sam, all mobile personas | Page refresh retains login |
     | Recipes page | No search/filter | Added client-side search + dietary filter | Recipe discovery unusable; dietary safety gap | Alex, Jordan personas | Search + dietary filter functional |
     | Planning add-meal | Creates stub only | Added autocomplete from recipe library | Users can't pick existing recipes | Quinn, Jordan personas | Autocomplete dropdown functional |
     | Connection status | Socket.io state (always false) | navigator.onLine + event listener | Misleading "not connected" on every load | The House multi-member persona | Offline banner accurate |
     | Recipe listing | No server-side filter | Added dietaryTag + skillLevel query params | Dietary safety concern for Alex persona | Alex persona | Filtered API response correct |
     ```
  2. Mark `rescue-09` complete in `rescue-manifest.md`; set progress to final count.

- **Files**: `CORRECTION_LOG.md`, `prd-phases/rescue/rescue-manifest.md`
- **Verify**: Manifest updated; rescue-09 complete
- **Accept**: All UX gaps addressed; manifest reflects completion

---

## Discovered Tasks

_None yet._
