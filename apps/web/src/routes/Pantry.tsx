import type { PantryItem } from "@staged/types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { useOnlineStatus } from "@/lib/use-online-status";

/**
 * Pantry page -- Sam's Fridge Rule.
 *
 * Items sorted by expiry date ascending.
 * Red background for <3 days, yellow for <7 days.
 * "What can I make?" links to /recipes with pantry filter.
 * Empty state: starter pantry banner.
 */

function daysUntilExpiry(expiresAt: string | undefined): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function expiryClass(days: number | null): string {
  if (days === null) return "";
  if (days <= 3) return "bg-red-50 border-red-300";
  if (days <= 7) return "bg-yellow-50 border-yellow-300";
  return "bg-white border-stone-200";
}

function expiryLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days <= 0) return "Expired";
  if (days === 1) return "Expires tomorrow";
  if (days <= 3) return `Expires in ${days} days`;
  if (days <= 7) return `Expires in ${days} days`;
  return null;
}

function sortByExpiry(items: PantryItem[]): PantryItem[] {
  return [...items].sort((a, b) => {
    if (!a.expiresAt && !b.expiresAt) return 0;
    if (!a.expiresAt) return 1; // no expiry goes last
    if (!b.expiresAt) return -1;
    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
  });
}

export default function Pantry() {
  const user = useAuthStore((s) => s.user);
  const householdId = user?.householdId;
  const isOnline = useOnlineStatus();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("1");
  const [addUnit, setAddUnit] = useState("");
  const [addExpiry, setAddExpiry] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // The API returns pantry items; we sort client-side by expiry
    fetch(`/api/households/${householdId}/pantry`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: PantryItem[]) => setItems(sortByExpiry(data)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [householdId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !householdId) return;
    setAdding(true);
    setAddError(null);
    try {
      const body: Partial<PantryItem> = {
        name: addName.trim(),
        quantity: parseFloat(addQty) || 1,
        unit: addUnit.trim() || undefined,
        expiresAt: addExpiry || undefined,
        householdId,
      };
      const res = await fetch(`/api/households/${householdId}/pantry/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const newItem = (await res.json()) as PantryItem;
      setItems((prev) => sortByExpiry([...prev, newItem]));
      setAddName("");
      setAddQty("1");
      setAddUnit("");
      setAddExpiry("");
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Could not add item.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!householdId) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await fetch(`/api/pantry/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // If delete fails, re-fetch to restore correct state
      fetch(`/api/households/${householdId}/pantry`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : []))
        .then((data: PantryItem[]) => setItems(sortByExpiry(data)))
        .catch(() => {});
    }
  };

  const STARTER_ITEMS = [
    "Olive oil",
    "Salt",
    "Black pepper",
    "Garlic",
    "Onions",
    "Butter",
    "Eggs",
    "All-purpose flour",
    "Sugar",
    "Soy sauce",
    "Chicken stock",
    "Canned tomatoes",
    "Pasta",
    "Rice",
    "Chili flakes",
    "Cumin",
    "Honey",
  ];

  const handleStarterPantry = async () => {
    if (!householdId) return;
    try {
      await Promise.all(
        STARTER_ITEMS.map((name) =>
          fetch(`/api/households/${householdId}/pantry/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, quantity: 1 }),
          }),
        ),
      );
      // Re-fetch to show newly added items
      const res = await fetch(`/api/households/${householdId}/pantry`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = (await res.json()) as PantryItem[];
        setItems(sortByExpiry(data));
      }
    } catch {
      // best-effort
    }
  };

  const sorted = sortByExpiry(items);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4" data-testid="pantry-page">
      {!isOnline && (
        <div
          data-testid="offline-banner"
          className="mb-4 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm border border-amber-300"
        >
          You're offline -- changes will sync when you reconnect.
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Pantry</h1>
        <Link
          to="/recipes"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
          data-testid="what-can-i-make"
        >
          What can I make? &rarr;
        </Link>
      </div>

      {/* Empty state */}
      {!loading && sorted.length === 0 && (
        <div
          className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6"
          data-testid="pantry-empty"
        >
          <p className="text-stone-700 font-medium mb-1">
            Your pantry is empty.
          </p>
          <p className="text-stone-500 text-sm mb-4">
            Add staples to discover recipes you can make today.
          </p>
          <button
            onClick={handleStarterPantry}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            data-testid="add-starter-pantry"
          >
            Add starter pantry
          </button>
        </div>
      )}

      {/* Pantry items (Sam's Fridge Rule: sorted by expiry, urgency colors) */}
      {loading ? (
        <div className="text-stone-400 text-sm py-8 text-center animate-pulse">
          Loading pantry...
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {sorted.map((item) => {
            const days = daysUntilExpiry(item.expiresAt);
            const colorClass = expiryClass(days);
            const label = expiryLabel(days);
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border ${colorClass}`}
                data-testid={`pantry-item-${item.id}`}
              >
                <div>
                  <span className="font-medium text-stone-900 text-sm">
                    {item.name}
                  </span>
                  <span className="text-stone-500 text-xs ml-2">
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </span>
                  {label && (
                    <span
                      className={`ml-2 text-xs font-medium ${
                        days !== null && days <= 3
                          ? "text-red-600"
                          : "text-yellow-700"
                      }`}
                    >
                      {label}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-stone-300 hover:text-red-400 transition-colors text-sm ml-3 flex-shrink-0"
                  aria-label={`Remove ${item.name}`}
                  data-testid={`remove-${item.id}`}
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add item form */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Add item</h2>
        <form onSubmit={handleAdd} className="space-y-2">
          <input
            type="text"
            placeholder="Ingredient name"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            data-testid="pantry-name-input"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Qty"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              step="0.1"
              min="0"
              className="w-24 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Unit (cup, oz...)"
              value={addUnit}
              onChange={(e) => setAddUnit(e.target.value)}
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              value={addExpiry}
              onChange={(e) => setAddExpiry(e.target.value)}
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Expiry date"
            />
          </div>
          {addError && <p className="text-red-600 text-xs">{addError}</p>}
          <button
            type="submit"
            disabled={adding || !addName.trim()}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-medium rounded-lg transition-colors"
            data-testid="pantry-add-btn"
          >
            {adding ? "Adding..." : "Add to pantry"}
          </button>
        </form>
      </div>
    </div>
  );
}
