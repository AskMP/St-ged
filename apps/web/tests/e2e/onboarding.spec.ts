/**
 * Jordan Flow -- First Apartment Cook
 *
 * Tests the signup -> onboarding -> planning flow.
 * All API calls are mocked via page.route().
 * Uses page.addInitScript() to seed auth state BEFORE page.goto().
 *
 * Jordan's persona: 23, solo, beginner skill level, needs pantry setup.
 */
import { expect, test } from "@playwright/test";

const MOCK_USER = {
  id: "user-jordan",
  email: "jordan@staged.test",
  name: "Jordan",
  householdId: null as string | null,
  skillLevel: "beginner",
  role: "member",
};

const MOCK_USER_WITH_HH = {
  ...MOCK_USER,
  householdId: "hh-jordan",
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/auth/signup", (route) => {
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "Account created" }),
    });
  });
  await page.route("**/api/auth/signin", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  await page.route("**/api/auth/me", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_USER),
    });
  });
  await page.route("**/api/households", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "hh-jordan", name: "Jordan's Household" }),
      });
    } else {
      route.continue();
    }
  });
  await page.route("**/api/households/**", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.route("**/api/recipes**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "r1",
          title: "Easy Pasta",
          skill_level: "beginner",
          zero_waste: false,
          cook_time_minutes: 20,
          servings: 2,
        },
        {
          id: "r2",
          title: "Simple Salad",
          skill_level: "beginner",
          zero_waste: true,
          cook_time_minutes: 10,
          servings: 1,
        },
      ]),
    });
  });
  // block socket.io
  await page.route("**/socket.io/**", (route) => route.abort());
});

test("Jordan: signup page renders correctly", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.locator('[data-testid="signup-page"]')).toBeVisible();
  await expect(page.getByText("Stàged").first()).toBeVisible();
  await expect(page.locator("#displayName")).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.locator("#passwordConfirm")).toBeVisible();
});

test("Jordan: client-side validation on blank submit", async ({ page }) => {
  await page.goto("/signup");
  await page.locator('[data-testid="signup-submit"]').click();
  await expect(page.getByText("Please tell us your name.")).toBeVisible();
});

test("Jordan: password mismatch shows error", async ({ page }) => {
  await page.goto("/signup");
  await page.locator("#displayName").fill("Jordan");
  await page.locator("#email").fill("jordan@staged.test");
  await page.locator("#password").fill("password123");
  await page.locator("#passwordConfirm").fill("different456");
  await page.locator('[data-testid="signup-submit"]').click();
  await expect(page.getByText("Passwords don't match.")).toBeVisible();
});

test("Jordan: onboarding step 1 -- skill level selection", async ({ page }) => {
  // Inject auth with no householdId
  await page.addInitScript(
    ({ key, stored }) => {
      localStorage.setItem(key, JSON.stringify(stored));
    },
    {
      key: "staged-auth",
      stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
    },
  );
  await page.goto("/onboarding");
  await expect(page.locator('[data-testid="skill-step"]')).toBeVisible();
  // Jordan selects Beginner (her skill level)
  await page.locator('[data-testid="skill-beginner"]').click();
  await expect(page.locator('[data-testid="skill-beginner"]')).toContainText(
    "Beginner",
  );
  // Continue button enabled after selection
  await page.locator('[data-testid="skill-continue"]').click();
  await expect(page.locator('[data-testid="household-step"]')).toBeVisible();
});

test("Jordan: onboarding step 2 -- solo household", async ({ page }) => {
  await page.addInitScript(
    ({ key, stored }) => {
      localStorage.setItem(key, JSON.stringify(stored));
    },
    {
      key: "staged-auth",
      stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
    },
  );
  await page.goto("/onboarding");
  // Step 1
  await page.locator('[data-testid="skill-beginner"]').click();
  await page.locator('[data-testid="skill-continue"]').click();
  // Step 2: solo
  await page.locator('[data-testid="household-solo"]').click();
  await page.locator('[data-testid="household-continue"]').click();
  // Step 3: dietary
  await expect(page.locator('[data-testid="dietary-step"]')).toBeVisible();
});

test("Jordan: full onboarding flow -> planning", async ({ page }) => {
  await page.addInitScript(
    ({ key, stored }) => {
      localStorage.setItem(key, JSON.stringify(stored));
    },
    {
      key: "staged-auth",
      stored: {
        state: { user: MOCK_USER_WITH_HH, isLoading: false },
        version: 0,
      },
    },
  );
  // Mock plan endpoint for /planning
  await page.route("**/api/households/**/plans/week**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ plan: { id: "plan-1" }, entries: [] }),
    });
  });
  await page.goto("/onboarding");
  // Step 1: skill
  await page.locator('[data-testid="skill-home_cook"]').click();
  await page.locator('[data-testid="skill-continue"]').click();
  // Step 2: household (solo)
  await page.locator('[data-testid="household-solo"]').click();
  await page.locator('[data-testid="household-continue"]').click();
  // Step 3: dietary (skip)
  await page.locator('[data-testid="dietary-skip"]').click();
  // Step 4: pantry (skip)
  await page.locator('[data-testid="pantry-continue"]').click();
  // Should navigate to /planning (A2HS not available in test browsers)
  await page.waitForURL("**/planning", { timeout: 5000 });
  await expect(page.locator('[data-testid="planning-page"]')).toBeVisible();
});
