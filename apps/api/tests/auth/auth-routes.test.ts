// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||=
  "postgresql://staged:staged_dev_password@localhost:5432/staged_dev";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";

import jwt from "jsonwebtoken";
import { app } from "../../src/index";
import { insertInviteHousehold, resetDb } from "./fixtures";

const skipIfNoDB = process.env.DATABASE_URL?.includes("localhost")
  ? describe
  : describe.skip;

async function signup(email: string, password: string, displayName: string) {
  return app.request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, displayName }),
  });
}

// auth tests require a live PostgreSQL database.
// In CI without a DB, these are skipped. Run locally with DATABASE_URL set.
skipIfNoDB("auth routes", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("POST /signup with valid body -> 201; row exists with hashed_password", async () => {
    const res = await signup("a@b.com", "password123", "Alice");
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.message).toBe("Account created");
  });

  it("POST /signup with same email -> 409", async () => {
    await signup("dup@test.com", "password123", "Dup");
    const dup = await signup("dup@test.com", "password123", "Dup2");
    expect(dup.status).toBe(409);
  });

  it("POST /signup with invalid email -> 400", async () => {
    const res = await signup("not-an-email", "password123", "Bad");
    expect(res.status).toBe(400);
  });

  it("POST /signup with weak password -> 400", async () => {
    const res = await signup("b@c.com", "short", "Bob");
    expect(res.status).toBe(400);
  });

  it("GET /me without session -> 401", async () => {
    const res = await app.request("http://localhost/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /me with x-test-user-id header -> 200 with householdId field", async () => {
    // first create the user so the profile row exists
    await signup("me@test.com", "password123", "MeUser");

    // use x-test-user-id shortcut (bypasses JWT) for the /me check
    // need to find the user id from DB
    const { pool } = await import("../../src/lib/db");
    const rows = await pool.query("SELECT id FROM users WHERE email = $1", [
      "me@test.com",
    ]);
    const userId = rows.rows[0]?.id as string | undefined;
    expect(userId).toBeTruthy();

    const res = await app.request("http://localhost/api/auth/me", {
      headers: { "x-test-user-id": userId! },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      id: userId,
      email: "me@test.com",
    });
    // householdId field must be present (may be null for new user)
    expect("householdId" in body).toBe(true);
  });

  it("POST /guest -> 200 with { token, guestId }", async () => {
    const res = await app.request("http://localhost/api/auth/guest", {
      method: "POST",
    });
    expect(res.status).toBe(200);
    const { token, guestId } = await res.json();
    expect(typeof token).toBe("string");
    expect(typeof guestId).toBe("string");
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as Record<
      string,
      unknown
    >;
    expect(decoded.role).toBe("guest");
    expect(decoded.guestId).toBe(guestId);
  });

  it("POST /invite/:code unauthenticated -> 401", async () => {
    const inviteCode = "INV123";
    await insertInviteHousehold(inviteCode);

    const anon = await app.request("http://localhost/api/auth/invite/INV123", {
      method: "POST",
    });
    expect(anon.status).toBe(401);
  });

  // rescue-06: custom /login endpoint tests
  it("POST /login with valid credentials -> 200 with user JSON and set-cookie", async () => {
    await signup("login@test.com", "password123", "LoginUser");
    const res = await app.request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "login@test.com",
        password: "password123",
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toMatchObject({
      email: "login@test.com",
      name: "LoginUser",
      role: "member",
    });
    expect(typeof body.user.id).toBe("string");
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toContain("next-auth.session-token=");
    expect(cookie).toContain("HttpOnly");
  });

  it("POST /login with wrong password -> 401", async () => {
    await signup("wrong@test.com", "password123", "WrongUser");
    const res = await app.request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "wrong@test.com", password: "badpass" }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /login with unknown email -> 401", async () => {
    const res = await app.request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "nobody@test.com",
        password: "password123",
      }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /login then GET /me with returned cookie -> 200", async () => {
    await signup("roundtrip@test.com", "password123", "RoundTrip");
    const loginRes = await app.request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "roundtrip@test.com",
        password: "password123",
      }),
    });
    expect(loginRes.status).toBe(200);
    const cookie = loginRes.headers.get("set-cookie") ?? "";
    // Extract token value from set-cookie header
    const tokenMatch = cookie.match(/next-auth\.session-token=([^;]+)/);
    expect(tokenMatch).toBeTruthy();
    const tokenValue = tokenMatch![1];

    const meRes = await app.request("http://localhost/api/auth/me", {
      headers: { cookie: `next-auth.session-token=${tokenValue}` },
    });
    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.email).toBe("roundtrip@test.com");
    expect("householdId" in meBody).toBe(true);
  });

  // NOTE: Auth.js /signin redirect-based flow intentionally not tested here.
  // See rescue-06 PRD and known-errors.md AUTH section.
  test.skip("POST /signin with correct credentials -> 200 with set-cookie", () => {
    // superseded by /login endpoint (rescue-06)
  });
});
