import { Hono } from 'hono'
import http from 'node:http'
import { Pool } from 'pg'
import { Server } from 'socket.io'
import { env } from './lib/env'
import { corsMiddleware } from './middleware/cors'
import { rateLimitMiddleware } from './middleware/rateLimit'
import authRouter from './routes/auth'
import fulfillmentRouter from './routes/fulfillment'
import householdsRouter from './routes/households'
import listsRouter from './routes/lists'
import pantryRouter from './routes/pantry'
import plansRouter from './routes/plans'
import recipesRouter from './routes/recipes'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

export const app = new Hono()

app.use('*', corsMiddleware)
app.use('*', rateLimitMiddleware)

const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${env.PORT}`)
  
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }
  }
  
  const request = new Request(url.href, {
    method: req.method || 'GET',
    headers,
  })
  
  const response = await app.fetch(request)
  
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  
  const body = await response.text()
  res.end(body)
})

const io = new Server(httpServer, {
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('household:join', (householdId: string) => {
    socket.join(`household:${householdId}`)
    console.log(`Socket ${socket.id} joined household:${householdId}`)
  })

  socket.on('household:leave', (householdId: string) => {
    socket.leave(`household:${householdId}`)
    console.log(`Socket ${socket.id} left household:${householdId}`)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

app.get('/health', async (c) => {
  try {
    await pool.query('SELECT 1')
    return c.json({ 
      status: 'ok', 
      db: 'connected', 
      uptime: process.uptime() 
    })
  } catch (err) {
    return c.json({ 
      status: 'degraded', 
      db: 'error', 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, 503)
  }
})

app.route('/api/auth', authRouter)
app.route('/api/recipes', recipesRouter)
app.route('/api/households', householdsRouter)
app.route('/api', listsRouter)
app.route('/api', plansRouter)
app.route('/api', pantryRouter)
app.route('/api/fulfillment', fulfillmentRouter)

httpServer.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})

export { io }
