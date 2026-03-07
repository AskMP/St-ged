import { describe, it, expect, beforeEach } from 'vitest'
import {
  createEvent,
  getEvent,
  claimSlot,
  listEvents,
  resetStore,
} from '../../src/services/potluck-service'
import type { PotluckEvent } from '@staged/types'

beforeEach(() => {
  return resetStore()
})

describe('potluck service', () => {
  it('can create and retrieve an event', async () => {
    const evt = await createEvent({ title: 'My Party', slots: [] })
    expect(evt.title).toBe('My Party')
    const fetched = await getEvent(evt.id)
    expect(fetched.id).toBe(evt.id)
  })

  it('lists events', async () => {
    await createEvent({ title: 'One' })
    await createEvent({ title: 'Two' })
    const all = await listEvents()
    expect(all.length).toBe(2)
  })

  it('allows claiming an empty slot', async () => {
    const evt = await createEvent({
      title: 'Event',
      slots: [{ id: 's1', description: 'Salad' }],
    })
    const result = await claimSlot(evt.id, 's1', 'Alice')
    expect(result.success).toBe(true)
    expect(result.event?.slots[0].guestName).toBe('Alice')
  })

  it('rejects double-claim', async () => {
    const evt = await createEvent({
      title: 'Event',
      slots: [{ id: 's1', description: 'Appetizer' }],
    })
    const r1 = await claimSlot(evt.id, 's1', 'Bob')
    expect(r1.success).toBe(true)
    const r2 = await claimSlot(evt.id, 's1', 'Carol')
    expect(r2.success).toBe(false)
    expect(r2.message).toMatch(/already claimed/)
  })

  it('handles near-simultaneous claims with locking', async () => {
    const evt = await createEvent({
      title: 'Race',
      slots: [{ id: 's1', description: 'Dish' }],
    })
    const [a, b] = await Promise.all([
      claimSlot(evt.id, 's1', 'Alice'),
      claimSlot(evt.id, 's1', 'Bob'),
    ])
    // exactly one should succeed
    expect([a.success, b.success].filter(Boolean).length).toBe(1)
  })

  it('errors when event or slot not found', async () => {
    const r1 = await claimSlot('nope', 's1', 'X')
    expect(r1.success).toBe(false)
    expect(r1.message).toMatch(/event not found/)
    const evt = await createEvent({ title: 'E', slots: [] })
    const r2 = await claimSlot(evt.id, 'missing', 'X')
    expect(r2.success).toBe(false)
    expect(r2.message).toMatch(/slot not found/)
  })
})
