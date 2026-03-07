import type { PotluckEvent, PotluckSlot, ClaimResult } from '@staged/types'

// naive in-memory store for events
const EVENTS: PotluckEvent[] = []

export async function createEvent(data: Partial<PotluckEvent>): Promise<PotluckEvent> {
  const evt: PotluckEvent = {
    id: `evt-${Date.now()}`,
    title: data.title ?? 'Untitled event',
    hostHouseholdId: data.hostHouseholdId,
    date: data.date,
    slots: data.slots ?? [],
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

  if (slot.guestName) {
    return { success: false, message: 'already claimed' }
  }

  slot.guestName = guestName
  slot.claimedAt = new Date().toISOString()
  return { success: true, event: evt }
}

export async function resetStore() {
  // helper for tests
  EVENTS.length = 0
}
