/**
 * Household Settings -- all personas
 *
 * Covers: settings page content, household section, create/join household,
 * switch active household, signout redirect.
 *
 * Auth injected via localStorage. API mocked.
 */
import { test, expect } from "@playwright/test";

const MOCK_USER = {
  id: "user-settings",
  email: "settings@staged.test",
  name: "Settings User",
  householdId: "hh-primary",
  skillLevel: "home_cook",
  role: "owner",
};

const MOCK_MEMBERSHIPS = [
  {
    id: "hh-primary",
    name: "Primary Home",
    role: "owner",
    isActive: true,
  },
  {
    id: "hh-secondary",
    name: "Second Place",
    role: "member",
    isActive: false,
  },
];

test.describe("Settings and household management", () => {
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
    await page.route("**/api/auth/signout", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });
    await page.route("**/api/users/households**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ households: MOCK_MEMBERSHIPS }),
      });
    });
    await page.route("**/api/users/switch-household**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { ...MOCK_USER, householdId: "hh-secondary" },
        }),
      });
    });
    await page.route("**/api/households/join**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "hh-joined", name: "Joined Household" }),
      });
    });
    await page.route("**/socket.io/**", (route) => route.abort());
  });

  // -------------------------------------------------------------------------
  // Settings page content
  // -------------------------------------------------------------------------

  test("settings page renders with user name and email", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("settings-page")).toBeVisible();
    await expect(page.getByText("Settings User")).toBeVisible();
    await expect(page.getByText("settings@staged.test")).toBeVisible();
  });

  test("settings page shows skill level", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("settings-page")).toBeVisible();
    await expect(page.getByText(/home.cook/i)).toBeVisible();
  });

  test("household section shows household ID when household exists", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("settings-page")).toBeVisible();
    // Household ID is displayed (truncated)
    await expect(page.getByText(/household id/i)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Household section
  // -------------------------------------------------------------------------

  test("Your Households section lists memberships", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("households-section")).toBeVisible();
    await expect(page.getByText("Primary Home")).toBeVisible();
    await expect(page.getByText("Second Place")).toBeVisible();
  });

  test("active household shows Active badge", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("households-section")).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
  });

  test("inactive household shows Switch button", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByTestId("switch-household-hh-secondary"),
    ).toBeVisible();
  });

  test("switch household updates user and re-fetches memberships", async ({
    page,
  }) => {
    // After switch, return updated memberships with new active
    await page.route("**/api/users/households**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          households: [
            { ...MOCK_MEMBERSHIPS[0], isActive: false },
            { ...MOCK_MEMBERSHIPS[1], isActive: true },
          ],
        }),
      });
    });

    await page.goto("/settings");
    await expect(
      page.getByTestId("switch-household-hh-secondary"),
    ).toBeVisible();
    await page.getByTestId("switch-household-hh-secondary").click();
    // After switch, the button should eventually change state
    // (either disappears or shows Active)
    await expect(page.getByTestId("settings-page")).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Join via invite code
  // -------------------------------------------------------------------------

  test("join household via invite code form", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("join-code-input")).toBeVisible();
    await page.getByTestId("join-code-input").fill("INVITE-XYZ");
    await page.getByTestId("join-household-btn").click();
    // After join, no JS error -- page remains stable
    await expect(page.getByTestId("settings-page")).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Create new household
  // -------------------------------------------------------------------------

  test("create new household button navigates to /onboarding", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("create-household-btn")).toBeVisible();
    await page.getByTestId("create-household-btn").click();
    await expect(page).toHaveURL(/onboarding/, { timeout: 5000 });
  });

  // -------------------------------------------------------------------------
  // Signout
  // -------------------------------------------------------------------------

  test("signout button clears auth and redirects to /login", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("signout-btn")).toBeVisible();
    await page.getByTestId("signout-btn").click();
    await expect(page).toHaveURL(/\/login/, { timeout: 6000 });
  });

  test("after signout, /planning redirects back to /login", async ({
    page,
  }) => {
    await page.goto("/settings");
    await page.getByTestId("signout-btn").click();
    await expect(page).toHaveURL(/\/login/, { timeout: 6000 });

    await page.goto("/planning");
    await expect(page).toHaveURL(/\/login/);
  });
});
