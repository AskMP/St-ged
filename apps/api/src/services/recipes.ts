import { HTTPException } from 'hono/http-exception'

export async function listRecipes(householdId: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function getRecipe(id: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function createRecipe(data: unknown) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function importRecipeFromUrl(url: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}

export async function deleteRecipe(id: string) {
  throw new HTTPException(501, { message: 'Not implemented' })
}
