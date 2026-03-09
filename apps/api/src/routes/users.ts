import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import { getUserHouseholds } from "../services/household-service";

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

export default usersRouter;
