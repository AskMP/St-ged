import type { PotluckEvent, PotluckSlot, ClaimResult } from '@staged/types'

// naive in-memory store for events
const EVENTS: PotluckEvent[] = []

export async function createEvent(data: Partial<PotluckEvent>): Promise<PotluckEvent> {
  const evt: PotluckEvent = {
    id: `evt-${Date.now()}`,
    title: data.title ?? 'Untitled event',
    hostHouseholdId: data.hostHouseholdId,
    date: data.date,
    // ensure slots list has no locks initially
    slots: (data.slots ?? []).map((s) => ({ ...s })),
  }
  EVENTS.push(evt)
  return evt
}

export async function getEvent(id: string): Promise<PotluckEvent> {
  const found = EVENTS.find((e) => e.id === id)
  if (!found) throw new Error('not found')
  return found
}

export async function listEvents(): Promise<PotluckEvent[]> {
  // for simplicity return all events
  return EVENTS
}

export async function claimSlot(
  eventId: string,
  slotId: string,
  guestName: string
): Promise<ClaimResult> {
  const evt = EVENTS.find((e) => e.id === eventId)
  if (!evt) return { success: false, message: 'event not found' }

  const slot = evt.slots.find((s) => s.id === slotId)
  if (!slot) return { success: false, message: 'slot not found' }

  const now = Date.now()
  if (slot.lockedUntil && new Date(slot.lockedUntil).getTime() > now) {
    return { success: false, message: 'slot temporarily locked' }
  }

  if (slot.guestName) {
    return { success: false, message: 'already claimed' }
  }

  // set a short-lived lock to guard against near-simultaneous requests
  slot.lockedUntil = new Date(now + 5000).toISOString()

  // pretend some async work (e.g. DB write)
  await new Promise((r) => setTimeout(r, 1))

  slot.guestName = guestName
  slot.claimedAt = new Date().toISOString()
  slot.lockedUntil = undefined
  return { success: true, event: evt }
}

export async function resetStore() {
  // helper for tests
  EVENTS.length = 0
}
