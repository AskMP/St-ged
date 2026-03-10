/**
 * Starter recipe seeds for Staged.
 * 6 recipes covering beginner, intermediate, advanced, and vegan tiers.
 * Idempotent: recipes use fixed UUIDs (ON CONFLICT DO NOTHING).
 * Ingredients are only inserted if the recipe row was newly created.
 *
 * Run standalone: pnpm --filter @staged/db seed:recipes
 * Or imported by seeds/index.ts for the full seed run.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { recipes, recipeIngredients } from "../schema";

type IngredientRow = {
  name: string;
  quantityValue: number | null;
  quantityUnit: string | null;
  sortOrder: number;
};

type StarterRecipe = {
  id: string;
  title: string;
  description: string;
  skillLevel: string;
  servingsBase: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  dietaryTags: string[];
  techniqueTags: string[];
  ingredients: IngredientRow[];
};

const STARTER_RECIPES: StarterRecipe[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-000000000001",
    title: "Classic Scrambled Eggs",
    description: "Fluffy, creamy scrambled eggs ready in under 10 minutes.",
    skillLevel: "beginner",
    servingsBase: 2,
    prepTimeMinutes: 2,
    cookTimeMinutes: 5,
    dietaryTags: ["vegetarian", "gluten-free"],
    techniqueTags: ["saute"],
    ingredients: [
      { name: "Eggs", quantityValue: 4, quantityUnit: "large", sortOrder: 0 },
      { name: "Butter", quantityValue: 1, quantityUnit: "tbsp", sortOrder: 1 },
      {
        name: "Whole milk",
        quantityValue: 2,
        quantityUnit: "tbsp",
        sortOrder: 2,
      },
      { name: "Salt", quantityValue: null, quantityUnit: null, sortOrder: 3 },
      {
        name: "Black pepper",
        quantityValue: null,
        quantityUnit: null,
        sortOrder: 4,
      },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-000000000002",
    title: "Peanut Butter Toast",
    description: "A quick, satisfying breakfast with protein and healthy fats.",
    skillLevel: "beginner",
    servingsBase: 1,
    prepTimeMinutes: 3,
    cookTimeMinutes: 2,
    dietaryTags: ["vegan", "vegetarian"],
    techniqueTags: [],
    ingredients: [
      {
        name: "Whole wheat bread",
        quantityValue: 2,
        quantityUnit: "slices",
        sortOrder: 0,
      },
      {
        name: "Peanut butter",
        quantityValue: 2,
        quantityUnit: "tbsp",
        sortOrder: 1,
      },
      { name: "Banana", quantityValue: 0.5, quantityUnit: null, sortOrder: 2 },
      { name: "Honey", quantityValue: 1, quantityUnit: "tsp", sortOrder: 3 },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-000000000003",
    title: "Pasta Primavera",
    description:
      "Spring vegetables tossed with pasta in a light garlic-parmesan sauce.",
    skillLevel: "intermediate",
    servingsBase: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    dietaryTags: ["vegetarian"],
    techniqueTags: ["saute", "boil"],
    ingredients: [
      {
        name: "Penne pasta",
        quantityValue: 400,
        quantityUnit: "g",
        sortOrder: 0,
      },
      {
        name: "Cherry tomatoes",
        quantityValue: 250,
        quantityUnit: "g",
        sortOrder: 1,
      },
      { name: "Zucchini", quantityValue: 1, quantityUnit: null, sortOrder: 2 },
      {
        name: "Bell pepper",
        quantityValue: 1,
        quantityUnit: null,
        sortOrder: 3,
      },
      {
        name: "Garlic cloves",
        quantityValue: 3,
        quantityUnit: null,
        sortOrder: 4,
      },
      {
        name: "Parmesan cheese",
        quantityValue: 60,
        quantityUnit: "g",
        sortOrder: 5,
      },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-000000000004",
    title: "Chicken Stir Fry",
    description:
      "Quick weeknight stir fry with chicken and vegetables over rice.",
    skillLevel: "intermediate",
    servingsBase: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    dietaryTags: ["gluten-free"],
    techniqueTags: ["stir-fry"],
    ingredients: [
      {
        name: "Chicken breast",
        quantityValue: 500,
        quantityUnit: "g",
        sortOrder: 0,
      },
      {
        name: "Broccoli florets",
        quantityValue: 300,
        quantityUnit: "g",
        sortOrder: 1,
      },
      {
        name: "Soy sauce",
        quantityValue: 3,
        quantityUnit: "tbsp",
        sortOrder: 2,
      },
      {
        name: "Sesame oil",
        quantityValue: 1,
        quantityUnit: "tbsp",
        sortOrder: 3,
      },
      { name: "Ginger", quantityValue: 1, quantityUnit: "tsp", sortOrder: 4 },
      {
        name: "Garlic cloves",
        quantityValue: 2,
        quantityUnit: null,
        sortOrder: 5,
      },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-000000000005",
    title: "Beef Bourguignon",
    description:
      "Classic French braised beef stew with wine, mushrooms, and pearl onions.",
    skillLevel: "advanced",
    servingsBase: 6,
    prepTimeMinutes: 45,
    cookTimeMinutes: 180,
    dietaryTags: [],
    techniqueTags: ["braise", "saute"],
    ingredients: [
      {
        name: "Beef chuck",
        quantityValue: 1.5,
        quantityUnit: "kg",
        sortOrder: 0,
      },
      {
        name: "Red wine",
        quantityValue: 750,
        quantityUnit: "ml",
        sortOrder: 1,
      },
      {
        name: "Beef broth",
        quantityValue: 500,
        quantityUnit: "ml",
        sortOrder: 2,
      },
      {
        name: "Pearl onions",
        quantityValue: 200,
        quantityUnit: "g",
        sortOrder: 3,
      },
      {
        name: "Cremini mushrooms",
        quantityValue: 250,
        quantityUnit: "g",
        sortOrder: 4,
      },
      {
        name: "Bacon lardons",
        quantityValue: 150,
        quantityUnit: "g",
        sortOrder: 5,
      },
    ],
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-000000000006",
    title: "Red Lentil Soup",
    description:
      "Warming, protein-rich lentil soup with cumin, turmeric, and lemon.",
    skillLevel: "beginner",
    servingsBase: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    techniqueTags: ["simmer"],
    ingredients: [
      {
        name: "Red lentils",
        quantityValue: 300,
        quantityUnit: "g",
        sortOrder: 0,
      },
      { name: "Onion", quantityValue: 1, quantityUnit: null, sortOrder: 1 },
      {
        name: "Garlic cloves",
        quantityValue: 3,
        quantityUnit: null,
        sortOrder: 2,
      },
      { name: "Cumin", quantityValue: 1, quantityUnit: "tsp", sortOrder: 3 },
      {
        name: "Turmeric",
        quantityValue: 0.5,
        quantityUnit: "tsp",
        sortOrder: 4,
      },
      { name: "Lemon", quantityValue: 1, quantityUnit: null, sortOrder: 5 },
      {
        name: "Vegetable broth",
        quantityValue: 1200,
        quantityUnit: "ml",
        sortOrder: 6,
      },
    ],
  },
];

export async function seedStarterRecipes(
  db: ReturnType<typeof drizzle<typeof import("../schema")>>,
): Promise<void> {
  console.log("Seeding starter recipes...");

  for (const recipe of STARTER_RECIPES) {
    const { ingredients, ...recipeData } = recipe;

    // Upsert recipe row -- idempotent by fixed UUID
    const inserted = await db
      .insert(recipes)
      .values({
        id: recipeData.id,
        title: recipeData.title,
        description: recipeData.description,
        skillLevel: recipeData.skillLevel,
        servingsBase: recipeData.servingsBase,
        prepTimeMinutes: recipeData.prepTimeMinutes,
        cookTimeMinutes: recipeData.cookTimeMinutes,
        dietaryTags: recipeData.dietaryTags,
        techniqueTags: recipeData.techniqueTags,
        isLicensed: false,
      })
      .onConflictDoNothing()
      .returning({ id: recipes.id });

    // Only insert ingredients if the recipe row was newly created
    if (inserted.length > 0 && ingredients.length > 0) {
      await db.insert(recipeIngredients).values(
        ingredients.map((ing) => ({
          recipeId: recipeData.id,
          name: ing.name,
          quantityValue: ing.quantityValue,
          quantityUnit: ing.quantityUnit,
          sortOrder: ing.sortOrder,
        })),
      );
    }
  }

  console.log(`Done. ${STARTER_RECIPES.length} starter recipes seeded.`);
}

// Run standalone: pnpm --filter @staged/db seed:recipes
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://staged:staged_dev_password@localhost:5432/staged_dev",
  });
  const db = drizzle(pool, { schema: await import("../schema") });
  seedStarterRecipes(db as any)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => pool.end());
}
