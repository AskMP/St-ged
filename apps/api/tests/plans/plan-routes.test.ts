process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'
import * as recipeService from '../../src/services/recipe-service'

describe('plan routes', () => {
  it('can create week plan, add entry, copy week, and generate list', async () => {
    // create household
    const hres = await app.request('http://localhost/api/households', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
      body: JSON.stringify({ name: 'PlanHouse' }),
    })
    const { id: hid } = await hres.json()

    // fetch week (should create)
    const week = '2025-02-03'
    const fetchRes = await app.request(`http://localhost/api/households/${hid}/plans/week?start=${week}`, {
      headers: { 'x-test-user-id': 'test-user' },
    })
    expect(fetchRes.status).toBe(200)
    const base = await fetchRes.json()
    expect(base.plan.weekStart).toBe(week)
    expect(base.entries).toHaveLength(0)

    // add a recipe entry
    const recipe = await recipeService.createRecipe({ title: 'Burger' })
    const addRes = await app.request(`http://localhost/api/plans/${base.plan.id}/entries`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
      body: JSON.stringify({ recipeId: recipe.id, day: '2025-02-04', servings: 2 }),
    })
    expect(addRes.status).toBe(201)
    const entry = await addRes.json()

    // confirm GET now has entry
    const fetch2 = await app.request(`http://localhost/api/households/${hid}/plans/week?start=${week}`, {
      headers: { 'x-test-user-id': 'test-user' },
    })
    const got2 = await fetch2.json()
    expect(got2.entries).toHaveLength(1)

    // copy week to next
    const copyRes = await app.request(`http://localhost/api/households/${hid}/plans/copy`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
      body: JSON.stringify({ from: week, to: '2025-02-10' }),
    })
    expect(copyRes.status).toBe(200)
    const copied = await copyRes.json()
    expect(copied.weekStart).toBe('2025-02-10')

    // generate list for original plan
    const genRes = await app.request(`http://localhost/api/plans/${base.plan.id}/generate-list`, {
      method: 'POST',
      headers: { 'x-test-user-id': 'test-user' },
    })
    expect(genRes.status).toBe(200)
    const list = await genRes.json()
    expect(list.id).toBeDefined()

    // fetch items via GET list route
    const itemsRes = await app.request(`http://localhost/api/lists/${list.id}`, {
      headers: { 'x-test-user-id': 'test-user' },
    })
    const items = await itemsRes.json()
    expect(items.items.length).toBeGreaterThan(0)
  })
})
