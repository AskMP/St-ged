import { HTTPException } from 'hono/http-exception'

export async function signUp(email: string, password: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function signIn(email: string, password: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function signOut(sessionToken: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function sendMagicLink(email: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function getCurrentUser(userId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function createGuestSession() {
  throw new HTTPException(501, { message: 'Not implemented' })
}
