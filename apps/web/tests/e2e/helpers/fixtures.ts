import type { Page, Route } from "@playwright/test";

// ---- Auth store helpers (staged-auth Zustand persist store) ----

/**
 * Inject auth user into the staged-auth Zustand persist store.
 * Must be called BEFORE page.goto() (guardrail: Zustand localStorage injection).
 */
export async function injectAuthUser(
  page: Page,
  opts: {
    id?: string;
    email?: string;
    name?: string;
    householdId?: string;
    skillLevel?: string;
    role?: string;
  } = {},
) {
  const user = {
    id: opts.id ?? "user-demo",
    email: opts.email ?? "demo@staged.test",
    name: opts.name ?? "Demo User",
    householdId: opts.householdId ?? "demo-household",
    skillLevel: opts.skillLevel ?? "beginner",
    role: opts.role ?? "member",
  };
  await page.addInitScript(
    ({ key, stored }) => {
      localStorage.setItem(key, JSON.stringify(stored));
    },
    {
      key: "staged-auth",
      stored: { state: { user, isLoading: false }, version: 0 },
    },
  );
}

// ---- Onboarding state helpers ----

/**
 * Inject onboarding state via addInitScript so Zustand reads it on mount.
 * Must be called BEFORE page.goto().
 */
export async function injectOnboardingComplete(
  page: Page,
  opts: {
    skillLevel?: string;
    householdSize?: number;
    householdId?: string;
  } = {},
) {
  const {
    skillLevel = "beginner",
    householdSize = 1,
    householdId = "demo-household",
  } = opts;
  await page.addInitScript(
    (stored) => {
      localStorage.setItem("staged-onboarding", JSON.stringify(stored));
    },
    {
      state: {
        step: "complete",
        skillLevel,
        householdSize,
        householdId,
        dietary: [],
      },
      version: 0,
    },
  );
}

export async function resetOnboarding(page: Page) {
  await page.evaluate(() => localStorage.removeItem("staged-onboarding"));
}

export async function setOnboardingStep(
  page: Page,
  step: string,
  extra: Record<string, unknown> = {},
) {
  await page.evaluate(
    ({ step, extra }) => {
      localStorage.setItem(
        "staged-onboarding",
        JSON.stringify({ state: { step, ...extra }, version: 0 }),
      );
    },
    { step, extra },
  );
}

// ---- Shared fixture data ----

export function getMondayISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export const mockRecipes = [
  {
    id: "r-pasta",
    title: "Pasta Primavera",
    diet: "vegetarian",
    ingredients: [
      { name: "pasta", quantity: "200g" },
      { name: "zucchini", quantity: "1" },
    ],
    steps: ["Boil pasta", "Sauté zucchini", "Combine"],
    nutrition_per_serving: { calories: 420, protein: 12, carbs: 65, fat: 10 },
  },
  {
    id: "r-lentil",
    title: "Red Lentil Soup",
    diet: "vegan",
    ingredients: [
      { name: "red lentils", quantity: "1 cup" },
      { name: "cumin", quantity: "1 tsp" },
    ],
    steps: ["Rinse lentils", "Simmer 25 mins", "Blend"],
    nutrition_per_serving: { calories: 310, protein: 18, carbs: 48, fat: 4 },
  },
];

export const mockWeekPlan = {
  plan: { id: "plan-demo" },
  entries: [
    {
      id: "entry-1",
      recipeId: "r-pasta",
      recipeTitle: "Pasta Primavera",
      date: getMondayISO(),
      mealType: "dinner",
    },
  ],
};

export const mockGroceryList = {
  id: "list-demo",
  name: "Week of demo",
  items: [
    {
      id: "i1",
      listId: "list-demo",
      name: "pasta 200g",
      checked: false,
      updatedAt: 0,
    },
    {
      id: "i2",
      listId: "list-demo",
      name: "zucchini",
      checked: false,
      updatedAt: 0,
    },
    {
      id: "i3",
      listId: "list-demo",
      name: "red lentils 1 cup",
      checked: false,
      updatedAt: 0,
    },
  ],
};

export const mockFulfillmentLink = {
  url: "https://www.instacart.com/store/1234/cart?affiliate_id=affiliate-test&items=pasta",
  token: "tok-demo",
  attribution: { affiliate: "affiliate-test" },
  bundles: [
    {
      name: "Premium Spices Pack",
      description: "Add gourmet spices for 5% off",
    },
  ],
};

// ---- Route interceptors ----

export async function mockRecipesApi(page: Page, overrides?: unknown[]) {
  const recipes = overrides ?? mockRecipes;
  await page.route("**/recipes?**", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(recipes),
    });
  });
  await page.route("**/recipes", (route: Route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(recipes),
      });
    } else {
      route.continue();
    }
  });
  await page.route("**/recipes/r-pasta", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipes[0]),
    });
  });
  await page.route("**/recipes/r-lentil", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipes[1]),
    });
  });
}

export async function mockPlanApi(page: Page) {
  await page.route("**/plans/week**", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockWeekPlan),
    });
  });
  await page.route("**/generate-list", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockGroceryList),
    });
  });
}

export async function mockFulfillmentApi(page: Page) {
  await page.route("**/fulfillment/instacart-link", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockFulfillmentLink),
    });
  });
}

export async function mockAuthApi(page: Page) {
  await page.route("**/auth/guest", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "guest-token", userId: "user-demo" }),
    });
  });
  await page.route("**/auth/me", (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "user-demo", name: "Demo User", email: null }),
    });
  });
}

export async function mockHouseholdsApi(page: Page) {
  await page.route("**/households", (route: Route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "demo-household", name: "Demo Household" }),
      });
    } else {
      route.continue();
    }
  });
  await page.route("**/pantry/templates/**", (route: Route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}

// ---- High-level flow helpers ----

/**
 * Login as an existing user via the login form.
 * Requires a live API at process.env.API_URL (or localhost:3000).
 * MUST only be used in tests gated on API_URL env var.
 */
export async function loginAs(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.locator("input[type='email'], #email").fill(email);
  await page.locator("input[type='password'], #password").fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/planning/, { timeout: 10_000 });
}

/**
 * Sign up a new user and log in. Generates a unique email if not provided.
 * Requires a live API at process.env.API_URL (or localhost:3000).
 * MUST only be used in tests gated on API_URL env var.
 */
export async function signupAndLogin(
  page: Page,
  email?: string,
  password?: string,
): Promise<{ email: string; password: string }> {
  const e = email ?? `e2e-${Date.now()}@staged.test`;
  const p = password ?? "testpass123";
  const apiBase = process.env.API_URL ?? "http://localhost:3000";
  await page.request.post(`${apiBase}/api/auth/signup`, {
    data: { email: e, password: p, displayName: "E2E User" },
  });
  await loginAs(page, e, p);
  return { email: e, password: p };
}

/**
 * Create a household via the API (requires live API).
 * Returns the household ID.
 */
export async function createHousehold(
  page: Page,
  name: string,
): Promise<string> {
  const apiBase = process.env.API_URL ?? "http://localhost:3000";
  const res = await page.request.post(`${apiBase}/api/households`, {
    data: { name },
  });
  const body = (await res.json()) as { id: string };
  return body.id;
}

/**
 * Skip onboarding by injecting completed state into localStorage.
 * Must be called BEFORE page.goto().
 */
export async function skipOnboarding(
  page: Page,
  opts: {
    skillLevel?: string;
    householdSize?: number;
    householdId?: string;
  } = {},
): Promise<void> {
  await injectOnboardingComplete(page, opts);
}

/**
 * Set the browser context (all pages) to offline mode.
 * Also dispatches the 'offline' event on the page.
 */
export async function goOffline(page: Page): Promise<void> {
  const context = page.context();
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
}

/**
 * Restore the browser context to online mode.
 * Also dispatches the 'online' event on the page.
 */
export async function goOnline(page: Page): Promise<void> {
  const context = page.context();
  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
}
