import { test, expect } from '@playwright/test'

test.describe('Potluck flows', () => {
  test('slot locking prevents double-claim', async ({ page, context }) => {
    // backend state simulated via route intercepts on API port
    const event = { id: 'e1', title: 'Race Event', slots: [{ id: 's1', description: 'Dish' }] }
    let claimed = false

    // catch both /potluck and /api/potluck paths
    await context.route('**:3000/**potluck**', (route) => {
      const req = route.request()
      const url = req.url()
      const method = req.method()
      if (method === 'POST' && url.endsWith('/api/potluck')) {
        // create event
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(event),
        })
      } else if (method === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(event),
        })
      } else if (method === 'POST' && url.includes('/slots/s1/claim')) {
        if (!claimed) {
          claimed = true
          event.slots[0].guestName = 'Alice'
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(event),
          })
        } else {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'already claimed' }),
          })
        }
      } else {
        route.continue()
      }
    })

    const page1 = await context.newPage()
    const page2 = await context.newPage()

    await page1.goto(`/potluck/${event.id}`)
    await page2.goto(`/potluck/${event.id}`)

    // wait for the claim input to become available
    await page1.waitForSelector('[placeholder="Your name"]', { timeout: 10000 })
    await page2.waitForSelector('[placeholder="Your name"]', { timeout: 10000 })

    await page1.fill('[placeholder="Your name"]', 'Alice')
    await page1.click('text=Claim')
    await expect(page1.locator('text=Taken by Alice')).toBeVisible()

    await page2.fill('[placeholder="Your name"]', 'Bob')
    await page2.click('text=Claim')
    await expect(page2.locator('[data-testid="claim-error"]')).toBeVisible()
  })
})
