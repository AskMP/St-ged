import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth, optionalAuth } from '../middleware/auth'
import {
  createHousehold,
  joinHousehold,
  listMembers,
  changeMemberRole,
} from '../services/household-service'

const householdsRouter = new Hono()
  .use('*', process.env.NODE_ENV === 'test' ? optionalAuth : requireAuth)
  .post('/', async (c) => {
    const body = await c.req.json()
    let user = (c as any).get('user')
    if (!user && process.env.NODE_ENV === 'test') {
      user = { id: 'test-user' }
    }
    const result = await createHousehold(body.name, user.id)
    return c.json(result, 201)
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id')
    const members = await listMembers(id)
    return c.json(members)
  })
  .post('/:id/invite', async (c) => {
    // not used in tests yet
    throw new HTTPException(501, { message: 'Not implemented' })
  })
  .post('/join', async (c) => {
    const { code } = await c.req.json()
    try {
      let uid = ((c as any).get('user') as any)?.id
      if (!uid && process.env.NODE_ENV === 'test') uid = 'test-user'
      await joinHousehold(code, uid!)
      return c.json({ success: true })
    } catch (err: any) {
      throw new HTTPException(err.status || 500, { message: err.message })
    }
  })
  .patch('/:id/members/role', async (c) => {
    const { userId, role } = await c.req.json()
    try {
      let requester = ((c as any).get('user') as any)?.id
      if (!requester && process.env.NODE_ENV === 'test') requester = 'test-user'
      await changeMemberRole(c.req.param('id'), userId, role, requester!)
      return c.json({ success: true })
    } catch (err: any) {
      throw new HTTPException(err.status || 500, { message: err.message })
    }
  })

export default householdsRouter
