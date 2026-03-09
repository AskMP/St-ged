import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "@/lib/api-client";

/**
 * Fulfillment (Deliver Me This) page.
 *
 * Shows the week's unchecked grocery list items.
 * User can deselect items they already have.
 * Primary CTA: Send to Instacart (IDP deep-link via API).
 * Attribution disclosure: required by Instacart IDP terms.
 * Fallback: Copy list to clipboard.
 */

interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
}

export default function FulfillmentPage() {
  const [searchParams] = useSearchParams();
  const listId = searchParams.get("listId");

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [instacartUrl, setInstacartUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load grocery list items if listId provided
  useEffect(() => {
    if (!listId) return;
    setLoading(true);
    apiClient.lists
      .get(listId)
      .then((data) => {
        setItems((data.items as GroceryItem[]).filter((i) => !i.checked));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [listId]);

  const selectedItems = items.filter((i) => !i.checked);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  };

  const handleSendToInstacart = async () => {
    if (!listId || selectedItems.length === 0) return;
    setLinkLoading(true);
    setError(null);
    try {
      const data = await apiClient.fulfillment.generateInstacartLink(listId);
      const url = (data as { url?: string }).url;
      if (url) {
        setInstacartUrl(url);
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setError(
          "Could not generate Instacart link. Please copy the list manually.",
        );
      }
    } catch {
      setError(
        "Failed to reach fulfillment service. Please copy the list manually.",
      );
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopyList = async () => {
    const text = selectedItems.map((i) => `- ${i.name}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      prompt("Copy this grocery list:", text);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4" data-testid="fulfillment-page">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">
        Deliver Me This
      </h1>
      <p className="text-stone-500 text-sm mb-6">
        Review your grocery list and send it to Instacart.
      </p>

      {/* Attribution disclosure -- required by Instacart IDP terms */}
      <div
        className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 mb-6 text-xs text-stone-500"
        data-testid="attribution-disclosure"
      >
        St&agrave;ged earns a commission on orders placed through Instacart.
      </div>

      {/* Grocery items */}
      {loading ? (
        <div className="text-stone-400 text-sm py-8 text-center animate-pulse">
          Loading grocery list...
        </div>
      ) : items.length === 0 ? (
        <div
          className="text-center py-12 text-stone-400"
          data-testid="fulfillment-empty"
        >
          <p className="mb-2">No grocery items yet.</p>
          <p className="text-sm">
            Assign recipes to your weekly plan to generate a list.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-6" data-testid="grocery-items">
          {items.map((item) => (
            <label
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                item.checked
                  ? "border-stone-200 bg-stone-50 opacity-50"
                  : "border-stone-200 bg-white hover:border-green-300"
              }`}
              data-testid={`grocery-item-${item.id}`}
            >
              <input
                type="checkbox"
                checked={!item.checked}
                onChange={() => handleToggle(item.id)}
                className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500"
              />
              <span
                className={`text-sm ${item.checked ? "line-through text-stone-400" : "text-stone-700"}`}
              >
                {item.name}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Selected count */}
      {items.length > 0 && (
        <p className="text-sm text-stone-500 mb-4">
          {selectedItems.length} of {items.length} items selected
        </p>
      )}

      {/* Error message */}
      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-3">
        <button
          onClick={handleSendToInstacart}
          disabled={linkLoading || selectedItems.length === 0}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          data-testid="send-to-instacart"
        >
          {linkLoading ? (
            "Generating link..."
          ) : (
            <>
              <span>🛒</span>
              Send to Instacart
            </>
          )}
        </button>

        {instacartUrl && (
          <a
            href={instacartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2.5 text-center text-sm text-orange-600 hover:text-orange-700 border border-orange-200 rounded-lg"
          >
            Open Instacart link again &rarr;
          </a>
        )}

        <button
          onClick={handleCopyList}
          disabled={selectedItems.length === 0}
          className="w-full py-2.5 border border-stone-300 hover:bg-stone-50 disabled:opacity-50 text-stone-700 text-sm font-medium rounded-lg transition-colors"
          data-testid="copy-list"
        >
          {copied ? "Copied!" : "Copy list to clipboard"}
        </button>
      </div>
    </div>
  );
}
