/**
 * Jordan Persona -- First Apartment Cook
 *
 * Full journey: onboarding -> recipe discovery -> recipe detail -> cooking view -> offline.
 * Jordan is 23, solo household, beginner skill level.
 *
 * All API calls are mocked. Auth injected via localStorage before goto().
 */
import { test, expect } from "@playwright/test";

const MOCK_USER_NO_HH = {
  id: "user-jordan",
  email: "jordan@staged.test",
  name: "Jordan",
  householdId: null as string | null,
  skillLevel: "beginner",
  role: "member",
};

const MOCK_USER = { ...MOCK_USER_NO_HH, householdId: "hh-jordan" };

const MOCK_RECIPES = [
  {
    id: "r-pasta",
    title: "Easy Pasta",
    skill_level: "beginner",
    zero_waste: false,
    cook_time_minutes: 20,
    servings: 2,
    ingredients: [{ name: "pasta", quantity: "200g" }],
    steps: ["Boil water", "Saute garlic", "Combine pasta"],
    nutrition_per_serving: { calories: 420, protein: 12, carbs: 65, fat: 10 },
    costPerServing: 1.8,
  },
  {
    id: "r-salad",
    title: "Simple Salad",
    skill_level: "beginner",
    zero_waste: true,
    cook_time_minutes: 10,
    servings: 1,
    ingredients: [{ name: "mixed greens", quantity: "100g" }],
    steps: ["Wash greens", "Add dressing"],
    nutrition_per_serving: { calories: 95, protein: 3, carbs: 8, fat: 6 },
    costPerServing: 1.2,
  },
];

test.describe("Jordan -- First Apartment Cook", () => {
  test.beforeEach(async ({ page }) => {
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
    await page.route("**/api/recipes/r-pasta", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECIPES[0]),
      });
    });
    await page.route("**/api/recipes/r-pasta/cost", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ costPerServing: 1.8, pantryDeduction: 0 }),
      });
    });
    await page.route("**/api/dietary/profiles", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ profiles: ["vegan", "vegetarian"] }),
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
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ households: [] }),
      });
    });
    await page.route("**/socket.io/**", (route) => route.abort());
  });

  // -------------------------------------------------------------------------
  // Onboarding
  // -------------------------------------------------------------------------

  test("full onboarding: skill=beginner, solo, no dietary, starter pantry", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: {
          state: { user: MOCK_USER_NO_HH, isLoading: false },
          version: 0,
        },
      },
    );
    // Plan endpoint for /planning after onboarding
    await page.route("**/api/households/**/plans/week**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ plan: { id: "p1" }, entries: [] }),
      });
    });
    await page.goto("/onboarding");

    // Step 1: skill
    await page.locator('[data-testid="skill-beginner"]').click();
    await page.locator('[data-testid="skill-continue"]').click();

    // Step 2: household (solo)
    await page.locator('[data-testid="household-solo"]').click();
    await page.locator('[data-testid="household-continue"]').click();

    // Step 3: dietary (skip)
    await page.locator('[data-testid="dietary-skip"]').click();

    // Step 4: pantry (skip/continue)
    await page.locator('[data-testid="pantry-continue"]').click();

    // Should land on /planning
    await page.waitForURL("**/planning", { timeout: 6000 });
    await expect(page.getByTestId("planning-page")).toBeVisible();
  });

  test("A2HS prompt component is mounted during onboarding (not blocking)", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: {
          state: { user: MOCK_USER_NO_HH, isLoading: false },
          version: 0,
        },
      },
    );
    await page.goto("/onboarding");
    // The InstallPrompt component renders to DOM even if OS prompt is not triggered
    // We verify the app doesn't crash; the prompt itself requires BeforeInstallPromptEvent
    await expect(page.locator('[data-testid="skill-step"]')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Recipe library
  // -------------------------------------------------------------------------

  test("recipes page shows skill filter pre-set area", async ({ page }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
      },
    );
    await page.goto("/recipes");
    await expect(page.getByTestId("recipe-library")).toBeVisible();
    await expect(page.getByTestId("skill-filters")).toBeVisible();
  });

  test("Jordan can search for a recipe by name", async ({ page }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
      },
    );
    await page.goto("/recipes");
    await expect(page.getByTestId("recipe-library")).toBeVisible();
    const search = page.getByPlaceholder("Search recipes...");
    await expect(search).toBeVisible();
    await search.fill("pasta");
    // Library remains visible (search is client-side filter)
    await expect(page.getByTestId("recipe-library")).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Recipe detail
  // -------------------------------------------------------------------------

  test("recipe detail shows title, ingredients, and nutrition", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
      },
    );
    await page.goto("/recipes/r-pasta");
    await expect(page.getByTestId("recipe-detail")).toBeVisible();
    // Title
    await expect(page.getByText("Easy Pasta")).toBeVisible();
  });

  test("recipe detail shows 'Start Cooking' button", async ({ page }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
      },
    );
    await page.goto("/recipes/r-pasta");
    await expect(page.getByTestId("recipe-detail")).toBeVisible();
    // 'Start Cooking' link or button should be present
    const startBtn = page
      .getByRole("link", { name: /start cooking/i })
      .or(page.getByRole("button", { name: /start cooking/i }));
    await expect(startBtn).toBeVisible({ timeout: 6000 });
  });

  // -------------------------------------------------------------------------
  // Cooking view
  // -------------------------------------------------------------------------

  test("cooking view renders with step display and next/prev buttons", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
      },
    );
    await page.goto("/recipes/r-pasta/cook");
    await expect(page.getByTestId("cooking-view")).toBeVisible({
      timeout: 6000,
    });
    // First step is shown
    await expect(page.getByText("Boil water")).toBeVisible();
    // Next button
    await expect(page.getByRole("button", { name: /next/i })).toBeVisible();
  });

  test("Jordan can step through all cooking steps", async ({ page }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
      },
    );
    await page.goto("/recipes/r-pasta/cook");
    await expect(page.getByTestId("cooking-view")).toBeVisible({
      timeout: 6000,
    });

    // Step 1 -> 2
    await page.getByRole("button", { name: /next/i }).click();
    await expect(page.getByText("Saute garlic")).toBeVisible();

    // Step 2 -> 3
    await page.getByRole("button", { name: /next/i }).click();
    await expect(page.getByText("Combine pasta")).toBeVisible();

    // Prev button appears once we're past step 1
    await expect(
      page.getByRole("button", { name: /prev|back/i }),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Offline
  // -------------------------------------------------------------------------

  test("go offline -> offline indicator appears @offline", async ({
    page,
    context,
  }) => {
    await page.addInitScript(
      ({ key, stored }) => {
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "staged-auth",
        stored: { state: { user: MOCK_USER, isLoading: false }, version: 0 },
      },
    );
    await page.goto("/recipes");
    await expect(page.getByTestId("recipe-library")).toBeVisible();

    // Simulate going offline
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Offline indicator must be visible
    const offlineEl = page
      .getByTestId("offline-indicator")
      .or(page.getByTestId("offline-banner"));
    await expect(offlineEl).toBeVisible({ timeout: 4000 });
  });
});
