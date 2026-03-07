import { HTTPException } from 'hono/http-exception'

export async function getWeeklyPlan(householdId: string, startDate: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function addMealEntry(planId: string, data: unknown) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function removeMealEntry(entryId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}
