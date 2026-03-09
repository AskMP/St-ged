import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Returns the currently authenticated user from the Zustand store.
 * On first load (user is null), fetches /api/auth/me to hydrate the store.
 * On 401 (session expired), redirects to /login preserving the current path.
 *
 * This hook is safe to call in any protected component -- it is idempotent
 * when the user is already in the store.
 */
export function useCurrentUser() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (user !== null) {
      setLoading(false);
      return; // already hydrated
    }

    let cancelled = false;
    setLoading(true);

    apiClient.auth
      .me()
      .then((me) => {
        if (!cancelled) {
          setUser(me);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          const returnTo = encodeURIComponent(window.location.pathname);
          navigate(`/login?returnTo=${returnTo}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, navigate, setUser, setLoading]);

  return { user, isLoading };
}
