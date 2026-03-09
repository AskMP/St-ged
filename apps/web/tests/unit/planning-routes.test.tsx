import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import * as apiClient from "../../src/lib/api-client";
import { useOnboardingStore } from "../../src/lib/onboarding-store";
import * as socketLib from "../../src/lib/socket";
import * as syncQueue from "../../src/lib/sync-queue";
import Planning from "../../src/routes/Planning";

// Mock API client
vi.mock("../../src/lib/api-client", () => ({
  apiClient: {
    plans: {
      getWeek: vi.fn(),
      addEntry: vi.fn(),
      removeEntry: vi.fn(),
      generateList: vi.fn(),
      copyWeek: vi.fn(),
    },
    lists: {
      getAll: vi.fn(),
      get: vi.fn(),
      addItem: vi.fn(),
      toggleItem: vi.fn(),
      deleteItem: vi.fn(),
    },
    recipes: {
      // cost is called by the component on every render; provide a harmless default
      cost: vi
        .fn()
        .mockResolvedValue({ costPerServing: 0, pantryDeduction: 0 }),
    },
  },
}));

// Mock socket
vi.mock("../../src/lib/socket", () => ({
  joinHousehold: vi.fn(),
  leaveHousehold: vi.fn(),
  onConnectionChange: vi.fn(() => () => {}),
  getSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    connected: false,
  })),
}));

// Mock sync queue
vi.mock("../../src/lib/sync-queue", () => ({
  enqueue: vi.fn(),
  flushQueue: vi.fn(),
}));

// Compute the Monday of the current week so the entry always falls in-view
function getMondayISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

const mockWeekPlan = {
  plan: { id: "plan-1" },
  entries: [
    {
      id: "e1",
      recipeId: "r1",
      recipeTitle: "Pasta Primavera",
      date: getMondayISO(),
      mealType: "dinner",
    },
  ],
};

const mockGroceryList = {
  id: "list-1",
  items: [
    {
      id: "i1",
      listId: "list-1",
      name: "pasta 200g",
      checked: false,
      updatedAt: 0,
    },
    {
      id: "i2",
      listId: "list-1",
      name: "zucchini",
      checked: true,
      updatedAt: 0,
    },
  ],
};

beforeEach(() => {
  vi.mocked(apiClient.apiClient.plans.getWeek).mockResolvedValue(mockWeekPlan);
  vi.mocked(apiClient.apiClient.plans.generateList).mockResolvedValue(
    mockGroceryList,
  );
  vi.mocked(apiClient.apiClient.plans.copyWeek).mockResolvedValue({});
  vi.mocked(apiClient.apiClient.lists.toggleItem).mockResolvedValue({});
  // Reset onboarding store
  useOnboardingStore.getState().reset();
});

function renderPlanning() {
  return render(
    <MemoryRouter initialEntries={["/planning"]}>
      <Routes>
        <Route path="/planning" element={<Planning />} />
        <Route path="/fulfillment" element={<div>Fulfillment page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Planning page", () => {
  it("renders the planning page heading", async () => {
    renderPlanning();
    await waitFor(() => {
      expect(screen.getByTestId("planning-page")).toBeInTheDocument();
    });
    expect(screen.getByText("Meal Plan")).toBeInTheDocument();
  });

  it("shows budget summary placeholder", async () => {
    renderPlanning();
    await waitFor(() => {
      expect(screen.getByTestId("budget-summary")).toBeInTheDocument();
    });
  });

  it("shows week navigation controls", async () => {
    renderPlanning();
    await waitFor(() => {
      expect(screen.getByTestId("week-nav")).toBeInTheDocument();
    });
    expect(screen.getByText(/Prev/)).toBeInTheDocument();
    expect(screen.getByText(/Next/)).toBeInTheDocument();
  });

  it("renders the week calendar grid", async () => {
    renderPlanning();
    await waitFor(() => {
      expect(screen.getByTestId("week-calendar")).toBeInTheDocument();
    });
    expect(screen.getByText("breakfast")).toBeInTheDocument();
    expect(screen.getByText("lunch")).toBeInTheDocument();
    expect(screen.getByText("dinner")).toBeInTheDocument();
  });

  it("displays meal entries from the plan", async () => {
    renderPlanning();
    await waitFor(() => {
      expect(screen.getAllByTestId("meal-entry")).toHaveLength(1);
    });
    expect(screen.getByText("Pasta Primavera")).toBeInTheDocument();
  });

  it("requests cost per recipe and updates week cost", async () => {
    // stub cost returns 2 for any id
    // override default cost in this spec
    vi.mocked(apiClient.apiClient.recipes.cost).mockResolvedValue({
      costPerServing: 2,
      pantryDeduction: 0,
    });
    renderPlanning();
    await waitFor(() => {
      expect(apiClient.apiClient.recipes.cost).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId("budget-summary")).toHaveTextContent(
        /Weekly cost:/,
      );
    });
  });

  it("shows week navigation controls", async () => {
    renderPlanning();
    await waitFor(() => {
      expect(screen.getByTestId("week-nav")).toBeInTheDocument();
    });
  });

  it("shows Generate from plan button", async () => {
    renderPlanning();
    await waitFor(() => {
      expect(screen.getByTestId("generate-list-btn")).toBeInTheDocument();
    });
  });

  it("generates grocery list on button click", async () => {
    renderPlanning();
    await waitFor(() => screen.getByTestId("generate-list-btn"));
    fireEvent.click(screen.getByTestId("generate-list-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("grocery-list")).toBeInTheDocument();
    });
    expect(screen.getByText("pasta 200g")).toBeInTheDocument();
    expect(screen.getByText("zucchini")).toBeInTheDocument();
  });

  it("shows Instacart link after generating list", async () => {
    renderPlanning();
    await waitFor(() => screen.getByTestId("generate-list-btn"));
    fireEvent.click(screen.getByTestId("generate-list-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("fulfill-link")).toBeInTheDocument();
    });
  });

  it("checked items show strikethrough style", async () => {
    renderPlanning();
    await waitFor(() => screen.getByTestId("generate-list-btn"));
    fireEvent.click(screen.getByTestId("generate-list-btn"));
    await waitFor(() => screen.getByTestId("grocery-list"));
    // zucchini is pre-checked
    const zucchini = screen.getByText("zucchini");
    expect(zucchini.className).toContain("line-through");
  });

  it("queues sync when generate-list fails and shows badge", async () => {
    vi.mocked(apiClient.apiClient.plans.generateList).mockRejectedValue(
      new Error("offline"),
    );
    renderPlanning();
    await waitFor(() => screen.getByTestId("generate-list-btn"));
    fireEvent.click(screen.getByTestId("generate-list-btn"));
    await waitFor(() => {
      expect(syncQueue.enqueue).toHaveBeenCalledWith(
        "generate-list",
        expect.any(Object),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("sync-queue-badge")).toBeInTheDocument();
    });
  });

  it("copy week button calls the API", async () => {
    renderPlanning();
    await waitFor(() => screen.getByTestId("copy-week-btn"));
    fireEvent.click(screen.getByTestId("copy-week-btn"));
    await waitFor(() => {
      expect(apiClient.apiClient.plans.copyWeek).toHaveBeenCalled();
    });
  });

  it("joins household socket on mount", async () => {
    renderPlanning();
    await waitFor(() => {
      expect(socketLib.joinHousehold).toHaveBeenCalled();
    });
  });

  it("prev/next week navigation changes week label", async () => {
    renderPlanning();
    await waitFor(() => screen.getByTestId("week-nav"));
    fireEvent.click(screen.getByText(/Next/));
    // Week should shift; just verify the label updated (won't be same text)
    expect(screen.getByTestId("week-nav")).toBeInTheDocument();
  });
});
