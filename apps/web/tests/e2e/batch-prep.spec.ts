import { expect, test } from '@playwright/test'

test.describe('Batch-prep page', () => {
  test('combined list from selected recipes', async ({ page, context }) => {
    // stub recipe list and combine API
    const recipes = [
      { id: 'r1', name: 'Recipe One' },
      { id: 'r2', name: 'Recipe Two' },
    ]
    await context.route('**:3000/**api/recipes**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(recipes),
      })
    })

    await context.route('**:3000/**batch-prep**', (route) => {
      const req = route.request()
      const url = req.url()
      if (req.method() === 'POST' && url.includes('batch-prep/combine')) {
        // echo back sequence order and a fabricated item
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sequence: ['r1', 'r2'],
            items: [{ name: 'flour', count: 2 }],
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/batch-prep')
    await page.waitForSelector('[data-testid="batch-prep-page"]')

    // select both recipes
    await page.click('text=Recipe One')
    await page.click('text=Recipe Two')
    await page.click('[data-testid="combine-button"]')

    // verify result
    await expect(page.locator('text=Combined Ingredients')).toBeVisible()
    await expect(page.locator('text=flour')).toBeVisible()
    const seq = await page.locator('[data-testid="sequence-item"]').allTextContents()
    expect(seq).toEqual(['Recipe One', 'Recipe Two'])

    // start prep and advance
    await page.click('[data-testid="start-prep"]')
    await expect(page.locator('[data-testid="prep-state"]')).toHaveText(/Now cooking: Recipe One/)
    await page.click('[data-testid="next-recipe"]')
    await expect(page.locator('[data-testid="prep-state"]')).toHaveText(/Now cooking: Recipe Two/)
    await expect(page.locator('[data-testid="next-recipe"]')).toHaveCount(0)
  })

  test('runtime batch-prep flow (requires API server)', async ({ page, context }) => {
    test.skip(process.env.BATCH_RUNTIME !== '1', 'Set BATCH_RUNTIME=1 and run dev servers to exercise real API')

    // authenticate as guest and copy cookie into browser context
    const guest = await context.request.post('http://localhost:3000/api/auth/guest')
    const rawCookies = guest.headers()['set-cookie']
    if (rawCookies) {
      const list = Array.isArray(rawCookies) ? rawCookies : [rawCookies]
      const cookies = list.map((c) => {
        const [pair] = c.split(';')
        const [name, value] = pair.split('=')
        return { name, value, domain: 'localhost', path: '/' }
      })
      await context.addCookies(cookies)
    }

    // create two recipes via browser context so cookies (auth) are included
    await page.evaluate(async () => {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'r1', title: 'Real One', ingredients: ['a', 'b'] }),
      })
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'r2', title: 'Real Two', ingredients: ['b', 'c'] }),
      })
    })

    await page.goto('/batch-prep')
    await page.waitForSelector('[data-testid="batch-prep-page"]')

    // wait for the recipes list response and log body
    const listResp = await page.waitForResponse((r) => r.url().includes('/api/recipes') && r.status() === 200)
    const listBody = await listResp.json()
    console.log('recipes list', listBody)

    // select both recipes by their real titles
    await page.click('text=Real One')
    await page.click('text=Real Two')
    await page.click('[data-testid="combine-button"]')

    await expect(page.locator('text=Combined Ingredients')).toBeVisible()
    await expect(page.locator('text=b')).toBeVisible()
    const seq = await page.locator('[data-testid="sequence-item"]').allTextContents()
    expect(seq).toEqual(['Real One', 'Real Two'])

    // walkthrough prep
    await page.click('[data-testid="start-prep"]')
    await expect(page.locator('[data-testid="prep-state"]')).toHaveText(/Now cooking: Real One/)
  })
})
