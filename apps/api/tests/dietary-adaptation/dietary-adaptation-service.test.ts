import { describe, it, expect } from 'vitest'
import { adaptRecipe, getAvailableProfiles, explainSubstitution } from '../../src/services/dietary-adaptation-service'

describe('dietary-adaptation-service', () => {
  const mockRecipe = {
    id: 'r1',
    title: 'Pasta with Butter',
    ingredients: [
      'pasta',
      'butter',
      'cheese',
      'milk',
    ],
  }

  describe('adaptRecipe', () => {
    it('adapts recipe to vegan', () => {
      const result = adaptRecipe(mockRecipe as any, 'vegan')
      
      expect(result.profile).toBe('vegan')
      expect(result.originalRecipeId).toBe('r1')
      expect(result.adaptedRecipe.title).toContain('vegan')
      expect(result.substitutions.length).toBeGreaterThan(0)
    })

    it('adapts recipe to dairy-free', () => {
      const result = adaptRecipe(mockRecipe as any, 'dairy-free')
      
      expect(result.profile).toBe('dairy-free')
      expect(result.substitutions.some(s => s.original === 'butter')).toBe(true)
      expect(result.substitutions.some(s => s.original === 'cheese')).toBe(true)
      expect(result.substitutions.some(s => s.original === 'milk')).toBe(true)
    })

    it('adapts recipe to gluten-free', () => {
      const glutenRecipe = {
        ...mockRecipe,
        ingredients: ['pasta', 'bread', 'soy sauce'],
      }
      const result = adaptRecipe(glutenRecipe as any, 'gluten-free')
      
      expect(result.profile).toBe('gluten-free')
      expect(result.substitutions.length).toBe(3)
    })

    it('handles recipe with no matching ingredients', () => {
      const simpleRecipe = {
        id: 'r2',
        title: 'Simple Salad',
        ingredients: ['lettuce', 'tomato', 'olive oil'],
      }
      const result = adaptRecipe(simpleRecipe as any, 'vegan')
      
      expect(result.profile).toBe('vegan')
      expect(result.substitutions.length).toBe(0)
    })
  })

  describe('getAvailableProfiles', () => {
    it('returns all dietary profiles', () => {
      const profiles = getAvailableProfiles()
      
      expect(profiles).toContain('vegan')
      expect(profiles).toContain('vegetarian')
      expect(profiles).toContain('dairy-free')
      expect(profiles).toContain('gluten-free')
    })
  })

  describe('explainSubstitution', () => {
    it('returns human-readable explanation', () => {
      const sub = {
        original: 'butter',
        replacement: 'coconut oil',
        reason: 'Vegan alternative',
      }
      const explanation = explainSubstitution(sub)
      
      expect(explanation).toContain('butter')
      expect(explanation).toContain('coconut oil')
      expect(explanation).toContain('Vegan alternative')
    })
  })
})
