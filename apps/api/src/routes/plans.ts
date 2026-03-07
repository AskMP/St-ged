import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'

const plansRouter = new Hono()
  .use('*', requireAuth)
  .get('/households/:id/plans/week', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/plans/:id/entries', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .delete('/plans/:id/entries/:entryId', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })

export default plansRouter
