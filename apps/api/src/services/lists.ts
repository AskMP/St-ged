import { HTTPException } from 'hono/http-exception'

export async function listGroceryLists(householdId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function createGroceryList(householdId: string, data: unknown) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function getGroceryList(id: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function addListItem(listId: string, data: unknown) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function updateListItem(itemId: string, data: unknown) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function removeListItem(itemId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}
