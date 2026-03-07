
## Iteration 1 — MVP Auth API (STG-281..STG-286)
- **Status**: Complete
- **Files changed**: apps/api/src/lib/auth.ts, apps/api/src/routes/auth.ts, apps/api/src/services/auth-service.ts, apps/api/src/middleware/auth.ts, apps/api/tests/auth/auth-routes.test.ts, prd-phases/01-mvp-api/prd-01-api-auth.md, prd-phases/manifest.md, plus many PRD & config updates
- **Patterns discovered**: using pg pool directly instead of full db package simplifies TS boundaries; vitest env config is needed for early env validation; Hono ctx typing workaround required for custom context vars
- **Gotchas**: ES modules hoist imports before runtime assignments (env vars need to be set in config or separate setup file); type-check across workspace packages is tricky—prefer minimal  boundaries for cross-package imports until full project references are configured
- **Time**: Sat Mar  7 16:46:16 UTC 2026
- Added import/nutrition/scaling/substitution features; expanded Recipe types; verified via updated tests
- Implemented households API with invites, join, members, guest-add helpers, and tests

## Iteration 2 -- Onboarding page (STG-114..STG-118)

- **Status**: Complete
- **Files changed**: apps/web/src/routes/Onboarding.tsx, apps/web/src/lib/onboarding-store.ts, apps/web/src/lib/api-client.ts, apps/web/src/lib/install.ts, apps/web/tests/unit/onboarding.test.tsx, apps/web/tests/e2e/onboarding.spec.ts, prd-phases/01-mvp-pages/prd-01-pages-onboarding.md, prd-phases/manifest.md
- **Patterns discovered**: Zustand persist store for resumable multi-step flows; beforeinstallprompt singleton in install.ts; E2E tests using localStorage injection to jump to specific steps; accented chars (Stàged) need regex in Playwright selectors (name: /St.ged/i); strict mode violations when text appears in nested children -- use getByRole or .first()
- **Gotchas**: beforeinstallprompt is captured globally at module load time -- place singleton in a separate lib file not inside a component; mobile E2E test must reload after setViewportSize to clear persisted step
- **Time**: Sat Mar  7 14:31:00 UTC 2026

## Iteration 3 -- Recipe pages (STG-119..STG-123)
- **Status**: Complete
- **Files changed**: apps/web/src/routes/Recipes.tsx, apps/web/src/lib/wake-lock.ts, apps/web/src/lib/api-client.ts (recipes methods), apps/web/src/App.tsx (sub-routes), apps/web/tests/unit/recipe-routes.test.tsx, apps/web/tests/e2e/recipes.spec.ts, prd-phases/01-mvp-pages/prd-01-pages-recipes.md, prd-phases/manifest.md
- **Patterns discovered**: Export multiple route components from one file (RecipeLibrary, RecipeDetail, CookingView) and import named exports in App.tsx; Playwright uses getByPlaceholder (not getByPlaceholderText); strict mode violations when text is in nested children -- use getByRole().first(); wake lock wrapped in a utility module for easy mocking in tests
- **Gotchas**: Playwright placeholder locator API differs from testing-library; mocking modules with vi.mock requires exact module path match
- **Time**: Sat Mar  7 14:39:00 UTC 2026

## Iteration 4 -- Planning pages (STG-124..STG-128)
- **Status**: Complete
- **Files changed**: apps/web/src/routes/Planning.tsx, apps/web/src/lib/socket.ts, apps/web/src/lib/api-client.ts (plans+lists), apps/web/src/App.tsx, apps/web/tests/unit/planning-routes.test.tsx, apps/web/tests/e2e/planning.spec.ts, prd-phases/01-mvp-pages/prd-01-pages-planning.md, prd-phases/manifest.md
- **Patterns discovered**: getMondayOfWeek(new Date()) date calculation must be replicated in unit test mock data or tests fail on wrong weeks -- always compute dynamic dates from the same function as the component; socket.io-client must be installed in the web package; offline E2E test uses page.context().route() to block API requests
- **Gotchas**: socket.io-client not in web deps by default -- run pnpm --filter web add socket.io-client; E2E offline test using context.route() to block requests shows graceful fallback (loading indicator)
- **Time**: Sat Mar  7 14:47:00 UTC 2026
