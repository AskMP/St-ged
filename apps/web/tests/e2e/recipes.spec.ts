/**
 * Maya Flow -- Eco-Anxious Planner
 *
 * Tests recipe library with zero-waste filter.
 * All API calls mocked. Auth injected via localStorage.
 *
 * Maya's persona: 31, zero-waste signal must be effortless to find.
 */
import { expect, test } from "@playwright/test";

const MOCK_USER = {
  id: "user-maya",
  email: "maya@staged.test",
  name: "Maya",
  householdId: "hh-eco",
  skillLevel: "home_cook",
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
  {
    id: "r-steak",
    title: "Grilled Steak",
    skill_level: "confident",
    zero_waste: false,
    cook_time_minutes: 30,
    servings: 2,
  },
];

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

  // Handle both /api/recipes and /api/recipes?... patterns
  await page.route("**/api/recipes**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_RECIPES),
    });
  });
  await page.route("**/socket.io/**", (route) => route.abort());
});

test("Maya: recipe library renders with all recipes", async ({ page }) => {
  await page.goto("/recipes");
  await expect(page.locator('[data-testid="recipe-library"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-lentil"]'),
  ).toBeVisible();
});

test("Maya: skill filter chips are visible (Jordan Confidence Rule)", async ({
  page,
}) => {
  await page.goto("/recipes");
  await expect(page.locator('[data-testid="skill-filters"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="skill-filter-beginner"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="skill-filter-home_cook"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="skill-filter-confident"]'),
  ).toBeVisible();
});

test("Maya: zero-waste toggle is visible (Maya Signal)", async ({ page }) => {
  await page.goto("/recipes");
  await expect(page.locator('[data-testid="zero-waste-toggle"]')).toBeVisible();
});

test("Maya: zero-waste toggle filters to only zero-waste recipes", async ({
  page,
}) => {
  await page.goto("/recipes");
  // All 3 recipes visible initially
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-lentil"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-steak"]'),
  ).toBeVisible();

  // Enable zero-waste filter
  await page.locator('[data-testid="zero-waste-toggle"]').click();

  // Only the zero-waste recipe should be visible
  await expect(
    page.locator('[data-testid="recipe-card-r-lentil"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).not.toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-steak"]'),
  ).not.toBeVisible();
});

test("Maya: zero-waste toggle off restores all recipes", async ({ page }) => {
  await page.goto("/recipes");
  // Toggle on
  await page.locator('[data-testid="zero-waste-toggle"]').click();
  await expect(
    page.locator('[data-testid="recipe-card-r-lentil"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).not.toBeVisible();

  // Toggle off
  await page.locator('[data-testid="zero-waste-toggle"]').click();
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-steak"]'),
  ).toBeVisible();
});

test("Maya: skill filter shows only beginner recipes", async ({ page }) => {
  await page.goto("/recipes");
  await page.locator('[data-testid="skill-filter-beginner"]').click();
  // beginner recipes
  await expect(
    page.locator('[data-testid="recipe-card-r-pasta"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="recipe-card-r-lentil"]'),
  ).toBeVisible();
  // confident recipe hidden
  await expect(
    page.locator('[data-testid="recipe-card-r-steak"]'),
  ).not.toBeVisible();
});
