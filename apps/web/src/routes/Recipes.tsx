import type { Ingredient, NutritionInfo, Recipe } from "@staged/types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../lib/api-client";
import {
  acquireWakeLock,
  isWakeLockSupported,
  releaseWakeLock,
} from "../lib/wake-lock";

// ---- Shared helpers ----

function SkeletonCard() {
  return (
    <div className="border border-stone-200 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-stone-100 rounded w-1/2" />
    </div>
  );
}

function NutritionRow({ nutrition }: { nutrition: NutritionInfo }) {
  return (
    <div className="flex gap-4 text-sm text-stone-500">
      <span>{nutrition.calories} kcal</span>
      {nutrition.protein != null && <span>{nutrition.protein}g protein</span>}
      {nutrition.fat != null && <span>{nutrition.fat}g fat</span>}
      {nutrition.carbs != null && <span>{nutrition.carbs}g carbs</span>}
    </div>
  );
}

// ---- Dietary Adaptation Component ----

type DietaryProfile = 'vegan' | 'vegetarian' | 'dairy-free' | 'gluten-free';

function DietaryAdaptation({ recipeId }: { recipeId: string }) {
  const [profiles, setProfiles] = useState<DietaryProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<DietaryProfile | null>(null);
  const [adapted, setAdapted] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.dietary.getProfiles().then((data) => {
      setProfiles(data.profiles as DietaryProfile[]);
    }).catch(() => {});
  }, []);

  const handleAdapt = async (profile: DietaryProfile) => {
    setSelectedProfile(profile);
    setLoading(true);
    try {
      const result = await apiClient.dietary.adapt(recipeId, profile);
      setAdapted(result);
    } catch (e) {
      console.error('Adaptation failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedProfile(null);
    setAdapted(null);
  };

  return (
    <div className="bg-purple-50 rounded-xl p-4 mb-6" data-testid="dietary-adaptation">
      <h3 className="font-semibold text-stone-900 mb-3">Make This Recipe...</h3>
      {!adapted ? (
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <button
              key={profile}
              onClick={() => handleAdapt(profile)}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              {profile === 'dairy-free' ? 'Dairy-Free' : 
               profile === 'gluten-free' ? 'Gluten-Free' : 
               profile.charAt(0).toUpperCase() + profile.slice(1)}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-purple-800">
              Adapted for {selectedProfile}
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-purple-600 hover:underline"
            >
              Show original
            </button>
          </div>
          {adapted.substitutions.length > 0 && (
            <div className="text-sm text-stone-600 mb-2">
              <strong>{adapted.substitutions.length} substitutions:</strong>
              <ul className="mt-1 space-y-1">
                {adapted.substitutions.map((sub: any, i: number) => (
                  <li key={i} className="text-xs">
                    • {sub.original} → {sub.replacement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DIET_FILTERS = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
] as const;

// ---- Recipe Library ----

export function RecipeLibrary() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diet, setDiet] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient.recipes
      .list({ diet: diet || undefined, search: search || undefined })
      .then((data) => setRecipes(data as Recipe[]))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [diet, search]);

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError("");
    try {
      await apiClient.recipes.import(importUrl.trim());
      setImportUrl("");
      // Refresh list
      const data = await apiClient.recipes.list({ diet: diet || undefined });
      setRecipes(data as Recipe[]);
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div data-testid="recipe-library" className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-stone-900 mb-4">Recipes</h1>

      {/* Search */}
      <input
        data-testid="recipe-search"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Diet filter chips */}
      <div className="flex gap-2 flex-wrap mb-4" data-testid="diet-filters">
        {DIET_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setDiet(diet === f ? "" : f)}
            className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
              diet === f
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Import form */}
      <div className="flex gap-2 mb-6">
        <input
          data-testid="import-url"
          placeholder="Paste recipe URL to import..."
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
          className="flex-1 border border-stone-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          data-testid="import-btn"
          onClick={handleImport}
          disabled={importing || !importUrl.trim()}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {importing ? "Importing..." : "Import"}
        </button>
      </div>
      {importError && (
        <p data-testid="import-error" className="text-red-500 text-sm mb-4">
          {importError}
        </p>
      )}

      {/* Recipe cards */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : recipes.length === 0 ? (
        <p className="text-stone-400 text-center py-12">
          No recipes yet. Import one above or add via the API.
        </p>
      ) : (
        <div className="space-y-3">
          {recipes.map((r) => (
            <Link
              key={r.id}
              to={`/recipes/${r.id}`}
              data-testid="recipe-card"
              className="block border border-stone-200 rounded-xl p-4 hover:border-green-400 transition-colors"
            >
              <div className="font-semibold text-stone-900">{r.title}</div>
              {r.description && (
                <div className="text-sm text-stone-500 mt-1 line-clamp-2">
                  {r.description}
                </div>
              )}
              {r.nutrition_per_serving && (
                <div className="mt-2">
                  <NutritionRow nutrition={r.nutrition_per_serving} />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Recipe Detail ----

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [scaled, setScaled] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subTarget, setSubTarget] = useState<string | null>(null);
  const [substitutions, setSubstitutions] = useState<string[]>([]);
  const [costInfo, setCostInfo] = useState<{
    costPerServing: number;
    pantryDeduction: number;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // fetch main recipe
    apiClient.recipes
      .get(id)
      .then((data) => {
        setRecipe(data as Recipe);
        setScaled(data as Recipe);
        setServings(1);
      })
      .catch(() => setError("Recipe not found"))
      .finally(() => setLoading(false));
    // fetch cost with pantry deduction if household available
    const pantryItems: unknown[] = []; // cost-route handles fetching itself via householdId query
    apiClient.recipes
      .cost(id)
      .then((c) => setCostInfo(c))
      .catch(() => {});
  }, [id]);

  const handleScale = async (factor: number) => {
    if (!recipe) return;
    setServings(factor);
    const result = await apiClient.recipes.scale(recipe, factor);
    setScaled(result as Recipe);
  };

  const handleSubstitute = async (ingredient: string) => {
    setSubTarget(ingredient);
    const { substitutions: subs } =
      await apiClient.recipes.substitute(ingredient);
    setSubstitutions(subs);
  };

  if (loading) {
    return (
      <div data-testid="recipe-detail" className="max-w-2xl mx-auto py-6 px-4">
        <SkeletonCard />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div data-testid="recipe-detail" className="max-w-2xl mx-auto py-6 px-4">
        <p className="text-red-500">{error || "Not found"}</p>
        <Link to="/recipes" className="text-green-600 text-sm">
          Back to library
        </Link>
      </div>
    );
  }

  const display = scaled ?? recipe;

  return (
    <div data-testid="recipe-detail" className="max-w-2xl mx-auto py-6 px-4">
      <Link to="/recipes" className="text-sm text-green-600 mb-4 block">
        &larr; Back to library
      </Link>

      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        {display.title}
      </h1>
      {display.description && (
        <p className="text-stone-500 mb-4">{display.description}</p>
      )}

      {/* Nutrition */}
      {display.nutrition_per_serving && (
        <div
          className="bg-green-50 rounded-xl p-4 mb-6"
          data-testid="nutrition-info"
        >
          <NutritionRow nutrition={display.nutrition_per_serving} />
        </div>
      )}

      {/* Cost */}
      {costInfo && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6" data-testid="cost-info">
          <div className="text-sm text-stone-700">
            Cost per serving: ${costInfo.costPerServing.toFixed(2)}
          </div>
          {costInfo.pantryDeduction > 0 && (
            <div className="text-xs text-stone-500">
              (-${costInfo.pantryDeduction.toFixed(2)} pantry deduction)
            </div>
          )}
        </div>
      )}

      {/* Dietary Adaptation */}
      <DietaryAdaptation recipeId={id!} />

      {/* Scaling */}
      <div
        className="flex items-center gap-3 mb-6"
        data-testid="scaling-controls"
      >
        <span className="text-sm text-stone-600 font-medium">Servings:</span>
        {[1, 2, 3, 4, 6, 8].map((n) => (
          <button
            key={n}
            onClick={() => handleScale(n)}
            className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
              servings === n
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Ingredients */}
      {Array.isArray(display.ingredients) && display.ingredients.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-stone-900 mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {display.ingredients.map((ing: Ingredient, i: number) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-stone-800">
                  {ing.quantity != null && `${ing.quantity} `}
                  {ing.unit && `${ing.unit} `}
                  {ing.name}
                </span>
                <button
                  onClick={() => handleSubstitute(ing.name)}
                  className="text-xs text-green-600 hover:underline ml-2"
                  data-testid={`substitute-${i}`}
                >
                  substitute
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Substitution results */}
      {subTarget && substitutions.length > 0 && (
        <div
          data-testid="substitution-results"
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
        >
          <p className="text-sm font-medium text-amber-900 mb-1">
            Substitutes for <em>{subTarget}</em>:
          </p>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            {substitutions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <button
            onClick={() => {
              setSubTarget(null);
              setSubstitutions([]);
            }}
            className="text-xs text-amber-600 mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cook button */}
      <Link
        to={`/recipes/${id}/cook`}
        data-testid="start-cooking-btn"
        className="block w-full py-3 rounded-xl bg-green-600 text-white font-medium text-center hover:bg-green-700"
      >
        Start Cooking
      </Link>
    </div>
  );
}

// ---- Cooking View ----

export function CookingView() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [step, setStep] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported] = useState(isWakeLockSupported());

  useEffect(() => {
    if (!id) return;
    apiClient.recipes.get(id).then((data) => setRecipe(data as Recipe));
  }, [id]);

  // Acquire wake lock on mount, release on unmount
  useEffect(() => {
    acquireWakeLock().then((ok) => setWakeLockActive(ok));
    return () => {
      releaseWakeLock();
    };
  }, []);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonCard />
      </div>
    );
  }

  const steps: string[] = Array.isArray(recipe.steps)
    ? (recipe.steps as string[])
    : recipe.instructions
      ? [recipe.instructions as string]
      : ["Follow the recipe instructions."];

  const isLast = step === steps.length - 1;

  return (
    <div
      data-testid="cooking-view"
      className="min-h-screen bg-stone-900 text-white flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-700">
        <Link to={`/recipes/${id}`} className="text-stone-400 text-sm">
          &larr; Exit
        </Link>
        <h1 className="font-semibold text-sm truncate max-w-xs">
          {recipe.title}
        </h1>
        {wakeLockActive && (
          <span
            className="text-xs text-green-400"
            data-testid="wake-lock-indicator"
          >
            Screen on
          </span>
        )}
        {!wakeLockActive && !wakeLockSupported && (
          <span className="text-xs text-stone-500">No wake lock</span>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-stone-400 text-sm mb-4">
          Step {step + 1} of {steps.length}
        </p>
        <p
          data-testid="cooking-step"
          className="text-xl font-medium leading-relaxed max-w-md"
        >
          {steps[step]}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 p-6 border-t border-stone-700">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex-1 py-4 rounded-xl border border-stone-600 text-stone-300 font-medium disabled:opacity-30"
        >
          Previous
        </button>
        {isLast ? (
          <Link
            to={`/recipes/${id}`}
            className="flex-1 py-4 rounded-xl bg-green-600 text-white font-medium text-center hover:bg-green-700"
          >
            Done!
          </Link>
        ) : (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 py-4 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

// Default export = library (App.tsx route for /recipes)
export default RecipeLibrary;
