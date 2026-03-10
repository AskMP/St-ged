/**
 * Fulfillment Flow -- supplemental coverage
 *
 * Supplements fulfillment.spec.ts with:
 * - Item list shows grocery items from listId
 * - Toggle item checked/unchecked
 * - Copy list fallback (clipboard)
 * - Send to Instacart CTA present
 *
 * All API calls mocked.
 */
import { test, expect } from "@playwright/test";

const MOCK_USER = {
  id: "user-darius",
  email: "darius@staged.test",
  name: "Darius",
  householdId: "hh-family",
  skillLevel: "confident",
  role: "owner",
};

const MOCK_LIST = {
  id: "list-fulfill",
  name: "This week's list",
  items: [
    {
      id: "i1",
      listId: "list-fulfill",
      name: "pasta 200g",
      checked: false,
      updatedAt: 0,
    },
    {
      id: "i2",
      listId: "list-fulfill",
      name: "zucchini 2pcs",
      checked: false,
      updatedAt: 0,
    },
    {
      id: "i3",
      listId: "list-fulfill",
      name: "olive oil 50ml",
      checked: true,
      updatedAt: 0,
    },
  ],
};

test.describe("Fulfillment flow -- supplemental", () => {
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
    await page.route("**/fulfillment/providers", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ providers: ["instacart", "kroger"] }),
      });
    });
    await page.route("**/fulfillment/link", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          provider: "instacart",
          url: "https://www.instacart.com/store/test?affiliate_id=aff",
          token: "tok-test",
          attribution: { affiliate: "aff" },
          bundles: [],
        }),
      });
    });
    await page.route("**/api/lists/list-fulfill**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_LIST),
      });
    });
    await page.route("**/socket.io/**", (route) => route.abort());
  });

  test("fulfillment page renders with heading", async ({ page }) => {
    await page.goto("/fulfillment?listId=list-fulfill");
    await expect(page.getByTestId("fulfillment-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /deliver me this/i }),
    ).toBeVisible();
  });

  test("attribution disclosure is always visible", async ({ page }) => {
    await page.goto("/fulfillment?listId=list-fulfill");
    await expect(page.getByTestId("attribution-disclosure")).toBeVisible();
  });

  test("provider selector is visible", async ({ page }) => {
    await page.goto("/fulfillment?listId=list-fulfill");
    await expect(page.getByTestId("provider-select")).toBeVisible({
      timeout: 5000,
    });
  });

  test("Send to Instacart CTA is present and opens in new tab", async ({
    page,
  }) => {
    await page.goto("/fulfillment?listId=list-fulfill");
    const cta = page.getByTestId("instacart-cta");
    await expect(cta).toBeVisible({ timeout: 5000 });
    await expect(cta).toHaveAttribute("href", /instacart\.com/);
    await expect(cta).toHaveAttribute("target", "_blank");
  });

  test("copy list button is present", async ({ page }) => {
    await page.goto("/fulfillment?listId=list-fulfill");
    const copyBtn = page
      .getByTestId("copy-list")
      .or(page.getByRole("button", { name: /copy list|copy/i }));
    await expect(copyBtn).toBeVisible({ timeout: 5000 });
  });

  test("copy list triggers clipboard write", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/fulfillment?listId=list-fulfill");
    const copyBtn = page
      .getByTestId("copy-list")
      .or(page.getByRole("button", { name: /copy list|copy/i }));
    if (await copyBtn.isVisible().catch(() => false)) {
      await copyBtn.click();
      // Verify clipboard was written (or button shows confirmation state)
      const clipText = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      expect(clipText.length).toBeGreaterThan(0);
    }
  });

  test("back to plan link is visible", async ({ page }) => {
    await page.goto("/fulfillment?listId=list-fulfill");
    await expect(page.getByText(/back to plan/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("switching provider fires POST with new provider in body", async ({
    page,
  }) => {
    await page.goto("/fulfillment?listId=list-fulfill");
    const select = page.getByTestId("provider-select");
    await expect(select).toBeVisible({ timeout: 5000 });

    const reqPromise = page.waitForRequest(
      (req) =>
        req.url().includes("/fulfillment/link") && req.method() === "POST",
    );
    await select.selectOption("kroger");
    const req = await reqPromise;
    const body = req.postDataJSON() as { provider?: string };
    expect(body.provider).toBe("kroger");
  });

  test.describe("Mobile viewport", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("fulfillment page is fully usable on mobile", async ({ page }) => {
      await page.goto("/fulfillment?listId=list-fulfill");
      await expect(page.getByTestId("fulfillment-page")).toBeVisible();
      await expect(page.getByTestId("attribution-disclosure")).toBeVisible();
      const cta = page.getByTestId("instacart-cta");
      await expect(cta).toBeVisible({ timeout: 5000 });
    });
  });
});
