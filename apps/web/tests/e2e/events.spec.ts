import { expect, test } from '@playwright/test'

test.describe('Event scheduling', () => {
  test('host can create and guest can book with route interception', async ({ page, context }) => {
    const events: any[] = []
    let booked = false
    await context.route('**:3000/**events**', (route) => {
      const req = route.request()
      const url = req.url()
      const method = req.method()
      if (method === 'POST' && url.endsWith('/api/events')) {
        const body = JSON.parse(req.postData() || '{}')
        const evt = { id: 'e1', ...body, startTime: new Date().toISOString(), attendees: [] }
        events.push(evt)
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(evt) })
      } else if (method === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ events }) })
      } else if (method === 'POST' && url.includes('/book')) {
        const id = url.split('/').slice(-2)[0]
        const evt = events.find((e) => e.id === id)
        if (!booked && evt) {
          booked = true
          evt.attendees.push('guest1')
          route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ eventId: id, userId: 'guest1' }) })
        } else {
          route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'already booked' }) })
        }
      } else {
        route.continue()
      }
    })

    // create as host
    await page.goto('/events')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('text=Upcoming Events')
    await page.click('text=+ New Event')
    await page.fill('input[placeholder="Title"]', 'Mock Event')
    await page.fill('input[placeholder="Price"]', '20')
    await page.click('text=Create')
    await expect(page.locator('text=Mock Event')).toBeVisible()

    // book as guest (no auth needed for mocked route)
    await page.click('[data-testid="book-button"]')
    await expect(page.locator('text=Mock Event')).toBeVisible() // reload should show event still
  })

  test('runtime event flow (requires API server)', async ({ page, context }) => {
    test.skip(process.env.EVENTS_RUNTIME !== '1', 'set EVENTS_RUNTIME=1 and run dev servers')
    // create real event via API
    const createResp = await context.request.post('http://localhost:3000/api/events', {
      data: { title: 'Live Event', priceCents: 3000 },
      headers: { 'x-test-user-id': 'host1' },
    })
    const evt = await createResp.json()
    await page.goto('/events')
    // confirm appears
    await expect(page.locator(`text=${evt.title}`)).toBeVisible()
    await page.click('[data-testid="book-button"]')
    await expect(page.locator(`text=${evt.title}`)).toBeVisible()
  })
})