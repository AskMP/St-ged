import { expect, test } from '@playwright/test'

// These tests require the dev server at http://localhost:5173
// The API is mocked via route interception so no API server is required.

test.describe('Fulfillment page', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the providers list
    await page.route('**/fulfillment/providers', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ providers: ['instacart', 'kroger'] }),
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

  test('provider selector appears and switching triggers API', async ({ page }) => {
    // intercept providers list to include multiple options
    await page.route('**/fulfillment/providers', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ providers: ['instacart', 'kroger'] }),
      })
    })
    // also intercept link so page doesn't actually navigate
    await page.route('**/fulfillment/link', (route) => {
      const post = route.request().postDataJSON()
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          provider: post.provider,
          url: 'https://www.instacart.com',
          token: 'tok',
          attribution: { affiliate: 'a' },
        }),
      })
    })
    await page.goto('/fulfillment?listId=list-e2e')
    const select = page.getByTestId('provider-select')
    await expect(select).toBeVisible()
    await select.selectOption('kroger')

    // wait for the POST request to fire and verify body
    const req = await page.waitForRequest((req) =>
      req.url().includes('/fulfillment/link') && req.method() === 'POST'
    )
    const body = req.postDataJSON()
    expect(body.provider).toBe('kroger')
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
    await page.unroute('**/fulfillment/link')
    await page.route('**/fulfillment/link', (route) => {
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

  test('runtime fulfillment flow (requires API server)', async ({ page, context }) => {
    test.skip(process.env.FULFILLMENT_RUNTIME !== '1', 'set FULFILLMENT_RUNTIME=1 and run web+api dev servers')
    // create household, list, and item via real API
    const hres = await context.request.post('http://localhost:3000/api/households', { data: { name: 'LiveHouse' } })
    const { id: hid } = await hres.json()
    const lres = await context.request.post(`http://localhost:3000/api/households/${hid}/lists`, { data: {} })
    const list = await lres.json()
    await context.request.post(`http://localhost:3000/api/lists/${list.id}/items`, { data: { name: 'Eggs' } })

    // navigate to fulfillment page using real API
    await page.goto(`/fulfillment?listId=${list.id}`)
    await expect(page.getByTestId('instacart-cta')).toBeVisible()
    // provider-select should appear (service will return default providers)
    await expect(page.getByTestId('provider-select')).toBeVisible()
  })
})
