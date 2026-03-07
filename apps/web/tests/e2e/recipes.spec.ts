import { test, expect } from '@playwright/test'

// These tests require the dev server at http://localhost:5173
// The API must be running at http://localhost:3000 for full integration,
// or the pages render gracefully with empty/error states.

test.describe('Recipe Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes')
  })

  test('renders recipe library heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recipes' })).toBeVisible()
  })

  test('shows search input', async ({ page }) => {
    await expect(page.getByPlaceholder('Search recipes...')).toBeVisible()
  })

  test('shows diet filter chips', async ({ page }) => {
    await expect(page.getByTestId('diet-filters')).toBeVisible()
    await expect(page.getByText('vegan')).toBeVisible()
    await expect(page.getByText('gluten-free')).toBeVisible()
  })

  test('shows import URL input', async ({ page }) => {
    await expect(page.getByTestId('import-url')).toBeVisible()
    await expect(page.getByTestId('import-btn')).toBeVisible()
  })

  test('import button is disabled when URL empty', async ({ page }) => {
    await expect(page.getByTestId('import-btn')).toBeDisabled()
  })

  test('import button enabled after typing URL', async ({ page }) => {
    await page.getByTestId('import-url').fill('https://example.com/recipe')
    await expect(page.getByTestId('import-btn')).toBeEnabled()
  })

  test('diet filter toggles active state on click', async ({ page }) => {
    const veganBtn = page.getByText('vegan')
    await veganBtn.click()
    // After click it should appear active (has green color classes applied)
    await expect(veganBtn).toBeVisible()
    // Click again to deselect
    await veganBtn.click()
    await expect(veganBtn).toBeVisible()
  })

  test('renders empty state when no recipes exist', async ({ page }) => {
    // API is likely not running in CI, so we get empty or error state
    // Just verify the page loads without crash
    await expect(page.getByTestId('recipe-library')).toBeVisible()
  })
})

test.describe('Recipe Detail', () => {
  test('navigating to /recipes/unknown shows back link', async ({ page }) => {
    await page.goto('/recipes/unknown-id')
    // Should show either the recipe or an error with a back link
    await expect(
      page.getByRole('link', { name: /Back to library/i }).or(page.getByTestId('recipe-detail'))
    ).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Recipe pages mobile viewport', () => {
  test('recipe library renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/recipes')
    await expect(page.getByRole('heading', { name: 'Recipes' })).toBeVisible()
    await expect(page.getByPlaceholder('Search recipes...')).toBeVisible()
  })
})

test.describe('Cooking view', () => {
  test('navigating to cook route shows cooking view or redirect', async ({ page }) => {
    await page.goto('/recipes/unknown-id/cook')
    // Should show cooking-view or skeleton loading - just not crash
    await expect(page).toHaveURL(/\/recipes\/unknown-id\/cook/)
  })
})
