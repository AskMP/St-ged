import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for Staged web app.
 *
 * Run: pnpm --filter web test:e2e
 * List: pnpm --filter web test:e2e --list
 *
 * Most tests mock the API via page.route(). Live-API tests are gated on
 * the API_URL env var or feature-specific flags (e.g. FULFILLMENT_RUNTIME=1).
 */

const CI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",

  /* Maximum time one test can run */
  timeout: 30_000,

  /* Expect timeout */
  expect: {
    timeout: 8_000,
  },

  /* Retries on CI to handle flaky timing issues */
  retries: CI ? 2 : 0,

  /* Parallelism */
  workers: CI ? 1 : undefined,

  /* Reporter */
  reporter: CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    /* Collect traces on retry for debugging */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Viewport matching common mobile PWA target */
    viewport: { width: 390, height: 844 },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Start the Vite dev server automatically when running E2E tests.
   * Skipped in CI where the server is expected to already be running.
   */
  webServer: CI
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:5173",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
