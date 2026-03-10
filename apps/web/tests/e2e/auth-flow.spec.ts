/**
 * Auth Flow -- all personas
 *
 * Covers: signup, login, auth guard redirects, signout, session persistence.
 * Mocked API for fast execution; live-API block gated on API_URL env var.
 */
import { test, expect } from "@playwright/test";

const LIVE = !!process.env.API_URL;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function mockAuthApis(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/signup", (route) => {
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "Account created" }),
    });
  });
  await page.route("**/api/auth/signin", (route) => {
    const body = route.request().postDataJSON() as { email?: string };
    if (body?.email?.includes("wrong")) {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "invalid_credentials" }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    }
  });
  await page.route("**/api/auth/me", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "user-test",
        email: "user@staged.test",
        name: "Test User",
        householdId: "hh-test",
        skillLevel: "beginner",
        role: "member",
      }),
    });
  });
  await page.route("**/api/auth/signout", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route("**/api/households/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ households: [] }),
    });
  });
  await page.route("**/socket.io/**", (route) => route.abort());
}

async function injectAuth(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ({ key, stored }) => {
      localStorage.setItem(key, JSON.stringify(stored));
    },
    {
      key: "staged-auth",
      stored: {
        state: {
          user: {
            id: "user-test",
            email: "user@staged.test",
            name: "Test User",
            householdId: "hh-test",
            skillLevel: "beginner",
            role: "member",
          },
          isLoading: false,
        },
        version: 0,
      },
    },
  );
}

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------

test.describe("Auth flow -- login", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApis(page);
  });

  test("login page renders email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-page")).toBeVisible();
    await expect(page.locator("input[type='email'], #email")).toBeVisible();
    await expect(
      page.locator("input[type='password'], #password"),
    ).toBeVisible();
  });

  test("login page has create account link", async ({ page }) => {
    await page.goto("/login");
    const signupLink = page.getByRole("link", {
      name: /create|sign up|register/i,
    });
    await expect(signupLink).toBeVisible();
  });

  test("wrong password shows error message", async ({ page }) => {
    await page.goto("/login");
    await page.locator("input[type='email'], #email").fill("wrong@staged.test");
    await page.locator("input[type='password'], #password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    // Error box or message must appear
    await expect(
      page.locator(
        '[data-testid="login-error"], [role="alert"], .text-red-600, .text-amber-600',
      ),
    ).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

test.describe("Auth flow -- guard redirects", () => {
  test("unauthenticated user visiting /planning redirects to /login", async ({
    page,
  }) => {
    await page.route("**/socket.io/**", (route) => route.abort());
    // No auth injected
    await page.goto("/planning");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user visiting /recipes redirects to /login", async ({
    page,
  }) => {
    await page.route("**/socket.io/**", (route) => route.abort());
    await page.goto("/recipes");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user visiting /pantry redirects to /login", async ({
    page,
  }) => {
    await page.route("**/socket.io/**", (route) => route.abort());
    await page.goto("/pantry");
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Session persistence
// ---------------------------------------------------------------------------

test.describe("Auth flow -- session persistence", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApis(page);
  });

  test("authenticated user can access /planning without redirect", async ({
    page,
  }) => {
    await injectAuth(page);
    await page.route("**/api/households/**/plans/week**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ plan: { id: "p1" }, entries: [] }),
      });
    });
    await page.goto("/planning");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByTestId("planning-page")).toBeVisible();
  });

  test("Zustand auth state persists across page reload", async ({ page }) => {
    await injectAuth(page);
    await page.route("**/api/households/**/plans/week**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ plan: { id: "p1" }, entries: [] }),
      });
    });
    await page.goto("/planning");
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Signout
// ---------------------------------------------------------------------------

test.describe("Auth flow -- signout", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApis(page);
  });

  test("signout button navigates to /login", async ({ page }) => {
    await injectAuth(page);
    await page.goto("/settings");
    await page.getByTestId("signout-btn").click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("after signout, /planning redirects to /login", async ({ page }) => {
    await injectAuth(page);
    await page.goto("/settings");
    await page.getByTestId("signout-btn").click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    await page.goto("/planning");
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Live-API gated tests
// ---------------------------------------------------------------------------

test.describe("Auth flow -- live API", () => {
  test("signup with existing email returns 409 (not 400)", async ({ page }) => {
    test.skip(!LIVE, "requires live API -- set API_URL=http://localhost:3000");

    const email = `existing-${Date.now()}@staged.test`;
    // First signup
    await page.request.post(`${process.env.API_URL}/api/auth/signup`, {
      data: { email, password: "pass1234", displayName: "First" },
    });
    // Second signup with same email
    const res = await page.request.post(
      `${process.env.API_URL}/api/auth/signup`,
      {
        data: { email, password: "pass1234", displayName: "Duplicate" },
      },
    );
    expect([409, 422]).toContain(res.status());
  });

  test("login with correct credentials redirects to /planning", async ({
    page,
  }) => {
    test.skip(!LIVE, "requires live API -- set API_URL=http://localhost:3000");

    const email = `login-${Date.now()}@staged.test`;
    await page.request.post(`${process.env.API_URL}/api/auth/signup`, {
      data: { email, password: "correct123", displayName: "LoginTest" },
    });

    await page.goto("/login");
    await page.locator("input[type='email'], #email").fill(email);
    await page.locator("input[type='password'], #password").fill("correct123");
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/planning/, { timeout: 8000 });
    await expect(page).toHaveURL(/\/planning/);
  });
});
