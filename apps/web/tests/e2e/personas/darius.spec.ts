/**
 * Persona: Darius — The Household Conductor (age 42, Atlanta, family of 4)
 *
 * Journey: Planning calendar → generate grocery list → fulfillment handoff → Instacart
 */
import { test, expect } from '@playwright/test'
import {
  injectOnboardingComplete,
  mockPlanApi,
  mockFulfillmentApi,
  mockGroceryList,
} from '../helpers/fixtures'

test.describe('Darius — Household Conductor', () => {
  test.describe('Planning page', () => {
    test.beforeEach(async ({ page }) => {
      await injectOnboardingComplete(page, { skillLevel: 'intermediate', householdSize: 4 })
      await mockPlanApi(page)
      await mockFulfillmentApi(page)
    })

    test('Darius sees the weekly planning calendar', async ({ page }) => {
      await page.goto('/planning')
      await expect(page.getByRole('heading', { name: 'Meal Plan' })).toBeVisible()
      await expect(page.getByTestId('week-calendar')).toBeVisible()
    })

    test('Darius sees a meal entry in the calendar', async ({ page }) => {
      await page.goto('/planning')
      await expect(page.getByTestId('week-calendar')).toBeVisible()
      await expect(page.getByText('Pasta Primavera')).toBeVisible()
    })

    test('Darius can navigate between weeks', async ({ page }) => {
      await page.goto('/planning')
      await expect(page.getByTestId('week-nav')).toBeVisible()
      const initialText = await page.getByTestId('week-nav').textContent()
      await page.getByText(/Next/).click()
      const updatedText = await page.getByTestId('week-nav').textContent()
      expect(updatedText).not.toBe(initialText)
    })

    test('Darius can generate a grocery list from the plan', async ({ page }) => {
      await page.goto('/planning')
      await page.getByTestId('generate-list-btn').click()
      await expect(page.getByTestId('grocery-list')).toBeVisible()
      await expect(page.getByText('pasta 200g')).toBeVisible()
      await expect(page.getByText('zucchini')).toBeVisible()
    })

    test('Darius sees the Order on Instacart link after generating the list', async ({ page }) => {
      await page.goto('/planning')
      await page.getByTestId('generate-list-btn').click()
      await expect(page.getByTestId('fulfill-link')).toBeVisible()
      await expect(page.getByText(/Instacart/)).toBeVisible()
    })

    test('Darius fulfill-link includes the listId query param', async ({ page }) => {
      await page.goto('/planning')
      await page.getByTestId('generate-list-btn').click()
      await expect(page.getByTestId('fulfill-link')).toBeVisible()
      const href = await page.getByTestId('fulfill-link').getAttribute('href')
      expect(href).toContain('listId=')
    })

    test('Darius can click through to the fulfillment page', async ({ page }) => {
      await page.goto('/planning')
      await page.getByTestId('generate-list-btn').click()
      await expect(page.getByTestId('fulfill-link')).toBeVisible()
      await page.getByTestId('fulfill-link').click()
      await expect(page.getByTestId('fulfillment-page')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Deliver Me This' })).toBeVisible()
    })

    test.describe('Offline resilience', () => {
      test('Darius sees the planning page structure even when API is offline', async ({
        page,
        context,
      }) => {
        // Block API requests before loading
        await context.route('**/localhost:3000/**', (route) => route.abort())
        await page.goto('/planning')
        await expect(page.getByTestId('planning-page')).toBeVisible()
        await expect(page.getByTestId('generate-list-btn')).toBeVisible()
      })
    })
  })

  test.describe('Fulfillment page', () => {
    test.beforeEach(async ({ page }) => {
      await injectOnboardingComplete(page, { skillLevel: 'intermediate', householdSize: 4 })
      await mockFulfillmentApi(page)
    })

    test('Darius sees affiliate disclosure on the fulfillment page', async ({ page }) => {
      await page.goto(`/fulfillment?listId=${mockGroceryList.id}`)
      await expect(page.getByTestId('attribution-disclosure')).toBeVisible()
      await expect(page.getByText(/Affiliate disclosure/)).toBeVisible()
    })

    test('Darius sees smart bundle suggestions', async ({ page }) => {
      await page.goto(`/fulfillment?listId=${mockGroceryList.id}`)
      await expect(page.getByTestId('bundle-list')).toBeVisible()
      await expect(page.getByText('Premium Spices Pack')).toBeVisible()
    })

    test('Darius sees the Instacart CTA that opens in a new tab', async ({ page }) => {
      await page.goto(`/fulfillment?listId=${mockGroceryList.id}`)
      const cta = page.getByTestId('instacart-cta')
      await expect(cta).toBeVisible()
      await expect(cta).toHaveAttribute('href', /instacart\.com/)
      await expect(cta).toHaveAttribute('target', '_blank')
    })

    test('Darius can go back to the plan from fulfillment', async ({ page }) => {
      await page.goto(`/fulfillment?listId=${mockGroceryList.id}`)
      await expect(page.getByText(/Back to plan/)).toBeVisible()
      await page.getByText(/Back to plan/).click()
      await expect(page.getByRole('heading', { name: 'Meal Plan' })).toBeVisible()
    })
  })
})
