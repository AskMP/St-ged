import type { GroceryListItem } from "@staged/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { getSocket, joinHousehold, leaveHousehold } from "@/lib/socket";
import { useOnlineStatus } from "@/lib/use-online-status";
import { enqueue, flushQueue } from "@/lib/sync-queue";

// ---- Types (local, not crossing into packages/types) ----

interface MealEntry {
  id: string;
  recipeId: string;
  recipeTitle?: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
}

interface WeekPlan {
  plan: { id: string };
  entries: MealEntry[];
}

interface GroceryList {
  id: string;
  name?: string;
  items: GroceryListItem[];
}

// ---- Helpers ----

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0] ?? d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

// ---- Main Component ----

// Active cell for meal entry
interface ActiveCell {
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
}

export default function Planning() {
  const user = useAuthStore((s) => s.user);
  const hid = user?.householdId ?? "demo-household";
  const isOnline = useOnlineStatus();

  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()));
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [weeklyCost, setWeeklyCost] = useState<number | null>(null);
  // Inline meal entry
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [mealInput, setMealInput] = useState("");
  // Recipe autocomplete (Quinn's planning flow)
  const allRecipesRef = useRef<{ id: string; title: string }[]>([]);
  const [recipeSuggestions, setRecipeSuggestions] = useState<
    { id: string; title: string }[]
  >([]);

  const startStr = formatDate(weekStart);

  // Load weekly plan
  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.plans.getWeek(hid, startStr);
      setWeekPlan(data as WeekPlan);
    } catch {
      setWeekPlan({ plan: { id: "offline" }, entries: [] });
    } finally {
      setLoading(false);
    }
  }, [hid, startStr]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  // whenever plan loads recalc cost
  useEffect(() => {
    if (!weekPlan || !hid) return;
    Promise.all(
      weekPlan.entries.map((e) =>
        apiClient.recipes.cost(e.recipeId, hid).then((r) => r.costPerServing),
      ),
    )
      .then((arr) => {
        setWeeklyCost(arr.reduce((a, b) => a + b, 0));
      })
      .catch(() => {});
  }, [weekPlan, hid]);

  // Socket.io setup
  useEffect(() => {
    joinHousehold(hid);

    const socket = getSocket();
    const onAssign = (data: { entry: unknown }) => {
      setWeekPlan((prev) => {
        if (!prev) return prev;
        return { ...prev, entries: [...prev.entries, data.entry as MealEntry] };
      });
    };
    const onRemove = (data: { entryId: string }) => {
      setWeekPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          entries: prev.entries.filter((e) => e.id !== data.entryId),
        };
      });
    };
    socket.on("plan:recipe:assign", onAssign);
    socket.on("plan:recipe:remove", onRemove);

    return () => {
      leaveHousehold(hid);
      socket.off("plan:recipe:assign", onAssign);
      socket.off("plan:recipe:remove", onRemove);
    };
  }, [hid]);

  // Fetch all recipes for autocomplete on mount
  useEffect(() => {
    if (!hid) return;
    apiClient.recipes
      .list({})
      .then((data) => {
        allRecipesRef.current = (data as { id: string; title: string }[]).map(
          (r) => ({ id: r.id, title: r.title }),
        );
      })
      .catch(() => {});
  }, [hid]);

  const handleMealInputChange = (value: string) => {
    setMealInput(value);
    if (!value.trim()) {
      setRecipeSuggestions([]);
      return;
    }
    const lower = value.toLowerCase();
    const matches = allRecipesRef.current
      .filter((r) => r.title.toLowerCase().includes(lower))
      .slice(0, 5);
    setRecipeSuggestions(matches);
  };

  const handlePickRecipe = async (recipe: { id: string; title: string }) => {
    if (!weekPlan || !activeCell) return;
    setMealInput("");
    setActiveCell(null);
    setRecipeSuggestions([]);
    try {
      const entry = (await apiClient.plans.addEntry(weekPlan.plan.id, {
        recipeId: recipe.id,
        date: activeCell.date,
        mealType: activeCell.mealType,
      })) as { id: string };
      setWeekPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          entries: [
            ...prev.entries,
            {
              id: entry.id,
              recipeId: recipe.id,
              recipeTitle: recipe.title,
              date: activeCell.date,
              mealType: activeCell.mealType,
            } as MealEntry,
          ],
        };
      });
    } catch {
      await enqueue("add-meal", {
        planId: weekPlan.plan.id,
        recipeId: recipe.id,
        ...activeCell,
      });
      setPendingSync((n) => n + 1);
    }
  };

  const handleGenerateList = async () => {
    if (!weekPlan) return;
    setListLoading(true);
    try {
      const generated = (await apiClient.plans.generateList(
        weekPlan.plan.id,
      )) as GroceryList;
      setGroceryList(generated);
    } catch {
      // queue for sync when offline
      await enqueue("generate-list", { planId: weekPlan.plan.id });
      setPendingSync((n) => n + 1);
    } finally {
      setListLoading(false);
    }
  };

  const handleToggleItem = async (item: GroceryListItem) => {
    if (!groceryList) return;
    // optimistic update
    setGroceryList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id ? { ...i, checked: !i.checked } : i,
        ),
      };
    });
    try {
      await apiClient.lists.toggleItem(groceryList.id, item.id);
    } catch {
      await enqueue("toggle-item", { listId: groceryList.id, itemId: item.id });
      setPendingSync((n) => n + 1);
    }
  };

  const handleCopyWeek = async () => {
    const nextWeek = formatDate(addDays(weekStart, 7));
    try {
      await apiClient.plans.copyWeek(hid, startStr, nextWeek);
      // Navigate to next week
      setWeekStart(addDays(weekStart, 7));
    } catch {
      await enqueue("copy-week", { from: startStr, to: nextWeek });
      setPendingSync((n) => n + 1);
    }
  };

  const handleFlushQueue = async () => {
    await flushQueue();
    setPendingSync(0);
  };

  const handleAddMeal = async () => {
    if (!mealInput.trim() || !weekPlan || !activeCell) return;
    const title = mealInput.trim();
    setMealInput("");
    setActiveCell(null);
    setRecipeSuggestions([]);

    try {
      // Create a stub recipe with the given title
      const recipe = (await apiClient.recipes.create({
        title,
        servings: 4,
      })) as { id: string; title: string };
      // Add to the plan
      const entry = (await apiClient.plans.addEntry(weekPlan.plan.id, {
        recipeId: recipe.id,
        date: activeCell.date,
        mealType: activeCell.mealType,
      })) as { id: string };
      // Optimistic update
      setWeekPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          entries: [
            ...prev.entries,
            {
              id: entry.id,
              recipeId: recipe.id,
              recipeTitle: recipe.title,
              date: activeCell.date,
              mealType: activeCell.mealType,
            } as MealEntry,
          ],
        };
      });
    } catch {
      await enqueue("add-meal", {
        planId: weekPlan.plan.id,
        title,
        ...activeCell,
      });
      setPendingSync((n) => n + 1);
    }
  };

  const handleRemoveMeal = async (entry: MealEntry) => {
    if (!weekPlan) return;
    setWeekPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: prev.entries.filter((e) => e.id !== entry.id),
      };
    });
    try {
      await apiClient.plans.removeEntry(weekPlan.plan.id, entry.id);
    } catch {
      // optimistic; re-fetch on error
      loadPlan();
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Darius's 5pm Rule: after 5pm, show "Tonight" strip at top
  const now = new Date();
  const todayStr = formatDate(now);
  const isPast5pm = now.getHours() >= 17;
  const tonightEntry = isPast5pm
    ? weekPlan?.entries.find(
        (e) => e.date === todayStr && e.mealType === "dinner",
      )
    : null;

  return (
    <div data-testid="planning-page" className="max-w-4xl mx-auto py-6 px-4">
      {/* Offline banner -- Riley's connection awareness requirement */}
      {!isOnline && (
        <div
          data-testid="offline-banner"
          className="mb-4 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm border border-amber-300"
        >
          You're offline -- changes will sync when you reconnect.
        </div>
      )}

      {/* Darius 5pm Rule: Tonight strip */}
      {tonightEntry && (
        <div
          className="bg-green-600 text-white rounded-xl p-4 mb-6 flex items-center gap-3"
          data-testid="tonight-strip"
        >
          <span className="text-2xl">🍽️</span>
          <div>
            <div className="text-xs font-medium opacity-80">Tonight</div>
            <div className="font-semibold text-lg">
              {tonightEntry.recipeTitle ?? "Dinner"}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Meal Plan</h1>
        </div>
        <div className="flex items-center gap-3">
          <span data-testid="budget-summary" className="text-sm text-stone-600">
            {weeklyCost != null
              ? `Weekly cost: $${weeklyCost.toFixed(2)}`
              : null}
          </span>
          {hid && (
            <Link
              to={`/fridge-clearance?householdId=${hid}`}
              data-testid="fridge-clearance-link"
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              What can I make?
            </Link>
          )}
          {pendingSync > 0 && (
            <button
              data-testid="sync-queue-badge"
              onClick={handleFlushQueue}
              className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full border border-amber-300"
            >
              {pendingSync} queued &mdash; tap to sync
            </button>
          )}
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-6" data-testid="week-nav">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm hover:bg-stone-50"
        >
          &larr; Prev
        </button>
        <span className="text-sm font-medium text-stone-700">
          {weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          &ndash;{" "}
          {addDays(weekStart, 6).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm hover:bg-stone-50"
        >
          Next &rarr;
        </button>
        <button
          onClick={handleCopyWeek}
          data-testid="copy-week-btn"
          className="ml-auto px-3 py-1.5 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
        >
          Copy to next week
        </button>
      </div>

      {/* Weekly calendar grid */}
      {loading ? (
        <div
          className="text-center py-12 text-stone-400"
          data-testid="loading-indicator"
        >
          Loading plan...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            data-testid="week-calendar"
            className="w-full border-collapse text-sm"
          >
            <thead>
              <tr>
                <th className="w-24 py-2 text-left text-stone-500 font-normal">
                  Meal
                </th>
                {weekDays.map((d) => (
                  <th
                    key={formatDate(d)}
                    className="py-2 text-center text-stone-700 font-medium min-w-25"
                  >
                    {d.toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.map((meal) => (
                <tr key={meal} className="border-t border-stone-100">
                  <td className="py-3 pr-3 text-stone-500 capitalize font-medium">
                    {meal}
                  </td>
                  {weekDays.map((d) => {
                    const dateStr = formatDate(d);
                    const entry = weekPlan?.entries.find(
                      (e) => e.date === dateStr && e.mealType === meal,
                    );
                    const isActive =
                      activeCell?.date === dateStr &&
                      activeCell?.mealType === meal;
                    return (
                      <td key={dateStr} className="py-2 px-1">
                        {isActive ? (
                          <div className="relative">
                            <div className="flex gap-1">
                              <input
                                autoFocus
                                value={mealInput}
                                onChange={(e) =>
                                  handleMealInputChange(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setRecipeSuggestions([]);
                                    handleAddMeal();
                                  }
                                  if (e.key === "Escape") {
                                    setActiveCell(null);
                                    setMealInput("");
                                    setRecipeSuggestions([]);
                                  }
                                }}
                                placeholder="Meal name"
                                className="flex-1 min-w-0 text-xs border border-green-400 rounded px-1.5 py-1 focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  setRecipeSuggestions([]);
                                  handleAddMeal();
                                }}
                                className="text-xs bg-green-600 text-white px-1.5 rounded"
                              >
                                +
                              </button>
                            </div>
                            {recipeSuggestions.length > 0 && (
                              <ul
                                data-testid="meal-search-dropdown"
                                className="absolute z-10 left-0 right-0 top-full mt-0.5 bg-white border border-stone-200 rounded-lg shadow-sm text-xs overflow-hidden"
                              >
                                {recipeSuggestions.map((r) => (
                                  <li key={r.id}>
                                    <button
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handlePickRecipe(r)}
                                      className="w-full text-left px-2 py-1.5 hover:bg-green-50 text-stone-800"
                                    >
                                      {r.title}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : entry ? (
                          <div
                            data-testid="meal-entry"
                            className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-800 font-medium leading-snug group relative"
                          >
                            {entry.recipeTitle ?? entry.recipeId}
                            <button
                              onClick={() => handleRemoveMeal(entry)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-green-400 hover:text-red-500 leading-none text-xs"
                              aria-label="Remove meal"
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full h-10 border border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-300 text-xs hover:border-green-400 hover:text-green-500 transition-colors"
                            onClick={() =>
                              setActiveCell({ date: dateStr, mealType: meal })
                            }
                          >
                            +
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate grocery list */}
      <div className="mt-8 border-t border-stone-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">Grocery List</h2>
          <button
            data-testid="generate-list-btn"
            onClick={handleGenerateList}
            disabled={listLoading || !weekPlan}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {listLoading ? "Generating..." : "Generate from plan"}
          </button>
        </div>

        {groceryList ? (
          <ul data-testid="grocery-list" className="space-y-2">
            {groceryList.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 p-3 border border-stone-100 rounded-xl"
              >
                <button
                  onClick={() => handleToggleItem(item)}
                  data-testid={`item-check-${item.id}`}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    item.checked
                      ? "border-green-500 bg-green-500"
                      : "border-stone-300"
                  }`}
                >
                  {item.checked && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </button>
                <span
                  className={`text-sm ${item.checked ? "line-through text-stone-400" : "text-stone-800"}`}
                >
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-400 text-sm">
            Generate a grocery list from your meal plan above.
          </p>
        )}
      </div>

      {/* Link to fulfillment */}
      {groceryList && groceryList.items.length > 0 && (
        <div className="mt-6">
          <Link
            to={`/fulfillment?listId=${groceryList.id}`}
            data-testid="fulfill-link"
            className="block w-full py-3 rounded-xl bg-green-600 text-white font-medium text-center hover:bg-green-700"
          >
            Order on Instacart &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
