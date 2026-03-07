import { Hono } from 'hono'
import { optionalAuth } from '../middleware/auth'
import { combineRecipes } from '../services/batch-prep-service'

const batchRouter = new Hono().use('*', optionalAuth)

batchRouter.post('/combine', async (c) => {
  const { recipeIds } = (await c.req.json()) as { recipeIds: string[] }
  if (!Array.isArray(recipeIds)) {
    return c.json({ error: 'recipeIds must be an array' }, 400)
  }
  const result = await combineRecipes(recipeIds)
  return c.json(result)
})

export default batchRouter
