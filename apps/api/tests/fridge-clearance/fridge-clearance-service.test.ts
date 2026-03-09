import type { PantryItem, Recipe } from '@staged/types'
import { describe, expect, it } from 'vitest'
import { computeFridgeClearance, getExpiringItems, matchRecipes } from '../../src/services/fridge-clearance-service'

function makePantry(name: string, expires?: string): PantryItem {
  return {
    id: name,
    householdId: 'h1',
    name,
    quantity: 1,
    unit: 'each',
    expiresAt: expires,
  }
}

function makeRecipe(id: string, title: string, ingredients: string[]): Recipe {
  return {
    id,
    title,
    diet: '',
    ingredients,
  } as unknown as Recipe
}

describe('fridge-clearance service', () => {
  it('scores recipes based on pantry coverage', () => {
    const pantry = [makePantry('eggs'), makePantry('milk')]
    const recipes = [
      makeRecipe('r1', 'Omelet', ['eggs', 'cheese']),
      makeRecipe('r2', 'Cereal', ['milk', 'cereal']),
      makeRecipe('r3', 'Toast', ['bread']),
    ]
    const suggestions = matchRecipes(pantry, recipes, 10)
    expect(suggestions.length).toBe(2)
    // r1 coverage 0.5, r2 coverage 0.5, r3 zero should be filtered out
    expect(suggestions.map((s) => s.recipe.id).sort()).toEqual(['r1', 'r2'])
  })

  it('computes expiry warnings correctly', () => {
    const now = new Date('2025-01-10T00:00:00Z')
    const pantry = [
      makePantry('apple', '2025-01-11T00:00:00Z'),
      makePantry('banana', '2025-01-20T00:00:00Z'),
      makePantry('cucumber'),
    ]
    const exp = getExpiringItems(pantry, now)
    expect(exp.length).toBe(1)
    expect(exp[0].name).toBe('apple')
    expect(exp[0].daysUntilExpiry).toBe(1)
  })

  it('computeFridgeClearance bundles suggestions and expiring', () => {
    const pantry = [makePantry('eggs')]
    const recipes = [makeRecipe('r1', 'Omelet', ['eggs'])]
    const result = computeFridgeClearance(pantry, recipes, new Date('2025-01-01'))
    expect(result.suggestions[0].recipe.id).toBe('r1')
    expect(result.expiringItems).toEqual([])
  })
})
