import { test, expect } from '@playwright/test'

// this assumes a user exists; tests should run after signup test or create user via API

test('login form renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByPlaceholder('Email')).toBeVisible()
  await expect(page.getByPlaceholder('Password')).toBeVisible()
})

test('can log in with valid credentials', async ({ page }) => {
  const email = `pw${Date.now()}@example.com`
  const password = 'password123'
  // create user via API directly
  await page.request.post('http://localhost:3000/api/auth/signup', {
    data: { email, password, displayName: 'PWUser' },
  })
  await page.goto('/login')
  await page.fill('input[placeholder="Email"]', email)
  await page.fill('input[placeholder="Password"]', password)
  await page.click('text=Sign in')
  // should redirect to planning
  await page.waitForURL('/planning')
  await expect(page).toHaveURL(/planning/)
})