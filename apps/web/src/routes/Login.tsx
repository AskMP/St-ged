import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Login page -- Jordan's front door.
 *
 * Design principles:
 * - No dark patterns; guest mode is visible but not the primary CTA
 * - Inline error feedback (no toast libraries, no modal)
 * - Loading state disables form to prevent double-submit
 * - On success: navigate to /planning (household exists) or /onboarding (new user)
 */
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/planning";

  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await apiClient.auth.signin(email, password);
      setUser(user);
      // Route to onboarding if no household yet, otherwise respect returnTo
      if (!user.householdId) {
        navigate("/onboarding");
      } else {
        navigate(returnTo);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
        setError("no_account");
      } else if (
        msg.includes("fetch") ||
        msg.toLowerCase().includes("network")
      ) {
        setError("Connection problem -- check your internet connection.");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-stone-50 px-4"
      data-testid="login-page"
    >
      <div className="w-full max-w-110">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-2">
            St&agrave;ged
          </h1>
          <p className="text-stone-500 text-base">
            Meal planning that works with your kitchen.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          {error && error !== "no_account" && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              role="alert"
              data-testid="login-error"
            >
              {error}
            </div>
          )}
          {error === "no_account" && (
            <div
              className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm"
              role="alert"
              data-testid="login-error"
            >
              Incorrect email or password.{" "}
              <Link
                to="/signup"
                className="font-medium underline hover:text-amber-900"
              >
                Create an account?
              </Link>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:bg-stone-50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:bg-stone-50"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              data-testid="login-submit"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
