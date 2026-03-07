process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'

describe('fulfillment routes', () => {
  it('generates instacart link and resolves token', async () => {
    const hres = await app.request('http://localhost/api/households', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user1' },
      body: JSON.stringify({ name: 'FulfillHouse' }),
    })
    const { id: hid } = await hres.json()

    const listRes = await app.request(`http://localhost/api/households/${hid}/lists`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user1' },
    })
    const list = await listRes.json()

    await app.request(`http://localhost/api/lists/${list.id}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user1' },
      body: JSON.stringify({ name: 'Milk' }),
    })

    // legacy endpoint still works
    const linkRes = await app.request('http://localhost/api/fulfillment/instacart-link', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user1' },
      body: JSON.stringify({ listId: list.id }),
    })
    expect(linkRes.status).toBe(200)
    const { url, token, attribution, bundles } = await linkRes.json()
    expect(url).toContain('instacart.com')
    expect(token).toBeDefined()
    expect(attribution.affiliate).toBeDefined()
    expect(bundles).toBeInstanceOf(Array)

    const redir = await app.request(`http://localhost/api/fulfillment/redirect/${token}`, {
      headers: { 'x-test-user-id': 'user1' },
    })
    expect(redir.status).toBe(200)
    const redbob = await redir.json()
    expect(redbob.url).toEqual(url)
    expect(redbob.affiliate).toBe(attribution.affiliate)

    // new providers endpoint
    const provRes = await app.request('http://localhost/api/fulfillment/providers', {
      headers: { 'x-test-user-id': 'user1' },
    })
    expect(provRes.status).toBe(200)
    const { providers } = await provRes.json()
    expect(providers).toEqual(expect.arrayContaining(['deep-link', 'instacart']))

    // generic link with explicit provider
    const genericRes = await app.request('http://localhost/api/fulfillment/link', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user1' },
      body: JSON.stringify({ listId: list.id, provider: 'instacart' }),
    })
    expect(genericRes.status).toBe(200)
    const gen = await genericRes.json()
    expect(gen.provider).toBe('instacart')
    expect(gen.url).toContain('instacart.com')

    // request with unknown provider should fallback to instacart
    const fallbackRes = await app.request('http://localhost/api/fulfillment/link', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user1' },
      body: JSON.stringify({ listId: list.id, provider: 'kroger' }),
    })
    expect(fallbackRes.status).toBe(200)
    const fol = await fallbackRes.json()
    expect(fol.provider).toBe('instacart')
  })

  it('returns 404 for invalid token', async () => {
    const res = await app.request('http://localhost/api/redirect/badtoken', {
      headers: { 'x-test-user-id': 'user1' },
    })
    expect(res.status).toBe(404)
  })
})
