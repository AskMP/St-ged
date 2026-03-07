import { Hono } from 'hono'
import { optionalAuth } from '../middleware/auth'
import {
  createEvent,
  getEvent,
  listEvents,
  claimSlot,
} from '../services/potluck-service'

const potluckRouter = new Hono().use('*', optionalAuth)

// create a new event
potluckRouter.post('/', async (c) => {
  const body = (await c.req.json()) as Partial<{ title: string; date: string; slots: any[] }>
  const evt = await createEvent({
    title: body.title,
    date: body.date,
    slots: body.slots ?? [],
  })
  return c.json(evt)
})

// list all events
potluckRouter.get('/', async (c) => {
  const evts = await listEvents()
  return c.json({ events: evts })
})

// get single event
potluckRouter.get('/:id', async (c) => {
  const { id } = c.req.param()
  try {
    const evt = await getEvent(id)
    return c.json(evt)
  } catch {
    return c.json({ error: 'not found' }, 404)
  }
})

// claim a slot
potluckRouter.post('/:id/slots/:slotId/claim', async (c) => {
  const { id, slotId } = c.req.param()
  const { guestName } = (await c.req.json()) as { guestName: string }
  const result = await claimSlot(id, slotId, guestName)
  if (!result.success) {
    return c.json({ error: result.message }, 400)
  }
  return c.json(result.event)
})

export default potluckRouter
