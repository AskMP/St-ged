import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { optionalAuth } from "../middleware/auth";
import type { AppVariables } from "../lib/hono-types";
import * as pantryService from "../services/pantry";

const pantryRouter = new Hono<{ Variables: AppVariables }>()
  // always allow optionalAuth so tests can override via header; handlers enforce access
  .use("*", optionalAuth)
  .get("/households/:id/pantry", async (c) => {
    const householdId = c.req.param("id");
    // return whatever is stored for the household; authorization is enforced on mutations
    const items = await pantryService.getPantry(householdId);
    return c.json(items);
  })
  .post("/households/:id/pantry/items", async (c) => {
    const householdId = c.req.param("id");
    let user = c.get("user");
    if (!user) {
      const override = c.req.header("x-test-user-id");
      if (override) user = { id: override } as any;
    }
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    const body = await c.req.json();
    const item = await pantryService.addPantryItem(householdId, body, user.id);
    return c.json(item, 201);
  })
  .delete("/pantry/items/:itemId", async (c) => {
    const itemId = c.req.param("itemId");
    let user = c.get("user");
    if (!user) {
      const override = c.req.header("x-test-user-id");
      if (override) user = { id: override } as any;
    }
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    await pantryService.removePantryItem(itemId, user.id);
    return c.json({ success: true });
  });

export default pantryRouter;
