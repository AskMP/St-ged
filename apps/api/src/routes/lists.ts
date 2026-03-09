import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import type { AppVariables } from "../lib/hono-types";
import * as listService from "../services/list-service";

const listsRouter = new Hono<{ Variables: AppVariables }>()
  .use("*", requireAuth)
  .get("/households/:id/lists", async (c) => {
    const hid = c.req.param("id");
    const user = c.get("user");
    const lists = await listService.getLists(hid, user.id);
    return c.json(lists);
  })
  .post("/households/:id/lists", async (c) => {
    const hid = c.req.param("id");
    const user = c.get("user");
    const list = await listService.createList(hid, user.id);
    return c.json(list, 201);
  })
  .get("/lists/:id", async (c) => {
    const lid = c.req.param("id");
    const user = c.get("user");
    const list = await listService.getList(lid);
    if (!list) {
      c.status(404);
      return;
    }
    const items = await listService.getItems(list.id, user.id);
    return c.json({ ...list, items });
  })
  .post("/lists/:id/items", async (c) => {
    const lid = c.req.param("id");
    const user = c.get("user");
    const { name } = await c.req.json();
    const item = await listService.addItem(lid, name, user.id);
    return c.json(item);
  })
  .patch("/lists/:id/items/:itemId", async (c) => {
    const itemId = c.req.param("itemId");
    const user = c.get("user");
    const item = await listService.toggleItem(itemId, user.id);
    return c.json(item);
  })
  .delete("/lists/:id/items/:itemId", async (c) => {
    const itemId = c.req.param("itemId");
    const user = c.get("user");
    await listService.deleteItem(itemId, user.id);
    return c.json({ success: true });
  });

export default listsRouter;
