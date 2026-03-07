import type { Page, Route } from '@playwright/test'

// ---- Onboarding state helpers ----

/**
 * Inject onboarding state via addInitScript so Zustand reads it on mount.
 * Must be called BEFORE page.goto().
 */
export async function injectOnboardingComplete(
  page: Page,
  opts: { skillLevel?: string; householdSize?: number; householdId?: string } = {}
) {
  const { skillLevel = 'beginner', householdSize = 1, householdId = 'demo-household' } = opts
  await page.addInitScript(
    (stored) => {
      localStorage.setItem('staged-onboarding', JSON.stringify(stored))
    },
    {
      state: {
        step: 'complete',
        skillLevel,
        householdSize,
        householdId,
        dietary: [],
      },
      version: 0,
    }
  )
}

export async function resetOnboarding(page: Page) {
  await page.evaluate(() => localStorage.removeItem('staged-onboarding'))
}

export async function setOnboardingStep(
  page: Page,
  step: string,
  extra: Record<string, unknown> = {}
) {
  await page.evaluate(
    ({ step, extra }) => {
      localStorage.setItem(
        'staged-onboarding',
        JSON.stringify({ state: { step, ...extra }, version: 0 })
      )
    },
    { step, extra }
  )
}

// ---- Shared fixture data ----

export function getMondayISO(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export const mockRecipes = [
  {
    id: 'r-pasta',
    title: 'Pasta Primavera',
    diet: 'vegetarian',
    ingredients: [{ name: 'pasta', quantity: '200g' }, { name: 'zucchini', quantity: '1' }],
    steps: ['Boil pasta', 'Saute zucchini', 'Combine'],
    nutrition_per_serving: { calories: 420, protein: 12, carbs: 65, fat: 10 },
  },
  {
    id: 'r-lentil',
    title: 'Red Lentil Soup',
    diet: 'vegan',
    ingredients: [{ name: 'red lentils', quantity: '1 cup' }, { name: 'cumin', quantity: '1 tsp' }],
    steps: ['Rinse lentils', 'Simmer 25 mins', 'Blend'],
    nutrition_per_serving: { calories: 310, protein: 18, carbs: 48, fat: 4 },
  },
]

export const mockWeekPlan = {
  plan: { id: 'plan-demo' },
  entries: [
    {
      id: 'entry-1',
      recipeId: 'r-pasta',
      recipeTitle: 'Pasta Primavera',
      date: getMondayISO(),
      mealType: 'dinner',
    },
  ],
}

export const mockGroceryList = {
  id: 'list-demo',
  name: 'Week of demo',
  items: [
    { id: 'i1', listId: 'list-demo', name: 'pasta 200g', checked: false, updatedAt: 0 },
    { id: 'i2', listId: 'list-demo', name: 'zucchini', checked: false, updatedAt: 0 },
    { id: 'i3', listId: 'list-demo', name: 'red lentils 1 cup', checked: false, updatedAt: 0 },
  ],
}

export const mockFulfillmentLink = {
  url: 'https://www.instacart.com/store/1234/cart?affiliate_id=affiliate-test&items=pasta',
  token: 'tok-demo',
  attribution: { affiliate: 'affiliate-test' },
  bundles: [
    { name: 'Premium Spices Pack', description: 'Add gourmet spices for 5% off' },
  ],
}

// ---- Route interceptors ----

export async function mockRecipesApi(page: Page, overrides?: unknown[]) {
  const recipes = overrides ?? mockRecipes
  await page.route('**/recipes?**', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(recipes),
    })
  })
  await page.route('**/recipes', (route: Route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(recipes),
      })
    } else {
      route.continue()
    }
  })
  await page.route('**/recipes/r-pasta', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRecipes[0]),
    })
  })
  await page.route('**/recipes/r-lentil', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRecipes[1]),
    })
  })
}

export async function mockPlanApi(page: Page) {
  await page.route('**/plans/week**', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockWeekPlan),
    })
  })
  await page.route('**/generate-list', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockGroceryList),
    })
  })
}

export async function mockFulfillmentApi(page: Page) {
  await page.route('**/fulfillment/instacart-link', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockFulfillmentLink),
    })
  })
}

export async function mockAuthApi(page: Page) {
  await page.route('**/auth/guest', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'guest-token', userId: 'user-demo' }),
    })
  })
  await page.route('**/auth/me', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'user-demo', name: 'Demo User', email: null }),
    })
  })
}

export async function mockHouseholdsApi(page: Page) {
  await page.route('**/households', (route: Route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'demo-household', name: 'Demo Household' }),
      })
    } else {
      route.continue()
    }
  })
  await page.route('**/pantry/templates/**', (route: Route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}
