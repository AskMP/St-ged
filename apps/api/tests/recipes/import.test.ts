// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'

const BASE = 'http://localhost'

describe('recipes import', () => {
  it('accepts JSON-LD import payloads', async () => {
    const payload = {
      url: 'https://example.com/recipe',
      jsonLd: { '@type': 'Recipe', name: 'Fake' },
    }
    const res = await app.request(`${BASE}/api/recipes/import`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBeDefined()
  })
})