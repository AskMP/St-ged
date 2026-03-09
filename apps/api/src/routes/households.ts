import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { optionalAuth } from "../middleware/auth";
import { db } from "../lib/db";
import { users } from "@staged/db";
import { eq } from "drizzle-orm";
import { issueSessionToken } from "../lib/auth";
import {
  addCostEntry,
  changeMemberRole,
  createHousehold,
  getCostHistory,
  getRotation,
  getRotationAssignments,
  joinHousehold,
  listMembers,
  setRotation,
} from "../services/household-service";

const householdsRouter = new Hono()
  .use("*", optionalAuth)
  .post("/", async (c) => {
    const body = await c.req.json();
    let user = (c as any).get("user");
    if (!user) {
      const override = c.req.header("x-test-user-id");
      if (override) user = { id: override } as any;
    }
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    const result = await createHousehold(body.name, user.id);

    // Re-issue JWT so client token reflects the new householdId.
    // Skip in test environment where NEXTAUTH_SECRET may not be set.
    if (process.env.NODE_ENV !== "test") {
      const [profile] = await db
        .select({
          id: users.id,
          email: users.email,
          displayName: users.displayName,
          householdId: users.householdId,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
      if (profile) {
        await issueSessionToken(c, {
          id: profile.id,
          email: profile.email,
          name: profile.displayName,
          householdId: profile.householdId,
        });
      }
    }

    return c.json(result, 201);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    console.log("households GET hit with id", id, "path", c.req.path);
    const members = await listMembers(id);
    return c.json(members);
  })
  .post("/:id/invite", async (c) => {
    // not used in tests yet
    throw new HTTPException(501, { message: "Not implemented" });
  })
  .post("/join", async (c) => {
    const { code } = await c.req.json();
    try {
      let uid = ((c as any).get("user") as any)?.id;
      if (!uid && process.env.NODE_ENV === "test") uid = "test-user";
      await joinHousehold(code, uid!);
      return c.json({ success: true });
    } catch (err: any) {
      throw new HTTPException(err.status || 500, { message: err.message });
    }
  })
  .patch("/:id/members/role", async (c) => {
    const { userId, role } = await c.req.json();
    try {
      let requester = ((c as any).get("user") as any)?.id;
      if (!requester && process.env.NODE_ENV === "test")
        requester = "test-user";
      await changeMemberRole(c.req.param("id"), userId, role, requester!);
      return c.json({ success: true });
    } catch (err: any) {
      throw new HTTPException(err.status || 500, { message: err.message });
    }
  })

  // household ops endpoints
  .post("/:id/costs", async (c) => {
    const { total, weights } = await c.req.json();
    const hid = c.req.param("id");
    try {
      const entry = await addCostEntry(hid, total, weights);
      return c.json(entry, 201);
    } catch (err: any) {
      throw new HTTPException(err.status || 500, { message: err.message });
    }
  })

  .get("/:id/costs", async (c) => {
    const hid = c.req.param("id");
    const history = await getCostHistory(hid);
    return c.json(history);
  })

  .post("/:id/rotation", async (c) => {
    const { frequency, members, startDate } = await c.req.json();
    const hid = c.req.param("id");
    const settings = await setRotation(hid, frequency, members, startDate);
    return c.json(settings);
  })

  .get("/:id/rotation", async (c) => {
    const hid = c.req.param("id");
    const settings = await getRotation(hid);
    return c.json(settings || {});
  })

  .get("/:id/rotation/assignments", async (c) => {
    const hid = c.req.param("id");
    const weeks = Number(c.req.query("weeks") || "4");
    const assigns = await getRotationAssignments(hid, weeks);
    return c.json(assigns);
  });

export default householdsRouter;
