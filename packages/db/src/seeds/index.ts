import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema";
import { SEED } from "./fixtures";
import { seedStarterRecipes } from "./recipes";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://staged:staged_dev_password@localhost:5432/staged_dev",
});
const db = drizzle(pool, { schema });

export async function seedDatabase() {
  console.log("Seeding database...");

  // households
  await db
    .insert(schema.households)
    .values([
      {
        id: SEED.households.primary.id,
        name: SEED.households.primary.name,
        inviteCode: SEED.households.primary.inviteCode,
        createdBy: SEED.users.owner.id,
      },
      {
        id: SEED.households.guest.id,
        name: SEED.households.guest.name,
        inviteCode: SEED.households.guest.inviteCode,
        createdBy: SEED.users.member.id,
      },
    ])
    .onConflictDoNothing();

  // users
  await db
    .insert(schema.users)
    .values([
      {
        id: SEED.users.owner.id,
        email: SEED.users.owner.email,
        displayName: SEED.users.owner.displayName,
        skillLevel: "intermediate",
        householdId: SEED.households.primary.id,
      },
      {
        id: SEED.users.member.id,
        email: SEED.users.member.email,
        displayName: SEED.users.member.displayName,
        skillLevel: "beginner",
        householdId: SEED.households.primary.id,
      },
    ])
    .onConflictDoNothing();

  // household members
  await db
    .insert(schema.householdMembers)
    .values([
      {
        householdId: SEED.households.primary.id,
        userId: SEED.users.owner.id,
        role: "owner",
      },
      {
        householdId: SEED.households.primary.id,
        userId: SEED.users.member.id,
        role: "member",
      },
    ])
    .onConflictDoNothing();

  // recipes
  await db
    .insert(schema.recipes)
    .values([
      {
        id: SEED.recipes.pasta.id,
        title: SEED.recipes.pasta.title,
        skillLevel: "intermediate",
        servingsBase: 4,
        dietaryTags: [],
        techniqueTags: ["saute"],
        createdBy: SEED.users.owner.id,
      },
      {
        id: SEED.recipes.salad.id,
        title: SEED.recipes.salad.title,
        skillLevel: "beginner",
        servingsBase: 2,
        dietaryTags: ["vegan", "gluten-free"],
        techniqueTags: [],
        createdBy: SEED.users.owner.id,
      },
    ])
    .onConflictDoNothing();

  // pantry for primary household
  const pantryId = "aaaaaaaa-0000-0000-0000-000000000001";
  await db
    .insert(schema.pantry)
    .values([{ id: pantryId, householdId: SEED.households.primary.id }])
    .onConflictDoNothing();

  await db
    .insert(schema.pantryItems)
    .values([
      {
        pantryId,
        ingredientName: "Olive oil",
        quantityValue: 500,
        quantityUnit: "ml",
      },
      {
        pantryId,
        ingredientName: "Kosher salt",
        quantityValue: 1,
        quantityUnit: "box",
      },
      {
        pantryId,
        ingredientName: "Black pepper",
        quantityValue: 50,
        quantityUnit: "g",
      },
      {
        pantryId,
        ingredientName: "Garlic",
        quantityValue: 1,
        quantityUnit: "bulb",
      },
    ])
    .onConflictDoNothing();

  // grocery list
  const listId = "bbbbbbbb-0000-0000-0000-000000000001";
  await db
    .insert(schema.groceryLists)
    .values([
      {
        id: listId,
        householdId: SEED.households.primary.id,
        name: "This Week",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.groceryListItems)
    .values([
      {
        listId,
        ingredientName: "Spaghetti",
        quantityValue: 400,
        quantityUnit: "g",
        sourceRecipeId: SEED.recipes.pasta.id,
      },
      {
        listId,
        ingredientName: "Pancetta",
        quantityValue: 150,
        quantityUnit: "g",
        sourceRecipeId: SEED.recipes.pasta.id,
      },
      {
        listId,
        ingredientName: "Eggs",
        quantityValue: 4,
        quantityUnit: "large",
        sourceRecipeId: SEED.recipes.pasta.id,
      },
    ])
    .onConflictDoNothing();

  // Seed 6 starter recipes
  await seedStarterRecipes(db as any);

  console.log("Seed complete.");
  await pool.end();
}

// Run directly: pnpm --filter @staged/db seed
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
