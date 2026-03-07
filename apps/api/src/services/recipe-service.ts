// Minimal recipe service implementations for MVP tests
// Full functionality will be added in subsequent tasks.

export async function listRecipes(householdId: string, filters: Record<string, any> = {}) {
  // ignore params for now; return empty list
  return { recipes: [] }
}

export async function getRecipe(id: string) {
  return { id, title: 'stub' }
}

export async function createRecipe(data: unknown) {
  return { id: 'new-recipe', ...data }
}

export async function importRecipeFromUrl(url: string, jsonLd: unknown) {
  // pretend we extracted a title from jsonLd
  return { title: typeof jsonLd === 'object' && (jsonLd as any).name ? (jsonLd as any).name : 'imported' }
}

export async function deleteRecipe(id: string) {
  // noop
}
