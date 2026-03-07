import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'

import {
  listRecipes,
  getRecipe,
  createRecipe,
  importRecipeFromUrl,
  deleteRecipe,
} from '../services/recipe-service'

const recipesRouter = new Hono()
  .use('*', requireAuth)
  .get('/', async (c) => {
    const householdId = c.req.ctx.auth.user?.householdId || ''
    // simple filter parsing; real implementation will be more complex
    const filters: Record<string, string> = {}
    const diet = c.req.query('diet')
    if (diet) filters.diet = diet

    const data = await listRecipes(householdId, filters)
    return c.json(data)
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id')
    const recipe = await getRecipe(id)
    return c.json(recipe)
  })
  .post('/', async (c) => {
    const body = await c.req.json()
    const created = await createRecipe(body)
    return c.json(created, 201)
  })
  .post('/import', async (c) => {
    const body = await c.req.json()
    const imported = await importRecipeFromUrl(body.url, body.jsonLd)
    return c.json(imported)
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id')
    await deleteRecipe(id)
    return c.json({ success: true })
  })

export default recipesRouter
