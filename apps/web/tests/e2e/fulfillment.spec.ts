import { test, expect } from '@playwright/test'

// These tests require the dev server at http://localhost:5173
// The API is mocked via route interception so no API server is required.

test.describe('Fulfillment page', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the providers list
    await page.route('**/fulfillment/providers', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ providers: ['instacart'] }),
      })
    })

    // Intercept the generic link API call
    await page.route('**/fulfillment/link', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          provider: 'instacart',
          url: 'https://www.instacart.com/store/1234/cart?affiliate_id=affiliate-test&items=pasta',
          token: 'tok-e2e',
          attribution: { affiliate: 'affiliate-test' },
          bundles: [
            { name: 'Premium Spices Pack', description: 'Add gourmet spices for 5% off' },
          ],
        }),
      })
    })
  })

  test('shows fulfillment page heading', async ({ page }) => {
    await page.goto('/fulfillment?listId=list-e2e')
    await expect(page.getByTestId('fulfillment-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Deliver Me This' })).toBeVisible()
  })

  test('always shows attribution disclosure', async ({ page }) => {
    await page.goto('/fulfillment?listId=list-e2e')
    await expect(page.getByTestId('attribution-disclosure')).toBeVisible()
    await expect(page.getByText(/Affiliate disclosure/)).toBeVisible()
  })

  test('shows no-list message when listId is missing', async ({ page }) => {
    await page.goto('/fulfillment')
    await expect(page.getByTestId('no-list-message')).toBeVisible()
  })

  test('renders bundle suggestions', async ({ page }) => {
    await page.goto('/fulfillment?listId=list-e2e')
    await expect(page.getByTestId('bundle-list')).toBeVisible()
    await expect(page.getByText('Premium Spices Pack')).toBeVisible()
    await expect(page.getByText('Add gourmet spices for 5% off')).toBeVisible()
  })

  test('renders partner attribution metadata', async ({ page }) => {
    await page.goto('/fulfillment?listId=list-e2e')
    await expect(page.getByTestId('partner-attribution')).toBeVisible()
    await expect(page.getByText(/affiliate-test/)).toBeVisible()
  })

  test('renders Instacart CTA link', async ({ page }) => {
    await page.goto('/fulfillment?listId=list-e2e')
    const cta = page.getByTestId('instacart-cta')
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', /instacart\.com/)
    await expect(cta).toHaveAttribute('target', '_blank')
  })

  test('shows error when API fails', async ({ page }) => {
    await page.unroute('**/fulfillment/instacart-link')
    await page.route('**/fulfillment/instacart-link', (route) => {
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    })
    await page.goto('/fulfillment?listId=list-e2e')
    await expect(page.getByTestId('fulfillment-error')).toBeVisible()
  })

  test('back to plan link is visible', async ({ page }) => {
    await page.goto('/fulfillment?listId=list-e2e')
    await expect(page.getByText(/Back to plan/)).toBeVisible()
  })

  test.describe('Mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('fulfillment page renders correctly on mobile', async ({ page }) => {
      await page.goto('/fulfillment?listId=list-mobile')
      await expect(page.getByTestId('fulfillment-page')).toBeVisible()
      await expect(page.getByTestId('attribution-disclosure')).toBeVisible()
      // CTA should be full-width and visible without horizontal scroll
      const cta = page.getByTestId('instacart-cta')
      await expect(cta).toBeVisible()
      await expect(cta).toBeVisible()
      await expect(cta).toHaveAttribute('href', /instacart\.com/)
    })
  })
})
