// Coaching and glossary types

export interface GlossaryTerm {
  term: string
  definition: string
  category: 'technique' | 'ingredient' | 'tool'
}

export interface IngredientInfo {
  description: string
  substitutes?: string | string[]
  tips?: string | string[]
}
