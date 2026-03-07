import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getSessionUser } from '../services/auth-service'

const requireAuth: MiddlewareHandler = async (c, next) => {
  const user = await getSessionUser(c.req.raw)
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  c.set('user', user)
  await next()
}

const optionalAuth: MiddlewareHandler = async (c, next) => {
  const user = await getSessionUser(c.req.raw)
  if (user) {
    c.set('user', user)
  }
  await next()
}

export { optionalAuth, requireAuth }

