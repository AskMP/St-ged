---
task: "Testing -- Vitest config, Playwright config, browser/offline/device validation baseline"
branch: "stg-00g/testing"
test_command: "pnpm test"
completion_promise: "COMPLETE"
max_iterations: 8
chain_next: "00h"
requires: ["00e", "00f"]
parallel_safe: false
group: 0
manifest_id: "00g"
---

# PRD: Testing Setup

## Context for Agent

### What This PRD Does

Configures Vitest for unit/integration testing across both apps, Playwright for browser and mobile-emulation validation, coverage reporting at the 75% threshold, and adds offline/device verification scaffolding that later PRDs must reuse. By the end, the project can prove behavior in tests, in a real browser, and in an ADB-assisted smoke path when device tooling is available.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00b | App skeletons with test runner in package.json scripts | `apps/web/`, `apps/api/` |
| 00e | API routes skeleton, health endpoint | `apps/api/src/` |
| 00f | UI primitives and design tokens | `apps/web/src/components/`, `apps/web/src/styles/` |

### Key Files to Read First

- `CLAUDE.md` -- testing conventions (Vitest, Playwright, 75% coverage target)
- `apps/web/package.json` -- current web scripts
- `apps/api/package.json` -- current API scripts

### Patterns to Follow

```typescript
// apps/web/tests/unit/Button.test.tsx -- Vitest + React Testing Library pattern
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with primary variant by default', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Delete</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-[var(--color-danger)]')
  })
})
```

```typescript
// apps/web/tests/e2e/home.spec.ts -- Playwright pattern
import { test, expect } from '@playwright/test'

test('homepage loads with Stàged branding', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Stàged')
  await expect(page).toHaveTitle(/Stàged/)
})
```

```typescript
// apps/api/tests/health.test.ts -- Hono test pattern (already created in 00e)
// vitest.config.ts pattern
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom' for web
    coverage: {
      provider: 'v8',
      threshold: { lines: 75, functions: 75, branches: 75, statements: 75 },
      reporter: ['text', 'lcov', 'html'],
    },
  },
})
```

### Skills and Commands

| Action | Command |
|--------|---------|
| Run all tests | `pnpm test` |
| Run web tests | `pnpm --filter web test` |
| Run API tests | `pnpm --filter api test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Coverage report | `pnpm --filter web test --coverage` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [x] **Task 1: Configure Vitest for web app and route-level tests** `[BD:STG-38]`
  - **Type**: task
  - **Do**: Create `apps/web/vitest.config.ts` using `defineConfig` with: `environment: 'jsdom'`, `setupFiles: ['./tests/setup.ts']`, coverage provider `v8` with 75% threshold (lines, functions, branches, statements), reporters `['text', 'lcov']`. Create `apps/web/tests/setup.ts` importing `@testing-library/jest-dom/vitest` matchers. Add `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` to `apps/web` devDependencies. Update `apps/web/package.json` `test` script to `vitest run` and add `test:watch` as `vitest`. Add a route-level test harness that renders the actual app router so later UI features can prove route reachability instead of isolated component rendering only.
  - **Files**: `apps/web/vitest.config.ts`, `apps/web/tests/setup.ts`, `apps/web/package.json`
  - **Verify**: `pnpm --filter web test` runs (may pass 0 tests -- that's ok at this stage)
  - **Accept**: Vitest config valid; route-level test harness exists; test runner starts without errors

- [x] **Task 2: Configure Vitest for API integration tests** `[BD:STG-39]`
  - **Type**: task
  - **Do**: Create `apps/api/vitest.config.ts` with `environment: 'node'`, coverage provider `v8` with 75% threshold, same reporters as web. Update `apps/api/package.json` test scripts. Ensure the existing API tests hit the actual Hono app or Node server surface instead of only mocked functions. Add a pattern for route-level integration tests so later PRDs can prove mounted endpoints, auth, and DB integration.
  - **Files**: `apps/api/vitest.config.ts`, `apps/api/package.json`
  - **Verify**: `pnpm --filter api test` runs and the health test passes
  - **Accept**: API Vitest config valid; health test suite passes against the real app surface

- [x] **Task 3: Install and configure Playwright for desktop and mobile emulation** `[BD:STG-40]`
  - **Type**: task
  - **Do**: Add `@playwright/test` to `apps/web` devDependencies. Run `pnpm --filter web exec playwright install chromium webkit` to install the required browsers. Create `apps/web/playwright.config.ts` with: `testDir: './tests/e2e'`, `baseURL: 'http://localhost:5173'`, `webServer: {command: "pnpm dev", url: "http://localhost:5173", reuseExistingServer: !process.env.CI}`, trace/screenshot retention for failures, and projects for `chromium`, `mobile-chrome`, and `webkit`. Add `test:e2e` and `test:e2e:headed` scripts to `apps/web/package.json`.
  - **Files**: `apps/web/package.json`, `apps/web/playwright.config.ts`
  - **Verify**: `pnpm --filter web test:e2e --list` shows no errors (even if 0 tests listed)
  - **Accept**: Playwright config valid; desktop and mobile-emulation projects are available; E2E runner starts

- [x] **Task 4: Write baseline route, browser, and offline tests** `[BD:STG-41]`
  - **Type**: task
  - **Do**: Create `apps/web/tests/unit/Button.test.tsx` and `apps/web/tests/unit/cn.test.ts` as baseline examples, but also add one route-level test that renders the real app entry point and one Playwright smoke test that loads the homepage without console errors. Add an offline-oriented test or helper that proves the test suite can simulate offline state for later PWA work.
  - **Files**: `apps/web/tests/unit/Button.test.tsx`, `apps/web/tests/unit/cn.test.ts`, `apps/web/tests/unit/app-routes.test.tsx`, `apps/web/tests/e2e/home.spec.ts`
  - **Verify**: `pnpm --filter web test` passes all unit tests
  - **Accept**: Baseline unit, route-level, and browser smoke tests pass in the web app

- [x] **Task 5: Add device-smoke detection and offline verification commands** `[BD:STG-42]`
  - **Type**: task
  - **Do**: Add a small verification script such as `scripts/check-adb-device.sh` or `scripts/check-adb-device.ts` that detects whether `adb` is available and whether a device is authorized. Add root scripts such as `pnpm test:browser`, `pnpm test:offline`, and `pnpm test:device`. The device script must instruct the agent to prompt the user to connect/authorize a device if none is available, while allowing browser work to continue.
  - **Files**: `scripts/check-adb-device.sh` or `scripts/check-adb-device.ts`, `package.json`
  - **Verify**: Running the device-check script exits 0 with a connected device or exits non-zero with a clear prompt message
  - **Accept**: Browser/offline/device verification commands exist and clearly differentiate available vs blocked device validation

- [x] **Task 6: Add test commands to turbo pipeline** `[BD:STG-43]`
  - **Type**: task
  - **Do**: Ensure `turbo.json` has `test` task configured: `dependsOn: ["^build"]`, outputs `["coverage/**"]`. Add `test:coverage` script to root package.json: `turbo run test -- --coverage`. Ensure root scripts expose browser and offline verification commands alongside `pnpm test`. Verify `pnpm test` runs all workspace tests.
  - **Files**: `turbo.json`, `package.json`
  - **Verify**: `pnpm test` from root runs both web and API test suites
  - **Accept**: Root test commands cover unit/integration suites and expose browser/offline/device verification entry points

- [x] **Task 7: Update manifest** `[BD:STG-44]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00g`. Change `status: pending` to `status: complete`. Update Current State to `7 / 38 PRDs complete`. Confirm `00h` (requires: 00c, 00g) is now unblocked.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00g" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated; 00h unblocked at 7/38 progress

---

## Discovered Tasks

_None yet._
