import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'

const AFFILIATE_ID = process.env.INSTACART_AFFILIATE_ID || 'affiliate-test'

import * as fulfillmentService from '../services/fulfillment-service'

const fulfillmentRouter = new Hono()
  .use('*', requireAuth)
  // list available fulfillment providers for this household
  .get('/providers', async (c) => {
    const user = c.get('user')
    const hid = user.householdId
    const providers = await fulfillmentService.getAvailableProviders(hid)
    return c.json({ providers })
  })
  // generic link generation; provider can be passed in body
  .post('/link', async (c) => {
    const body = await c.req.json()
    const { listId, provider } = body
    const user = c.get('user')
    const link = await fulfillmentService.generateLink(listId, user.id, provider)
    return c.json(link)
  })
  // old instacart-endpoint kept for backwards compatibility
  .post('/instacart-link', async (c) => {
    const body = await c.req.json()
    const { listId } = body
    const user = c.get('user')
    const link = await fulfillmentService.generateLink(listId, user.id, 'instacart')
    return c.json(link)
  })
  .get('/redirect/:token', async (c) => {
    try {
      const rec = await fulfillmentService.resolveToken(c.req.param('token'))
      // in a real service we'd redirect, here return JSON for tests
      return c.json({ url: rec.url, affiliate: AFFILIATE_ID })
    } catch (err: any) {
      throw new HTTPException(err.status || 500, { message: err.message })
    }
  })

export default fulfillmentRouter
