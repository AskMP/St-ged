// Potluck/event planner types (F13)

export interface PotluckSlot {
  id: string
  description?: string
  /** guest name when claimed; undefined if unclaimed */
  guestName?: string
  /** timestamp when claim occurred */
  claimedAt?: string
}

export interface PotluckEvent {
  id: string
  title: string
  hostHouseholdId?: string
  date?: string
  slots: PotluckSlot[]
}

export interface ClaimResult {
  success: boolean
  message?: string
  event?: PotluckEvent
}
