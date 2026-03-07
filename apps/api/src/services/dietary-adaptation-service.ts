// Dietary adaptation service - transforms recipes for dietary profiles

import type { DietaryProfile, Substitution, AdaptedRecipe } from '@staged/types'
import type { Recipe, Ingredient } from '@staged/types'

type RecipeIngredient = string | Ingredient

// Substitution mappings for different dietary profiles
const SUBSTITUTIONS: Record<DietaryProfile, Record<string, { replacement: string; reason: string }>> = {
  'vegan': {
    butter: { replacement: 'coconut oil or vegan butter', reason: 'Vegan alternative' },
    milk: { replacement: 'oat milk or almond milk', reason: 'Vegan alternative' },
    eggs: { replacement: 'flax egg or applesauce', reason: 'Vegan alternative' },
    cheese: { replacement: 'nutritional yeast or vegan cheese', reason: 'Vegan alternative' },
    honey: { replacement: 'maple syrup or agave', reason: 'Vegan alternative' },
    cream: { replacement: 'coconut cream', reason: 'Vegan alternative' },
    yogurt: { replacement: 'coconut yogurt', reason: 'Vegan alternative' },
    meat: { replacement: 'tofu or seitan', reason: 'Vegan alternative' },
    chicken: { replacement: 'tofu or tempeh', reason: 'Vegan alternative' },
    beef: { replacement: 'lentils or mushrooms', reason: 'Vegan alternative' },
    pork: { replacement: 'jackfruit', reason: 'Vegan alternative' },
    fish: { replacement: 'tofu or chickpeas', reason: 'Vegan alternative' },
    shrimp: { replacement: 'king oyster mushroom', reason: 'Vegan alternative' },
    bacon: { replacement: 'tempeh bacon or mushroom bacon', reason: 'Vegan alternative' },
    gelatin: { replacement: 'agar-agar', reason: 'Vegan alternative' },
    whey: { replacement: 'pea protein', reason: 'Vegan alternative' },
  },
  'vegetarian': {
    meat: { replacement: 'vegetables or lentils', reason: 'Vegetarian alternative' },
    chicken: { replacement: 'tofu or paneer', reason: 'Vegetarian alternative' },
    beef: { replacement: 'mushrooms or legumes', reason: 'Vegetarian alternative' },
    pork: { replacement: 'halloumi or paneer', reason: 'Vegetarian alternative' },
    fish: { replacement: 'paneer or tofu', reason: 'Vegetarian alternative' },
    shrimp: { replacement: 'paneer', reason: 'Vegetarian alternative' },
    bacon: { replacement: 'vegetarian bacon strips', reason: 'Vegetarian alternative' },
  },
  'dairy-free': {
    milk: { replacement: 'oat milk or almond milk', reason: 'Dairy-free alternative' },
    butter: { replacement: 'coconut oil or dairy-free butter', reason: 'Dairy-free alternative' },
    cheese: { replacement: 'dairy-free cheese', reason: 'Dairy-free alternative' },
    cream: { replacement: 'coconut cream', reason: 'Dairy-free alternative' },
    yogurt: { replacement: 'coconut yogurt', reason: 'Dairy-free alternative' },
    'ice cream': { replacement: 'coconut ice cream', reason: 'Dairy-free alternative' },
    'cream cheese': { replacement: 'vegan cream cheese', reason: 'Dairy-free alternative' },
    'sour cream': { replacement: 'coconut sour cream', reason: 'Dairy-free alternative' },
    whey: { replacement: 'oat protein', reason: 'Dairy-free alternative' },
  },
  'gluten-free': {
    wheat: { replacement: 'rice flour', reason: 'Gluten-free alternative' },
    flour: { replacement: 'GF flour blend', reason: 'Gluten-free alternative' },
    bread: { replacement: 'GF bread', reason: 'Gluten-free alternative' },
    pasta: { replacement: 'rice pasta or quinoa pasta', reason: 'Gluten-free alternative' },
    'soy sauce': { replacement: 'tamari', reason: 'Gluten-free alternative' },
    barley: { replacement: 'rice', reason: 'Gluten-free alternative' },
    rye: { replacement: 'buckwheat', reason: 'Gluten-free alternative' },
    seitan: { replacement: 'tofu or chickpea flour', reason: 'Gluten-free alternative' },
    breadcrumbs: { replacement: 'GF breadcrumbs', reason: 'Gluten-free alternative' },
    panko: { replacement: 'crushed rice crackers', reason: 'Gluten-free alternative' },
  },
}

function normalizeIngredientName(ingredient: string | Ingredient): string {
  return typeof ingredient === 'string' ? ingredient.toLowerCase().trim() : ingredient.name.toLowerCase().trim()
}

export function adaptRecipe(recipe: Recipe, profile: DietaryProfile): AdaptedRecipe {
  const substitutions: Substitution[] = []
  const profileSubs = SUBSTITUTIONS[profile]

  const adaptedIngredients = recipe.ingredients?.map((ing: RecipeIngredient) => {
    const name = normalizeIngredientName(ing)
    const ingStr = typeof ing === 'string' ? ing : ing.name

    for (const [original, sub] of Object.entries(profileSubs)) {
      if (name.includes(original) || original.includes(name)) {
        substitutions.push({
          original: ingStr,
          replacement: sub.replacement,
          reason: sub.reason,
        })
        // Replace the ingredient
        if (typeof ing === 'string') {
          return sub.replacement
        } else {
          return { ...ing, name: sub.replacement }
        }
      }
    }
    return ing
  })

  const adaptedRecipe = {
    ...recipe,
    id: `${recipe.id}-${profile}`,
    title: `${recipe.title} (${profile})`,
    ingredients: adaptedIngredients,
    dietary_tags: [...(recipe.dietary_tags || []), profile],
  }

  return {
    originalRecipeId: recipe.id,
    adaptedRecipe,
    profile,
    substitutions,
  }
}

export function getAvailableProfiles(): DietaryProfile[] {
  return ['vegan', 'vegetarian', 'dairy-free', 'gluten-free']
}

export function explainSubstitution(sub: Substitution): string {
  return `Replace "${sub.original}" with ${sub.replacement} (${sub.reason})`
}
