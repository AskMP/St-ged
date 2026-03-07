import { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { InstallPrompt } from "./components/InstallPrompt";
import { OfflineBanner } from "./components/OfflineBanner";
import FridgeClearance from "./routes/FridgeClearance";
import FulfillmentPage from "./routes/FulfillmentPage";
import Home from "./routes/Home";
import Lists from "./routes/Lists";
import Onboarding from "./routes/Onboarding";
import Planning from "./routes/Planning";
import Potluck from "./routes/Potluck";
import PotluckDetail from "./routes/PotluckDetail";
import BatchPrep from "./routes/BatchPrep";
import HouseholdOps from "./routes/HouseholdOps";
import Recipes, { CookingView, RecipeDetail } from "./routes/Recipes";

function App() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      <InstallPrompt />
      {!online && <OfflineBanner />}
      <header className="p-4 bg-gray-100">
        <nav className="space-x-4">
          <Link to="/">Home</Link>
          <Link to="/onboarding">Onboarding</Link>
          <Link to="/recipes">Recipes</Link>
          <Link to="/lists">Lists</Link>
          <Link to="/planning">Planning</Link>
          <Link to="/fridge-clearance">Fridge Clearance</Link>
          <Link to="/potluck">Potluck</Link>
          <Link to="/fulfillment">Fulfillment</Link>
          <Link to="/batch-prep">Batch Prep</Link>
          <Link to="/household-ops">Household Ops</Link>
        </nav>
      </header>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/:id/cook" element={<CookingView />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/fridge-clearance" element={<FridgeClearance />} />
          <Route path="/potluck" element={<Potluck />} />
          <Route path="/potluck/:id" element={<PotluckDetail />} />
          <Route path="/fulfillment" element={<FulfillmentPage />} />
          <Route path="/batch-prep" element={<BatchPrep />} />
          <Route path="/household-ops" element={<HouseholdOps />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
