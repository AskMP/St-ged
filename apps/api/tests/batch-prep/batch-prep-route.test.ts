// env ensures same as other tests
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'

describe('batch-prep route', () => {
  it('combines recipes via API', async () => {
    const res = await app.request('http://localhost/api/batch-prep/combine', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipeIds: ['r1', 'r2'] }),
    })
    expect([200, 200]).toContain(res.status) // service will ignore ids
    const body = await res.json()
    expect(body).toHaveProperty('items')
    expect(body).toHaveProperty('sequence')
  })

  it('returns 400 for invalid payload', async () => {
    const res = await app.request('http://localhost/api/batch-prep/combine', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    })
    expect(res.status).toBe(400)
  })
})