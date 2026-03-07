import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'

const recipesRouter = new Hono()
  .use('*', requireAuth)
  .get('/', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .get('/:id', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/import', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .delete('/:id', async (c) => {
    throw new HTTPException(501, { message: 'Not implemented' })
  })

export default recipesRouter
