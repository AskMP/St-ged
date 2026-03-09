/**
 * Onboarding unit tests -- persona-driven 4-step flow.
 *
 * Step 1: Skill level (Jordan's Confidence Rule)
 * Step 2: Household setup (Darius)
 * Step 3: Dietary profile (Maya)
 * Step 4: Starter pantry + A2HS
 *
 * All API calls are mocked. No auth dependency needed for initial render.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Onboarding from "../../src/routes/Onboarding";

// Mock api-client so Onboarding doesn't make real network calls
vi.mock("../../src/lib/api-client", () => ({
  apiClient: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: "u1",
        email: "test@test.com",
        name: "Test",
        householdId: null,
        skillLevel: "beginner",
        role: "member",
      }),
    },
    households: {
      create: vi.fn().mockResolvedValue({ id: "hh-1", name: "Test HH" }),
    },
    pantry: {
      applyTemplate: vi.fn().mockResolvedValue({}),
      bulkAdd: vi.fn().mockResolvedValue({}),
    },
  },
}));

// Mock useCurrentUser so Onboarding doesn't call /me in tests
vi.mock("../../src/lib/hooks/use-current-user", () => ({
  useCurrentUser: vi.fn().mockReturnValue({
    id: "u1",
    email: "test@test.com",
    name: "Test",
    householdId: null,
    skillLevel: "beginner",
    role: "member",
  }),
}));

// Mock useAuthStore so HouseholdStep can read user without localStorage
const mockSetUser = vi.fn();
vi.mock("../../src/lib/auth-store", () => ({
  useAuthStore: vi.fn((selector: (s: unknown) => unknown) => {
    const state = {
      user: {
        id: "u1",
        email: "test@test.com",
        name: "Test",
        householdId: null as string | null,
        skillLevel: "beginner",
        role: "member",
      },
      setUser: mockSetUser,
      isLoading: false,
      setLoading: vi.fn(),
      clear: vi.fn(),
    };
    return selector(state);
  }),
}));

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={["/onboarding"]}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/planning" element={<div>Planning page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Onboarding", () => {
  it("renders skill step as first step", () => {
    renderOnboarding();
    expect(screen.getByTestId("skill-step")).toBeInTheDocument();
    expect(
      screen.getByText(/comfortable.*kitchen|kitchen.*comfortable/i),
    ).toBeInTheDocument();
  });

  it("renders all three skill level options", () => {
    renderOnboarding();
    expect(screen.getByTestId("skill-beginner")).toBeInTheDocument();
    expect(screen.getByTestId("skill-home_cook")).toBeInTheDocument();
    expect(screen.getByTestId("skill-confident")).toBeInTheDocument();
  });

  it("skill continue button exists", () => {
    renderOnboarding();
    expect(screen.getByTestId("skill-continue")).toBeInTheDocument();
  });

  it("advances from skill to household step on continue", () => {
    renderOnboarding();
    fireEvent.click(screen.getByTestId("skill-beginner"));
    fireEvent.click(screen.getByTestId("skill-continue"));
    expect(screen.getByTestId("household-step")).toBeInTheDocument();
  });

  it("renders solo and group options on household step", () => {
    renderOnboarding();
    fireEvent.click(screen.getByTestId("skill-beginner"));
    fireEvent.click(screen.getByTestId("skill-continue"));
    expect(screen.getByTestId("household-solo")).toBeInTheDocument();
  });

  it("advances from household to dietary step", async () => {
    renderOnboarding();
    fireEvent.click(screen.getByTestId("skill-beginner"));
    fireEvent.click(screen.getByTestId("skill-continue"));
    fireEvent.click(screen.getByTestId("household-solo"));
    fireEvent.click(screen.getByTestId("household-continue"));
    await waitFor(() => {
      expect(screen.getByTestId("dietary-step")).toBeInTheDocument();
    });
  });

  it("dietary step has a skip button", async () => {
    renderOnboarding();
    fireEvent.click(screen.getByTestId("skill-beginner"));
    fireEvent.click(screen.getByTestId("skill-continue"));
    fireEvent.click(screen.getByTestId("household-solo"));
    fireEvent.click(screen.getByTestId("household-continue"));
    await waitFor(() => {
      expect(screen.getByTestId("dietary-skip")).toBeInTheDocument();
    });
  });

  it("advances from dietary to pantry step", async () => {
    renderOnboarding();
    fireEvent.click(screen.getByTestId("skill-beginner"));
    fireEvent.click(screen.getByTestId("skill-continue"));
    fireEvent.click(screen.getByTestId("household-solo"));
    fireEvent.click(screen.getByTestId("household-continue"));
    await waitFor(() => {
      expect(screen.getByTestId("dietary-skip")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("dietary-skip"));
    await waitFor(() => {
      expect(screen.getByTestId("pantry-step")).toBeInTheDocument();
    });
  });

  it("pantry step has a continue button", async () => {
    renderOnboarding();
    fireEvent.click(screen.getByTestId("skill-beginner"));
    fireEvent.click(screen.getByTestId("skill-continue"));
    fireEvent.click(screen.getByTestId("household-solo"));
    fireEvent.click(screen.getByTestId("household-continue"));
    await waitFor(() => {
      expect(screen.getByTestId("dietary-skip")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("dietary-skip"));
    await waitFor(() => {
      expect(screen.getByTestId("pantry-continue")).toBeInTheDocument();
    });
  });
});
