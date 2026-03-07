import { describe, it, expect } from 'vitest'
import {
  createHousehold,
  joinHousehold,
  canAddGuest,
  verifyHouseholdAccess,
} from '../../src/services/household-service'

describe('household service helpers', () => {
  it('allows owner and member to add guests', async () => {
    const { id, inviteCode } = await createHousehold('Test', 'owner1')
    // owner can add guest
    expect(await canAddGuest(id, 'owner1')).toBe(true)
    // simulate another member
    await joinHousehold(inviteCode, 'member1')
    expect(await canAddGuest(id, 'member1')).toBe(true)
    // outsider cannot
    expect(await canAddGuest(id, 'outsider')).toBe(false)
  })

  it('verifyHouseholdAccess throws for non-member', async () => {
    const { id, inviteCode } = await createHousehold('X', 'u1')
    await joinHousehold(inviteCode, 'u2')
    await expect(verifyHouseholdAccess(id, 'u2')).resolves.toHaveProperty('member')
    await expect(verifyHouseholdAccess(id, 'u3')).rejects.toHaveProperty('status', 401)
  })
})