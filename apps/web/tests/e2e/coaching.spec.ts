import { expect, test } from '@playwright/test'
import { injectOnboardingComplete, mockRecipesApi } from './helpers/fixtures'

// E2E tests for in-step coaching tooltips.
// Verifies that technique/ingredient terms in cooking steps render as
// clickable elements and display the expected glossary content when tapped.

test.describe('Coaching interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Provide a fake recipe with a known coaching term and ensure the user
    // has completed onboarding so cooking routes are accessible.
    await mockRecipesApi(page)
    await injectOnboardingComplete(page)
  })

  test('clicking a technique term shows definition tooltip', async ({ page }) => {
    await page.goto('/recipes/r-pasta/cook')

    // move to second step where the "Sauté" term appears
    await page.getByRole('button', { name: /next/i }).click()

    // step should render and include the "Sauté" coaching trigger specifically
    const triggers = page.locator('[data-testid="coaching-trigger"]')
    await expect(triggers).toHaveCount(1)
    const sauteBtn = triggers.first()
    await expect(sauteBtn).toBeVisible()

    // open the tooltip for the sauté term and verify its definition
    await sauteBtn.click()
    const tooltip = page.getByTestId('coaching-tooltip')
    await expect(tooltip).toBeVisible()

    const text = await tooltip.textContent()
    // definition for sauté begins with "Cook food quickly"
    expect(text?.toLowerCase()).toContain('cook food quickly')
    // category label should also be visible
    await expect(tooltip).toContainText('technique')
  })
})
