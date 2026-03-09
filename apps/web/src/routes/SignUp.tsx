import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

interface FieldErrors {
  displayName?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

function validate(
  displayName: string,
  email: string,
  password: string,
  passwordConfirm: string,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!displayName.trim()) errors.displayName = "Please tell us your name.";
  if (!email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) errors.password = "At least 8 characters.";
  if (password !== passwordConfirm)
    errors.passwordConfirm = "Passwords don't match.";
  return errors;
}

/**
 * SignUp page -- Jordan's path into the app.
 *
 * On 201: auto-signin then navigate to /onboarding.
 * On 409: surface "email already exists" with a link to /login.
 */
export default function SignUp() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const errors = validate(displayName, email, password, passwordConfirm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await apiClient.auth.signup(email, password, displayName);
      // Auto sign-in after successful registration
      await apiClient.auth.signin(email, password);
      const me = await apiClient.auth.me();
      setUser(me);
      navigate("/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("409") || msg.toLowerCase().includes("exists")) {
        setServerError("email_taken");
      } else if (msg.includes("400")) {
        setServerError(msg);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-8"
      data-testid="signup-page"
    >
      <div className="w-full max-w-[440px]">
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
          <h2 className="text-xl font-semibold text-stone-900 mb-6">
            Create your account
          </h2>

          {serverError && serverError !== "email_taken" && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              role="alert"
              data-testid="signup-error"
            >
              {serverError}
            </div>
          )}

          {serverError === "email_taken" && (
            <div
              className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm"
              role="alert"
              data-testid="signup-error-taken"
            >
              An account with this email already exists.{" "}
              <Link
                to="/login"
                className="font-medium underline hover:text-amber-900"
              >
                Sign in?
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Your name
              </label>
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:bg-stone-50"
                placeholder="How should we call you?"
                aria-describedby={
                  fieldErrors.displayName ? "displayName-error" : undefined
                }
              />
              {fieldErrors.displayName && (
                <p id="displayName-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:bg-stone-50"
                placeholder="you@example.com"
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.email}
                </p>
              )}
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:bg-stone-50"
                placeholder="8 characters minimum"
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
              />
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Confirm password
              </label>
              <input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:bg-stone-50"
                placeholder="Repeat your password"
                aria-describedby={
                  fieldErrors.passwordConfirm
                    ? "passwordConfirm-error"
                    : undefined
                }
              />
              {fieldErrors.passwordConfirm && (
                <p
                  id="passwordConfirm-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {fieldErrors.passwordConfirm}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              data-testid="signup-submit"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
