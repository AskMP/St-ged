import type { Ingredient, NutritionInfo, Recipe } from "@staged/types";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { RecipeCard } from "@/components/RecipeCard";
import {
  acquireWakeLock,
  isWakeLockSupported,
  releaseWakeLock,
} from "@/lib/wake-lock";
import { CoachedStep } from "@/components/CoachedStep";

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

type DietaryProfile = "vegan" | "vegetarian" | "dairy-free" | "gluten-free";

type SubstitutionState = {
  original: string;
  replacement: string;
  reason: string;
  accepted: boolean;
};

function DietaryAdaptation({ recipeId }: { recipeId: string }) {
  const [profiles, setProfiles] = useState<DietaryProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<DietaryProfile | null>(
    null,
  );
  const [adapted, setAdapted] = useState<any>(null);
  const [substitutions, setSubstitutions] = useState<SubstitutionState[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    apiClient.dietary
      .getProfiles()
      .then((data) => {
        setProfiles(data.profiles as DietaryProfile[]);
      })
      .catch(() => {});
  }, []);

  const handleAdapt = async (profile: DietaryProfile) => {
    setSelectedProfile(profile);
    setLoading(true);
    setSavedMessage("");
    try {
      const result = await apiClient.dietary.adapt(recipeId, profile);
      setAdapted(result);
      // Initialize all substitutions as accepted by default
      setSubstitutions(
        result.substitutions.map((sub: any) => ({
          ...sub,
          accepted: true,
        })),
      );
    } catch (e) {
      console.error("Adaptation failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSub = (index: number) => {
    setSubstitutions((prev) =>
      prev.map((sub, i) =>
        i === index ? { ...sub, accepted: !sub.accepted } : sub,
      ),
    );
  };

  const handleReset = () => {
    setSelectedProfile(null);
    setAdapted(null);
    setSubstitutions([]);
    setSavedMessage("");
  };

  const handleSaveAdapted = async () => {
    if (!adapted) return;
    setSaving(true);
    try {
      // Filter to only accepted substitutions
      const acceptedSubs = substitutions.filter((s) => s.accepted);
      // Apply accepted substitutions to create final recipe
      const finalRecipe = {
        ...adapted.adaptedRecipe,
        ingredients: adapted.adaptedRecipe.ingredients?.map(
          (ing: any, idx: number) => {
            const sub = acceptedSubs.find(
              (s) => s.original === (typeof ing === "string" ? ing : ing.name),
            );
            if (sub) {
              return typeof ing === "string"
                ? sub.replacement
                : { ...ing, name: sub.replacement };
            }
            return ing;
          },
        ),
      };
      await apiClient.recipes.create(finalRecipe);
      setSavedMessage("Adapted recipe saved to your library!");
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  const acceptedCount = substitutions.filter((s) => s.accepted).length;

  return (
    <div
      className="bg-purple-50 rounded-xl p-4 mb-6"
      data-testid="dietary-adaptation"
    >
      <h3 className="font-semibold text-stone-900 mb-3">Make This Recipe...</h3>
      {!adapted ? (
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <button
              key={profile}
              onClick={() => handleAdapt(profile)}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              {profile === "dairy-free"
                ? "Dairy-Free"
                : profile === "gluten-free"
                  ? "Gluten-Free"
                  : profile.charAt(0).toUpperCase() + profile.slice(1)}
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
              Start over
            </button>
          </div>

          {substitutions.length > 0 ? (
            <div className="mb-4">
              <p className="text-sm text-stone-600 mb-2">
                Review and toggle substitutions ({acceptedCount} of{" "}
                {substitutions.length} applied):
              </p>
              <ul className="space-y-2" data-testid="substitutions-list">
                {substitutions.map((sub, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-sm p-2 rounded ${sub.accepted ? "bg-green-50" : "bg-stone-100"}`}
                  >
                    <input
                      type="checkbox"
                      checked={sub.accepted}
                      onChange={() => handleToggleSub(i)}
                      className="mt-1 h-4 w-4 text-green-600 rounded"
                      data-testid={`sub-toggle-${i}`}
                    />
                    <div className="flex-1">
                      <span
                        className={
                          sub.accepted
                            ? "text-stone-800"
                            : "text-stone-400 line-through"
                        }
                      >
                        {sub.original}
                      </span>
                      <span className="mx-1">→</span>
                      <span className="text-green-700 font-medium">
                        {sub.replacement}
                      </span>
                      <p className="text-xs text-stone-500 mt-1">
                        {sub.reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-stone-500 mb-4">
              No substitutions needed for this recipe.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAdapted}
              disabled={saving || acceptedCount === 0}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              data-testid="save-adapted-recipe"
            >
              {saving ? "Saving..." : "Save Adapted Recipe"}
            </button>
            {savedMessage && (
              <span
                className="text-sm text-green-600"
                data-testid="save-message"
              >
                {savedMessage}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const SKILL_FILTERS = [
  { value: "beginner", label: "Beginner" },
  { value: "home_cook", label: "Home Cook" },
  { value: "confident", label: "Confident" },
] as const;

const DIET_FILTERS = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
] as const;

// ---- Recipe Library (persona-driven rebuild) ----
// Jordan's Confidence Rule: skill badges + skill filter prominent
// Maya's Zero-Waste Signal: zero-waste toggle at filter bar

export function RecipeLibrary() {
  const user = useAuthStore((s) => s.user);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Pre-select dietary filter from user profile (Alex's dietary safety requirement)
  const [diet, setDiet] = useState(() => {
    const tags = user?.dietaryTags;
    if (tags && tags.length > 0) {
      const knownTags = ["vegan", "vegetarian", "gluten-free", "dairy-free"];
      const match = tags.find((t) => knownTags.includes(t));
      return match ?? "";
    }
    return "";
  });
  const [dietaryAutoApplied] = useState(() => {
    const tags = user?.dietaryTags;
    if (tags && tags.length > 0) {
      const knownTags = ["vegan", "vegetarian", "gluten-free", "dairy-free"];
      return tags.some((t) => knownTags.includes(t));
    }
    return false;
  });
  const [skillFilter, setSkillFilter] = useState("");
  const [zeroWasteOnly, setZeroWasteOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient.recipes
      .list({ dietaryTag: diet || undefined, search: search || undefined })
      .then((data) => setRecipes(data as Recipe[]))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [diet, search]);

  // Client-side filter for skill level and zero-waste (not in API query params)
  const filteredRecipes = recipes.filter((r) => {
    if (skillFilter && r.skill_level !== skillFilter) return false;
    if (zeroWasteOnly && !r.zero_waste) return false;
    return true;
  });

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

      {/* Dietary auto-filter notice */}
      {dietaryAutoApplied && diet && (
        <div className="text-xs text-stone-500 mb-2 flex items-center gap-2">
          <span>Filtered by your dietary preferences.</span>
          <button
            onClick={() => setDiet("")}
            className="text-green-600 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="space-y-2 mb-5">
        {/* Skill filter chips (Jordan's Confidence Rule) */}
        <div
          className="flex gap-2 flex-wrap items-center"
          data-testid="recipe-filter-skill"
        >
          <span className="text-xs text-stone-400 font-medium">Skill:</span>
          {SKILL_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() =>
                setSkillFilter(skillFilter === f.value ? "" : f.value)
              }
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                skillFilter === f.value
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
              data-testid={`skill-filter-${f.value}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Diet filter chips */}
        <div
          className="flex gap-2 flex-wrap items-center"
          data-testid="recipe-filter-diet"
        >
          <span className="text-xs text-stone-400 font-medium">Diet:</span>
          {DIET_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDiet(diet === f.value ? "" : f.value)}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                diet === f.value
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Zero-Waste toggle (Maya's Zero-Waste Signal) */}
          <button
            onClick={() => setZeroWasteOnly(!zeroWasteOnly)}
            className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors flex items-center gap-1 ${
              zeroWasteOnly
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
            data-testid="zero-waste-toggle"
          >
            🌿 Zero-waste
          </button>
        </div>
      </div>

      {/* Recipe grid: 2-col mobile, 3-col tablet */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm mb-2">
            No recipes match your filters.
          </p>
          {(skillFilter || diet || zeroWasteOnly) && (
            <button
              onClick={() => {
                setSkillFilter("");
                setDiet("");
                setZeroWasteOnly(false);
              }}
              className="text-green-600 text-sm hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
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
          <CoachedStep step={steps[step] || ""} />
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
