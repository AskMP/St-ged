import React from "react";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

/**
 * AuthGuard -- wraps protected routes.
 *
 * While checking session: shows a loading spinner.
 * If user is null after check: useCurrentUser redirects to /login?returnTo=.
 * If user is present: renders children.
 *
 * Design principle: No Dead Ends (redirect preserves return path).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useCurrentUser();

  // Show spinner while loading OR while user is null (effect hasn't fired yet on first render).
  // Without this, the component returns null for one frame before the /me fetch starts.
  if (isLoading || user === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-stone-50"
        data-testid="auth-loading"
      >
        <div className="text-stone-400 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
