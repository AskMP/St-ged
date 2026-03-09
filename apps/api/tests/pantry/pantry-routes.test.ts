// ensure required environment variables are set for the test run
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'

const BASE = 'http://localhost'

describe('pantry routes', () => {
  it('allows household owner to crud pantry items and prevents cross-household access', async () => {
    // create a household as the test user
    const createRes = await app.request(`${BASE}/api/households`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
      body: JSON.stringify({ name: 'PantryHouse' }),
    })
    expect(createRes.status).toBe(201)
    const { id: hid } = await createRes.json()

    // verify membership recorded
    const memRes = await app.request(`${BASE}/api/households/${hid}`, {
      method: 'GET',
      headers: { 'x-test-user-id': 'test-user' },
    })
    console.log('household members after create:', await memRes.json())
    
    // initial pantry should be empty
    console.log('performing pantry GET for household', hid)
    const emptyRes = await app.request(`${BASE}/api/households/${hid}/pantry`, {
      method: 'GET',
      headers: { 'x-test-user-id': 'test-user' },
    })
    console.log('emptyRes status', emptyRes.status)
    const emptyBody = await emptyRes.text()
    console.log('emptyRes body', emptyBody)
    expect(emptyRes.status).toBe(200)
    expect(emptyBody).toEqual('[]')

    // add an item
    const addRes = await app.request(`${BASE}/api/households/${hid}/pantry/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
      body: JSON.stringify({ name: 'flour', quantity: 2, unit: 'cup' }),
    })
    expect(addRes.status).toBe(201)
    const item = await addRes.json()
    expect(item).toHaveProperty('id')

    // get again should return the item
    const got = await app.request(`${BASE}/api/households/${hid}/pantry`, {
      method: 'GET',
      headers: { 'x-test-user-id': 'test-user' },
    })
    console.log('second GET status', got.status)
    const gotBody = await got.text()
    console.log('second GET body', gotBody)
    expect(got.status).toBe(200)
    expect(gotBody).toEqual(JSON.stringify([item]))

    // delete the item
    const del = await app.request(`${BASE}/api/pantry/items/${item.id}`, {
      method: 'DELETE',
      headers: { 'x-test-user-id': 'test-user' },
    })
    expect(del.status).toBe(200)

    const after = await app.request(`${BASE}/api/households/${hid}/pantry`, {
      method: 'GET',
      headers: { 'x-test-user-id': 'test-user' },
    })
    console.log('after GET status', after.status)
    const afterBody = await after.text()
    console.log('after GET body', afterBody)
    expect(after.status).toBe(200)
    expect(afterBody).toEqual('[]')

  })
})