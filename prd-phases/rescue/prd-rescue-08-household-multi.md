---
task: "Multi-household support -- create, join, switch active household; token refresh"
branch: "stg-rescue-08/household-multi"
test_command: "pnpm test"
completion_promise: "COMPLETE"
max_iterations: 15
requires: ["rescue-07"]
group: "rescue"
manifest_id: "rescue-08"
---

# PRD Rescue-08: Multi-Household Support

## Mandatory Pre-Read

1. `RESCUE_PROTOCOL.md` -- mandate
2. `prd-phases/rescue/rescue-manifest.md` -- current state
3. `apps/api/src/services/household-service.ts` -- post rescue-07, now using Drizzle
4. `apps/web/src/lib/auth-store.ts` -- JWT/user state management
5. `apps/web/src/routes/Onboarding.tsx` -- current onboarding flow

**Confidence**: High for backend endpoints; Medium for token refresh flow (test-sensitive).

---

## Context for Agent

### User Story Driving This PRD

**Jordan** (primary persona) is temporarily helping an elderly family member who lives
separately. Jordan needs to manage two households: their own and the family member's.
Currently the app has no way to create multiple households per user, switch between them,
or even see a list of households they belong to.

Additionally, the **Onboarding** flow creates a household but never updates the auth token
to include the new `householdId` -- so after onboarding completes, every authenticated
API call still has `householdId: null` in the JWT, causing 403s on all household-scoped
endpoints.

### Current Architecture Gaps

1. **One household per user (hard constraint)**: `users.householdId` is a single FK.
   The `householdMembers` junction table exists but is never queried for "which households
   does this user belong to?"
2. **No active-household switch endpoint**: After joining/creating a second household,
   there is no way to switch which one is "active" (the one that appears in the JWT).
3. **Onboarding does not refresh the JWT**: `POST /api/households` creates the household
   and updates `users.householdId` in the DB -- but the JWT cookie still has the old
   `householdId: null`. Every subsequent API call uses the stale token.
4. **`HouseholdOps.tsx` uses `useOnboardingStore()`**: Reads `householdId` from the
   onboarding flow's localStorage store instead of `useAuthStore()`. If the user navigates
   directly to `/household` without going through onboarding, `householdId` is undefined
   and falls back to `"demo-household"` -- a string that will never match any DB row.

### Design Decision: Single "active" household

Keep `users.householdId` as the "active" household FK. A user can belong to many households
(via `householdMembers`) but only one is active at a time. The JWT encodes the active one.
To switch, the user calls `PATCH /api/users/me/active-household` with the new ID -- this
updates the DB and returns a fresh JWT cookie.

This keeps the auth middleware simple (single householdId on the token) while enabling the
caregiving use case.

### JWT Refresh Pattern

When any operation changes the active householdId, the API must re-issue the JWT:

```typescript
import { encode } from "next-auth/jwt";

async function issueToken(
  c: Context,
  user: { id; email; name; householdId; role },
) {
  const secret = process.env.NEXTAUTH_SECRET!;
  const token = await encode({
    token: {
      sub: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      householdId: user.householdId,
      role: user.role ?? "member",
    },
    secret,
  });
  c.header(
    "Set-Cookie",
    `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax`,
  );
}
```

Reuse this helper in the login endpoint, createHousehold endpoint, joinHousehold endpoint,
and the new switchHousehold endpoint. Extract it to a shared `issueSessionToken` function
in `apps/api/src/lib/auth.ts` to avoid duplication.

---

## Tasks

### Task 1: Add `GET /api/users/me/households` endpoint `[BD:stg-ssx]` ✓

- **Type**: task
- **Do**:
  Add a new endpoint that returns all households the authenticated user belongs to.
  This powers the household switcher UI.

  Location: `apps/api/src/routes/auth.ts` (or create a dedicated `users.ts` route if
  this file is already large -- read it first to decide).

  ```
  GET /api/users/me/households
  Auth: required
  Response: { households: Array<{ id, name, inviteCode, role, isActive }> }
  ```

  Implementation:
  1. Get userId from session via `getSessionUser(c.req.raw)`
  2. SELECT from `householdMembers` joined to `households` WHERE `userId = userId`
  3. Mark each result with `isActive: household.id === user.householdId`
  4. Return array

  Register the new endpoint on the appropriate router in `apps/api/src/index.ts`.

- **Files**: `apps/api/src/routes/auth.ts` (or new `users.ts`)
- **Verify**: `curl -H "Cookie: ..." http://localhost:3000/api/users/me/households` returns
  the list; type-check passes
- **Accept**: Endpoint exists and returns correct membership list

---

### Task 2: Fix `POST /api/households` to return a fresh JWT `[BD:stg-4fz]` ✓

- **Type**: task
- **Do**:
  Read `apps/api/src/routes/households.ts`. Find the `POST /api/households` (create
  household) handler.

  After creating the household (Task 1 of rescue-07 fixed the service to UPDATE
  `users.householdId` in DB), the route must now also re-issue the JWT cookie so the
  client's token reflects the new `householdId`.
  1. Extract the `issueSessionToken(c, user)` helper into `apps/api/src/lib/auth.ts`
     (see pattern in Context section above)
  2. After `createHousehold(name, userId)` returns `{ id, inviteCode }`:
     - SELECT the full user row to get name, email, role
     - Call `issueSessionToken(c, { id: userId, email, name, householdId: id, role })`
  3. Return `{ id, inviteCode }` as before (no change to response body)

  Also update `POST /api/auth/login` to use the shared `issueSessionToken` helper
  instead of its own duplicate cookie logic. Verify the existing login tests still pass.

- **Files**: `apps/api/src/lib/auth.ts`, `apps/api/src/routes/households.ts`,
  `apps/api/src/routes/auth.ts`
- **Verify**: After onboarding creates a household, the cookie returned includes the new
  `householdId`. `GET /api/auth/me` immediately after returns user with non-null householdId.
- **Accept**: `createHousehold` response sets a fresh JWT; login still works

---

### Task 3: Fix `POST /api/households/join` to return a fresh JWT `[BD:stg-puy]` ✓

- **Type**: task
- **Do**:
  Find the `POST /api/households/join` handler in `apps/api/src/routes/households.ts`.
  After calling `joinHousehold(inviteCode, userId)`:
  1. Fetch updated user from DB to get the new `householdId`
  2. Call `issueSessionToken(c, user)` to re-issue the JWT
  3. Return `{ success: true }` as before

- **Files**: `apps/api/src/routes/households.ts`
- **Verify**: After joining via invite code, `GET /api/auth/me` returns the joined
  household in the user's `householdId`
- **Accept**: Join response sets a fresh JWT

---

### Task 4: Add `PATCH /api/users/me/active-household` endpoint `[BD:stg-chn]` ✓

- **Type**: task
- **Do**:
  New endpoint for switching the active household.

  ```
  PATCH /api/users/me/active-household
  Auth: required
  Body: { householdId: string }
  Response: { user: { id, name, email, householdId, role } }
  ```

  Implementation:
  1. Get userId from session
  2. Verify the user is a member of the requested householdId (SELECT from householdMembers)
  3. UPDATE `users` SET `householdId = requestedId` WHERE `id = userId`
  4. Issue fresh JWT via `issueSessionToken`
  5. Return the updated user object

  Also update `useAuthStore` in the web app to call this endpoint when the user switches
  household -- but the UI is in rescue-08 Task 5, so the API endpoint comes first.

- **Files**: `apps/api/src/routes/auth.ts` (or `users.ts`)
- **Verify**: After switching, `GET /api/auth/me` returns the new `householdId` in the
  JWT-decoded response
- **Accept**: Switch endpoint exists; JWT reflects new household

---

### Task 5: Fix `HouseholdOps.tsx` to use `useAuthStore()` `[BD:stg-8sy]` ✓

- **Type**: task
- **Do**:
  Read `apps/web/src/routes/HouseholdOps.tsx` in full.

  Line 11: `const { householdId } = useOnboardingStore();`
  Line 12: `const hid = householdId ?? "demo-household";`

  This is the bug. `"demo-household"` will never match a real DB row. Fix:
  1. Remove `useOnboardingStore` import
  2. Import `useAuthStore` from `"../lib/auth-store"` (or `"@/lib/auth-store"`)
  3. Replace:
     ```typescript
     const user = useAuthStore((s) => s.user);
     const hid = user?.householdId;
     ```
  4. Add a guard: if `!hid`, render a message "Set up a household first" with a link
     to `/onboarding`
  5. Remove the `?? "demo-household"` fallback entirely

- **Files**: `apps/web/src/routes/HouseholdOps.tsx`
- **Verify**: Navigate to `/household` as a logged-in user with a household -- page loads
  correctly. As a user without a household -- shows the setup prompt.
- **Accept**: No `"demo-household"` fallback; no `useOnboardingStore` import in HouseholdOps

---

### Task 6: Add household switcher to Settings page `[BD:stg-ir6]` ✓

- **Type**: task
- **Do**:
  Read `apps/web/src/routes/Settings.tsx` in full.

  Add a "Your Households" section between the Household section and App section:

  ```
  [Your Households]
  +-----------------------------------------------------------+
  | My Household           Owner     [Active]                 |
  | Grandma's Kitchen      Member    [Switch]                 |
  | + Join with invite code...                                |
  | + Create new household...                                 |
  +-----------------------------------------------------------+
  ```

  Implementation:
  1. On mount: `GET /api/users/me/households` to fetch all memberships
  2. Render each household with name, role, and an "Active" badge or "Switch" button
  3. "Switch" button calls `PATCH /api/users/me/active-household` with `{ householdId }`
     then updates `useAuthStore` with the returned user
  4. "Join with invite code" shows an inline input for the invite code, calls
     `POST /api/households/join`, then refreshes the list
  5. "Create new household" navigates to `/onboarding` (which already handles creation)

  Add the `apiClient.users` namespace to `api-client.ts`:

  ```typescript
  users: {
    getHouseholds(): Promise<{ households: HouseholdMembership[] }> {
      return request("/api/users/me/households");
    },
    switchHousehold(householdId: string): Promise<{ user: User }> {
      return request("/api/users/me/active-household", {
        method: "PATCH",
        body: JSON.stringify({ householdId }),
      });
    },
  },
  ```

  Add `HouseholdMembership` to `packages/types/src/index.ts` if not already there:

  ```typescript
  export interface HouseholdMembership {
    id: string;
    name: string;
    inviteCode: string;
    role: "owner" | "member" | "guest";
    isActive: boolean;
  }
  ```

- **Files**: `apps/web/src/routes/Settings.tsx`, `apps/web/src/lib/api-client.ts`,
  `packages/types/src/index.ts`
- **Verify**: Settings page shows all households; Switch button updates the active household
  and the page reflects the change
- **Accept**: Household switcher is functional; users can switch and join from Settings

---

### Task 7: Fix Onboarding to update AuthStore after household creation `[BD:stg-cht]` ✓

- **Type**: task
- **Do**:
  Read `apps/web/src/routes/Onboarding.tsx`. Find the step where the household is created
  (the `apiClient.households.create(name)` or `fetch("/api/households", { method: "POST" })` call).

  After the household creation API call returns:
  1. The API (post rescue-08 Task 2) now returns a fresh JWT cookie AND `{ id, inviteCode }`
  2. Call `GET /api/auth/me` to fetch the updated user (with new householdId)
  3. Call `setUser(updatedUser)` from `useAuthStore` to update the in-memory state

  OR -- simpler approach -- update the household create API to return the full user object:
  Change `POST /api/households` response to `{ id, inviteCode, user: { id, name, email, householdId, role } }`.
  Then in Onboarding, call `setUser(res.user)` directly.

  Choose the simpler approach (return user in response).

  Also verify: `apps/web/src/lib/api-client.ts` `households.create()` method exists and
  points to the correct path (`/api/households`). If it doesn't exist, add it.

- **Files**: `apps/web/src/routes/Onboarding.tsx`, `apps/api/src/routes/households.ts`,
  `apps/web/src/lib/api-client.ts`
- **Verify**: Complete onboarding flow in browser -- after household creation step, the
  user's `householdId` is non-null; pantry and planning pages load without 403
- **Accept**: AuthStore has correct householdId after onboarding; no 403 on post-onboarding pages

---

### Task 8: Write unit tests for household multi flow `[BD:stg-c5n]` ✓

- **Type**: task
- **Do**:
  1. Add to `apps/api/tests/households/`:
     - `GET /api/users/me/households` returns memberships
     - `PATCH /api/users/me/active-household` switches and issues new cookie
     - `PATCH` with a householdId the user does not belong to returns 403
  2. Add to `apps/web/tests/unit/household-ops.test.tsx`:
     - HouseholdOps shows "Set up household" prompt when user has no householdId
     - HouseholdOps loads cost history when householdId is present

- **Verify**: `pnpm test` passes; new tests are not skipped
- **Accept**: Tests cover the critical multi-household paths

---

### Task 9: Update CORRECTION_LOG.md and rescue manifest `[BD:stg-1jw]` ✓

- **Type**: chore
- **Do**:
  1. Append to `CORRECTION_LOG.md`:
     ```
     | HouseholdOps.tsx | Used useOnboardingStore() | Fixed to use useAuthStore() | Stale ID caused all household ops to fail | Jordan (caregiver) persona | HouseholdOps loads with real data |
     | Onboarding flow | JWT not refreshed after household create | Token re-issued; AuthStore updated | Post-onboarding 403s on all household endpoints | All personas | Full onboarding in browser passes |
     | Multi-household | Only single household per user | Added switcher; active-household endpoint | Caregiver use case unaddressed | Jordan persona | Settings switcher functional |
     ```
  2. Mark `rescue-08` complete in `rescue-manifest.md`; increment counter.

- **Files**: `CORRECTION_LOG.md`, `prd-phases/rescue/rescue-manifest.md`
- **Verify**: Manifest updated; rescue-08 marked complete
- **Accept**: All household multi-tenancy gaps addressed

---

## Discovered Tasks

_None yet._
