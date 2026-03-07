import { Hono } from 'hono'
import { adaptRecipe, getAvailableProfiles, explainSubstitution } from '../services/dietary-adaptation-service'
import { getRecipe } from '../services/recipe-service'

const dietaryRouter = new Hono()

dietaryRouter.post('/adapt', async (c) => {
  const { recipeId, profile } = await c.req.json()
  const recipe = await getRecipe(recipeId)
  const adapted = adaptRecipe(recipe, profile)
  return c.json(adapted)
})

dietaryRouter.get('/profiles', async (c) => {
  const profiles = getAvailableProfiles()
  return c.json({ profiles })
})

dietaryRouter.post('/explain', async (c) => {
  const { substitution } = await c.req.json()
  const explanation = explainSubstitution(substitution)
  return c.json({ explanation })
})

export default dietaryRouter
