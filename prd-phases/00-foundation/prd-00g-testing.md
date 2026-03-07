---
task: "Testing -- Vitest config, Playwright config, sample tests, coverage baseline"
branch: "stg-00g/testing"
test_command: "pnpm test"
completion_promise: "COMPLETE"
max_iterations: 8
chain_next: "00h"
requires: ["00e"]
parallel_safe: false
group: 0
manifest_id: "00g"
---

# PRD: Testing Setup

## Context for Agent

### What This PRD Does

Configures Vitest for unit/integration testing across both apps, Playwright for E2E browser testing, coverage reporting at the 75% threshold, and adds sample tests that establish the patterns all future PRDs will follow. By the end, `pnpm test` and `pnpm --filter web test:e2e` both pass.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00b | App skeletons with test runner in package.json scripts | `apps/web/`, `apps/api/` |
| 00e | API routes skeleton, health endpoint | `apps/api/src/` |
| 00f | UI components (Button, Card, etc.) | `apps/web/src/components/` |

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
    expect(btn.className).toContain('bg-chef-danger')
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

- [ ] **Task 1: Configure Vitest for web app** `[BD:STG-38]`
  - **Type**: task
  - **Do**: Create `apps/web/vitest.config.ts` using `defineConfig` with: `environment: 'jsdom'`, `setupFiles: ['./tests/setup.ts']`, coverage provider `v8` with 75% threshold (lines, functions, branches, statements), reporters `['text', 'lcov']`. Create `apps/web/tests/setup.ts` importing `@testing-library/jest-dom/vitest` matchers. Add `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` to `apps/web` devDependencies. Update `apps/web/package.json` `test` script to `vitest run` and add `test:watch` as `vitest`.
  - **Files**: `apps/web/vitest.config.ts`, `apps/web/tests/setup.ts`, `apps/web/package.json`
  - **Verify**: `pnpm --filter web test` runs (may pass 0 tests -- that's ok at this stage)
  - **Accept**: Vitest config valid; test runner starts without errors

- [ ] **Task 2: Configure Vitest for API** `[BD:STG-39]`
  - **Type**: task
  - **Do**: Create `apps/api/vitest.config.ts` with `environment: 'node'`, coverage provider `v8` with 75% threshold, same reporters as web. Update `apps/api/package.json` test scripts. Ensure the existing `apps/api/tests/health.test.ts` (from prd-00e) runs successfully.
  - **Files**: `apps/api/vitest.config.ts`, `apps/api/package.json`
  - **Verify**: `pnpm --filter api test` runs and the health test passes
  - **Accept**: API Vitest config valid; health test suite passes

- [ ] **Task 3: Install and configure Playwright** `[BD:STG-40]`
  - **Type**: task
  - **Do**: Add `@playwright/test` to `apps/web` devDependencies. Run `pnpm --filter web exec playwright install chromium` to install the Chromium browser. Create `apps/web/playwright.config.ts` with: `testDir: './tests/e2e'`, `baseURL: 'http://localhost:5173'`, `webServer: {command: "pnpm dev", url: "http://localhost:5173", reuseExistingServer: !process.env.CI}`, projects: `[{name: 'chromium', use: {browserName: 'chromium'}}]`. Add `test:e2e` script to `apps/web/package.json`: `playwright test`.
  - **Files**: `apps/web/package.json`, `apps/web/playwright.config.ts`
  - **Verify**: `pnpm --filter web test:e2e --list` shows no errors (even if 0 tests listed)
  - **Accept**: Playwright config valid; Chromium installed; E2E test runner starts

- [ ] **Task 4: Write sample unit tests** `[BD:STG-41]`
  - **Type**: task
  - **Do**: Create `apps/web/tests/unit/Button.test.tsx` using the Vitest + React Testing Library pattern shown above. Test: (1) renders with correct text, (2) primary/ghost/danger variant class names, (3) size variants, (4) disabled state. Create `apps/web/tests/unit/cn.test.ts` testing the `cn()` utility: merges classnames, handles undefined, handles arrays. Both test files should pass.
  - **Files**: `apps/web/tests/unit/Button.test.tsx`, `apps/web/tests/unit/cn.test.ts`
  - **Verify**: `pnpm --filter web test` passes all unit tests
  - **Accept**: 6+ unit tests passing in the web app

- [ ] **Task 5: Write sample E2E test** `[BD:STG-42]`
  - **Type**: task
  - **Do**: Create `apps/web/tests/e2e/home.spec.ts` using the Playwright pattern shown above. Test: (1) homepage loads without console errors, (2) "Stàged" text visible, (3) page title matches. This test will evolve as the UI develops -- the goal now is confirming E2E infrastructure works.
  - **Files**: `apps/web/tests/e2e/home.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e` passes (requires Vite dev server running)
  - **Accept**: At least 1 E2E test passing with Playwright + Chromium

- [ ] **Task 6: Add test commands to turbo pipeline** `[BD:STG-43]`
  - **Type**: task
  - **Do**: Ensure `turbo.json` has `test` task configured: `dependsOn: ["^build"]`, outputs `["coverage/**"]`. Add `test:coverage` script to root package.json: `turbo run test -- --coverage`. Verify `pnpm test` runs all workspace tests.
  - **Files**: `turbo.json`, `package.json`
  - **Verify**: `pnpm test` from root runs both web and API test suites
  - **Accept**: Root `pnpm test` passes all sample tests across both apps

- [ ] **Task 7: Update manifest** `[BD:STG-44]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00g`. Change `status: pending` to `status: complete`. Update Current State accordingly. Confirm `00h` (requires: 00g) is now unblocked.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00g" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated; 00h unblocked

---

## Discovered Tasks

_None yet._
