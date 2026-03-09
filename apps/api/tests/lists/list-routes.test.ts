// pantry already tested separately; this suite covers lists
process.env.NEXTAUTH_SECRET ||= 'test-secret'
process.env.DATABASE_URL ||= 'postgresql://staged:staged_dev_password@localhost:5432/staged_dev'
process.env.NEXTAUTH_URL ||= 'http://localhost:3000'

import { app } from '../../src/index'

describe('list routes', () => {
  it('can create a list and add items with dedupe and toggle/delete', async () => {
    // create household
    const hres = await app.request('http://localhost/api/households', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
      body: JSON.stringify({ name: 'ListHouse' }),
    })
    const { id: hid } = await hres.json()

    const createList = await app.request(`http://localhost/api/households/${hid}/lists`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
    })
    expect(createList.status).toBe(201)
    const list = await createList.json()

    // verify listing endpoint
    const listResp = await app.request(`http://localhost/api/households/${hid}/lists`, {
      headers: { 'x-test-user-id': 'test-user' },
    })
    expect(listResp.status).toBe(200)
    const lists = await listResp.json()
    expect(lists).toHaveLength(1)
    expect(lists[0].id).toBe(list.id)

    const add1 = await app.request(`http://localhost/api/lists/${list.id}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
      body: JSON.stringify({ name: 'Banana' }),
    })
    expect(add1.status).toBe(200)
    const item1 = await add1.json()

    const addDup = await app.request(`http://localhost/api/lists/${list.id}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user-id': 'test-user' },
      body: JSON.stringify({ name: 'banana' }),
    })
    expect(addDup.status).toBe(200)
    const itemDup = await addDup.json()
    expect(itemDup.id).toBe(item1.id) // dedupe returned same item

    // list should show the item
    const fetch = await app.request(`http://localhost/api/lists/${list.id}`, {
      headers: { 'x-test-user-id': 'test-user' },
    })
    expect(fetch.status).toBe(200)
    const fetched = await fetch.json()
    expect(fetched.items).toHaveLength(1)
    expect(fetched.items[0].id).toBe(item1.id)
    expect(fetched.items[0].checked).toBe(false)

    const toggle = await app.request(`http://localhost/api/lists/${list.id}/items/${item1.id}`, {
      method: 'PATCH',
      headers: { 'x-test-user-id': 'test-user' },
    })
    expect(toggle.status).toBe(200)
    const toggled = await toggle.json()
    expect(toggled.checked).toBe(true)

    // toggled should reflect in GET
    const fetch2 = await app.request(`http://localhost/api/lists/${list.id}`, {
      headers: { 'x-test-user-id': 'test-user' },
    })
    const fetched2 = await fetch2.json()
    expect(fetched2.items[0].checked).toBe(true)

    const del = await app.request(`http://localhost/api/lists/${list.id}/items/${item1.id}`, {
      method: 'DELETE',
      headers: { 'x-test-user-id': 'test-user' },
    })
    expect(del.status).toBe(200)
  })
})