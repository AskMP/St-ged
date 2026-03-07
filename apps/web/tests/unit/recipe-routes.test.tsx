import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as apiClient from "../../src/lib/api-client";
import * as wakeLock from "../../src/lib/wake-lock";
import {
  CookingView,
  RecipeDetail,
  RecipeLibrary,
} from "../../src/routes/Recipes";

// Mock api client
vi.mock("../../src/lib/api-client", () => ({
  apiClient: {
    recipes: {
      list: vi.fn(),
      get: vi.fn(),
      import: vi.fn(),
      scale: vi.fn(),
      substitute: vi.fn(),
      cost: vi.fn(),
    },
    dietary: {
      getProfiles: vi.fn().mockResolvedValue({ profiles: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'] }),
      adapt: vi.fn(),
    },
  },
}));

// Mock wake lock
vi.mock("../../src/lib/wake-lock", () => ({
  isWakeLockSupported: vi.fn(() => false),
  acquireWakeLock: vi.fn(() => Promise.resolve(false)),
  releaseWakeLock: vi.fn(() => Promise.resolve()),
}));

const mockRecipes = [
  {
    id: "r1",
    title: "Pasta Primavera",
    description: "Light summer pasta",
    nutrition_per_serving: { calories: 450, protein: 12, fat: 10, carbs: 70 },
    ingredients: [
      { name: "pasta", quantity: 200, unit: "g" },
      { name: "zucchini", quantity: 1, unit: "medium" },
    ],
    steps: [
      "Boil water and cook pasta.",
      "Saute vegetables.",
      "Combine and serve.",
    ],
  },
  {
    id: "r2",
    title: "Lentil Soup",
    description: "Hearty and vegan",
    nutrition_per_serving: { calories: 320, protein: 18, fat: 5, carbs: 50 },
    ingredients: [{ name: "lentils", quantity: 200, unit: "g" }],
    steps: ["Simmer lentils.", "Season and serve."],
  },
];

beforeEach(() => {
  vi.mocked(apiClient.apiClient.recipes.list).mockResolvedValue(mockRecipes);
  vi.mocked(apiClient.apiClient.recipes.get).mockResolvedValue(mockRecipes[0]);
  vi.mocked(apiClient.apiClient.recipes.scale).mockResolvedValue(
    mockRecipes[0],
  );
  vi.mocked(apiClient.apiClient.recipes.substitute).mockResolvedValue({
    substitutions: ["spaghetti squash", "rice noodles"],
  });
  vi.mocked(apiClient.apiClient.recipes.import).mockResolvedValue(
    mockRecipes[0],
  );
  vi.mocked(apiClient.apiClient.recipes.cost).mockResolvedValue({
    costPerServing: 0,
    pantryDeduction: 0,
  });
});

function renderRoute(path: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path.replace(/\/[^/]+$/, "/*")} element={element} />
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RecipeLibrary", () => {
  it("renders search input and diet filter chips", async () => {
    render(
      <MemoryRouter>
        <RecipeLibrary />
      </MemoryRouter>,
    );
    expect(
      screen.getByPlaceholderText("Search recipes..."),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("diet-filters")).toBeInTheDocument();
    });
    expect(screen.getByText("vegan")).toBeInTheDocument();
    expect(screen.getByText("gluten-free")).toBeInTheDocument();
  });

  it("displays recipe cards after loading", async () => {
    render(
      <MemoryRouter>
        <RecipeLibrary />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getAllByTestId("recipe-card")).toHaveLength(2);
    });
    expect(screen.getByText("Pasta Primavera")).toBeInTheDocument();
    expect(screen.getByText("Lentil Soup")).toBeInTheDocument();
  });

  it("shows import URL input and button", async () => {
    render(
      <MemoryRouter>
        <RecipeLibrary />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("import-url")).toBeInTheDocument();
    expect(screen.getByTestId("import-btn")).toBeInTheDocument();
  });

  it("import button disabled when URL empty", () => {
    render(
      <MemoryRouter>
        <RecipeLibrary />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("import-btn")).toBeDisabled();
  });

  it("shows import error when import fails", async () => {
    vi.mocked(apiClient.apiClient.recipes.import).mockRejectedValue(
      new Error("Invalid URL"),
    );
    render(
      <MemoryRouter>
        <RecipeLibrary />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("import-url"), {
      target: { value: "https://example.com/recipe" },
    });
    fireEvent.click(screen.getByTestId("import-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("import-error")).toBeInTheDocument();
    });
  });

  it("calls list API with diet param when filter selected", async () => {
    render(
      <MemoryRouter>
        <RecipeLibrary />
      </MemoryRouter>,
    );
    await waitFor(() => screen.getAllByTestId("recipe-card"));
    fireEvent.click(screen.getByText("vegan"));
    await waitFor(() => {
      expect(apiClient.apiClient.recipes.list).toHaveBeenCalledWith(
        expect.objectContaining({ diet: "vegan" }),
      );
    });
  });
});

describe("RecipeDetail", () => {
  function renderDetail() {
    return render(
      <MemoryRouter initialEntries={["/recipes/r1"]}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes" element={<div>Library</div>} />
          <Route path="/recipes/:id/cook" element={<div>Cooking</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("renders recipe title and description", async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText("Pasta Primavera")).toBeInTheDocument();
    });
    expect(screen.getByText("Light summer pasta")).toBeInTheDocument();
  });

  it("shows nutrition info", async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByTestId("nutrition-info")).toBeInTheDocument();
    });
    expect(screen.getByText(/450 kcal/)).toBeInTheDocument();
  });

  it("shows scaling controls", async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByTestId("scaling-controls")).toBeInTheDocument();
    });
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows ingredient substitute buttons", async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByTestId("substitute-0")).toBeInTheDocument();
    });
  });

  it("shows substitution results after clicking substitute", async () => {
    renderDetail();
    await waitFor(() => screen.getByTestId("substitute-0"));
    fireEvent.click(screen.getByTestId("substitute-0"));
    await waitFor(() => {
      expect(screen.getByTestId("substitution-results")).toBeInTheDocument();
    });
    expect(screen.getByText("spaghetti squash")).toBeInTheDocument();
  });

  it("displays cost info when cost API resolves", async () => {
    vi.mocked(apiClient.apiClient.recipes.cost).mockResolvedValue({
      costPerServing: 4,
      pantryDeduction: 0.5,
    });
    renderDetail();
    await waitFor(() => screen.getByTestId("cost-info"));
    expect(screen.getByText(/Cost per serving/)).toBeInTheDocument();
  });

  it("has a Start Cooking link", async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByTestId("start-cooking-btn")).toBeInTheDocument();
    });
  });
});

describe("CookingView", () => {
  function renderCooking() {
    return render(
      <MemoryRouter initialEntries={["/recipes/r1/cook"]}>
        <Routes>
          <Route path="/recipes/:id/cook" element={<CookingView />} />
          <Route path="/recipes/:id" element={<div>Detail</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("renders cooking step content", async () => {
    renderCooking();
    await waitFor(() => {
      expect(screen.getByTestId("cooking-view")).toBeInTheDocument();
    });
    expect(screen.getByTestId("cooking-step")).toBeInTheDocument();
  });

  it("shows step 1 of total steps", async () => {
    renderCooking();
    await waitFor(() => screen.getByTestId("cooking-step"));
    expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument();
  });

  it("Previous button disabled on first step", async () => {
    renderCooking();
    await waitFor(() => screen.getByTestId("cooking-step"));
    expect(screen.getByText("Previous")).toBeDisabled();
  });

  it("Next advances to step 2", async () => {
    renderCooking();
    await waitFor(() => screen.getByTestId("cooking-step"));
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();
  });

  it("shows wake lock fallback text when unsupported", async () => {
    vi.mocked(wakeLock.isWakeLockSupported).mockReturnValue(false);
    renderCooking();
    await waitFor(() => screen.getByTestId("cooking-view"));
    expect(screen.getByText("No wake lock")).toBeInTheDocument();
  });
});
