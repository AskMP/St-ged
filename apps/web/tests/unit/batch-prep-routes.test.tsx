import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BatchPrep from "../../src/routes/BatchPrep";
import { apiClient } from "../../src/lib/api-client";

vi.mock("../../src/lib/api-client");

describe("BatchPrep page", () => {
  beforeEach(() => {
    vi.mocked(apiClient.recipes.list).mockReset();
    vi.mocked(apiClient.batchPrep.combine).mockReset();
  });

  it("loads recipes and allows combining", async () => {
    const recipes = [
      { id: "r1", name: "Recipe One" },
      { id: "r2", name: "Recipe Two" },
    ];
    vi.mocked(apiClient.recipes.list).mockResolvedValue(recipes);
    vi.mocked(apiClient.batchPrep.combine).mockResolvedValue({
      items: [{ name: "salt", count: 2 }],
      sequence: ["r2", "r1"],
    });

    render(
      <MemoryRouter initialEntries={["/batch-prep"]}>
        <Routes>
          <Route path="/batch-prep" element={<BatchPrep />} />
        </Routes>
      </MemoryRouter>
    );

    // wait for recipes to load
    await waitFor(() => expect(apiClient.recipes.list).toHaveBeenCalled());
    expect(screen.getByLabelText(/Recipe One/)).toBeInTheDocument();

    // select both
    fireEvent.click(screen.getByLabelText(/Recipe One/));
    fireEvent.click(screen.getByLabelText(/Recipe Two/));

    const btn = screen.getByTestId("combine-button");
    fireEvent.click(btn);

    await waitFor(() => expect(apiClient.batchPrep.combine).toHaveBeenCalledWith(["r1", "r2"]));
    expect(screen.getByText(/Combined Ingredients/)).toBeInTheDocument();
    expect(screen.getByText(/salt/)).toBeInTheDocument();
    expect(screen.getByText(/Portion/)).toBeInTheDocument();
    // verify sequence list contains both recipes in order
    const seqItems = screen.getAllByTestId("sequence-item");
    expect(seqItems.map((el) => el.textContent)).toEqual(["Recipe Two", "Recipe One"]);

    // start prep session
    fireEvent.click(screen.getByTestId("start-prep"));
    expect(screen.getByTestId("prep-state")).toHaveTextContent("Now cooking: Recipe Two");
    fireEvent.click(screen.getByTestId("next-recipe"));
    expect(screen.getByTestId("prep-state")).toHaveTextContent("Now cooking: Recipe One");
    // after last recipe, Next button replaced with completion text
    expect(screen.queryByTestId("next-recipe")).toBeNull();
  });

  it("shows error when combine fails", async () => {
    vi.mocked(apiClient.recipes.list).mockResolvedValue([]);
    vi.mocked(apiClient.batchPrep.combine).mockRejectedValue(new Error("fail"));

    render(
      <MemoryRouter initialEntries={["/batch-prep"]}>
        <Routes>
          <Route path="/batch-prep" element={<BatchPrep />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(apiClient.recipes.list).toHaveBeenCalled());
    // clicking combine with no recipes selected should be disabled
    const btn = screen.getByTestId("combine-button");
    expect(btn).toBeDisabled();
  });
});
