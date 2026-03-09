import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import { issueSessionToken } from "../lib/auth";
import {
  getUserHouseholds,
  switchActiveHousehold,
} from "../services/household-service";

// we duplicate the shape here to avoid Hono context typing conflicts
interface SessionUser {
  id: string;
  role: string;
  email?: string | null;
  name?: string | null;
}

const usersRouter = new Hono();

// GET /api/users/me/households
// Returns all households the authenticated user belongs to, with isActive flag.
usersRouter.get("/me/households", requireAuth, async (c) => {
  const sessionUser = (c as unknown as { get: (k: string) => unknown }).get(
    "user",
  ) as SessionUser | undefined;

  if (!sessionUser?.id) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const households = await getUserHouseholds(sessionUser.id);
  return c.json({ households });
});

// PATCH /api/users/me/active-household
// Switches the user's active household. Verifies membership, updates DB,
// re-issues JWT cookie so client token reflects the new householdId.
usersRouter.patch("/me/active-household", requireAuth, async (c) => {
  const sessionUser = (c as unknown as { get: (k: string) => unknown }).get(
    "user",
  ) as SessionUser | undefined;

  if (!sessionUser?.id) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  let body: { householdId?: string };
  try {
    body = await c.req.json<{ householdId?: string }>();
  } catch {
    throw new HTTPException(400, { message: "invalid json" });
  }

  if (!body.householdId) {
    throw new HTTPException(400, { message: "householdId required" });
  }

  try {
    const updated = await switchActiveHousehold(
      sessionUser.id,
      body.householdId,
    );
    if (!updated) {
      throw new HTTPException(500, { message: "Failed to update household" });
    }

    await issueSessionToken(c, {
      id: updated.id,
      email: updated.email,
      name: updated.displayName,
      householdId: updated.householdId,
      role: sessionUser.role,
    });

    return c.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.displayName,
        householdId: updated.householdId,
        role: sessionUser.role,
      },
    });
  } catch (err: unknown) {
    if (err instanceof HTTPException) throw err;
    const e = err as { status?: number; message?: string };
    const status = e.status === 403 || e.status === 404 ? e.status : 500;
    throw new HTTPException(status, {
      message: e.message ?? "Failed to switch household",
    });
  }
});

export default usersRouter;
