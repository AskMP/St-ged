# @staged/db

Drizzle ORM schema, migrations, and seed scripts for Staged.

## Commands

```bash
# Run Drizzle migrations
pnpm --filter @staged/db migrate

# Generate a new migration from schema changes
pnpm --filter @staged/db generate

# Seed the database (creates dev fixtures + 6 starter recipes)
pnpm --filter @staged/db seed

# Seed only the 6 starter recipes
pnpm --filter @staged/db seed:recipes
```

## Seed Recipes

The seed includes 6 starter recipes so new users see a populated recipe library immediately:

| Recipe                 | Skill        | Tags                           |
| ---------------------- | ------------ | ------------------------------ |
| Classic Scrambled Eggs | beginner     | vegetarian, gluten-free        |
| Peanut Butter Toast    | beginner     | vegan, vegetarian              |
| Pasta Primavera        | intermediate | vegetarian                     |
| Chicken Stir Fry       | intermediate | gluten-free                    |
| Beef Bourguignon       | advanced     | --                             |
| Red Lentil Soup        | beginner     | vegan, gluten-free, dairy-free |

Seeds are idempotent: running them multiple times is safe (uses fixed UUIDs + ON CONFLICT DO NOTHING).
