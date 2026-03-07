---
task: "MVP auth API -- NextAuth (Auth.js) routes, JWT sessions, guest access, and invite-aware identity flows"
branch: "stg-01-api-auth/auth-api"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "01-api-recipes"
requires: ["01-data-schema"]
parallel_safe: false
group: 1
manifest_id: "01-api-auth"
---

# PRD: MVP Auth API

## Context for Agent

### What This PRD Does

Implements the authentication and identity flows the MVP depends on: sign up, sign in (email/password + Google OAuth), sign out, JWT session lookup, guest sessions, and household-invite-aware auth handoff. This PRD turns the NextAuth (Auth.js v5) foundation from prd-00d into a fully functional auth API surface with a working Credentials provider, app-level user profile linking, and guest identity management.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00d | NextAuth (Auth.js) wiring via @hono/auth-js, Drizzle adapter, /api/auth/* routes mounted | `apps/api/src/lib/auth.ts`, `apps/api/src/index.ts`, `packages/db/src/` |
| 00e | Auth route skeleton and session middleware | `apps/api/src/routes/auth.ts`, `apps/api/src/middleware/auth.ts` |
| 01-data-schema | Finalized user and household schema | `packages/db/src/schema/` |

### Key Files to Read First

- `apps/api/src/lib/auth.ts` -- Auth.js config from prd-00d (authConfig, getSession)
- `apps/api/src/index.ts` -- where /api/auth/* is mounted and initAuthConfig is applied
- `apps/api/src/routes/auth.ts` -- route skeleton to be fleshed out here
- `apps/api/src/middleware/auth.ts` -- session middleware stub
- `packages/db/src/schema/users.ts` -- app-level user profile (distinct from Auth.js identity table)

### Patterns to Follow

- Auth.js handles `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session` automatically via `authHandler()` -- do not re-implement these
- App-level routes (profile, guest session, invite redemption) live in `apps/api/src/routes/auth.ts` and delegate to `apps/api/src/services/auth-service.ts`
- Session lookup in middleware: `const session = await getSession(c.req.raw, authConfig)` -- never parse JWT manually
- Guest sessions: issue a short-lived JWT with `role: "guest"` and a generated `guestId`; store no PII; expire after 7 days
- Route handlers stay thin -- all logic in services; Hono handlers orchestrate only
- Do not use `any` types; session shape is typed via `next-auth` module augmentation in `packages/types/src/auth.d.ts`

### Skills and Commands

| Action | Command |
|--------|---------|
| Run API tests | `pnpm --filter api test` |
| Type check | `pnpm --filter api type-check` |
| Start API dev server | `pnpm --filter api dev` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

This PRD uses **Build-then-Verify**: implement everything completely, then write and run tests once.

1. Build all auth services and routes before running any tests
2. Keep Auth.js-specific internals isolated behind `apps/api/src/lib/auth.ts` -- app code only calls `getSession`, `signIn`, `signOut`, and the auth-service functions
3. Preserve guest and invite flows even if email sending remains stubbed
4. If Google OAuth credentials are not yet available, set `GOOGLE_CLIENT_ID=stub` and `GOOGLE_CLIENT_SECRET=stub` -- the provider registration will succeed and fail gracefully at runtime
5. If a test fails after the verify phase, fix the implementation bug; do not rewrite the test to match broken behavior

---

## Tasks

--- BUILD PHASE -- implement everything before running tests ---

- [x] **Task 1: Wire Credentials provider and app-level user linking** `[BD:STG-281]`
  - **Type**: feature
  - **Do**: Complete the Auth.js `Credentials` provider `authorize` function in `apps/api/src/lib/auth.ts`. It should: look up the user by email in the Auth.js `users` table, verify the password hash (use `bcryptjs`), and return the Auth.js user object on success or `null` on failure. Add a `callbacks.signIn` callback that creates the app-level profile row in `packages/db/src/schema/users.ts` if one does not already exist for the authenticated user (set `skillLevel: "beginner"`, `dietaryProfile: {}`, `householdId: null` as defaults). Add `callbacks.jwt` and `callbacks.session` to embed `userId` and `role` into the JWT payload and session object. Augment the NextAuth session type in `packages/types/src/auth.d.ts` so `session.user.id` and `session.user.role` are typed.
  - **Files**: `apps/api/src/lib/auth.ts`, `packages/types/src/auth.d.ts`
  - **Accept**: Credentials provider authorize function complete; session callbacks embed userId and role; TypeScript types are clean

- [x] **Task 2: Implement auth service and app-level routes** `[BD:STG-282]`
  - **Type**: feature
  - **Do**: Create `apps/api/src/services/auth-service.ts` with the following exports:
    - `getSessionUser(req: Request): Promise<SessionUser | null>` -- calls `getSession(req, authConfig)` and returns the typed user or null
    - `createGuestSession(): Promise<{ token: string; guestId: string }>` -- generates a UUID `guestId`, signs a short-lived JWT (7 days, `role: "guest"`) using `NEXTAUTH_SECRET`, returns both; does NOT write to DB
    - `redeemInvite(inviteCode: string, userId: string): Promise<void>` -- looks up the household by `inviteCode` in the DB, adds the user as a member with `role: "member"`, updates `users.householdId`
    - In `apps/api/src/routes/auth.ts`, add these app-level routes (Auth.js already handles `/api/auth/*` automatically):
      - `GET /api/auth/me` -- returns session user + app profile (join Auth.js session with `users` table); returns 401 if no session
      - `POST /api/auth/guest` -- calls `createGuestSession()`, returns `{ token, guestId }`
      - `POST /api/auth/invite/:code` -- calls `redeemInvite()`, returns 200 on success or 404 if invite not found
    - Update `apps/api/src/middleware/auth.ts` to export `requireAuth` (rejects if no session) and `optionalAuth` (attaches session if present, continues either way)
  - **Files**: `apps/api/src/services/auth-service.ts`, `apps/api/src/routes/auth.ts`, `apps/api/src/middleware/auth.ts`
  - **Accept**: All three app-level routes implemented; middleware helpers exported; auth-service functions complete

- [x] **Task 3: Implement sign-up route and password hashing** `[BD:STG-283]`
  - **Type**: feature
  - **Do**: Auth.js Credentials provider handles sign-in but not sign-up natively. Add `POST /api/auth/signup` to `apps/api/src/routes/auth.ts` that: validates `{ email, password, displayName }` with Zod (password min 8 chars), checks the email is not already registered, hashes the password with `bcryptjs` (rounds: 12), inserts into the Auth.js `users` table and the app-level `users` table in a transaction, and returns `{ message: "Account created" }` with 201. On duplicate email return 409. This route is separate from `/api/auth/*` because Auth.js does not provide a sign-up endpoint for Credentials.
  - **Files**: `apps/api/src/routes/auth.ts`, `apps/api/src/services/auth-service.ts`
  - **Accept**: Sign-up route creates both the Auth.js user record and the app profile row; duplicate email returns 409

--- VERIFY PHASE -- implementation is complete; now write and run tests once ---

- [x] **Task 4: Write and run auth verification tests** `[BD:STG-284]`
  - **Type**: task
  - **Do**: Write real HTTP integration tests against the mounted Hono app (no mocks for DB or auth). Cover:
    - `POST /api/auth/signup` -- success (201 + user in DB), duplicate email (409), weak password (400)
    - `POST /api/auth/signin` via Auth.js Credentials (sign in with valid credentials, assert session JWT returned)
    - `GET /api/auth/me` -- with valid session (200 + user object), without session (401)
    - `POST /api/auth/guest` -- returns token + guestId; token is a valid JWT with `role: "guest"`
    - `POST /api/auth/invite/:code` -- valid invite links user to household; invalid code returns 404
    - `requireAuth` middleware blocks unauthenticated requests to a protected stub route
    Run `pnpm --filter api test` once. Fix any genuine implementation bugs found. Do not rewrite tests to match broken behavior.
  - **Files**: `apps/api/tests/auth/auth-routes.test.ts`, `apps/api/tests/auth/fixtures.ts`
  - **Verify**: `pnpm --filter api test -- auth` exits 0
  - **Accept**: All auth flows proven at the HTTP integration level; test suite green

- [x] **Task 5: Type-check and clean up auth boundaries** `[BD:STG-285]`
  - **Type**: task
  - **Do**: Run `pnpm --filter api type-check`. Fix any TypeScript errors in auth-related files. Ensure `session.user.id` and `session.user.role` are available without casting throughout the codebase. Confirm no business logic has leaked into route handlers (services only). Confirm no `any` types in auth files.
  - **Files**: `apps/api/src/lib/auth.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/services/auth-service.ts`, `packages/types/src/auth.d.ts`
  - **Verify**: `pnpm --filter api type-check` exits 0
  - **Accept**: Types clean; auth primitives reusable; handlers thin

- [x] **Task 6: Update manifest** `[BD:STG-286]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-api-auth`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-api-auth`, progress = `11 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-api-auth" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and recipes/households/onboarding can proceed

---

## Discovered Tasks

_None yet._
