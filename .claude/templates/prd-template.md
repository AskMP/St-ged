<!-- Legacy single-PRD template. For multi-PRD chained architecture (recommended),
     see prd-multi-template.md and manifest-template.md. -->
---
task: "TASK_NAME"
branch: "PREFIX-ID/description"
test_command: "npm test"
completion_promise: "COMPLETE"
max_iterations: 10
---

# PRD: TASK_NAME

## Overview

<!-- 2-3 sentence description of what this task accomplishes. -->

TODO: Describe the task.

## Success Criteria

<!-- How do we know when this is done? Must be machine-verifiable. -->

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Critical user paths are navigable (pages load, links resolve)
- [ ] Seed data loads successfully (if applicable)
- [ ] Required env vars documented in `.env.example` or equivalent
- [ ] TODO: Add specific acceptance criteria

## Tasks

<!-- Checkbox list that Ralph tracks. Each item = one atomic iteration.
     IMPORTANT: All BD tasks are created in batch BEFORE any implementation begins.
     Task IDs are embedded inline so iterations never need to search/create tasks.
     Each step must be self-contained: an agent reading ONLY that step's description
     should know exactly what to do, which files to touch, and how to verify.

     TYPE SELECTION GUIDE:
     - feature: New user-facing functionality or capability (maps to {{cmd:create_feature}})
     - bug: Fix for broken behavior or regression (maps to {{cmd:create_bug}})
     - task: Setup, configuration, refactoring, infrastructure work (maps to {{cmd:create_task}})
     - chore: Maintenance, dependency updates, CI/CD, documentation (maps to {{cmd:create_task}})
     - epic: Parent grouping for related tasks (maps to {{cmd:create_epic}})

     DO FIELD REQUIREMENTS:
     The Do field must contain concrete, atomic implementation details:
     - Exact function signatures: `export async function createUser(data: CreateUserInput): Promise<User>`
     - Exact file paths: `src/lib/auth.ts`, NOT "the auth file"
     - Exact behavior: "Return 409 Conflict when email already exists", NOT "handle errors"
     - Exact config values: `bcrypt cost factor 12`, NOT "use secure hashing"
     If an agent cannot implement the task from the Do field alone, it is too vague. -->

- [ ] **Task 1: Title** `[BD:PREFIX-ID]`
  - **Type**: feature | bug | task | chore
  - **Do**: Exactly what to implement — include function signatures, file paths, behavior descriptions
  - **Files**: `path/to/file1.ts`, `path/to/file2.ts`
  - **Route**: Target page/route this feature lives on (for UI tasks; omit for backend-only)
  - **Verify**: Command or check to confirm completion
  - **Accept**: Measurable acceptance criteria

- [ ] **Task 2: Title** `[BD:PREFIX-ID]`
  - **Type**: feature | bug | task | chore
  - **Do**: Exactly what to implement — include function signatures, file paths, behavior descriptions
  - **Files**: `path/to/file.ts`
  - **Route**: Target page/route (for UI tasks; omit for backend-only)
  - **Verify**: Command or check to confirm completion
  - **Accept**: Measurable acceptance criteria

- [ ] **Task 3: Title** `[BD:PREFIX-ID]`
  - **Type**: feature | bug | task | chore
  - **Do**: Exactly what to implement — include function signatures, file paths, behavior descriptions
  - **Files**: `path/to/file.ts`
  - **Verify**: Command or check to confirm completion
  - **Accept**: Measurable acceptance criteria

- [ ] **Task 4: Title** `[BD:PREFIX-ID]`
  - **Type**: feature | bug | task | chore
  - **Do**: Exactly what to implement — include function signatures, file paths, behavior descriptions
  - **Files**: `path/to/file.ts`
  - **Verify**: Command or check to confirm completion
  - **Accept**: Measurable acceptance criteria

## Technical Context

<!-- Key information the agent needs to know. File paths, API contracts, patterns to follow. -->

- **Key files**: TODO
- **Patterns to follow**: TODO
- **Dependencies**: TODO

## Constraints

<!-- Hard limits and requirements. -->

- TODO: List any constraints (performance, compatibility, security, etc.)

## Out of Scope

<!-- Explicitly list what this task does NOT include. -->

- TODO: List exclusions

---

## Example PRD

Below is a concrete example for reference:

```markdown
---
task: "Add user authentication"
branch: "myapp-42/add-auth"
test_command: "npm test"
completion_promise: "COMPLETE"
max_iterations: 8
---

# PRD: Add User Authentication

## Overview

Add JWT-based authentication to the Express API. Users should be able to register, login, and access protected routes with a bearer token.

## Success Criteria

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Critical user paths navigable (auth pages load, login/register links resolve)
- [ ] Registration endpoint returns JWT on success
- [ ] Login endpoint returns JWT for valid credentials
- [ ] Protected routes return 401 without valid token
- [ ] Password hashing uses bcrypt with cost factor 12

## Tasks

<!-- All BD tasks created in batch before implementation begins. IDs embedded inline. -->

- [ ] **Task 1: Auth schema** `[BD:myapp-a1b2c3]`
  - **Type**: task
  - **Do**: Create User model with email (unique, case-insensitive index via `LOWER(email)`), password_hash (VARCHAR 255), created_at (TIMESTAMP DEFAULT NOW()) fields. Export `interface User { id: string; email: string; passwordHash: string; createdAt: Date }` from `src/models/user.ts`. Create migration `src/migrations/add-users-table.ts` using Knex schema builder with `table.uuid('id').primary().defaultTo(knex.fn.uuid())`.
  - **Files**: `src/models/user.ts`, `src/migrations/add-users-table.ts`
  - **Verify**: `npm run migrate && npm test -- --grep "User model"`
  - **Accept**: Migration runs clean, model imports and validates email uniqueness

- [ ] **Task 2: Registration endpoint** `[BD:myapp-d4e5f6]`
  - **Type**: feature
  - **Do**: Add POST /api/auth/register with: validate email (regex + unique check), validate password (>= 8 chars), hash via `bcrypt.hash(password, 12)`, insert user, return `{ token: jwt.sign({ userId: user.id }, SECRET, { expiresIn: '24h' }) }` with 201 status. Return 409 on duplicate email, 400 on missing/invalid fields.
  - **Files**: `src/routes/auth.ts`, `tests/auth.test.ts`
  - **Verify**: `npm test -- --grep "register"`
  - **Accept**: Tests pass for valid registration, duplicate email (409), missing fields (400)

- [ ] **Task 3: Login endpoint** `[BD:myapp-g7h8i9]`
  - **Type**: feature
  - **Do**: Add POST /api/auth/login: look up user by `LOWER(email)`, verify via `bcrypt.compare(password, user.passwordHash)`, return JWT with `{ userId: user.id }` payload and 24h expiry. Return 401 with `{ error: "Invalid credentials" }` for wrong password or missing user (same message for both — no user enumeration).
  - **Files**: `src/routes/auth.ts`, `tests/auth.test.ts`
  - **Verify**: `npm test -- --grep "login"`
  - **Accept**: Tests pass for valid login, wrong password (401), missing user (401)

- [ ] **Task 4: Auth middleware** `[BD:myapp-j0k1l2]`
  - **Type**: task
  - **Do**: Create `export function authMiddleware(req: Request, res: Response, next: NextFunction)` that: extracts token from `Authorization: Bearer <token>` header, verifies via `jwt.verify(token, SECRET)`, attaches `req.user = { userId: decoded.userId }`. Return 401 with `{ error: "Unauthorized" }` for missing, expired, or invalid tokens.
  - **Files**: `src/middleware/auth.ts`, `tests/middleware/auth.test.ts`
  - **Verify**: `npm test -- --grep "auth middleware"`
  - **Accept**: Tests pass for valid token, expired token (401), missing token (401)

- [ ] **Task 5: Protect existing routes** `[BD:myapp-m3n4o5]`
  - **Type**: task
  - **Do**: Apply `authMiddleware` to all routes in `src/routes/users.ts` via `router.use(authMiddleware)`. Update all existing tests in `tests/users.test.ts` to include `Authorization: Bearer <validToken>` header using a test helper that generates JWT.
  - **Files**: `src/routes/users.ts`, `tests/users.test.ts`
  - **Verify**: `npm test`
  - **Accept**: Existing tests updated with auth, unauthenticated requests return 401

- [ ] **Task 6: Integration tests** `[BD:myapp-p6q7r8]`
  - **Type**: task
  - **Do**: Add end-to-end test file covering: register new user → login with credentials → use token to access GET /api/users → verify expired token returns 401 (use `jwt.sign` with `{ expiresIn: '0s' }` for expiry test).
  - **Files**: `tests/integration/auth-flow.test.ts`
  - **Verify**: `npm test -- --grep "auth flow"`
  - **Accept**: Full flow passes, covers happy path and error cases

## Technical Context

- **Key files**: src/models/, src/routes/, src/middleware/, tests/
- **Patterns to follow**: Existing route structure in src/routes/users.ts
- **Dependencies**: jsonwebtoken, bcrypt (already in package.json)

## Constraints

- JWT expiry: 24 hours
- Passwords must be >= 8 characters
- Email must be unique (case-insensitive)

## Out of Scope

- OAuth / social login
- Password reset flow
- Session management (JWT only)
```
