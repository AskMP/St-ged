import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'

const fulfillmentRouter = new Hono()
  .use('*', requireAuth)
  .post('/instacart-link', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .get('/redirect/:token', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })

export default fulfillmentRouter
