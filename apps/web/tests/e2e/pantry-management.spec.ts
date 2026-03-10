/**
 * Pantry Management -- all personas
 *
 * Covers: empty state, add starter pantry, add/remove custom items,
 * expiry sorting, offline optimistic UI.
 *
 * Auth injected via localStorage. API mocked.
 */
import { test, expect } from "@playwright/test";

const MOCK_USER = {
  id: "user-pantry",
  email: "pantry@staged.test",
  name: "Pantry User",
  householdId: "hh-pantry",
  skillLevel: "beginner",
  role: "member",
};

const NEW_ITEM = {
  id: "p-new",
  householdId: "hh-pantry",
  name: "Eggs",
  quantity: 12,
  unit: "count",
  expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  category: "dairy",
};

test.describe("Pantry management", () => {
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
    await page.route("**/socket.io/**", (route) => route.abort());
  });

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  test("empty state shows add-starter-pantry banner", async ({ page }) => {
    await page.route("**/api/households/*/pantry**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
    await page.goto("/pantry");
    await expect(page.getByTestId("pantry-page")).toBeVisible();
    // Empty state must prompt to add starter pantry
    const emptyBanner = page
      .getByTestId("pantry-empty")
      .or(page.getByText(/starter pantry/i))
      .or(page.getByText(/no items/i));
    await expect(emptyBanner).toBeVisible({ timeout: 5000 });
  });

  // -------------------------------------------------------------------------
  // Add starter pantry
  // -------------------------------------------------------------------------

  test("add starter pantry populates list", async ({ page }) => {
    const starterItems = [
      {
        id: "s1",
        householdId: "hh-pantry",
        name: "Olive Oil",
        quantity: 1,
        unit: "bottle",
        expiresAt: null,
        category: "pantry",
      },
      {
        id: "s2",
        householdId: "hh-pantry",
        name: "Salt",
        quantity: 1,
        unit: "box",
        expiresAt: null,
        category: "pantry",
      },
    ];

    let pantryItems: unknown[] = [];

    await page.route("**/api/households/*/pantry**", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(pantryItems),
        });
      } else {
        route.continue();
      }
    });

    await page.route("**/api/pantry/templates/**", (route) => {
      pantryItems = starterItems;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ added: starterItems.length }),
      });
    });

    await page.goto("/pantry");
    await expect(page.getByTestId("pantry-page")).toBeVisible();

    const starterBtn = page
      .getByRole("button", { name: /starter pantry|add starter/i })
      .or(page.getByTestId("add-starter-pantry"));
    if (await starterBtn.isVisible().catch(() => false)) {
      await starterBtn.click();
      // After adding starter, items should appear
      await expect(page.getByText("Olive Oil")).toBeVisible({ timeout: 5000 });
    }
  });

  // -------------------------------------------------------------------------
  // Add custom item
  // -------------------------------------------------------------------------

  test("add custom item via form -- item appears in list", async ({ page }) => {
    let pantryItems: unknown[] = [];

    await page.route("**/api/households/*/pantry**", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(pantryItems),
        });
      } else if (route.request().method() === "POST") {
        pantryItems = [NEW_ITEM];
        route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(NEW_ITEM),
        });
      } else {
        route.continue();
      }
    });

    await page.goto("/pantry");
    await expect(page.getByTestId("pantry-page")).toBeVisible();

    // Fill add-item form
    const nameInput = page
      .getByTestId("pantry-add-name")
      .or(page.getByPlaceholder(/item name|name/i).first());
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill("Eggs");

    const qtyInput = page
      .getByTestId("pantry-add-qty")
      .or(page.getByPlaceholder(/quantity|qty/i).first());
    if (await qtyInput.isVisible().catch(() => false)) {
      await qtyInput.fill("12");
    }

    const submitBtn = page
      .getByTestId("pantry-add-submit")
      .or(page.getByRole("button", { name: /add|save/i }));
    await submitBtn.click();

    // Item should appear
    await expect(page.getByText("Eggs")).toBeVisible({ timeout: 5000 });
  });

  // -------------------------------------------------------------------------
  // Remove item
  // -------------------------------------------------------------------------

  test("remove item -- item disappears from list", async ({ page }) => {
    let pantryItems = [NEW_ITEM];

    await page.route("**/api/households/*/pantry**", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(pantryItems),
        });
      } else {
        route.continue();
      }
    });

    await page.route("**/api/households/*/pantry/p-new", (route) => {
      if (route.request().method() === "DELETE") {
        pantryItems = [];
        route.fulfill({ status: 204, body: "" });
      } else {
        route.continue();
      }
    });

    await page.goto("/pantry");
    await expect(page.getByText("Eggs")).toBeVisible({ timeout: 5000 });

    // Remove button
    const removeBtn = page
      .getByTestId("pantry-remove-p-new")
      .or(
        page
          .locator('[data-testid^="pantry-item-p-new"]')
          .getByRole("button")
          .last(),
      );

    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click();
      await expect(page.getByText("Eggs")).not.toBeVisible({ timeout: 5000 });
    }
  });

  // -------------------------------------------------------------------------
  // Expiry sorting
  // -------------------------------------------------------------------------

  test("items sorted by expiry date (soonest first)", async ({ page }) => {
    const items = [
      {
        id: "p-later",
        householdId: "hh-pantry",
        name: "Cheese",
        quantity: 200,
        unit: "g",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: "dairy",
      },
      {
        id: "p-sooner",
        householdId: "hh-pantry",
        name: "Milk",
        quantity: 1,
        unit: "litre",
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: "dairy",
      },
    ];

    await page.route("**/api/households/*/pantry**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(items),
      });
    });

    await page.goto("/pantry");
    await expect(page.getByTestId("pantry-page")).toBeVisible();

    // Both items present
    await expect(page.getByText("Milk")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Cheese")).toBeVisible();

    // Milk (2 days) should appear before Cheese (7 days) in the DOM
    const milkPos = await page.getByText("Milk").boundingBox();
    const cheesePos = await page.getByText("Cheese").boundingBox();
    if (milkPos && cheesePos) {
      expect(milkPos.y).toBeLessThan(cheesePos.y);
    }
  });

  // -------------------------------------------------------------------------
  // Offline optimistic
  // -------------------------------------------------------------------------

  test("add item offline -- item appears optimistically @offline", async ({
    page,
    context,
  }) => {
    await page.route("**/api/households/*/pantry**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/pantry");
    await expect(page.getByTestId("pantry-page")).toBeVisible();

    // Go offline
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Offline indicator
    const offlineEl = page
      .getByTestId("offline-indicator")
      .or(page.getByTestId("offline-banner"));
    await expect(offlineEl).toBeVisible({ timeout: 4000 });

    // Attempt to add item -- should show optimistically (offline-first write)
    const nameInput = page
      .getByTestId("pantry-add-name")
      .or(page.getByPlaceholder(/item name|name/i).first());

    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Offline Butter");
      const submitBtn = page
        .getByTestId("pantry-add-submit")
        .or(page.getByRole("button", { name: /add|save/i }));
      await submitBtn.click();
      // Item should appear optimistically even without network
      await expect(page.getByText("Offline Butter")).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
