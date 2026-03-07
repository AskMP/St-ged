// ensure env for tests
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'
import { resetStore } from '../../src/services/potluck-service'

describe('potluck route', () => {
  beforeEach(async () => {
    await resetStore()
  })

  it('can create an event then retrieve it', async () => {
    const createResp = await app.request('http://localhost/api/potluck', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'userA' },
      body: JSON.stringify({ title: 'Test event', slots: [{ id: 's1', description: 'Dish' }] }),
    })
    expect(createResp.status).toBe(200)
    const evt = await createResp.json()
    expect(evt.title).toBe('Test event')

    const getResp = await app.request(`http://localhost/api/potluck/${evt.id}`, { method: 'GET', headers: { 'x-test-user-id': 'userA' } })
    expect(getResp.status).toBe(200)
    const fetched = await getResp.json()
    expect(fetched.id).toBe(evt.id)
    expect(fetched.slots.length).toBe(1)
  })

  it('allows claiming a slot', async () => {
    const createResp = await app.request('http://localhost/api/potluck', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'userA' },
      body: JSON.stringify({ title: 'Party', slots: [{ id: 's1', description: 'Salad' }] }),
    })
    const evt = await createResp.json()
    const claimResp = await app.request(`http://localhost/api/potluck/${evt.id}/slots/s1/claim`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'userA' },
      body: JSON.stringify({ guestName: 'Alice' }),
    })
    expect(claimResp.status).toBe(200)
    const updated = await claimResp.json()
    expect(updated.slots[0].guestName).toBe('Alice')

    // second claim should return 400
    const claim2 = await app.request(`http://localhost/api/potluck/${evt.id}/slots/s1/claim`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'userA' },
      body: JSON.stringify({ guestName: 'Bob' }),
    })
    expect(claim2.status).toBe(400)
  })
})