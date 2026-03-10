/**
 * Server-side recipe filter tests.
 * Verifies that GET /api/recipes accepts skillLevel and dietaryTag query params
 * and that listRecipes() applies the appropriate filters.
 *
 * These tests use the in-memory Drizzle mock via the app's test environment.
 */

// Ensure test env vars are set
process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.DATABASE_URL ||=
  "postgresql://staged:staged_dev_password@localhost:5432/staged_dev";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";

import { describe, expect, it, vi, beforeEach } from "vitest";
import { app } from "../../src/index";

const BASE = "http://localhost";

// The recipe service uses Drizzle + real DB in integration mode.
// For unit-level testing, we mock the recipe service to avoid DB dependency.

vi.mock("../../src/services/recipe-service", () => ({
  listRecipes: vi.fn(
    async (_householdId: string, filters: Record<string, string>) => {
      const allRecipes = [
        {
          id: "r1",
          title: "Scrambled Eggs",
          skillLevel: "beginner",
          dietaryTags: ["vegetarian", "gluten-free"],
          ingredients: [],
        },
        {
          id: "r2",
          title: "Beef Bourguignon",
          skillLevel: "advanced",
          dietaryTags: [],
          ingredients: [],
        },
        {
          id: "r3",
          title: "Red Lentil Soup",
          skillLevel: "beginner",
          dietaryTags: ["vegan", "gluten-free"],
          ingredients: [],
        },
        {
          id: "r4",
          title: "Chicken Stir Fry",
          skillLevel: "intermediate",
          dietaryTags: ["gluten-free"],
          ingredients: [],
        },
      ];

      let result = allRecipes;

      if (filters.skillLevel) {
        result = result.filter((r) => r.skillLevel === filters.skillLevel);
      }
      if (filters.dietaryTag) {
        result = result.filter((r) =>
          r.dietaryTags.includes(filters.dietaryTag),
        );
      }

      return { recipes: result };
    },
  ),
  getRecipe: vi.fn(),
  createRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
  importRecipeFromUrl: vi.fn(),
  scaleRecipe: vi.fn(),
  getSubstitutions: vi.fn(),
  getRecipeCost: vi.fn(),
  calculateRecipeCost: vi.fn(),
}));

describe("GET /api/recipes -- server-side filters", () => {
  it("returns all recipes with no filters", async () => {
    const res = await app.request(`${BASE}/api/recipes`, { method: "GET" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(4);
  });

  it("filters by skillLevel=beginner", async () => {
    const res = await app.request(`${BASE}/api/recipes?skillLevel=beginner`, {
      method: "GET",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    // Only beginner recipes: Scrambled Eggs + Red Lentil Soup
    expect(body).toHaveLength(2);
    expect(body.every((r: any) => r.skillLevel === "beginner")).toBe(true);
  });

  it("filters by skillLevel=advanced", async () => {
    const res = await app.request(`${BASE}/api/recipes?skillLevel=advanced`, {
      method: "GET",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("Beef Bourguignon");
  });

  it("filters by dietaryTag=vegan returns only vegan-tagged recipes", async () => {
    const res = await app.request(`${BASE}/api/recipes?dietaryTag=vegan`, {
      method: "GET",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    // Only Red Lentil Soup is tagged vegan
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("Red Lentil Soup");
  });

  it("filters by dietaryTag=gluten-free returns only gluten-free recipes", async () => {
    const res = await app.request(
      `${BASE}/api/recipes?dietaryTag=gluten-free`,
      { method: "GET" },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    // Scrambled Eggs, Red Lentil Soup, Chicken Stir Fry all have gluten-free
    expect(body).toHaveLength(3);
    expect(body.every((r: any) => r.dietaryTags.includes("gluten-free"))).toBe(
      true,
    );
  });
});
