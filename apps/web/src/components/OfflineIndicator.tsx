import { useEffect, useState } from "react";

/**
 * OfflineIndicator -- small bottom banner shown when the device is offline.
 *
 * Design principles:
 * - Does NOT block interaction (never a modal)
 * - Auto-shows on offline event; auto-hides on online event
 * - Non-intrusive placement: bottom of screen, above bottom nav
 */
export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      data-testid="offline-indicator"
    >
      <div className="bg-stone-800 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        You&apos;re offline. Showing saved data.
      </div>
    </div>
  );
}
