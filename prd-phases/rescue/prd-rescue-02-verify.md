---
task: "Foundation green gate -- register/login/me/household verified in real browser"
branch: "stg-rescue-02/verify"
test_command: "pnpm --filter api test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 8
chain_next: "rescue-03"
requires: ["rescue-01"]
parallel_safe: false
group: "rescue"
manifest_id: "rescue-02"
---

# PRD Rescue-02: Foundation Verification (Green Gate)

## Mandatory Pre-Read

1. `RESCUE_PROTOCOL.md` -- ADB and browser validation requirements
2. `CODE_REVIEW_2026-03-08.md` -- list of all fixes applied so far
3. `prd-phases/rescue/rescue-manifest.md` -- current rescue state
4. `CORRECTION_LOG.md` -- what was changed and why

**Role**: You are QA Lead. Your only job in this PRD is to VERIFY, not build.
Do not write new features. Do not refactor. Run the acceptance criteria for
rescue-00 and rescue-01, document the results, and gate the UX rebuild behind
a confirmed green state.

---

## Context for Agent

### Why This Gate Exists

rescue-00 built the schema. rescue-01 fixed auth. Before spending significant
time on the UX rebuild (rescue-04), we must confirm that the foundation actually
works end-to-end in a real browser. This is exactly the kind of verification
the original loop skipped -- marking things complete based on code existing, not
on behavior being proven.

The DoD for this gate, per RESCUE_PROTOCOL.md Section 4:

> Auth Integrity: Resolve the "Register-but-no-Login" bug. Done only when a user
> can register, log out, and log back in on a fresh incognito window.

That is the minimum bar. This PRD meets it with evidence.

### What "Green Gate" Means

ALL of the following must be true simultaneously before this PRD is marked complete:

1. `pnpm --filter @staged/db migrate` exits 0 (schema applied)
2. `pnpm --filter api type-check` exits 0 (no type errors in API)
3. `pnpm --filter web type-check` exits 0 (no type errors in web app)
4. `pnpm --filter api test` passes (unit/integration tests)
5. A new user can register via `POST /api/auth/signup` in a real browser or curl
6. The same user can sign in and receive a session cookie
7. `GET /api/auth/me` with that cookie returns `{ id, email, name, householdId, skillLevel, role }`
8. `GET /health` returns `{ status: "ok", db: "connected" }`

Items 5-7 must be proven with evidence (curl output or browser screenshots).

### If a Gate Item Fails

Do NOT hack around it. Diagnose the root cause using `/evidence-gather`.
If the fix is in scope (a bug in rescue-00/01 work), fix it here and log it.
If the fix requires significant new work, add a Discovered Task with full details
and determine whether to block rescue-04 or proceed with a known limitation noted.

### Local Environment Checklist

Before running any verification:

```bash
docker compose up -d            # PostgreSQL must be running
cp .env.example .env.local      # if .env.local doesn't exist
pnpm install                    # in case deps changed
pnpm --filter @staged/db migrate  # apply latest migrations
```

---

## Tasks

### Task 1: [x] Schema integrity check `[BD:STG-231]`

- **Type**: task
- **Do**: Run the following and capture output as evidence:

  ```bash
  pnpm --filter @staged/db migrate
  psql $DATABASE_URL -c "\dt"
  ```

  Verify the output of `\dt` includes all 15 app tables:
  `users`, `households`, `household_members`, `recipes`, `recipe_ingredients`,
  `substitutions`, `grocery_lists`, `grocery_list_items`, `meal_plans`,
  `meal_plan_entries`, `pantry`, `pantry_items`, `sync_queue`,
  `user_recipe_library`, `usda_ingredients`.

  Also verify Auth.js tables exist: `user`, `account`, `session`,
  `verification_token` (these are created by Auth.js on first boot; start the API
  briefly with `pnpm --filter api dev` if they are missing).

  Record the table list in `bd` notes for this task.

- **Verify**: migrate exits 0; all 15 app tables visible in `\dt`
- **Accept**: Schema is applied and complete

---

### Task 2: [x] Type-check all packages `[BD:STG-232]`

- **Type**: task
- **Do**: Run `pnpm type-check` from the project root (runs tsc across all packages).
  Capture the output. If errors exist, categorize them:
  - Errors in `packages/db` or `packages/types`: fix here (schema/type alignment)
  - Errors in `apps/api`: log as Discovered Task unless trivial to fix
  - Errors in `apps/web`: log as Discovered Task (web types will be cleaned up in rescue-04)

  The hard requirement: `apps/api` and `packages/db` and `packages/types` must
  be type-error free. Web app errors are acceptable at this gate since rescue-04
  is doing a ground-up rebuild anyway.

- **Verify**: `pnpm --filter api type-check && pnpm --filter @staged/db type-check && pnpm --filter @staged/types type-check` all exit 0
- **Accept**: API, db, and types packages pass type-check

---

### Task 3: [x] Auth unit test suite `[BD:STG-233]`

- **Type**: task
- **Do**: Run `pnpm --filter api test -- auth` to execute the auth test suite
  written in rescue-01 Task 6. Capture the output. All 7 test cases must pass.

  If tests fail:
  1. Read the failure output carefully
  2. Determine if it's a test setup issue or a real auth bug
  3. Fix bugs in the auth layer; do not soften test assertions to make them pass

  If the `/api/auth/signin` test fails with a 404 or 302: confirm Auth.js is
  initialized before the custom authRouter. Check `apps/api/src/index.ts` for
  middleware registration order -- `initAuth()` must be applied as `app.use('*', ...)`
  BEFORE routes are registered.

- **Verify**: `pnpm --filter api test -- auth-routes` exits 0 with all tests passing
- **Accept**: All 7 auth test cases green

---

### Task 4: [x] Health endpoint check `[BD:STG-234]`

- **Type**: task
- **Do**: Start the API server (`pnpm --filter api dev`) and verify:
  ```bash
  curl http://localhost:3000/health
  # Expected: {"status":"ok","db":"connected","uptime":...}
  ```
  If `db: "error"`, the shared pool in `lib/db.ts` is not connecting. Check:
  - Is Docker Compose PostgreSQL running? (`docker ps`)
  - Is `DATABASE_URL` in `.env.local` correct?
  - Are there any pool connection errors in the API server console?
- **Verify**: `{"status":"ok","db":"connected"}` returned
- **Accept**: Health endpoint confirms DB connectivity

---

### Task 5: [x] End-to-end auth flow in a real browser `[BD:STG-235]`

- **Type**: task (RESCUE_PROTOCOL.md browser validation requirement)
- **Do**: With both API (`pnpm --filter api dev`) and web (`pnpm --filter web dev`)
  running, execute the following flow manually or via the browser automation tools
  (mcp**claude-in-chrome**\*):

  **Flow A -- Registration**:
  1. Open http://localhost:5173 in an incognito window
  2. Navigate to the signup/registration UI (or use curl if UI isn't built yet)
  3. Register with email: `verify-test@staged.test`, password: `testpass1234`, name: `Verify Test`
  4. Confirm: 201 response (or success UI state), row exists in `users` table

  **Flow B -- Sign out and sign back in**: 5. Sign out (clear cookies / close incognito / call signout endpoint) 6. Open a NEW incognito window 7. Navigate to login 8. Sign in with the same credentials 9. Call `GET /api/auth/me` -- confirm `{ id, email, name, householdId }` returned 10. Confirm `householdId` is null (no household assigned yet -- correct)

  If the web UI login page is not functional yet (rescue-04 hasn't run), use curl
  for the auth flow and document that web UI verification is deferred to rescue-04.
  The API-level auth MUST be verified regardless.

  Record evidence: copy curl output or take a screenshot of the browser network tab
  showing the `/me` response. Append to bd notes for this task.

- **Verify**: User can register, sign out, and sign back in on a fresh incognito window (per RESCUE_PROTOCOL.md Section 4)
- **Accept**: Full round-trip auth confirmed with evidence

---

### Task 6: [x] Seed fixtures verification `[BD:STG-236]`

- **Type**: task
- **Do**: Run the seed script and verify the data:
  ```bash
  pnpm --filter @staged/db seed
  psql $DATABASE_URL -c "SELECT id, email, display_name, household_id FROM users LIMIT 5;"
  psql $DATABASE_URL -c "SELECT id, name, invite_code FROM households;"
  psql $DATABASE_URL -c "SELECT id, title FROM recipes;"
  ```
  All seed data from the fixtures file should be present. If the seed throws an
  FK violation, check that households are inserted before users (the seed should
  handle ordering already, but verify).
- **Verify**: Seed data present; all fixture IDs match constants in `packages/db/src/seeds/fixtures.ts`
- **Accept**: Deterministic test data available for downstream E2E tests

---

### Task 7: [x] Document gate status and update manifest `[BD:STG-237]`

- **Type**: chore
- **Do**:
  1. Append to `CORRECTION_LOG.md`:
     ```
     | Foundation Green Gate | Unverified (all prior PRDs marked complete without testing) | Verified | All 5 gate criteria confirmed: migrate, type-check, auth tests, health, browser flow | All personas | See rescue-02 task notes in bd for evidence |
     ```
  2. If any gate item failed and was fixed here, add a row for each fix.
  3. If any gate item failed and was left as a Discovered Task (deferred), note it
     here with "Status: Blocked -- see Discovered Tasks in rescue-02".
  4. Update `prd-phases/rescue/rescue-manifest.md`: mark `rescue-02` complete,
     progress = `3 / 5 rescue PRDs complete`. Note that rescue-03 and rescue-04
     are now both unblocked and may run in parallel.
- **Files**: `CORRECTION_LOG.md`, `prd-phases/rescue/rescue-manifest.md`
- **Verify**: Manifest shows rescue-02 complete; rescue-03 and rescue-04 unblocked
- **Accept**: Gate is formally documented; UX rebuild may proceed

---

## Discovered Tasks

_None yet._

---

## Gate Summary Template

Copy this into bd notes when completing Task 7:

```
FOUNDATION GREEN GATE -- rescue-02
Date: [YYYY-MM-DD]

[x] pnpm --filter @staged/db migrate -- exits 0
[x] pnpm --filter api type-check -- exits 0
[x] pnpm --filter @staged/types type-check -- exits 0
[x] pnpm --filter api test -- auth-routes -- all passing
[x] GET /health -- {"status":"ok","db":"connected"}
[x] Register new user -- 201 response, row in users table
[x] Sign in (fresh incognito) -- session cookie received
[x] GET /me with session -- returns { id, email, householdId }

KNOWN LIMITATIONS AT GATE:
- apps/web type-check: [N errors deferred to rescue-04]
- [any other deferred items]

VERDICT: GREEN / CONDITIONAL (circle one)
```
