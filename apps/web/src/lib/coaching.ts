// Coaching/glossary data and utilities

import type { GlossaryTerm, IngredientInfo } from '@staged/types'

const TECHNIQUE_GLOSSARY: GlossaryTerm[] = [
  { term: 'sauté', definition: 'Cook food quickly in a small amount of fat over high heat, stirring frequently.', category: 'technique' },
  { term: 'simmer', definition: 'Cook food in liquid at just below boiling point, with small bubbles forming.', category: 'technique' },
  { term: 'boil', definition: 'Cook food in rapidly bubbling liquid at 212°F (100°C).', category: 'technique' },
  { term: 'braise', definition: 'Cook food slowly in a covered pot with a small amount of liquid.', category: 'technique' },
  { term: 'roast', definition: 'Cook food in an oven with dry heat, typically at high temperatures.', category: 'technique' },
  { term: 'grill', definition: 'Cook food over direct heat, usually outdoors on a barbecue.', category: 'technique' },
  { term: 'baste', definition: 'Pour liquid or fat over food while cooking to keep it moist and add flavor.', category: 'technique' },
  { term: 'deglaze', definition: 'Add liquid to a hot pan to loosen browned food particles (fond) for sauce.', category: 'technique' },
  { term: 'reduce', definition: 'Boil liquid to evaporate water, concentrating flavors into a sauce.', category: 'technique' },
  { term: 'fold', definition: 'Gently combine ingredients without deflating, using a lifting motion.', category: 'technique' },
  { term: 'julienne', definition: 'Cut food into thin, matchstick-sized strips.', category: 'technique' },
  { term: 'chiffonade', definition: 'Cut leafy vegetables or herbs into thin ribbons.', category: 'technique' },
  { term: 'blanch', definition: 'Briefly cook food in boiling water, then immediately plunge into ice water.', category: 'technique' },
  { term: 'poach', definition: 'Cook food gently in simmering liquid.', category: 'technique' },
  { term: 'sear', definition: 'Brown the surface of food quickly at high heat to develop flavor.', category: 'technique' },
  { term: 'marinade', definition: 'Flavorful liquid mixture used to tenderize and season food before cooking.', category: 'technique' },
  { term: 'emulsify', definition: 'Mix two liquids that don\'t normally combine, like oil and vinegar.', category: 'technique' },
  { term: 'knead', definition: 'Work dough with hands to develop gluten structure.', category: 'technique' },
  { term: 'proof', definition: 'Allow yeast dough to rise until doubled in size.', category: 'technique' },
  { term: 'caramelize', definition: 'Heat sugar or foods containing natural sugars until they brown and sweeten.', category: 'technique' },
]

const INGREDIENT_GLOSSARY: Record<string, IngredientInfo> = {
  'shallot': {
    description: 'A small, mild onion variety with a delicate, slightly sweet flavor.',
    substitutes: ['onion', 'scallion'],
    tips: 'Mince finely to distribute evenly in sauces.'
  },
  'cumin': {
    description: 'A warm, earthy spice common in Mexican, Indian, and Middle Eastern cuisines.',
    substitutes: ['coriander', 'caraway'],
    tips: 'Toast whole seeds in a dry pan to enhance flavor.'
  },
  'paprika': {
    description: 'A ground spice made from dried red fruits of Capsicum annuum.',
    substitutes: ['cayenne', 'chili powder'],
    tips: 'Use sweet paprika for mild flavor, smoked paprika for depth.'
  },
  'thyme': {
    description: 'An aromatic herb with small leaves and earthy, minty flavor.',
    substitutes: ['oregano', 'marjoram'],
    tips: 'Add early in cooking as flavor develops slowly.'
  },
  'rosemary': {
    description: 'A fragrant herb with needle-like leaves and pine-like aroma.',
    substitutes: ['thyme', 'sage'],
    tips: 'Strip leaves from stem before using, chop finely.'
  },
  'saffron': {
    description: 'The world\'s most expensive spice, from crocus flowers. Provides golden color and floral flavor.',
    substitutes: ['turmeric', 'annatto'],
    tips: 'Steep in warm liquid before adding to dishes.'
  },
  'prosciutto': {
    description: 'Italian dry-cured ham, thin-sliced and often served raw.',
    substitutes: ['parma ham', 'serrano ham'],
    tips: 'Wrap around melon or figs for classic appetizer.'
  },
  'parmesan': {
    description: 'Hard, aged Italian cheese with nutty, sharp flavor.',
    substitutes: ['pecorino romano', 'grana padano'],
    tips: 'Use a microplane for finest texture.'
  },
  'arborio': {
    description: 'Short-grain rice ideal for risotto, releases starch for creamy texture.',
    substitutes: ['carnaroli', 'vialone nano'],
    tips: 'Toast rice in fat before adding liquid.'
  },
  'miso': {
    description: 'Fermented soybean paste, salty and umami-rich.',
    substitutes: ['soy sauce', 'dashi'],
    tips: 'Add at end of cooking to preserve beneficial bacteria.'
  },
}

export function getTechniqueGlossary(): GlossaryTerm[] {
  return TECHNIQUE_GLOSSARY
}

export function getIngredientInfo(name: string): IngredientInfo | undefined {
  const key = name.toLowerCase().trim()
  return INGREDIENT_GLOSSARY[key]
}

export function findTermsInText(text: string): Array<{ term: string; definition: string; category: 'technique' | 'ingredient'; index: number; length: number }> {
  const found: Array<{ term: string; definition: string; category: 'technique' | 'ingredient'; index: number; length: number }> = []
  const lowerText = text.toLowerCase()

  // Find techniques
  for (const entry of TECHNIQUE_GLOSSARY) {
    const idx = lowerText.indexOf(entry.term.toLowerCase())
    if (idx !== -1) {
      found.push({
        term: entry.term,
        definition: entry.definition,
        category: 'technique',
        index: idx,
        length: entry.term.length,
      })
    }
  }

  // Find ingredients
  for (const [name, info] of Object.entries(INGREDIENT_GLOSSARY)) {
    const idx = lowerText.indexOf(name)
    if (idx !== -1) {
      found.push({
        term: name,
        definition: info.description,
        category: 'ingredient',
        index: idx,
        length: name.length,
      })
    }
  }

  // Sort by index
  return found.sort((a, b) => a.index - b.index)
}
