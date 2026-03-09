import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthGuard } from "./components/AuthGuard";
import { InstallPrompt } from "./components/InstallPrompt";

// Lazy imports for faster initial load
import Login from "./routes/Login";
import SignUp from "./routes/SignUp";
import Onboarding from "./routes/Onboarding";

// Core pages (authenticated)
import Planning from "./routes/Planning";
import Recipes, { RecipeDetail, CookingView } from "./routes/Recipes";
import Pantry from "./routes/Pantry";
import FulfillmentPage from "./routes/FulfillmentPage";
import Lists from "./routes/Lists";
import HouseholdOps from "./routes/HouseholdOps";

// Additional feature pages
import BatchPrep from "./routes/BatchPrep";
import EventsPage from "./routes/Events";
import FridgeClearance from "./routes/FridgeClearance";
import Potluck from "./routes/Potluck";
import PotluckDetail from "./routes/PotluckDetail";

/**
 * Authenticated route wrapper: combines AuthGuard + AppShell.
 * Route definitions use this for all protected pages.
 */
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <>
      {/* A2HS prompt (listens for beforeinstallprompt globally) */}
      <InstallPrompt />

      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/planning" replace />} />

        {/* Public / unauthenticated routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Onboarding: authed but pre-household; no AppShell (full-screen flow) */}
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <Onboarding />
            </AuthGuard>
          }
        />

        {/* Protected pages with AppShell */}
        <Route
          path="/planning"
          element={
            <Protected>
              <Planning />
            </Protected>
          }
        />
        <Route
          path="/recipes"
          element={
            <Protected>
              <Recipes />
            </Protected>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <Protected>
              <RecipeDetail />
            </Protected>
          }
        />
        <Route
          path="/recipes/:id/cook"
          element={
            <Protected>
              <CookingView />
            </Protected>
          }
        />
        <Route
          path="/pantry"
          element={
            <Protected>
              <Pantry />
            </Protected>
          }
        />
        <Route
          path="/household"
          element={
            <Protected>
              <HouseholdOps />
            </Protected>
          }
        />
        <Route
          path="/lists"
          element={
            <Protected>
              <Lists />
            </Protected>
          }
        />
        <Route
          path="/fulfillment"
          element={
            <Protected>
              <FulfillmentPage />
            </Protected>
          }
        />

        {/* Additional feature routes */}
        <Route
          path="/batch-prep"
          element={
            <Protected>
              <BatchPrep />
            </Protected>
          }
        />
        <Route
          path="/events"
          element={
            <Protected>
              <EventsPage />
            </Protected>
          }
        />
        <Route
          path="/fridge-clearance"
          element={
            <Protected>
              <FridgeClearance />
            </Protected>
          }
        />
        <Route
          path="/potluck"
          element={
            <Protected>
              <Potluck />
            </Protected>
          }
        />
        <Route
          path="/potluck/:id"
          element={
            <Protected>
              <PotluckDetail />
            </Protected>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/planning" replace />} />
      </Routes>
    </>
  );
}
