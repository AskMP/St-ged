// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'

const BASE = 'http://localhost'

describe('recipes routes', () => {
  it('supports basic CRUD and search filters (currently unimplemented)', async () => {
    // create
    const createRes = await app.request(`${BASE}/api/recipes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Test Burger' }),
    })
    // we expect this to succeed once implementation exists
    expect(createRes.status).toBe(201)

    // read list
    const listRes = await app.request(`${BASE}/api/recipes`, {
      method: 'GET',
    })
    expect(listRes.status).toBe(200)

    // search filter example
    const searchRes = await app.request(`${BASE}/api/recipes?diet=vegan`, {
      method: 'GET',
    })
    expect(searchRes.status).toBe(200)

    // delete (will fail if id not provided)
    const deleteRes = await app.request(`${BASE}/api/recipes/123`, {
      method: 'DELETE',
    })
    expect(deleteRes.status).toBe(200)
  })
})