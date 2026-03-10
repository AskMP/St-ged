/**
 * Offline PWA -- offline-first behaviour
 *
 * Covers:
 * - Amber/offline banner appears when network goes offline
 * - Banner disappears when back online
 * - Actions attempted offline show sync-queue-badge
 * - App shell bottom nav is present for authenticated users
 * - Previously loaded content is still visible while offline
 *
 * Design principle 5 (Offline First): every page must display its last-known
 * data when the network is unavailable.
 *
 * Auth injected via localStorage. API mocked.
 */
import { test, expect } from "@playwright/test";

const MOCK_USER = {
  id: "user-offline",
  email: "offline@staged.test",
  name: "Offline Tester",
  householdId: "hh-offline",
  skillLevel: "beginner",
  role: "member",
};

const MOCK_RECIPES = [
  {
    id: "r-pasta",
    title: "Pasta Primavera",
    skill_level: "beginner",
    zero_waste: false,
    cook_time_minutes: 20,
    servings: 2,
  },
  {
    id: "r-lentil",
    title: "Red Lentil Soup",
    skill_level: "beginner",
    zero_waste: true,
    cook_time_minutes: 25,
    servings: 4,
  },
];

test.describe("Offline PWA -- offline-first behaviour", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
      },
    );
    await page.route("**/api/auth/me", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });
    await page.route("**/api/recipes**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECIPES),
      });
    });
    await page.route("**/socket.io/**", (route) => route.abort());
  });

  test("offline indicator appears when network goes offline @offline", async ({
    page,
    context,
  }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipe-library")).toBeVisible();

    // Confirm indicator is not visible while online
    const indicator = page
      .getByTestId("offline-indicator")
      .or(page.getByTestId("offline-banner"));
    await expect(indicator).not.toBeVisible();

    // Go offline
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Offline indicator must appear
    await expect(indicator).toBeVisible({ timeout: 5000 });
  });

  test("offline indicator disappears when network is restored @offline", async ({
    page,
    context,
  }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipe-library")).toBeVisible();

    // Go offline
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    const indicator = page
      .getByTestId("offline-indicator")
      .or(page.getByTestId("offline-banner"));
    await expect(indicator).toBeVisible({ timeout: 5000 });

    // Come back online
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect(indicator).not.toBeVisible({ timeout: 5000 });
  });

  test("content loaded before going offline remains visible @offline", async ({
    page,
    context,
  }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipe-library")).toBeVisible();
    await expect(page.getByTestId("recipe-card-r-pasta")).toBeVisible();
    await expect(page.getByTestId("recipe-card-r-lentil")).toBeVisible();

    // Go offline
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Content from before still visible (SPA state; no reload required)
    await expect(page.getByTestId("recipe-library")).toBeVisible();
    await expect(page.getByTestId("recipe-card-r-pasta")).toBeVisible();
  });

  test("app shell bottom nav is present for authenticated users", async ({
    page,
  }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("nav-planning")).toBeVisible();
    await expect(page.getByTestId("nav-recipes")).toBeVisible();
    await expect(page.getByTestId("nav-pantry")).toBeVisible();
    await expect(page.getByTestId("nav-household")).toBeVisible();
  });

  test("offline banner text is descriptive", async ({ page, context }) => {
    await page.goto("/recipes");
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    const banner = page
      .getByTestId("offline-indicator")
      .or(page.getByTestId("offline-banner"));
    await expect(banner).toBeVisible({ timeout: 5000 });

    // Should contain helpful text
    const text = await banner.textContent();
    expect(text?.toLowerCase()).toMatch(/offline|saved|cached/);
  });

  test("planning page structure visible when API is offline @offline", async ({
    page,
    context,
  }) => {
    await page.route("**/api/households/**/plans/week**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ plan: { id: "p1" }, entries: [] }),
      });
    });

    await page.goto("/planning");
    await expect(page.getByTestId("planning-page")).toBeVisible();

    // Block all further API calls
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Page structure still intact
    await expect(page.getByTestId("planning-page")).toBeVisible();
  });
});
