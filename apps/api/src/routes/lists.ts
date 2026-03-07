import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'

const listsRouter = new Hono()
  .use('*', requireAuth)
  .get('/households/:id/lists', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/households/:id/lists', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .get('/lists/:id', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/lists/:id/items', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .patch('/lists/:id/items/:itemId', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .delete('/lists/:id/items/:itemId', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })

export default listsRouter
