import { expect, test } from '@playwright/test'

// simple mock response for suggestions + expiring
const mockResult = {
  suggestions: [
    {
      recipe: { id: 'r1', title: 'Mock Recipe', diet: 'vegan' },
      coverageScore: 0.8,
      matchedIngredients: ['tomato'],
      missingIngredients: ['water'],
    },
  ],
  expiringItems: [
    { id: 'p1', name: 'Milk', expiresAt: '2025-01-01', daysUntilExpiry: 0 },
  ],
}

test.describe('Fridge Clearance page', () => {
  test('shows guidance when no household param', async ({ page }) => {
    await page.goto('/fridge-clearance')
    await expect(page.getByTestId('no-household-msg')).toBeVisible()
  })

  test('fetch error shows error message', async ({ page, context }) => {
    // intercept only the backend API call (port 3000) and abort to simulate failure
    await context.route('**:3000/fridge-clearance**', (route) => route.abort())
    await page.goto('/fridge-clearance?householdId=abc')
    await expect(page.getByTestId('fridge-error')).toBeVisible()
  })

  test('renders suggestions and expiring items when API returns data', async ({ page, context }) => {
    // mock only the backend API request
    await context.route('**:3000/fridge-clearance**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResult),
      })
    )
    await page.goto('/fridge-clearance?householdId=abc')
    await expect(page.getByRole('heading', { name: /What can I make\?/i })).toBeVisible()
    await expect(page.getByTestId('expiring-items')).toBeVisible()
    await expect(page.getByTestId('suggestion-card')).toBeVisible()
    await expect(page.getByText('Mock Recipe')).toBeVisible()
  })
})
