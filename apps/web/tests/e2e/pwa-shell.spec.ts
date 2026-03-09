/**
 * Offline Smoke Test -- PWA Shell
 *
 * Tests the offline indicator and that the recipe library shows recipes
 * when the network goes down (Dexie cache / mocked API before offline).
 *
 * Pattern: populate mocked API response before goto(), set offline, re-visit,
 * confirm offline indicator is visible.
 *
 * Design principle 5 (Offline First): every page must display its last-known
 * data when the network is unavailable. The offline indicator must be visible
 * without being annoying.
 */
import { expect, test } from "@playwright/test";

const MOCK_USER = {
  id: "user-offline-test",
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

test.beforeEach(async ({ page }) => {
  // Inject auth before page load (staged-auth Zustand persist store guardrail)
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

test("offline indicator appears when network goes offline", async ({
  page,
  context,
}) => {
  // Load recipes while online so the page renders
  await page.goto("/recipes");
  await expect(page.locator('[data-testid="recipe-library"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).toBeVisible();

  // Confirm indicator is not visible while online
  await expect(
    page.locator('[data-testid="offline-indicator"]'),
  ).not.toBeVisible();

  // Go offline
  await context.setOffline(true);
  // Dispatch the offline event so React state updates immediately
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));

  // Offline indicator must be visible
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
  await expect(
    page.getByText("You're offline. Showing saved data."),
  ).toBeVisible();
});

test("offline indicator disappears when network comes back online", async ({
  page,
  context,
}) => {
  await page.goto("/recipes");
  await expect(page.locator('[data-testid="recipe-library"]')).toBeVisible();

  // Go offline then back online
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(
    page.locator('[data-testid="offline-indicator"]'),
  ).not.toBeVisible();
});

test("recipes page renders content loaded before going offline", async ({
  page,
  context,
}) => {
  // Visit recipes while online -- content loaded from mocked API
  await page.goto("/recipes");
  await expect(page.locator('[data-testid="recipe-library"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-lentil"]'),
  ).toBeVisible();

  // Go offline
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));

  // Offline indicator visible
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

  // Page content still visible (SPA state; no reload needed in this test)
  await expect(page.locator('[data-testid="recipe-library"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).toBeVisible();
});

test("app shell bottom nav is present for authenticated users", async ({
  page,
}) => {
  await page.goto("/recipes");
  await expect(page.locator('[data-testid="nav-planning"]')).toBeVisible();
  await expect(page.locator('[data-testid="nav-recipes"]')).toBeVisible();
  await expect(page.locator('[data-testid="nav-pantry"]')).toBeVisible();
  await expect(page.locator('[data-testid="nav-household"]')).toBeVisible();
});
