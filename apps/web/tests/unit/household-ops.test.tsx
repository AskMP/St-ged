import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../src/lib/api-client";
import { useAuthStore } from "../../src/lib/auth-store";
import HouseholdOps from "../../src/routes/HouseholdOps";

vi.mock("../../src/lib/api-client");

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("HouseholdOps page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default: user has a household
    useAuthStore.setState({
      user: {
        id: "u1",
        email: "user@example.com",
        name: "User",
        householdId: "hid",
        role: "member",
      },
    });
  });

  it("shows setup prompt when user has no householdId", async () => {
    useAuthStore.setState({ user: null });
    renderWithRouter(<HouseholdOps />);
    expect(
      await screen.findByTestId("household-ops-no-household"),
    ).toBeTruthy();
    expect(screen.queryByTestId("household-ops")).toBeNull();
  });

  it("renders forms and fetches history/rotation on load", async () => {
    vi.mocked(apiClient.households.costHistory).mockResolvedValue([]);
    vi.mocked(apiClient.households.getRotation).mockResolvedValue(null);
    vi.mocked(apiClient.households.getRotationAssignments).mockResolvedValue(
      [],
    );

    renderWithRouter(<HouseholdOps />);
    expect(await screen.findByTestId("household-ops")).toBeTruthy();
    expect(apiClient.households.costHistory).toHaveBeenCalledWith("hid");
    expect(apiClient.households.getRotation).toHaveBeenCalledWith("hid");
  });

  it("submits cost and updates history display", async () => {
    const entry = {
      id: "e1",
      date: "2025-01-01T00:00:00Z",
      total: 50,
      splits: { user1: 50 },
    };
    vi.mocked(apiClient.households.costHistory).mockResolvedValue([]);
    vi.mocked(apiClient.households.addCost).mockResolvedValue(entry);

    renderWithRouter(<HouseholdOps />);
    fireEvent.change(screen.getByTestId("cost-input"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByTestId("cost-submit"));

    const matches = await screen.findAllByText("user1: $50.00");
    expect(matches.length).toBeGreaterThan(0);
    // totals summary should show the same amount
    expect(await screen.findByTestId("cost-totals")).toHaveTextContent(
      "user1: $50.00",
    );
    // reminder should appear
    expect(await screen.findByTestId("cost-reminder")).toBeVisible();
  });

  it("sets rotation and shows assignments", async () => {
    vi.mocked(apiClient.households.costHistory).mockResolvedValue([]);
    vi.mocked(apiClient.households.getRotation).mockResolvedValue(null);
    vi.mocked(apiClient.households.getRotationAssignments).mockResolvedValue(
      [],
    );
    const settings = {
      householdId: "hid",
      frequency: "weekly",
      members: ["a", "b"],
      startDate: "2025-01-01",
    };
    const assigns = [{ date: "2025-01-01", userId: "a" }];
    vi.mocked(apiClient.households.setRotation).mockResolvedValue(settings);
    vi.mocked(apiClient.households.getRotationAssignments).mockResolvedValue(
      assigns,
    );

    renderWithRouter(<HouseholdOps />);
    fireEvent.change(screen.getByTestId("rotation-members"), {
      target: { value: "a,b" },
    });
    fireEvent.click(screen.getByTestId("rotation-submit"));

    expect(await screen.findByTestId("rotation-settings")).toBeVisible();
    expect(screen.getByText("a")).toBeVisible();
    expect(await screen.findByTestId("rotation-assignments")).toBeVisible();
  });
});
