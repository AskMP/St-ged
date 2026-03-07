import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'

const householdsRouter = new Hono()
  .use('*', requireAuth)
  .post('/', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .get('/:id', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/:id/invite', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/join/:code', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })

export default householdsRouter
