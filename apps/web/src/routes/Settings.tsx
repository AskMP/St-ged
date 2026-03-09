import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";
import { apiClient } from "@/lib/api-client";

/**
 * Settings page -- user profile, household info, and sign-out.
 */
export default function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignout = async () => {
    setSigningOut(true);
    try {
      await apiClient.auth.signout();
    } catch {
      // best-effort
    }
    clear();
    window.location.href = "/login";
  };

  return (
    <div className="max-w-lg mx-auto py-6 px-4" data-testid="settings-page">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Settings</h1>

      {/* Account section */}
      <section className="bg-white rounded-2xl border border-stone-200 mb-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
            Account
          </h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 font-bold text-lg flex items-center justify-center shrink-0">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "?"}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-stone-900 truncate">
                {user?.name ?? "Unknown"}
              </p>
              <p className="text-sm text-stone-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="text-sm text-stone-500">
            <span className="capitalize">{user?.skillLevel ?? "beginner"}</span>
            {" cook"}
          </div>
        </div>
      </section>

      {/* Household section */}
      <section className="bg-white rounded-2xl border border-stone-200 mb-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
            Household
          </h2>
        </div>
        <div className="px-5 py-4">
          {user?.householdId ? (
            <div className="space-y-3">
              <p className="text-sm text-stone-600">
                Household ID:{" "}
                <span className="font-mono text-xs text-stone-400">
                  {user.householdId.slice(0, 8)}&hellip;
                </span>
              </p>
              <button
                onClick={() => navigate("/household")}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Manage household &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-stone-500">
                You haven&apos;t set up a household yet.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Set up household &rarr;
              </button>
            </div>
          )}
        </div>
      </section>

      {/* App section */}
      <section className="bg-white rounded-2xl border border-stone-200 mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
            App
          </h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-700">Appearance</span>
            <span className="text-sm text-stone-400">System default</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-700">Version</span>
            <span className="text-sm text-stone-400 font-mono">0.1.0-mvp</span>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <button
        onClick={handleSignout}
        disabled={signingOut}
        className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors disabled:opacity-50"
        data-testid="signout-btn"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
