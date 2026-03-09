import type { PantryItem, Recipe } from '@staged/types'
import { describe, expect, it } from 'vitest'
import { calculateRecipeCost, getRecipeCost } from '../../src/services/recipe-service'

const sample: Recipe = {
  id: 'r1',
  title: 'Sample',
  ingredients: [{ name: 'tomato' }, { name: 'water' }],
  cost_per_serving: 2,
}

const pantry: PantryItem[] = [
  { id: 'p1', householdId: 'h', name: 'tomato', quantity: 1 },
]

describe('cost service', () => {
  it('deducts pantry items from base cost', async () => {
    const result = await calculateRecipeCost(sample, pantry)
    expect(result.costPerServing).toBeLessThan(2)
    expect(result.pantryDeduction).toBeGreaterThan(0)
  })

  it('getRecipeCost proxies to calculation', async () => {
    // insert sample recipe into the in-memory RECIPES via createRecipe import
    const { createRecipe } = await import('../../src/services/recipe-service')
    const created = await createRecipe(sample)
    const result = await getRecipeCost(created.id, pantry)
    expect(result.costPerServing).toBeLessThan(sample.cost_per_serving!)    
  })
})
