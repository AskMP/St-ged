import { expect, test } from '@playwright/test'

test.describe('Dietary adaptation', () => {
  test('adapts recipe and shows substitutions', async ({ page, context }) => {
    // Mock all API calls to localhost:3000
    await context.route('http://localhost:3000/**', async (route) => {
      const url = route.request().url()
      
      if (url.includes('/recipes/r1') && !url.includes('/cost')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'r1',
            title: 'Pasta with Butter Sauce',
            ingredients: [
              { name: 'pasta', quantity: 200, unit: 'g' },
              { name: 'butter', quantity: 2, unit: 'tbsp' },
              { name: 'cheese', quantity: 50, unit: 'g' },
              { name: 'milk', quantity: 100, unit: 'ml' },
            ],
          }),
        })
      } else if (url.includes('/recipes/r1/cost')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ costPerServing: 0, pantryDeduction: 0 }),
        })
      } else if (url.includes('/dietary/profiles')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ profiles: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'] }),
        })
      } else if (url.includes('/dietary/adapt')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            originalRecipeId: 'r1',
            profile: 'vegan',
            substitutions: [
              { original: 'butter', replacement: 'coconut oil or vegan butter', reason: 'Vegan alternative' },
              { original: 'cheese', replacement: 'nutritional yeast or vegan cheese', reason: 'Vegan alternative' },
              { original: 'milk', replacement: 'oat milk or almond milk', reason: 'Vegan alternative' },
            ],
            adaptedRecipe: {
              id: 'r1-vegan',
              title: 'Pasta with Butter Sauce (vegan)',
              ingredients: ['pasta', 'coconut oil or vegan butter', 'nutritional yeast or vegan cheese', 'oat milk or almond milk'],
            },
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/recipes/r1')
    await page.waitForSelector('[data-testid="recipe-detail"]')

    // Wait for dietary adaptation section to load
    await page.waitForSelector('[data-testid="dietary-adaptation"]', { timeout: 10000 })

    // Click vegan adaptation button
    await page.click('button:has-text("Vegan")')

    // Verify substitutions are shown
    await expect(page.locator('[data-testid="substitutions-list"]')).toBeVisible()

    // Verify save button exists
    await expect(page.locator('[data-testid="save-adapted-recipe"]')).toBeVisible()
  })

  test('toggles individual substitutions', async ({ page, context }) => {
    // Mock all API calls to localhost:3000
    await context.route('http://localhost:3000/**', async (route) => {
      const url = route.request().url()
      
      if (url.includes('/recipes/r1') && !url.includes('/cost')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'r1',
            title: 'Test Recipe',
            ingredients: [{ name: 'butter' }, { name: 'cheese' }],
          }),
        })
      } else if (url.includes('/recipes/r1/cost')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ costPerServing: 0, pantryDeduction: 0 }),
        })
      } else if (url.includes('/dietary/profiles')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ profiles: ['dairy-free'] }),
        })
      } else if (url.includes('/dietary/adapt')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            originalRecipeId: 'r1',
            profile: 'dairy-free',
            substitutions: [
              { original: 'butter', replacement: 'coconut oil', reason: 'Dairy-free alternative' },
              { original: 'cheese', replacement: 'dairy-free cheese', reason: 'Dairy-free alternative' },
            ],
            adaptedRecipe: { id: 'r1-df', title: 'Test Recipe (dairy-free)' },
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/recipes/r1')
    await page.waitForSelector('[data-testid="dietary-adaptation"]')

    // Click dairy-free button
    await page.click('button:has-text("Dairy-Free")')

    // Verify both substitutions shown
    await expect(page.locator('[data-testid="sub-toggle-0"]')).toBeVisible()
    await expect(page.locator('[data-testid="sub-toggle-1"]')).toBeVisible()

    // Toggle off first substitution
    await page.click('[data-testid="sub-toggle-0"]')

    // Verify it's unchecked (the checkbox should not be checked)
    const checkbox = page.locator('[data-testid="sub-toggle-0"]')
    await expect(checkbox).not.toBeChecked()
  })

  test('runtime dietary adaptation (requires API server)', async ({ page, context }) => {
    test.skip(process.env.DIETARY_RUNTIME !== '1', 'Set DIETARY_RUNTIME=1 and run dev servers to exercise real API')

    // Get guest session
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

    // Create a test recipe
    await page.evaluate(async () => {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-recipe', title: 'Test Recipe', ingredients: ['butter', 'cheese', 'milk'] }),
      })
    })

    await page.goto('/recipes/test-recipe')
    await page.waitForSelector('[data-testid="dietary-adaptation"]')

    // Click vegetarian
    await page.click('text=Vegetarian')

    // Verify substitutions appear
    await expect(page.locator('[data-testid="substitutions-list"]')).toBeVisible()
  })
})
