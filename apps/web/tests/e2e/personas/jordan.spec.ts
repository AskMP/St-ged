/**
 * Persona: Jordan — The First Apartment Cook (age 23, solo)
 *
 * Journey: First-run onboarding as a beginner → recipe library → recipe detail
 */
import { test, expect } from '@playwright/test'
import { setOnboardingStep } from '../helpers/fixtures'

test.describe('Jordan — First Apartment Cook', () => {
  test('Jordan sees the welcome screen on first open', async ({ page }) => {
    await page.goto('/onboarding')
    await page.evaluate(() => localStorage.removeItem('staged-onboarding'))
    await page.reload()
    await expect(page.getByRole('heading', { name: /St.ged/i })).toBeVisible()
    await expect(page.getByText('Continue as guest')).toBeVisible()
  })

  test('Jordan sees Beginner / Intermediate / Advanced at skill step', async ({ page }) => {
    await page.goto('/onboarding')
    await setOnboardingStep(page, 'skill')
    await page.reload()
    await expect(page.getByText('Beginner')).toBeVisible()
    await expect(page.getByText('Intermediate')).toBeVisible()
    await expect(page.getByText('Advanced')).toBeVisible()
  })

  test('Jordan selects Beginner and advances to household step', async ({ page }) => {
    await page.goto('/onboarding')
    await setOnboardingStep(page, 'skill')
    await page.reload()
    await page.getByText('Beginner').click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Household size')).toBeVisible()
  })

  test('Jordan sees the dietary preferences step', async ({ page }) => {
    await page.goto('/onboarding')
    await setOnboardingStep(page, 'dietary', { skillLevel: 'beginner', householdSize: 1 })
    await page.reload()
    await expect(page.getByText('Dietary preferences')).toBeVisible()
  })

  // Recipe library — no auth state needed; component fetches independently
  test('Jordan sees the recipe library with search and filters', async ({ page }) => {
    await page.goto('/recipes')
    await expect(page.getByRole('heading', { name: 'Recipes' })).toBeVisible()
    await expect(page.getByTestId('recipe-library')).toBeVisible()
    await expect(page.getByPlaceholder('Search recipes...')).toBeVisible()
  })

  test('Jordan sees vegan and gluten-free filter chips', async ({ page }) => {
    await page.goto('/recipes')
    await expect(page.getByText('vegan')).toBeVisible()
    await expect(page.getByText('gluten-free')).toBeVisible()
  })

  test('Jordan can type a search query', async ({ page }) => {
    await page.goto('/recipes')
    await page.getByPlaceholder('Search recipes...').fill('pasta')
    await expect(page.getByTestId('recipe-library')).toBeVisible()
  })

  test('Jordan can open a recipe detail page', async ({ page }) => {
    await page.goto('/recipes/r-pasta')
    await expect(page.getByTestId('recipe-detail')).toBeVisible()
  })
})
