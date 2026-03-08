import { Hono } from "hono";
import http from "node:http";
import { authHandler } from "@hono/auth-js";
import { env } from "./lib/env";
import { initAuth } from "./lib/auth";
import { pool } from "./lib/db";
import { createSocketIOserver } from "./lib/socket";
import { corsMiddleware } from "./middleware/cors";
import { rateLimitMiddleware } from "./middleware/rateLimit";
import authRouter from "./routes/auth";
import batchRouter from "./routes/batch-prep";
import dietaryAdaptationRouter from "./routes/dietary-adaptation";
import eventsRouter from "./routes/events";
import fridgeClearanceRouter from "./routes/fridge-clearance";
import fulfillmentRouter from "./routes/fulfillment";
import householdsRouter from "./routes/households";
import listsRouter from "./routes/lists";
import pantryRouter from "./routes/pantry";
import plansRouter from "./routes/plans";
import potluckRouter from "./routes/potluck";
import recipesRouter from "./routes/recipes";

export const app = new Hono();

app.use("*", corsMiddleware);
app.use("*", rateLimitMiddleware);

// initialize Auth.js (NextAuth) before other routes
app.use("*", initAuth());
// register custom auth routes first (signup, guest, invite)
// AUTH-003 fix: authRouter registered exactly once. Previously registered
// twice (line ~35 and line ~93) causing routing confusion.
app.route("/api/auth", authRouter);
// limit authHandler to the actions Auth.js expects; avoid swallowing signup/guest
app.all("/api/auth/signin", authHandler());
app.all("/api/auth/signout", authHandler());
app.all("/api/auth/session", authHandler());
app.all("/api/auth/callback/*", authHandler());

const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${env.PORT}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  // if there's a body (POST/PUT/etc), pipe it through to the Fetch request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestInit: any = {
    method: req.method ?? "GET",
    headers,
    // Node.js request is a readable stream; Fetch accepts a stream as body
    body: ["GET", "HEAD"].includes(req.method ?? "") ? undefined : req,
    // required by undici when sending a stream body (not in standard RequestInit types)
    duplex: ["GET", "HEAD"].includes(req.method ?? "") ? undefined : "half",
  };
  const request = new Request(url.href, requestInit as RequestInit);

  const response = await app.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = await response.text();
  res.end(body);
});

// central socket.io setup uses helper from lib/socket
const io = createSocketIOserver(httpServer);

// AUTH-004 fix: use shared pool from lib/db instead of a local new Pool()
app.get("/health", async (c) => {
  try {
    await pool.query("SELECT 1");
    return c.json({
      status: "ok",
      db: "connected",
      uptime: process.uptime(),
    });
  } catch (err) {
    return c.json(
      {
        status: "degraded",
        db: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      503,
    );
  }
});

app.route("/api/recipes", recipesRouter);
app.route("/api/batch-prep", batchRouter);
app.route("/api/households", householdsRouter);
app.route("/api", pantryRouter);
app.route("/api", listsRouter);
app.route("/api", plansRouter);
app.route("/api", fridgeClearanceRouter);
app.route("/api/potluck", potluckRouter);
app.route("/api/events", eventsRouter);
app.route("/api/fulfillment", fulfillmentRouter);
app.route("/api/dietary", dietaryAdaptationRouter);

// only start the HTTP server when not running under the test runner.
// Vitest sets NODE_ENV=test; by skipping the listen call we avoid EADDRINUSE
// when tests import this module multiple times.  Individual tests can still
// exercise the `app` instance via `app.fetch` or make real HTTP requests if a
// separate process is started explicitly.
if (process.env.NODE_ENV !== "test") {
  httpServer.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

export { io };
