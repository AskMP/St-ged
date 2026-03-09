/**
 * Recipes page unit tests -- persona-driven recipe library.
 *
 * Tests the rebuilt Recipes.tsx which has:
 * - Skill level filter chips (Jordan's Confidence Rule)
 * - Zero-waste toggle (Maya's Zero-Waste Signal)
 * - Search input
 * - Recipe grid with RecipeCard components
 */
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Recipes from "../../../src/routes/Recipes";

vi.mock("../../../src/lib/api-client", () => ({
  apiClient: {
    recipes: {
      list: vi.fn().mockResolvedValue([
        {
          id: "r-pasta",
          title: "Pasta Primavera",
          skill_level: "beginner",
          zero_waste: false,
          cook_time_minutes: 20,
          servings: 2,
        },
        {
          id: "r-lentil",
          title: "Red Lentil Soup",
          skill_level: "beginner",
          zero_waste: true,
          cook_time_minutes: 25,
          servings: 4,
        },
      ]),
    },
  },
}));

function renderRecipes() {
  return render(
    <MemoryRouter initialEntries={["/recipes"]}>
      <Routes>
        <Route path="/recipes" element={<Recipes />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("recipes page", () => {
  it("renders the recipe library container", () => {
    renderRecipes();
    expect(screen.getByTestId("recipe-library")).toBeInTheDocument();
  });

  it("renders skill filter chips (Jordan's Confidence Rule)", async () => {
    renderRecipes();
    await waitFor(() => {
      expect(screen.getByTestId("skill-filters")).toBeInTheDocument();
    });
    expect(screen.getByTestId("skill-filter-beginner")).toBeInTheDocument();
    expect(screen.getByTestId("skill-filter-home_cook")).toBeInTheDocument();
    expect(screen.getByTestId("skill-filter-confident")).toBeInTheDocument();
  });

  it("renders zero-waste toggle (Maya's Signal)", async () => {
    renderRecipes();
    await waitFor(() => {
      expect(screen.getByTestId("zero-waste-toggle")).toBeInTheDocument();
    });
  });

  it("renders search input", async () => {
    renderRecipes();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  it("renders recipe cards after load", async () => {
    renderRecipes();
    await waitFor(() => {
      expect(screen.getByTestId("recipe-card-r-pasta")).toBeInTheDocument();
    });
    expect(screen.getByTestId("recipe-card-r-lentil")).toBeInTheDocument();
  });
});
