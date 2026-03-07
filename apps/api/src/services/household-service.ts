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

// authorization helpers for later modules
export async function canAddGuest(householdId: string, userId: string): Promise<boolean> {
  const h = HOUSEHOLDS.find((h) => h.id === householdId)
  if (!h) return false
  return h.members.some((m) => (m.userId === userId && (m.role === 'owner' || m.role === 'member')))
}

export async function verifyHouseholdAccess(householdId: string, userId: string) {
  const h = HOUSEHOLDS.find((h) => h.id === householdId)
  if (!h) {
    const err: any = new Error('Household not found')
    err.status = 404
    throw err
  }
  const m = h.members.find((m) => m.userId === userId)
  if (!m) {
    const err: any = new Error('Not a member')
    err.status = 401
    throw err
  }
  return { household: h, member: m }
}

// ---- Household ops: cost splitting & rotation ----

interface CostEntry {
  id: string
  householdId: string
  total: number
  splits: Record<string, number>
  date: string
}

const COST_ENTRIES: CostEntry[] = []

export async function addCostEntry(
  householdId: string,
  total: number,
  weights?: Record<string, number>
): Promise<CostEntry> {
  const h = HOUSEHOLDS.find((h) => h.id === householdId)
  if (!h) {
    const err: any = new Error('Household not found')
    err.status = 404
    throw err
  }

  const members = h.members.map((m) => m.userId)
  const splits: Record<string, number> = {}

  if (weights && Object.keys(weights).length > 0) {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0)
    for (const member of members) {
      const w = weights[member] ?? 0
      splits[member] = sum > 0 ? (total * w) / sum : 0
    }
  } else {
    const each = members.length > 0 ? total / members.length : 0
    for (const member of members) {
      splits[member] = each
    }
  }

  const entry: CostEntry = {
    id: uuidv4(),
    householdId,
    total,
    splits,
    date: new Date().toISOString(),
  }
  COST_ENTRIES.push(entry)
  return entry
}

export async function getCostHistory(householdId: string): Promise<CostEntry[]> {
  return COST_ENTRIES.filter((e) => e.householdId === householdId)
}

// rotation settings stored per household
interface RotationSettings {
  householdId: string
  frequency: 'weekly' | 'biweekly'
  members: string[]
  startDate: string // ISO date string
}

const ROTATIONS: RotationSettings[] = []

export async function setRotation(
  householdId: string,
  frequency: 'weekly' | 'biweekly',
  members: string[],
  startDate?: string
): Promise<RotationSettings> {
  const existing = ROTATIONS.find((r) => r.householdId === householdId)
  const settings: RotationSettings = {
    householdId,
    frequency,
    members,
    startDate: startDate || new Date().toISOString(),
  }
  if (existing) {
    Object.assign(existing, settings)
    return existing
  }
  ROTATIONS.push(settings)
  return settings
}

export async function getRotation(householdId: string): Promise<RotationSettings | undefined> {
  return ROTATIONS.find((r) => r.householdId === householdId)
}

// compute upcoming assignments for next N weeks (default 4)
export async function getRotationAssignments(
  householdId: string,
  weeks = 4
): Promise<{ date: string; userId: string }[]> {
  const s = ROTATIONS.find((r) => r.householdId === householdId)
  if (!s) {
    return []
  }
  const result: { date: string; userId: string }[] = []
  if (s.members.length === 0) return result

  const start = new Date(s.startDate)
  for (let i = 0; i < weeks; i++) {
    const offsetDays = i * 7 * (s.frequency === 'biweekly' ? 2 : 1)
    const d = new Date(start)
    d.setDate(d.getDate() + offsetDays)
    const idx = i % s.members.length
    result.push({ date: d.toISOString().split('T')[0], userId: s.members[idx] })
  }
  return result
}
