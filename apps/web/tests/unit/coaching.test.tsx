import { describe, it, expect } from 'vitest'
import { getTechniqueGlossary, getIngredientInfo, findTermsInText } from '../../src/lib/coaching'

describe('coaching utilities', () => {
  describe('getTechniqueGlossary', () => {
    it('returns array of techniques', () => {
      const glossary = getTechniqueGlossary()
      expect(glossary.length).toBeGreaterThan(0)
      expect(glossary[0]).toHaveProperty('term')
      expect(glossary[0]).toHaveProperty('definition')
      expect(glossary[0]).toHaveProperty('category')
    })

    it('includes common cooking techniques', () => {
      const glossary = getTechniqueGlossary()
      const terms = glossary.map(g => g.term.toLowerCase())
      expect(terms).toContain('sauté')
      expect(terms).toContain('simmer')
      expect(terms).toContain('sear')
    })
  })

  describe('getIngredientInfo', () => {
    it('returns info for known ingredient', () => {
      const info = getIngredientInfo('shallot')
      expect(info).toBeDefined()
      expect(info?.description).toContain('onion')
    })

    it('returns undefined for unknown ingredient', () => {
      const info = getIngredientInfo('xyzunknown')
      expect(info).toBeUndefined()
    })

    it('is case insensitive', () => {
      const info1 = getIngredientInfo('Shallot')
      const info2 = getIngredientInfo('shallot')
      expect(info1).toEqual(info2)
    })
  })

  describe('findTermsInText', () => {
    it('finds techniques in step text', () => {
      const text = 'Sauté the onions until translucent, then simmer for 10 minutes.'
      const terms = findTermsInText(text)
      
      const techniques = terms.filter(t => t.category === 'technique')
      expect(techniques.length).toBe(2)
      expect(techniques.some(t => t.term.toLowerCase() === 'sauté')).toBe(true)
      expect(techniques.some(t => t.term.toLowerCase() === 'simmer')).toBe(true)
    })

    it('finds ingredients in step text', () => {
      const text = 'Add shallot and cumin to the pan.'
      const terms = findTermsInText(text)
      
      const ingredients = terms.filter(t => t.category === 'ingredient')
      expect(ingredients.length).toBe(2)
      expect(ingredients.some(t => t.term.toLowerCase() === 'shallot')).toBe(true)
      expect(ingredients.some(t => t.term.toLowerCase() === 'cumin')).toBe(true)
    })

    it('returns empty array when no terms found', () => {
      const text = 'Mix everything together in a bowl.'
      const terms = findTermsInText(text)
      expect(terms).toHaveLength(0)
    })

    it('returns terms with correct position info', () => {
      const text = 'Sauté the garlic'
      const terms = findTermsInText(text)
      
      expect(terms[0]!).toHaveProperty('index')
      expect(terms[0]!).toHaveProperty('length')
      expect(terms[0]!.definition).toBeDefined()
    })
  })
})
