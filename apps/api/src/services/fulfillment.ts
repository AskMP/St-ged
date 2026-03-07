import { HTTPException } from 'hono/http-exception'

export async function createInstacartLink(listId: string, items: unknown[]) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function handleInstacartRedirect(token: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}
