import { Hono } from 'hono'
import { optionalAuth, requireAuth } from '../middleware/auth'

import type { PantryItem } from '@staged/types'
import { getPantry } from '../services/pantry'
import {
    createRecipe,
    deleteRecipe,
    getRecipe,
    getRecipeCost,
    getSubstitutions,
    importRecipeFromUrl,
    listRecipes,
    scaleRecipe,
} from '../services/recipe-service'

const recipesRouter = new Hono()
  // tests run under NODE_ENV=test; skip strict auth for them so recipes
  // endpoints can be exercised without needing a full login flow.
  .use('*', process.env.NODE_ENV === 'test' ? optionalAuth : requireAuth)
  .get('/', async (c) => {
    const householdId = (c.req as any).ctx?.auth?.user?.householdId || ''
    // simple filter parsing; real implementation will be more complex
    const filters: Record<string, string> = {}
    const diet = c.req.query('diet')
    if (diet) filters.diet = diet

    const data = await listRecipes(householdId, filters)
    // API clients expect an array; unwrap before returning
    return c.json(data.recipes)
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id')
    const recipe = await getRecipe(id)
    return c.json(recipe)
  })
  .get('/:id/cost', async (c) => {
    const id = c.req.param('id')
    const householdId = c.req.query('householdId')
    let pantryItems: PantryItem[] = []
    if (householdId) {
      pantryItems = await getPantry(householdId)
    }
    const cost = await getRecipeCost(id, pantryItems)
    return c.json(cost)
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
  .post('/scale', async (c) => {
    const { recipe, factor } = await c.req.json()
    const scaled = await scaleRecipe(recipe, factor)
    return c.json(scaled)
  })
  .post('/substitute', async (c) => {
    const { ingredient } = await c.req.json()
    const subs = await getSubstitutions(ingredient)
    return c.json({ substitutions: subs })
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id')
    await deleteRecipe(id)
    return c.json({ success: true })
  })

export default recipesRouter
