/**
 * FulfillmentPage unit tests -- Deliver Me This flow.
 *
 * Tests the rebuilt fulfillment page which:
 * - Shows grocery list items (loaded by listId)
 * - Has attribution disclosure (IDP requirement)
 * - Has "Send to Instacart" CTA
 * - Has "Copy list" fallback
 */
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FulfillmentPage from "../../src/routes/FulfillmentPage";

vi.mock("../../src/lib/api-client", () => ({
  apiClient: {
    lists: {
      get: vi.fn(),
    },
    fulfillment: {
      generateInstacartLink: vi.fn(),
    },
  },
}));

import * as apiModule from "../../src/lib/api-client";

const mockListData = {
  id: "list-1",
  name: "Week list",
  items: [
    { id: "i1", name: "pasta 200g", checked: false },
    { id: "i2", name: "zucchini", checked: false },
  ],
};

function renderFulfillment(search = "?listId=list-1") {
  return render(
    <MemoryRouter initialEntries={[`/fulfillment${search}`]}>
      <Routes>
        <Route path="/fulfillment" element={<FulfillmentPage />} />
        <Route path="/planning" element={<div>Planning</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(apiModule.apiClient.lists.get).mockResolvedValue(mockListData);
  vi.mocked(
    apiModule.apiClient.fulfillment.generateInstacartLink,
  ).mockResolvedValue({ url: "https://instacart.com/test" });
});

describe("FulfillmentPage", () => {
  it("renders the fulfillment page with testid", () => {
    renderFulfillment();
    expect(screen.getByTestId("fulfillment-page")).toBeInTheDocument();
  });

  it("always shows attribution disclosure", () => {
    renderFulfillment();
    expect(screen.getByTestId("attribution-disclosure")).toBeInTheDocument();
    expect(screen.getByText(/earns a commission/i)).toBeInTheDocument();
  });

  it("shows Send to Instacart button", () => {
    renderFulfillment();
    expect(screen.getByTestId("send-to-instacart")).toBeInTheDocument();
  });

  it("shows copy list button", () => {
    renderFulfillment();
    expect(screen.getByTestId("copy-list")).toBeInTheDocument();
  });

  it("loads and shows grocery items when listId provided", async () => {
    renderFulfillment();
    await waitFor(() => {
      expect(screen.getByTestId("grocery-item-i1")).toBeInTheDocument();
    });
    expect(screen.getByTestId("grocery-item-i2")).toBeInTheDocument();
  });

  it("shows empty state when no listId provided", () => {
    renderFulfillment("");
    // no listId -> items never loaded -> shows empty state
    expect(screen.queryByTestId("grocery-item-i1")).not.toBeInTheDocument();
  });

  it("shows Deliver Me This heading", () => {
    renderFulfillment();
    expect(screen.getByText(/Deliver Me This/i)).toBeInTheDocument();
  });
});
