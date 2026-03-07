import { cors as honoCors } from 'hono/cors'
import { env } from '../lib/env'

const corsMiddleware = honoCors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173',
      env.WEB_URL,
    ].filter(Boolean)
    
    if (!origin) return allowedOrigins[0]
    if (allowedOrigins.includes(origin)) return origin
    return allowedOrigins[0]
  },
  credentials: true,
})

export { corsMiddleware }
