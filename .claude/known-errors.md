# Known Errors & Gotchas

Accumulated from real sessions. Each entry has a trigger, the fix, and the context it came from.

---

## ENV / TOOLING

### check-branch.sh hook blocks all writes on main

- **Symptom**: Every file write or edit is rejected immediately with a hook error
- **Cause**: A pre-tool hook runs `check-branch.sh` which aborts on the `main` branch
- **Fix**: Create a feature branch first before touching any file: `git checkout -b stg-xxx/description`
- **Context**: Rescue-00 iteration -- first write attempt on main was rejected

### dotenv-cli does NOT override shell-set environment variables

- **Symptom**: `dotenv -e .env.local -- tsx script.ts` uses the wrong DATABASE_URL
- **Cause**: Shell-exported vars take precedence over dotenv-cli loaded vars
- **Fix**: Unset the shell var first (`unset DATABASE_URL`) or use `dotenv -e .env.local --override -- tsx script.ts`
- **Context**: Rescue-00 migration testing

### Vitest test filtering uses positional args, not --testPathPattern

- **Symptom**: `pnpm test -- --testPathPattern=auth-routes` silently runs all tests
- **Fix**: `pnpm test auth-routes` (positional pattern after `--`) or `pnpm test -- auth-routes`
- **Context**: Rescue-01 auth test run

### pnpm workspace: @staged/db not resolvable by Vitest

- **Symptom**: `Cannot find module '@staged/db'` in test files inside apps/api/tests/
- **Cause**: Vitest resolves workspace packages from `dist/` by default; @staged/db has no build step
- **Fix**: In test files use relative imports (`../../packages/db/src`) OR configure vitest aliases in `vitest.config.ts`:
  ```ts
  resolve: { alias: { '@staged/db': path.resolve(__dirname, '../../packages/db/src') } }
  ```
  Alternatively, omit schema from `drizzle()` in `lib/db.ts` so tests don't need the schema import
- **Context**: Rescue-01 -- vitest couldn't load db.ts which imported @staged/db

---

## DATABASE / DRIZZLE

### drizzle.config.ts missing dbCredentials causes silent abort

- **Symptom**: `pnpm --filter @staged/db generate` exits 0 but produces no migration; `migrate` aborts
- **Fix**: Add `dbCredentials: { url: process.env.DATABASE_URL ?? 'postgresql://...' }` to the config
- **Context**: Rescue-00 SCHEMA-003

### Pre-existing Postgres tables break drizzle-kit generate (hash mismatch)

- **Symptom**: `drizzle-kit migrate` fails with "migration already applied" or hash conflict
- **Cause**: Tables created by Auth.js or raw SQL before Drizzle don't have entries in `drizzle.__drizzle_migrations`
- **Fix**: Either drop and recreate the DB, or manually insert the migration hash:
  ```sql
  INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
  VALUES ('<hash-from-migration-file>', extract(epoch from now())::bigint * 1000);
  ```
- **Context**: Rescue-00 -- Auth.js bootstrapped tables before Drizzle took ownership

### households.created_by is NOT NULL -- test fixtures must provide a UUID

- **Symptom**: `INSERT INTO households` fails FK or NOT NULL constraint in test setup
- **Cause**: `created_by` column is `NOT NULL` in the households table
- **Fix**: Always seed a user UUID first (or use a hardcoded constant) before inserting a household in tests
- **Context**: Rescue-01 auth smoke tests

### hashed_password column may not exist on pre-migration users table

- **Symptom**: `column "hashed_password" does not exist` at signup
- **Cause**: The `users` table existed before rescue-00 schema migration ran; ALTER TABLE not applied
- **Fix**: Run `ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password text;` before the Drizzle migration, or drop and recreate
- **Context**: Rescue-00/01 handoff -- Drizzle migration generates CREATE TABLE but pre-existing table needs ALTER

### Type conflicts: DB-derived types vs hand-written types in packages/types

- **Symptom**: `Duplicate identifier 'Recipe'` or type mismatch errors after adding `db-types.ts`
- **Cause**: `packages/types/src/*.ts` has manually written interfaces; `db-types.ts` adds `InferSelectModel` derivations with same names
- **Fix**: Prefix DB-derived types with `DB` (e.g., `DBUser`, `DBRecipe`) or alias: `export type DBUser = InferSelectModel<typeof users>`. Do NOT delete existing manual types until rescue-04 rebuilds all consumers
- **Context**: Rescue-00 Task 10

---

## AUTH.JS

### Auth.js JWT uses token.sub for user ID, never token.user

- **Symptom**: `getSessionUser` always returns null; all authenticated routes return 401
- **Cause**: The prior code read `token.user` which Auth.js never sets. Auth.js always sets `token.sub` = user id
- **Fix**: `const id = (token.userId as string) ?? (token.sub as string);`
- **Context**: Rescue-01 AUTH-001 -- the original bug that triggered the rescue

### Auth.js DrizzleAdapter account table has no password column

- **Symptom**: `INSERT INTO account` throws `column "password" does not exist`
- **Cause**: Auth.js's DrizzleAdapter schema for `account` has no password field; it's designed for OAuth only
- **Fix**: Store `hashedPassword` on OUR `users` table (which we control), not in `account`. Look up via `SELECT hashed_password FROM users WHERE email = $1` in the `authorize` callback
- **Context**: Rescue-01 AUTH-002

### Auth.js session callback requires `any` types due to union complexity

- **Symptom**: TypeScript error in `callbacks.session` when trying to add custom fields
- **Cause**: `@auth/core` session/token types are complex unions that don't easily accept custom properties
- **Fix**: Cast as `any` in the session callback and add a `// TODO: proper types` comment. This is Auth.js's own limitation
- **Context**: Rescue-01

### DrizzleAdapter does not require schema arg

- **Symptom**: `DrizzleAdapter(db, { schema })` causes type errors or import resolution issues
- **Fix**: `DrizzleAdapter(db)` is sufficient -- the adapter auto-discovers its own Auth.js tables
- **Context**: Rescue-01 auth.ts refactor

---

## TESTING PATTERNS

### Vitest integration tests that need a live DB should be skippable

- **Pattern**: Wrap tests that require DATABASE_URL with:
  ```ts
  const skipIfNoDb = !process.env.DATABASE_URL ? test.skip : test;
  ```
  Or use `describe.skipIf(!process.env.DATABASE_URL)(...)` at the suite level
- **Context**: Auth smoke tests in rescue-01

### Auth-dependent route tests must skip until auth is functional

- **Pattern**: Mark tests blocked by auth with `// RESCUE-01: skip until getSessionUser is fixed`
  ```ts
  test.skip('requires auth fix (RESCUE-01)', ...)
  ```
  Then unskip in the same PR that fixes auth
- **Context**: Rescue-00 -- integration tests for households, events, auth routes were all failing due to AUTH-001

### Route tests against Hono app: always include x-test-user-id header

- **Symptom**: All requests to auth-protected routes return 401 in tests
- **Fix**: Include `'x-test-user-id': 'some-uuid'` header on all requests in route tests. The `requireAuth` middleware reads this header to bypass JWT validation in test mode
- **Context**: Multiple iterations -- potluck, household-ops, auth routes

---

## MONOREPO / BUILD

### pnpm workspace overrides needed for drizzle-orm version consistency

- **Symptom**: `Cannot use import statement` or version mismatch errors between drizzle-orm in db package and api package
- **Fix**: Add to root `package.json`:
  ```json
  "pnpm": { "overrides": { "drizzle-orm": "^0.30.0" } }
  ```
- **Context**: Rescue-00 -- packages/db and apps/api had different drizzle-orm resolutions

### Source path alias avoids needing built dist for cross-package imports in tests

- **Pattern**: In `tsconfig.json` for apps/api, use:
  ```json
  "paths": { "@staged/db": ["../../packages/db/src/index.ts"] }
  ```
  This resolves to source TypeScript, not `dist/`, which avoids needing a build step during tests
- **Context**: Rescue-00/01 -- @staged/db has no build step, only source

### db.ts shared module must NOT import schema from @staged/db during Vitest runs

- **Symptom**: Vitest fails to load `apps/api/src/lib/db.ts` because it imports `@staged/db`
- **Fix**: Keep `lib/db.ts` schema-free for now. Export only `pool` and `query`. Add schema to drizzle in rescue-03 when path aliases are confirmed working
- **Context**: Rescue-01 -- adding schema import broke all vitest runs in the api package
