export interface CostEntry {
  id: string
  householdId: string
  total: number
  splits: Record<string, number>
  date: string
}

export interface RotationSettings {
  householdId: string
  frequency: 'weekly' | 'biweekly'
  members: string[]
  startDate: string
}

export interface RotationAssignment {
  date: string
  userId: string
}
