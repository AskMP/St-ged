import { test, expect } from '@playwright/test'
import { injectOnboardingComplete } from './helpers/fixtures'

// Mocks for household ops API endpoints
export async function mockHouseholdOpsApi(page, overrides = {}) {
  // cost history GET
  await page.route('**/households/*/costs', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(overrides.history ?? []) })
    } else if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(overrides.addCostResponse ?? { id: 'c1', date: new Date().toISOString(), total: 0, splits: {} }),
      })
    } else {
      route.continue()
    }
  })
  // rotation endpoints
  await page.route('**/households/*/rotation', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(overrides.rotation ?? {}) })
    } else if (route.request().method() === 'POST') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(overrides.rotationResponse ?? overrides.rotation ?? {}) })
    } else {
      route.continue()
    }
  })
  await page.route('**/households/*/rotation/assignments**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(overrides.assignments ?? []) })
  })
}

test.describe('Household Ops UI', () => {
  // helper to set minimal GET mocks for cost/rotation
  async function baseMock(page) {
    await injectOnboardingComplete(page)
    // generic GET costs returns empty history
    await page.route('**/households/*/costs', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      } else {
        route.continue()
      }
    })
    // generic rotation GET empty
    await page.route('**/households/*/rotation', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      } else {
        route.continue()
      }
    })
    await page.route('**/households/*/rotation/assignments**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
  }

  test('can add a cost entry and view it', async ({ page }) => {
    page.on('console', (msg) => console.log('[PAGE]', msg.text()))
    page.on('pageerror', (err) => console.log('[PAGE_ERROR]', err.message))
    await baseMock(page)
    const fakeEntry = { id: 'c1', date: '2025-01-01T00:00:00Z', total: 60, splits: { user1: 60 } }
    // override POST response only
    await page.route('**/households/*/costs', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(fakeEntry),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/household-ops')
    const inputLocator = page.locator('[data-testid="cost-input"]')
    await inputLocator.waitFor({ state: 'visible' })
    await inputLocator.fill('60')
    await page.click('[data-testid="cost-submit"]')
    await expect(page.getByTestId('cost-history')).toContainText('user1: $60.00')
  })

  test('can configure rotation and see assignments', async ({ page }) => {
    await baseMock(page)
    const settings = { householdId: 'hid', frequency: 'weekly', members: ['a', 'b'] }
    const assigns = [{ date: '2025-01-01', userId: 'a' }]
    // override rotation GET/POST and assignments
    await page.route('**/households/*/rotation', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(settings) })
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(settings) })
      } else {
        route.continue()
      }
    })
    await page.route('**/households/*/rotation/assignments**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(assigns) })
    })

    await page.goto('/household-ops')
    await page.fill('[data-testid="rotation-members"]', 'a,b')
    await page.click('[data-testid="rotation-submit"]')
    await expect(page.getByTestId('rotation-settings')).toContainText('a, b')
    await expect(page.getByTestId('rotation-assignments')).toContainText('a')
  })
})