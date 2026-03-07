import { test, expect } from '@playwright/test'

// These tests require the dev server running at http://localhost:5173
// Run: pnpm --filter web dev (in separate terminal)
// Then: pnpm --filter web test:e2e

test.beforeEach(async ({ page }) => {
  // Clear onboarding store state between tests
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.removeItem('staged-onboarding'))
  await page.reload()
})

test('welcome step renders with sign-up and guest options', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /St.ged/i })).toBeVisible()
  await expect(page.getByText('Create account')).toBeVisible()
  await expect(page.getByText('Continue as guest')).toBeVisible()
})

test('shows sign-up form on Create account click', async ({ page }) => {
  await page.getByText('Create account').click()
  await expect(page.getByPlaceholder('Name')).toBeVisible()
  await expect(page.getByPlaceholder('Email')).toBeVisible()
  await expect(page.getByPlaceholder('Password (8+ chars)')).toBeVisible()
})

test('back button from sign-up form returns to welcome', async ({ page }) => {
  await page.getByText('Create account').click()
  await page.getByText('Back').click()
  await expect(page.getByText('Create account')).toBeVisible()
})

test('skill step shows beginner/intermediate/advanced options', async ({ page }) => {
  // Navigate directly to skill step by setting store state
  await page.evaluate(() => {
    localStorage.setItem(
      'staged-onboarding',
      JSON.stringify({ state: { step: 'skill' }, version: 0 })
    )
  })
  await page.reload()
  await expect(page.getByText('Your skill level')).toBeVisible()
  await expect(page.getByText('Beginner')).toBeVisible()
  await expect(page.getByText('Intermediate')).toBeVisible()
  await expect(page.getByText('Advanced')).toBeVisible()
})

test('dietary step shows all preference options', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'staged-onboarding',
      JSON.stringify({ state: { step: 'dietary', skillLevel: 'beginner', householdSize: 2 }, version: 0 })
    )
  })
  await page.reload()
  await expect(page.getByText('Dietary preferences')).toBeVisible()
  await expect(page.getByText('Vegan')).toBeVisible()
  await expect(page.getByText('Gluten-free')).toBeVisible()
  await expect(page.getByText('Nut-free')).toBeVisible()
})

test('pantry step shows starter templates', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'staged-onboarding',
      JSON.stringify({
        state: { step: 'pantry', skillLevel: 'beginner', householdSize: 2, dietary: [] },
        version: 0,
      })
    )
  })
  await page.reload()
  await expect(page.getByText('Starter pantry')).toBeVisible()
  await expect(page.getByText('Essential kitchen')).toBeVisible()
  await expect(page.getByRole('button', { name: /Plant-based/ }).first()).toBeVisible()
})

test('install step shows A2HS guidance', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'staged-onboarding',
      JSON.stringify({ state: { step: 'install' }, version: 0 })
    )
  })
  await page.reload()
  await expect(page.getByText('Add to Home Screen')).toBeVisible()
  await expect(page.getByText(/offline/i)).toBeVisible()
  await expect(page.getByText('Skip for now')).toBeVisible()
})

test('onboarding is recoverable after page refresh mid-flow', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'staged-onboarding',
      JSON.stringify({ state: { step: 'skill', userId: 'u1' }, version: 0 })
    )
  })
  await page.reload()
  // Should resume at skill step, not reset to welcome
  await expect(page.getByText('Your skill level')).toBeVisible()
})

test('mobile viewport renders onboarding correctly', async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem('staged-onboarding'))
  await page.setViewportSize({ width: 390, height: 844 }) // iPhone 14 size
  await page.reload()
  await expect(page.getByRole('heading', { name: /St.ged/i })).toBeVisible()
  await expect(page.getByText('Create account')).toBeVisible()
})
