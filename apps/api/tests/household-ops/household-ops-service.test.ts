import { describe, expect, it } from 'vitest'
import {
  addCostEntry,
  getCostHistory,
  setRotation,
  getRotation,
  getRotationAssignments,
  createHousehold,
  joinHousehold,
} from '../../src/services/household-service'

// helper to create a household with one owner and optionally join additional members
async function makeHouseholdWithMembers(additional: string[] = []) {
  const { id, inviteCode } = await createHousehold('test', 'user1')
  for (const m of additional) {
    await joinHousehold(inviteCode, m)
  }
  return id
}

describe('household ops service', () => {
  it('adds cost entry and returns equal splits with single member', async () => {
    const hid = await makeHouseholdWithMembers()
    const entry = await addCostEntry(hid, 120)
    expect(entry.splits['user1']).toBeCloseTo(120)
    const hist = await getCostHistory(hid)
    expect(hist).toHaveLength(1)
    expect(hist[0].total).toBe(120)
    expect(Object.keys(hist[0].splits)).toEqual(['user1'])
  })

  it('splits cost evenly across multiple members', async () => {
    const hid = await makeHouseholdWithMembers(['user2', 'user3'])
    const entry = await addCostEntry(hid, 90)
    expect(entry.splits['user1']).toBeCloseTo(30)
    expect(entry.splits['user2']).toBeCloseTo(30)
    expect(entry.splits['user3']).toBeCloseTo(30)
  })

  it('rounds splits to cents and distributes remainder', async () => {
    const hid = await makeHouseholdWithMembers(['user2', 'user3'])
    // 100/3 should produce 33.34,33.33,33.33 or similar
    const entry = await addCostEntry(hid, 100)
    const values = Object.values(entry.splits).map((v) => Math.round(v * 100) / 100)
    expect(values.reduce((a, b) => a + b, 0)).toBeCloseTo(100)
    expect(values.some((v) => v === 33.34)).toBe(true)
  })

  it('handles zero-weight fallback to even split', async () => {
    const hid = await makeHouseholdWithMembers(['user2'])
    const entry = await addCostEntry(hid, 50, { user1: 0, user2: 0 })
    expect(entry.splits['user1']).toBeCloseTo(25)
    expect(entry.splits['user2']).toBeCloseTo(25)
  })

  it('supports weighted splits', async () => {
    const hid = await makeHouseholdWithMembers(['user2'])
    const weights = { user1: 1, user2: 3 }
    const entry = await addCostEntry(hid, 80, weights)
    expect(entry.splits['user1']).toBeCloseTo(20)
    expect(entry.splits['user2']).toBeCloseTo(60)
  })

  it('rotation settings and assignments rotate correctly', async () => {
    const hid = await makeHouseholdWithMembers(['user2', 'user3'])
    const settings = await setRotation(hid, 'weekly', ['user1', 'user2', 'user3'], '2025-01-01')
    expect(settings.frequency).toBe('weekly')
    const fetched = await getRotation(hid)
    expect(fetched).toMatchObject({ frequency: 'weekly' })

    const assigns = await getRotationAssignments(hid, 3)
    expect(assigns).toHaveLength(3)
    expect(assigns[0].userId).toBe('user1')
    expect(assigns[1].userId).toBe('user2')
    expect(assigns[2].userId).toBe('user3')
  })
})
