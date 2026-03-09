import { useEffect, useState } from "react";

/**
 * Returns true when the browser has network access (navigator.onLine).
 * Subscribes to window online/offline events for real-time updates.
 *
 * Use this instead of Socket.io connection state as the primary offline
 * indicator -- it reflects actual network availability, not WebSocket state.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
