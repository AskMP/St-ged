import { HTTPException } from 'hono/http-exception'

export async function getPantry(householdId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function addPantryItem(householdId: string, data: unknown) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function removePantryItem(itemId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}
