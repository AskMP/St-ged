// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'

const BASE = 'http://localhost'

describe('recipes routes', () => {
  it('supports basic CRUD and search filters (currently unimplemented)', async () => {
    // create
    const createRes = await app.fetch(`${BASE}/api/recipes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Test Burger' }),
    })
    // we expect this to succeed once implementation exists
    expect(createRes.status).toBe(201)

    // read list
    const listRes = await app.fetch(`${BASE}/api/recipes`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer fake' },
    })
    expect(listRes.status).toBe(200)

    // search filter example
    const searchRes = await app.fetch(`${BASE}/api/recipes?diet=vegan`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer fake' },
    })
    expect(searchRes.status).toBe(200)

    // delete (will fail if id not provided)
    const deleteRes = await app.fetch(`${BASE}/api/recipes/123`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer fake' },
    })
    expect(deleteRes.status).toBe(200)
  })
})