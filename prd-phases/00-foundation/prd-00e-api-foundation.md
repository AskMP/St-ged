---
task: "API foundation -- Hono routes, Socket.io setup, env validation, route skeleton"
branch: "stg-00e/api-foundation"
test_command: "pnpm --filter api test"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "00g"
requires: ["00d"]
parallel_safe: false
group: 0
manifest_id: "00e"
---

# PRD: API Foundation

## Context for Agent

### What This PRD Does

Completes the Hono API server foundation: typed environment validation (Zod), Socket.io setup with per-household rooms, route skeleton for all MVP endpoints, CORS/rate-limiting middleware, and a working `/health` endpoint with DB connectivity check. At the end of this PRD, the API structure is complete and all routes return 501 Not Implemented stubs.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00b | Hono skeleton with `/health` endpoint | `apps/api/src/index.ts` |
| 00d | DB schema, Better Auth, db client | `packages/db/src/`, `apps/api/src/lib/auth.ts` |

### Key Files to Read First

- `CLAUDE.md` -- API structure, coding conventions, Socket.io event types
- `apps/api/src/index.ts` -- current skeleton
- `apps/api/src/lib/auth.ts` -- Better Auth setup

### Patterns to Follow

```typescript
// apps/api/src/lib/env.ts -- Zod env validation
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-'),
  INSTACART_IDP_AFFILIATE_ID: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
})

export const env = envSchema.parse(process.env)
```

```typescript
// Socket.io room pattern (per-household)
// Room name: `household:${householdId}`
// Mutations broadcast to room; sender included (idempotent on client)
io.on('connection', (socket) => {
  socket.on('household:join', (householdId: string) => {
    socket.join(`household:${householdId}`)
  })
  // Broadcast from server after mutation validated:
  // io.to(`household:${householdId}`).emit('list:item:add', { item })
})
```

```typescript
// Hono route pattern with auth middleware
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'

const recipesRouter = new Hono()
  .use('*', requireAuth)
  .get('/', async (c) => {
    // TODO: implement in prd-01-api-recipes
    throw new HTTPException(501, { message: 'Not implemented' })
  })

export default recipesRouter
```

### Skills and Commands

| Action | Command |
|--------|---------|
| Start API dev | `pnpm --filter api dev` |
| Run API tests | `pnpm --filter api test` |
| Type check API | `pnpm --filter api type-check` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Implement typed env validation** `[BD:STG-26]`
  - **Type**: task
  - **Do**: Replace the stub `apps/api/src/lib/env.ts` with the full Zod implementation shown in the patterns above. Import `env` at the top of `apps/api/src/index.ts` to trigger validation on startup -- if any required env var is missing, the process exits with a descriptive error. Add all required env vars to `.env.example` with placeholder values.
  - **Files**: `apps/api/src/lib/env.ts`, `apps/api/src/index.ts`, `.env.example`
  - **Verify**: Starting the API with a missing `DATABASE_URL` prints a clear Zod error and exits non-zero
  - **Accept**: Env validation runs on startup; all required vars documented in `.env.example`

- [ ] **Task 2: Set up Socket.io with household rooms** `[BD:STG-27]`
  - **Type**: task
  - **Do**: Create `apps/api/src/lib/socket.ts` that: creates a Socket.io Server instance, attaches it to the Node.js HTTP server (not Hono directly -- use `@hono/node-server` to get the underlying http.Server), configures CORS to allow the web app origin, defines the `household:join` event handler (socket joins the room `household:${householdId}`), defines the `household:leave` event (socket leaves the room), exports the `io` instance for use in route handlers (to broadcast mutations). Create `packages/types/src/events.ts` with `ServerToClientEvents` and `ClientToServerEvents` interfaces covering: `list:item:add`, `list:item:check`, `list:item:remove`, `plan:recipe:assign`, `plan:recipe:remove` -- each with a typed payload.
  - **Files**: `apps/api/src/lib/socket.ts`, `apps/api/src/index.ts` (wire up Socket.io), `packages/types/src/events.ts`
  - **Verify**: API starts; connecting a Socket.io client emitting `household:join` with a UUID joins the room without error
  - **Accept**: Socket.io server running; per-household rooms functional; event types defined

- [ ] **Task 3: Add CORS and rate-limit middleware** `[BD:STG-28]`
  - **Type**: task
  - **Do**: Create `apps/api/src/middleware/cors.ts` using Hono's built-in `cors` middleware. Allow origin `http://localhost:5173` in development and the Vercel deployment URL (from env var `WEB_URL`) in production. Create `apps/api/src/middleware/rateLimit.ts` using a simple in-memory rate limiter (100 requests per minute per IP; return 429 if exceeded). Create `apps/api/src/middleware/auth.ts` with a `requireAuth` middleware that validates the Better Auth session cookie and adds the user to Hono's context (`c.set('user', user)`). Wire all three middleware to the Hono app in `src/index.ts`.
  - **Files**: `apps/api/src/middleware/cors.ts`, `apps/api/src/middleware/rateLimit.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/index.ts`
  - **Verify**: `curl http://localhost:3000/health` returns 200; CORS headers present on response
  - **Accept**: CORS, rate-limit, and auth middleware mounted; health endpoint still returns 200

- [ ] **Task 4: Create route skeleton (all MVP routes return 501)** `[BD:STG-29]`
  - **Type**: task
  - **Do**: Create the following router files in `apps/api/src/routes/`, each with the correct Hono router setup and all endpoints stubbed to throw `HTTPException(501, { message: 'Not implemented' })`:
    - `auth.ts`: POST `/auth/sign-up`, POST `/auth/sign-in`, POST `/auth/sign-out`, POST `/auth/magic-link`, GET `/auth/me`, POST `/auth/guest`
    - `recipes.ts`: GET `/recipes`, GET `/recipes/:id`, POST `/recipes` (create), POST `/recipes/import` (URL import), DELETE `/recipes/:id`
    - `households.ts`: POST `/households`, GET `/households/:id`, POST `/households/:id/invite`, POST `/households/join/:code`
    - `lists.ts`: GET `/households/:id/lists`, POST `/households/:id/lists`, GET `/lists/:id`, POST `/lists/:id/items`, PATCH `/lists/:id/items/:itemId`, DELETE `/lists/:id/items/:itemId`
    - `plans.ts`: GET `/households/:id/plans/week`, POST `/plans/:id/entries`, DELETE `/plans/:id/entries/:entryId`
    - `pantry.ts`: GET `/households/:id/pantry`, POST `/households/:id/pantry/items`, DELETE `/pantry/items/:itemId`
    - `fulfillment.ts`: POST `/fulfillment/instacart-link`, GET `/fulfillment/redirect/:token`
    Mount all routers in `src/index.ts` under the `/api` prefix.
  - **Files**: All files in `apps/api/src/routes/`, `apps/api/src/index.ts`
  - **Verify**: `curl http://localhost:3000/api/recipes` returns 501 JSON; `pnpm --filter api type-check` passes
  - **Accept**: All routes mounted; all return 501; TypeScript clean

- [ ] **Task 5: Enhance /health endpoint with DB check** `[BD:STG-30]`
  - **Type**: task
  - **Do**: Update the GET `/health` handler in `apps/api/src/index.ts` to: query the DB with `SELECT 1` using the db pool, return `{status: "ok", db: "connected", uptime: process.uptime()}` on success, or `{status: "degraded", db: "error", error: err.message}` with 503 status on failure.
  - **Files**: `apps/api/src/index.ts`
  - **Verify**: `curl http://localhost:3000/health` returns `{status: "ok", db: "connected", ...}` when local DB is running
  - **Accept**: Health endpoint reports DB connectivity; returns 503 when DB is down

- [ ] **Task 6: Write API foundation tests** `[BD:STG-31]`
  - **Type**: task
  - **Do**: Create `apps/api/tests/health.test.ts` using Vitest that tests the health endpoint: (1) returns 200 with `{status: "ok"}` when DB is available; (2) returns 503 when DB connection fails (mock the pool query to reject). Create `apps/api/tests/middleware/cors.test.ts` that verifies CORS headers are present on responses.
  - **Files**: `apps/api/tests/health.test.ts`, `apps/api/tests/middleware/cors.test.ts`
  - **Verify**: `pnpm --filter api test` passes all tests
  - **Accept**: 2+ API tests passing; test coverage baseline established

- [ ] **Task 7: Update manifest** `[BD:STG-32]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00e`. Change `status: pending` to `status: complete`. Update Current State accordingly. Confirm `00g` (requires 00e) is now unblocked.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00e" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated; 00g unblocked

---

## Discovered Tasks

_None yet._
