import { useOnlineStatus } from "@/lib/use-online-status";

export default function Lists() {
  const isOnline = useOnlineStatus();
  return (
    <div className="max-w-2xl mx-auto py-6 px-4" data-testid="lists-page">
      {!isOnline && (
        <div
          data-testid="offline-banner"
          className="mb-4 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm border border-amber-300"
        >
          You're offline -- changes will sync when you reconnect.
        </div>
      )}
      <h1 className="text-2xl font-bold text-stone-900">Grocery Lists</h1>
      <p className="text-stone-400 text-sm mt-2">
        Lists are generated from your meal plan.
      </p>
    </div>
  );
}
