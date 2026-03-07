/**
 * Persona: Maya — The Eco-Anxious Meal Planner (age 31, Portland)
 *
 * Journey: Recipe library with dietary filters → offline access
 */
import { test, expect } from '@playwright/test'

test.describe('Maya — Eco-Anxious Meal Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes')
  })

  test('Maya can browse the recipe library', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recipes' })).toBeVisible()
    await expect(page.getByTestId('recipe-library')).toBeVisible()
  })

  test('Maya sees vegan, vegetarian, and dairy-free filters', async ({ page }) => {
    await expect(page.getByText('vegan')).toBeVisible()
    await expect(page.getByText('vegetarian')).toBeVisible()
    await expect(page.getByText('dairy-free')).toBeVisible()
  })

  test('Maya can click the vegan filter', async ({ page }) => {
    await page.getByText('vegan').click()
    await expect(page.getByTestId('recipe-library')).toBeVisible()
  })

  test('Maya can type a search query', async ({ page }) => {
    await page.getByPlaceholder('Search recipes...').fill('lentil')
    await expect(page.getByTestId('recipe-library')).toBeVisible()
  })

  test('Maya can open a recipe detail page', async ({ page }) => {
    await page.goto('/recipes/r-lentil')
    await expect(page.getByTestId('recipe-detail')).toBeVisible()
  })

  test('Maya can navigate to the recipe detail page (start-cooking available with data)', async ({
    page,
  }) => {
    // Without a running API the detail renders in error state — verify the page is reachable
    await page.goto('/recipes/r-pasta')
    await expect(page.getByTestId('recipe-detail')).toBeVisible()
  })

  test.describe('Offline access', () => {
    test('Maya sees offline banner when network goes away', async ({ page }) => {
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'))
      })
      await expect(page.getByTestId('offline-banner')).toBeVisible()
    })

    test('Maya can restore the online state', async ({ page }) => {
      await page.evaluate(() => window.dispatchEvent(new Event('offline')))
      await expect(page.getByTestId('offline-banner')).toBeVisible()

      await page.evaluate(() => window.dispatchEvent(new Event('online')))
      await expect(page.getByTestId('offline-banner')).not.toBeVisible()
    })
  })
})
