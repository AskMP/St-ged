import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import type { AppVariables } from "../lib/hono-types";
import * as planService from "../services/plan-service";

const plansRouter = new Hono<{ Variables: AppVariables }>()
  .use("*", requireAuth)
  // fetch or create weekly plan
  .get("/households/:id/plans/week", async (c) => {
    const hid = c.req.param("id");
    const { start } = c.req.query();
    if (!start) {
      throw new HTTPException(400, { message: "start query required" });
    }
    const plan = await planService.getWeeklyPlan(hid, start as string);
    if (!plan) {
      // create empty
      const user = c.get("user");
      const newPlan = await planService.createPlan(
        hid,
        start as string,
        user.id,
      );
      return c.json({ plan: newPlan, entries: [] });
    }
    return c.json(plan);
  })
  .post("/plans/:id/entries", async (c) => {
    const pid = c.req.param("id");
    const data = await c.req.json();
    const entry = await planService.addMealEntry(pid, data);
    return c.json(entry, 201);
  })
  .delete("/plans/:id/entries/:entryId", async (c) => {
    const entryId = c.req.param("entryId");
    await planService.removeMealEntry(entryId);
    return c.json({ success: true });
  })
  // copy week endpoint for convenience
  .post("/households/:id/plans/copy", async (c) => {
    const hid = c.req.param("id");
    const { from, to } = await c.req.json();
    const user = c.get("user");
    const dest = await planService.copyWeek(hid, from, to, user.id);
    return c.json(dest);
  })
  .post("/plans/:id/generate-list", async (c) => {
    const pid = c.req.param("id");
    const user = c.get("user");
    const list = await planService.generateList(pid, user.id);
    return c.json(list);
  });

export default plansRouter;
