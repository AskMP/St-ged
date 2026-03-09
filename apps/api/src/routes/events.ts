import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { optionalAuth } from "../middleware/auth";
import type { AppVariables } from "../lib/hono-types";
import * as eventService from "../services/event-service";

const eventsRouter = new Hono<{ Variables: AppVariables }>()
  .use("*", optionalAuth)
  // create an event (host only)
  .post("/", async (c) => {
    const user = c.get("user");
    if (!user) throw new HTTPException(401);
    const body = await c.req.json();
    const evt = await eventService.createEvent({ ...body, hostId: user.id });
    return c.json(evt);
  })
  .get("/", async (c) => {
    const events = await eventService.listEvents();
    return c.json({ events });
  })
  .get("/:id", async (c) => {
    const evt = await eventService.getEvent(c.req.param("id"));
    if (!evt) throw new HTTPException(404);
    return c.json(evt);
  })
  .post("/:id/book", async (c) => {
    const user = c.get("user");
    if (!user) throw new HTTPException(401);
    try {
      const booking = await eventService.bookEvent(c.req.param("id"), user.id);
      return c.json(booking);
    } catch (err: any) {
      throw new HTTPException(err.status || 500, { message: err.message });
    }
  });

export default eventsRouter;
