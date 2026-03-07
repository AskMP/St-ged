import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'

const pantryRouter = new Hono()
  .use('*', requireAuth)
  .get('/households/:id/pantry', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/households/:id/pantry/items', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .delete('/pantry/items/:itemId', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })

export default pantryRouter
