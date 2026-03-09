import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";
import { apiClient } from "@/lib/api-client";
import { OfflineIndicator } from "./OfflineIndicator";

const NAV_ITEMS = [
  { to: "/planning", label: "Planning", icon: CalendarIcon },
  { to: "/recipes", label: "Recipes", icon: BookIcon },
  { to: "/pantry", label: "Pantry", icon: PantryIcon },
  { to: "/household", label: "Household", icon: HouseIcon },
] as const;

// ---- SVG icon components (inline, no dependency) ----

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-5 h-5 ${active ? "text-green-600" : "text-stone-400"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-5 h-5 ${active ? "text-green-600" : "text-stone-400"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        strokeWidth="2"
      />
    </svg>
  );
}

function PantryIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-5 h-5 ${active ? "text-green-600" : "text-stone-400"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 3h18v4H3zM5 7v14h14V7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 11h6M9 15h4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HouseIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-5 h-5 ${active ? "text-green-600" : "text-stone-400"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 22V12h6v10" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ---- AppShell ----

/**
 * AppShell -- authenticated page wrapper.
 *
 * Top bar: "Staged" wordmark + avatar (initials)
 * Bottom nav: Planning / Recipes / Pantry / Household
 * Offline indicator: small banner above bottom nav
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const handleSignout = async () => {
    setMenuOpen(false);
    try {
      await apiClient.auth.signout();
    } catch {
      // best-effort
    }
    clear();
    window.location.href = "/login";
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link
          to="/planning"
          className="text-xl font-bold text-stone-900 tracking-tight"
        >
          St&agrave;ged
        </Link>

        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <button
            className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center hover:bg-green-200 transition-colors"
            aria-label={`Account menu for ${user?.name ?? "user"}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-stone-100">
                <p className="text-xs font-semibold text-stone-900 truncate">
                  {user?.name ?? "User"}
                </p>
                <p className="text-xs text-stone-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Settings
              </button>
              <button
                onClick={handleSignout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Offline banner (above bottom nav) */}
      <OfflineIndicator />

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  isActive
                    ? "text-green-600"
                    : "text-stone-400 hover:text-stone-600"
                }`}
                aria-current={isActive ? "page" : undefined}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon active={isActive} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
