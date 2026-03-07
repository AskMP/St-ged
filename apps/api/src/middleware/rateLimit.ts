import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100
const WINDOW_MS = 60 * 1000

function cleanExpired() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

setInterval(cleanExpired, WINDOW_MS)

const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
  const key = `${ip}:${c.req.path}`
  
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
  } else {
    record.count++
    if (record.count > RATE_LIMIT) {
      throw new HTTPException(429, { message: 'Too many requests' })
    }
  }
  
  await next()
}

export { rateLimitMiddleware }
