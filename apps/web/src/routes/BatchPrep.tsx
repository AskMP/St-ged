import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";

interface RecipeSummary {
  id: string;
  name: string;
}

export default function BatchPrep() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ items: { name: string; count: number }[]; sequence: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await apiClient.recipes.list();
        // assume list items have id & name properties
        setRecipes(list as RecipeSummary[]);
      } catch (e) {
        // ignore
      }
    }
    load();
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const combine = async () => {
    setError(null);
    setResult(null);
    try {
      const ids = Array.from(selected);
      const res = await apiClient.batchPrep.combine(ids);
      setResult(res as { items: { name: string; count: number }[]; sequence: string[] });
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  };

  return (
    <div data-testid="batch-prep-page" className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Batch Prep</h1>
      <p>Select multiple recipes to generate a combined ingredient list.</p>

      <div className="mt-4">
        {recipes.map((r) => (
          <label key={r.id} className="block">
            <input
              type="checkbox"
              checked={selected.has(r.id)}
              onChange={() => toggle(r.id)}
              data-testid={`select-${r.id}`}
            />
            <span className="ml-2">{r.name}</span>
          </label>
        ))}
      </div>

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={combine}
        disabled={selected.size === 0}
        data-testid="combine-button"
      >
        Combine
      </button>

      {error && <div className="mt-2 text-red-600" data-testid="error">{error}</div>}

      {result && (
        <div className="mt-6" data-testid="result">
          <h2 className="text-xl font-semibold">Combined Ingredients</h2>
          <ul className="list-disc ml-6">
            {result.items.map((it) => (
              <li key={it.name}>{it.name} (in {it.count} recipes)</li>
            ))}
          </ul>
          <h3 className="mt-4 font-medium">Recipe order</h3>
          <ol className="list-decimal ml-6">
            {result.sequence.map((id) => (
              <li key={id} data-testid="sequence-item">
                {recipes.find((r) => r.id === id)?.name || id}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
