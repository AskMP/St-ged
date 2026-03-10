import { expect, test } from '@playwright/test'

const mockCost = (id: string) => ({ costPerServing: id === 'r1' ? 2 : 3, pantryDeduction: 0 })

test.describe('Cost-serving flows', () => {
  test('planning page shows weekly cost total', async ({ page, context }) => {
    await context.route('**:3000/recipes/*/cost**', (route) => {
      const url = route.request().url()
      const match = url.match(/recipes\/(.+?)\/cost/)
      const id = match ? match[1] : ''
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCost(id)) })
    })

    await page.goto('/planning')
    // wait for cost calculations to fire
    await page.waitForSelector('[data-testid="budget-summary"]')
    const text = await page.textContent('[data-testid="budget-summary"]')
    expect(text).toMatch(/Weekly cost: \$5\.00/) // 2 + 3
  })
})
