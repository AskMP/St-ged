// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'

const BASE = 'http://localhost'

describe('household routes', () => {
  it('creates a household, generates invite, join-by-code, and lists members', async () => {
    // create household
    const createRes = await app.request(`${BASE}/api/households`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'My Home' }),
    })
    expect(createRes.status).toBe(201)
    const created = await createRes.json()
    expect(created.id).toBeDefined()
    expect(created.inviteCode).toBeDefined()

    const { inviteCode, id: householdId } = created

    // joining with invalid code should 404
    const badJoin = await app.request(`${BASE}/api/households/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'WRONG' }),
    })
    expect(badJoin.status).toBe(404)

    // join with valid code
    // join with a different user
    const joinRes = await app.request(`${BASE}/api/households/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user-b' },
      body: JSON.stringify({ code: inviteCode }),
    })
    expect(joinRes.status).toBe(200)

    // list members should include both owner and user-b
    const listRes = await app.request(`${BASE}/api/households/${householdId}`, {
      method: 'GET',
      headers: { 'x-test-user-id': 'user-b' },
    })
    expect(listRes.status).toBe(200)
    const members = await listRes.json()
    expect(Array.isArray(members)).toBe(true)
    expect(members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: 'test-user' }),
        expect.objectContaining({ userId: 'user-b' }),
      ])
    )
  })

  it('prevents duplicate joins and unauthorized role changes', async () => {
    // setup: create another household
    const res = await app.request(`${BASE}/api/households`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Other' }),
    })
    const { inviteCode, id: hid } = await res.json()

    // first join as user-c
    await app.request(`${BASE}/api/households/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user-c' },
      body: JSON.stringify({ code: inviteCode }),
    })
    // second attempt with same user should 409
    const dup = await app.request(`${BASE}/api/households/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user-c' },
      body: JSON.stringify({ code: inviteCode }),
    })
    expect(dup.status).toBe(409)

    // attempt role change as non-owner should 401
    const roleRes = await app.request(`${BASE}/api/households/${hid}/members/role`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'user-c' },
      body: JSON.stringify({ userId: 'fake', role: 'owner' }),
    })
    expect(roleRes.status).toBe(401)
    // body may be plain text
  })
})