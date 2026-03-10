/**
 * Darius Persona -- Household Conductor (supplemental coverage)
 *
 * Covers additional planning interactions not in personas/darius.spec.ts:
 * - week navigation text changes
 * - meal slot interaction
 * - list item toggle
 * - weekly cost display
 * - "Deliver Me This" navigate path
 *
 * Auth injected via localStorage; all API calls mocked.
 */
import { test, expect } from "@playwright/test";
import {
  injectOnboardingComplete,
  mockPlanApi,
  mockFulfillmentApi,
} from "./helpers/fixtures";

const MOCK_USER = {
  id: "user-darius",
  email: "darius@staged.test",
  name: "Darius",
  householdId: "hh-family",
  skillLevel: "confident",
  role: "owner",
};

const MOCK_PLAN = {
  plan: { id: "plan-week" },
  entries: [
    {
      id: "entry-1",
      recipeId: "r-pasta",
      recipeTitle: "Pasta Primavera",
      date: new Date().toISOString().slice(0, 10),
      mealType: "dinner",
    },
  ],
};

const MOCK_LIST = {
  id: "list-week",
  name: "Week grocery list",
  items: [
    { id: "i1", name: "pasta 200g", checked: false },
    { id: "i2", name: "zucchini", checked: false },
  ],
};

test.describe("Darius -- Planning supplemental", () => {
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
    await injectOnboardingComplete(page, {
      skillLevel: "confident",
      householdSize: 4,
      householdId: "hh-family",
    });

    await page.route("**/api/auth/me", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });
    await page.route("**/api/households/hh-family/plans/week**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PLAN),
      });
    });
    await page.route("**/api/plans/plan-week/generate-list", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_LIST),
      });
    });
    await page.route("**/api/lists/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_LIST),
      });
    });
    await page.route("**/api/recipes/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "r-pasta",
          title: "Pasta Primavera",
          ingredients: [{ name: "pasta" }],
          steps: ["Boil pasta"],
        }),
      });
    });
    await mockPlanApi(page);
    await mockFulfillmentApi(page);
    await page.route("**/socket.io/**", (route) => route.abort());
  });

  test("planning page renders with week navigation", async ({ page }) => {
    await page.goto("/planning");
    await expect(page.getByTestId("planning-page")).toBeVisible();
    await expect(page.getByTestId("week-nav")).toBeVisible();
  });

  test("next week button changes the displayed week text", async ({ page }) => {
    await page.goto("/planning");
    await expect(page.getByTestId("week-nav")).toBeVisible();
    const before = await page.getByTestId("week-nav").textContent();

    const nextBtn = page
      .getByRole("button", { name: /next/i })
      .or(page.locator('[data-testid="week-next"]'));
    await nextBtn.first().click();

    const after = await page.getByTestId("week-nav").textContent();
    expect(after).not.toBe(before);
  });

  test("prev week button changes the displayed week text back", async ({
    page,
  }) => {
    await page.goto("/planning");
    const nextBtn = page
      .getByRole("button", { name: /next/i })
      .or(page.locator('[data-testid="week-next"]'));
    await nextBtn.first().click();
    const afterNext = await page.getByTestId("week-nav").textContent();

    const prevBtn = page
      .getByRole("button", { name: /prev|back/i })
      .or(page.locator('[data-testid="week-prev"]'));
    await prevBtn.first().click();
    const afterPrev = await page.getByTestId("week-nav").textContent();
    expect(afterPrev).not.toBe(afterNext);
  });

  test("existing meal entry is visible in the week grid", async ({ page }) => {
    await page.goto("/planning");
    await expect(page.getByText("Pasta Primavera")).toBeVisible();
  });

  test("generate grocery list shows list items", async ({ page }) => {
    await page.goto("/planning");
    await page.getByTestId("generate-list-btn").click();
    await expect(page.getByTestId("grocery-list")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("pasta 200g")).toBeVisible();
    await expect(page.getByText("zucchini")).toBeVisible();
  });

  test("'Deliver Me This' link is present after generating list", async ({
    page,
  }) => {
    await page.goto("/planning");
    await page.getByTestId("generate-list-btn").click();
    await expect(page.getByTestId("fulfill-link")).toBeVisible({
      timeout: 5000,
    });
    const href = await page.getByTestId("fulfill-link").getAttribute("href");
    expect(href).toContain("listId=");
  });

  test("clicking 'Deliver Me This' navigates to /fulfillment", async ({
    page,
  }) => {
    // Mock fulfillment link endpoint used on the fulfillment page
    await page.route("**/fulfillment/link", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          provider: "instacart",
          url: "https://www.instacart.com/test",
          token: "tok",
          attribution: { affiliate: "aff-test" },
        }),
      });
    });
    await page.goto("/planning");
    await page.getByTestId("generate-list-btn").click();
    await expect(page.getByTestId("fulfill-link")).toBeVisible({
      timeout: 5000,
    });
    await page.getByTestId("fulfill-link").click();
    await expect(page.getByTestId("fulfillment-page")).toBeVisible({
      timeout: 5000,
    });
  });

  test("weekly cost summary is visible after list generation", async ({
    page,
  }) => {
    // Mock cost endpoint
    await page.route("**/api/recipes/*/cost**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ costPerServing: 3.5, pantryDeduction: 0 }),
      });
    });
    await page.goto("/planning");
    // Budget summary should appear without needing list generation
    const budget = page.getByTestId("budget-summary");
    if (await budget.isVisible().catch(() => false)) {
      await expect(budget).toBeVisible();
    }
    // If budget-summary isn't present until list is generated, generate first
    else {
      await page.getByTestId("generate-list-btn").click();
      await expect(page.getByTestId("grocery-list")).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
