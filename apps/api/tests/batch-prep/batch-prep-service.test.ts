import { beforeEach, describe, expect, it } from 'vitest'
import { combineRecipes } from '../../src/services/batch-prep-service'
import { createRecipe } from '../../src/services/recipe-service'

import { RECIPES } from '../../src/services/recipe-service'

beforeEach(() => {
  // reset recipe store by clearing exported array
  RECIPES.length = 0
})

describe('batch-prep service', () => {
  it('combines ingredients across recipes', async () => {
    await createRecipe({ id: 'r1', title: 'A', ingredients: ['tomato', 'water'] })
    await createRecipe({ id: 'r2', title: 'B', ingredients: ['tomato', 'basil'] })
    const res = await combineRecipes(['r1', 'r2'])
    expect(res.sequence).toEqual(['r1', 'r2'])
    expect(res.items).toEqual([
      { name: 'basil', count: 1 },
      { name: 'tomato', count: 2 },
      { name: 'water', count: 1 },
    ])
  })

  it('ignores unknown recipe ids', async () => {
    await createRecipe({ id: 'r1', title: 'A', ingredients: ['onion'] })
    const res = await combineRecipes(['r1', 'missing'])
    expect(res.items).toEqual([{ name: 'onion', count: 1 }])
  })
})