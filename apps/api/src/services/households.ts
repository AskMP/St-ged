import { HTTPException } from 'hono/http-exception'

export async function createHousehold(name: string, userId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function getHousehold(id: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function generateInviteCode(householdId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function joinHousehold(code: string, userId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}
