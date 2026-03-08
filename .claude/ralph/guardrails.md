# Guardrails

## Sign: Zustand localStorage injection for E2E tests

- **Trigger**: When setting Zustand persist store state in Playwright E2E tests
- **Instruction**: Use `page.addInitScript()` to set localStorage BEFORE `page.goto()`. Never use `page.evaluate()` to set state that Zustand reads at mount time -- the store is already hydrated and won't react to post-mount localStorage changes. Pattern: `await page.addInitScript((val) => localStorage.setItem(key, JSON.stringify(val)), storeValue)` then `await page.goto(...)`.
- **Context**: Iteration 6 -- setOnboardingComplete used page.evaluate which couldn't update already-mounted Zustand stores.

## Sign: Component testids must cover ALL render states

- **Trigger**: When testing a React component that conditionally renders different JSX (loading/error/success states)
- **Instruction**: Ensure `data-testid` is present on the outermost element in EVERY conditional return path (loading, error, empty, success). If testid is only on the success state, tests without a live API will fail to find it.
- **Context**: Iteration 6 -- RecipeDetail only had data-testid="recipe-detail" on the success path; loading and error states had plain divs.

## Sign: Tailwind CSS not wired in web app

- **Trigger**: When building any UI feature or checking CSS styling in the browser
- **Instruction**: Verify that `apps/web/src/index.css` exists with `@import "tailwindcss"`, that `main.tsx` imports it, and that `vite.config.ts` includes `tailwindcss()` from `@tailwindcss/vite`. If any of these are missing, fix them before continuing UI work.
- **Context**: Iteration 5 -- Tailwind was installed but never wired into the app; all class names rendered as unstyled HTML until fixed.

## Sign: Missing auth header in route tests causes 401

- **Trigger**: When writing backend route tests against the Hono `app` instance using optionalAuth
- **Instruction**: Always include an `x-test-user-id` header (or appropriate auth credentials) on requests to avoid unauthorized errors. This is required even if the request body isn't user-specific.
- **Context**: Iteration 10 -- potluck route tests failed until header was added to create/claim calls.

## Sign: check-branch.sh hook blocks all edits on main

- **Trigger**: Any file write, edit, or create attempted while on the `main` branch
- **Instruction**: Run `git checkout -b stg-xxx/description` BEFORE touching any file. The hook runs on every tool use and will abort the entire action if you are on main. This is not a permissions error -- it is a project guardrail.
- **Context**: Rescue-00 -- first write blocked; wasted one tool call diagnosing it.

## Sign: @staged/db workspace package unresolvable in Vitest

- **Trigger**: When running `pnpm --filter api test` and tests import anything that transitively imports `@staged/db`
- **Instruction**: Do NOT import `@staged/db` in `apps/api/src/lib/db.ts` or any file loaded by tests. Add a path alias in `apps/api/vitest.config.ts` pointing `@staged/db` to `../../packages/db/src/index.ts`, OR keep `lib/db.ts` schema-free (export only `pool` and `query`). The schema import can be deferred until rescue-03 when aliases are confirmed.
- **Context**: Rescue-01 -- all api tests failed after db.ts imported @staged/db schema.

## Sign: Auth.js JWT shape -- token.sub not token.user

- **Trigger**: Any time you write or review `getSessionUser` or JWT-reading code
- **Instruction**: Auth.js ALWAYS sets `token.sub` = user id. `token.user` is NEVER set by Auth.js. The correct read is: `const id = (token.userId as string) ?? (token.sub as string)`. If you see `token.user`, that is the AUTH-001 bug -- fix it.
- **Context**: Rescue-01 AUTH-001 -- root cause of "Register-but-no-Login" bug.

## Sign: Drizzle migration hash conflict with pre-existing tables

- **Trigger**: When `drizzle-kit migrate` fails with hash conflict or "already applied" on a DB that had tables before Drizzle was introduced
- **Instruction**: The tables may exist but Drizzle has no record of them. Options: (1) drop and recreate the DB with `docker compose down -v && docker compose up -d`, then migrate fresh; (2) manually insert the migration hash into `drizzle.__drizzle_migrations`. Option 1 is safer in dev. Never option 1 in prod.
- **Context**: Rescue-00 -- Auth.js had already created tables before Drizzle schema was written.

## Sign: rescue-02 is verification-only -- no new features

- **Trigger**: When executing prd-rescue-02-verify.md tasks
- **Instruction**: Your role is QA Lead. Run commands, capture output, document results. Do NOT refactor, fix unrelated issues, or add features. If a gate item fails, diagnose and fix only the specific failing bug -- then document it. Large new work goes in a Discovered Task.
- **Context**: rescue-02 PRD mandate -- prior loops marked things complete without verifying.
