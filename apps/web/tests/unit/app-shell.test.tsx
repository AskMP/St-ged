/**
 * App shell unit tests -- OfflineIndicator and AppShell components.
 *
 * Tests are kept component-level (not full App render) to avoid
 * dependency on BrowserRouter + auth state in unit test environment.
 */
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { OfflineIndicator } from "../../src/components/OfflineIndicator";
import { AppShell } from "../../src/components/AppShell";

describe("OfflineIndicator", () => {
  it("does not show indicator when online", () => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      writable: true,
      configurable: true,
    });
    render(<OfflineIndicator />);
    expect(screen.queryByTestId("offline-indicator")).not.toBeInTheDocument();
  });

  it("shows indicator when offline event fires", () => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      writable: true,
      configurable: true,
    });
    render(<OfflineIndicator />);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByTestId("offline-indicator")).toBeInTheDocument();
    expect(
      screen.getByText(/You're offline\. Showing saved data\./),
    ).toBeInTheDocument();
  });

  it("hides indicator when online event fires after offline", () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      writable: true,
      configurable: true,
    });
    render(<OfflineIndicator />);
    // starts offline
    expect(screen.getByTestId("offline-indicator")).toBeInTheDocument();
    act(() => {
      Object.defineProperty(navigator, "onLine", { value: true });
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.queryByTestId("offline-indicator")).not.toBeInTheDocument();
  });
});

describe("AppShell", () => {
  function renderShell() {
    return render(
      <MemoryRouter initialEntries={["/planning"]}>
        <AppShell>
          <div data-testid="child-content">Content</div>
        </AppShell>
      </MemoryRouter>,
    );
  }

  it("renders the Staged wordmark", () => {
    renderShell();
    expect(screen.getByText("Stàged")).toBeInTheDocument();
  });

  it("renders bottom nav links", () => {
    renderShell();
    expect(screen.getByTestId("nav-planning")).toBeInTheDocument();
    expect(screen.getByTestId("nav-recipes")).toBeInTheDocument();
    expect(screen.getByTestId("nav-pantry")).toBeInTheDocument();
    expect(screen.getByTestId("nav-household")).toBeInTheDocument();
  });

  it("renders children inside the shell", () => {
    renderShell();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
