import { v4 as uuidv4 } from 'uuid'

// simplistic in-memory storage. later this will be backed by a real database
interface Member {
  userId: string
  role: 'owner' | 'member' | 'guest'
}

interface HouseholdRecord {
  id: string
  name: string
  inviteCode: string
  members: Member[]
}

const HOUSEHOLDS: HouseholdRecord[] = []

function generateInviteCode() {
  // three random alphanumeric words
  return Array(3)
    .fill(0)
    .map(() => Math.random().toString(36).substring(2, 8))
    .join('-')
}

export async function createHousehold(name: string, creatorId: string) {
  const id = uuidv4()
  const inviteCode = generateInviteCode()
  const record: HouseholdRecord = { id, name, inviteCode, members: [{ userId: creatorId, role: 'owner' }] }
  HOUSEHOLDS.push(record)
  return { id, inviteCode }
}

export async function joinHousehold(code: string, userId: string) {
  const h = HOUSEHOLDS.find((h) => h.inviteCode === code)
  if (!h) {
    const err: any = new Error('Not found')
    err.status = 404
    throw err
  }
  if (h.members.some((m) => m.userId === userId)) {
    const err: any = new Error('Already joined')
    err.status = 409
    throw err
  }
  h.members.push({ userId, role: 'member' })
  return { success: true }
}

export async function listMembers(householdId: string) {
  const h = HOUSEHOLDS.find((h) => h.id === householdId)
  if (!h) {
    const err: any = new Error('Household not found')
    err.status = 404
    throw err
  }
  return h.members
}

export async function changeMemberRole(householdId: string, userId: string, role: string, requesterId: string) {
  const h = HOUSEHOLDS.find((h) => h.id === householdId)
  if (!h) {
    const err: any = new Error('Household not found')
    err.status = 404
    throw err
  }
  // only owner can change roles
  const requester = h.members.find((m) => m.userId === requesterId)
  if (!requester || requester.role !== 'owner') {
    const err: any = new Error('Unauthorized')
    err.status = 401
    throw err
  }
  const member = h.members.find((m) => m.userId === userId)
  if (!member) {
    const err: any = new Error('Member not found')
    err.status = 404
    throw err
  }
  member.role = role as Member['role']
  return { success: true }
}

export async function getHouseholdByInvite(code: string) {
  return HOUSEHOLDS.find((h) => h.inviteCode === code)
}
