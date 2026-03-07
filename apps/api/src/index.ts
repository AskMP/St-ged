import { Hono } from 'hono'
import http from 'node:http'
import { Pool } from 'pg'
import { env } from './lib/env'
import { createSocketIOserver } from './lib/socket'
import { corsMiddleware } from './middleware/cors'
import { rateLimitMiddleware } from './middleware/rateLimit'
import authRouter from './routes/auth'
import batchRouter from './routes/batch-prep'
import dietaryAdaptationRouter from './routes/dietary-adaptation'
import fridgeClearanceRouter from './routes/fridge-clearance'
import fulfillmentRouter from './routes/fulfillment'
import householdsRouter from './routes/households'
import listsRouter from './routes/lists'
import pantryRouter from './routes/pantry'
import plansRouter from './routes/plans'
import potluckRouter from './routes/potluck'
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

// central socket.io setup uses helper from lib/socket
const io = createSocketIOserver(httpServer)

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
app.route('/api/batch-prep', batchRouter)
app.route('/api/households', householdsRouter)
app.route('/api', pantryRouter)
app.route('/api', listsRouter)
app.route('/api', plansRouter)
app.route('/api', fridgeClearanceRouter)
app.route('/api/potluck', potluckRouter)
app.route('/api/fulfillment', fulfillmentRouter)
app.route('/api/dietary', dietaryAdaptationRouter)

// only start the HTTP server when not running under the test runner.
// Vitest sets NODE_ENV=test; by skipping the listen call we avoid EADDRINUSE
// when tests import this module multiple times.  Individual tests can still
// exercise the `app` instance via `app.fetch` or make real HTTP requests if a
// separate process is started explicitly.
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`)
  })
}

export { io }
