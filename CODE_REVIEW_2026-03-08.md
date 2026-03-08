# Code Review Audit -- Foundation Layer

**Date**: 2026-03-08
**Scope**: PRD 00d (Database) + PRD 01-data-schema (MVP Schema)
**Auditor**: Lead Architect (Zero-Redundancy Audit)
**Status**: RED -- Foundation is non-functional

---

## Executive Summary

The manifest claims 33/38 PRDs "complete." The Foundation layer is **not complete**. The Drizzle schema
is an empty placeholder. No migrations exist. The database contract that every API route, service, and
UI feature depends on was never written. The application runs against tables that exist only because Auth.js
bootstrapped them at runtime -- not because the schema layer owns them.

**Net result**: Every PRD after 00d is built on sand.

---

## Findings

### Group 0 -- Foundation (PRDs 00d + 00e)

#### `[block]` SCHEMA-001 -- Drizzle schema is an empty placeholder

**File**: `packages/db/src/schema/index.ts`

```
// Database schema - see prd-01-data-schema
// Placeholder - full schema to be added in prd-01-data-schema
```

Not a single Drizzle table definition exists. PRD 00d Task 2 specifies 14 tables. None are implemented.
`packages/db/src/` contains only: `schema/index.ts` (placeholder), `index.ts` (3-line boilerplate),
`queries/recipes.ts` (stubs), and `migrations/.gitkeep`.

**Impact**: `pnpm --filter @staged/db generate` will emit an empty migration. `pnpm --filter api type-check`
will fail on any route that tries to use Drizzle schema types, because there are none to export.

---

#### `[block]` SCHEMA-002 -- No migrations exist

**File**: `packages/db/src/migrations/.gitkeep`

The migrations directory contains only a `.gitkeep`. PRD 00d Task 3 requires that migrations be run and
tables verified. This task was never executed.

**Impact**: Any new developer (`docker compose up -d && pnpm --filter @staged/db migrate`) gets an empty
database. The application cannot function against a fresh environment.

---

#### `[block]` SCHEMA-003 -- `drizzle.config.ts` missing `dbCredentials`

**File**: `packages/db/drizzle.config.ts`

```typescript
export default {
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
} satisfies Config;
```

No `dbCredentials` or `url` field. `drizzle-kit generate` will work (schema introspection only), but
`drizzle-kit migrate` / `drizzle-kit push` will throw `"missing db credentials"` and abort.

---

#### `[block]` AUTH-001 -- `getSessionUser` always returns null (login permanently broken)

**File**: `apps/api/src/services/auth-service.ts:12-16`

```typescript
export async function getSessionUser(
  req: Request,
): Promise<SessionUser | null> {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token || !token.user) return null; // <-- token.user is NEVER SET
  return token.user as SessionUser;
}
```

The JWT callback in `apps/api/src/lib/auth.ts` sets `token.userId` and `token.role`, but **never**
sets `token.user`. `getToken` returns the raw JWT payload. `token.user` is always `undefined`.
This means `requireAuth` middleware **always** returns 401 after a successful sign-in.

**This is the "Register-but-no-Login" bug.** A user can create an account (`POST /api/auth/signup`)
but every subsequent authenticated request is rejected.

**Fix required**: Change `if (!token || !token.user) return null` to use `token.sub` (Auth.js default
for user ID) and reconstruct SessionUser from token claims.

---

#### `[block]` AUTH-002 -- Auth.js `account` table missing `password` column

**File**: `apps/api/src/routes/auth.ts:73`

```typescript
await client.query(
  `INSERT INTO account ("id","providerId","accountId","userId","password","createdAt","updatedAt") ...`,
  [uuidv4(), email, userId, hashed],
);
```

The `@auth/drizzle-adapter` creates an `account` table without a `password` column. The raw SQL
signup inserts a `password` field that does not exist in the schema. Signup will throw
`ERROR: column "password" of relation "account" does not exist`.

**Note**: This also means signup has been broken since Auth.js was integrated. No credentials user
can be created.

---

#### `[block]` AUTH-003 -- Duplicate route registration

**File**: `apps/api/src/index.ts:35,93`

```typescript
// line 35
app.route("/api/auth", authRouter);
// ...
// line 93
app.route("/api/auth", authRouter); // duplicate
```

`authRouter` is mounted twice on `/api/auth`. Hono will process both registrations; the first match
wins but this creates confusion and maintenance risk. The duplicate must be removed.

---

#### `[block]` AUTH-004 -- Three independent DB connection pools

**Files**: `apps/api/src/lib/auth.ts:16`, `apps/api/src/services/auth-service.ts:8`, `apps/api/src/index.ts:21`

Three separate `new Pool({ connectionString: ... })` instantiations exist in the API:

1. `auth.ts` -- for the DrizzleAdapter and `query()` helper
2. `auth-service.ts` -- for `getSessionUser`, `redeemInvite`
3. `index.ts` -- for the `/health` route

Each creates its own idle connection pool against PostgreSQL. Under load this saturates the
Supabase free-tier connection limit (25 simultaneous connections) and causes random 500 errors.

---

#### `[warn]` AUTH-005 -- `/me` response missing `householdId`

**Files**: `apps/api/src/routes/auth.ts:18-25`, `apps/web/src/routes/Login.tsx:22`

`GET /api/auth/me` returns `user` from session (fields: `id`, `role`). It does not query the
app-level `users` table for `householdId`. `Login.tsx` reads `me.householdId` which will always
be `undefined`. The user is navigated to `/planning` with no household context.

---

#### `[warn]` AUTH-006 -- `skipCSRFCheck` applied globally

**File**: `apps/api/src/lib/auth.ts:9,29`

CSRF protection is disabled for all Auth.js routes. The comment notes this is safe because of CORS
policy. However, if CORS is misconfigured (or in local dev where CORS is permissive), CSRF attacks
become possible. This should be scoped to the credentials provider only, not applied globally.

---

#### `[warn]` SCHEMA-004 -- Query stubs throw unconditionally

**File**: `packages/db/src/queries/recipes.ts`

```typescript
export function insertRecipe(/* params */) {
  throw new Error("not implemented");
}
```

All three exported query functions throw `Error('not implemented')`. Any code path that reaches
these throws at runtime with no fallback. These must be either implemented or removed.

---

#### `[nit]` AUTH-007 -- `any` types throughout auth layer

**Files**: `apps/api/src/lib/auth.ts:42,70,80,88`

Multiple `authorize: async (creds: any)`, `{ user }: { user?: any }`, `{ token, user }: { token: any; user?: any }`.
CLAUDE.md explicitly prohibits `any` types. Use proper Auth.js types from `@auth/core/types`.

---

#### `[nit]` AUTH-008 -- `import` statement mid-function in route file

**File**: `apps/api/src/routes/auth.ts:28-30`

```typescript
// sign-up route for credentials provider
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
```

Imports appear after the first route handler definition. While JavaScript hoists `import` statements,
this violates all style guides and ESLint `import/first` rules. All imports must be at the top of the file.

---

### Group 1 -- MVP Data Schema (PRD 01-data-schema)

#### `[block]` SCHEMA-005 -- Zero schema tables implemented

PRD 01-data-schema Task 2 requires implementing all 14 MVP tables with relations, composite keys,
and indexes. The schema index is still the placeholder from before PRD 00d was supposed to execute.
None of the following tables exist as Drizzle definitions:

| Table                 | Status  |
| --------------------- | ------- |
| `users`               | MISSING |
| `households`          | MISSING |
| `household_members`   | MISSING |
| `recipes`             | MISSING |
| `recipe_ingredients`  | MISSING |
| `substitutions`       | MISSING |
| `grocery_lists`       | MISSING |
| `grocery_list_items`  | MISSING |
| `meal_plans`          | MISSING |
| `meal_plan_entries`   | MISSING |
| `pantry`              | MISSING |
| `pantry_items`        | MISSING |
| `sync_queue`          | MISSING |
| `user_recipe_library` | MISSING |
| `usda_ingredients`    | MISSING |

---

#### `[block]` SCHEMA-006 -- Seed scripts and test fixtures not implemented

PRD 01-data-schema Task 3 requires `packages/db/src/seeds/index.ts` and `seeds/fixtures.ts`.
Neither file exists. Every E2E test that claims to work against "realistic data" is operating
against an empty database or mocked data only.

---

#### `[block]` SCHEMA-007 -- Shared types not sourced from schema

PRD 01-data-schema Task 4 requires `packages/types/src/` to align with the finalized schema.
The types package exists and exports types, but those types were written independently of any
schema definition. There is no code path that derives types from Drizzle's `InferSelectModel` /
`InferInsertModel`. Schema and types can (and likely do) diverge silently.

---

## Summary Table

| ID         | Severity  | Component       | Finding                                                        | File(s)                                  |
| ---------- | --------- | --------------- | -------------------------------------------------------------- | ---------------------------------------- |
| SCHEMA-001 | `[block]` | DB / Schema     | Drizzle schema is an empty placeholder                         | `packages/db/src/schema/index.ts`        |
| SCHEMA-002 | `[block]` | DB / Migrations | No migration files exist                                       | `packages/db/src/migrations/`            |
| SCHEMA-003 | `[block]` | DB / Config     | `drizzle.config.ts` missing `dbCredentials`                    | `packages/db/drizzle.config.ts`          |
| AUTH-001   | `[block]` | Auth            | `getSessionUser` always returns null -- `token.user` never set | `apps/api/src/services/auth-service.ts`  |
| AUTH-002   | `[block]` | Auth            | `account` table has no `password` column -- signup throws      | `apps/api/src/routes/auth.ts`            |
| AUTH-003   | `[block]` | Routing         | Duplicate `authRouter` registration                            | `apps/api/src/index.ts`                  |
| AUTH-004   | `[block]` | DB / Infra      | Three independent DB pools -- connection exhaustion risk       | `auth.ts`, `auth-service.ts`, `index.ts` |
| AUTH-005   | `[warn]`  | Auth / UX       | `/me` omits `householdId` -- login lands with no household     | `apps/api/src/routes/auth.ts`            |
| AUTH-006   | `[warn]`  | Auth            | `skipCSRFCheck` applied globally instead of per-provider       | `apps/api/src/lib/auth.ts`               |
| SCHEMA-004 | `[warn]`  | DB / Queries    | All query helpers throw `Error('not implemented')`             | `packages/db/src/queries/recipes.ts`     |
| AUTH-007   | `[nit]`   | Auth            | Pervasive `any` types in auth layer                            | `apps/api/src/lib/auth.ts`               |
| AUTH-008   | `[nit]`   | Auth            | `import` statements mid-file in route handler                  | `apps/api/src/routes/auth.ts`            |
| SCHEMA-005 | `[block]` | DB / Schema     | All 15 MVP tables missing from Drizzle schema                  | `packages/db/src/schema/`                |
| SCHEMA-006 | `[block]` | DB / Seeds      | No seed scripts or test fixtures                               | `packages/db/src/seeds/`                 |
| SCHEMA-007 | `[block]` | Types           | Shared types not derived from schema -- silent drift           | `packages/types/src/`                    |

**Block count**: 11 | **Warn count**: 3 | **Nit count**: 2

---

## Verdict

**Foundation Integrity: RED. Do not proceed to UX rebuild until all `[block]` items are resolved.**

The drizzle schema is the single source of truth for this application. It does not exist.
Every layer above it (auth routes, service layer, API routes, UI) is running against tables
whose shape is unknown to the TypeScript compiler, unverified by migration, and unconstrained
by Drizzle. Bugs in those layers cannot be reliably fixed until the foundation is solid.
