import { skipCSRFCheck } from "@auth/core";
import type { AuthConfig } from "@auth/core/types";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { initAuthConfig } from "@hono/auth-js";
import bcrypt from "bcryptjs";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import { db, query } from "./db";

// skipCSRFCheck symbol allows us to disable the built-in CSRF protection
// since our front end uses a JSON/SPA form which would otherwise require an
// extra token round-trip.  We still have the global CORS policy and are
// not exposing the signin endpoint to third-party domains.
// TODO(security): Narrow skipCSRFCheck to the credentials signin endpoint only
// instead of applying globally. See CODE_REVIEW_2026-03-08.md AUTH-006.
// Post-rescue security hardening task will address this.

export const authConfig: AuthConfig = {
  // disable CSRF for API consumers so that the client can POST credentials
  // directly without fetching a token first
  skipCSRFCheck: skipCSRFCheck,
  // AUTH-007: set basePath so Auth.js correctly parses /api/auth/* action URLs.
  // Without this, NEXTAUTH_URL="http://localhost:3000" causes basePath to default
  // to "/" (the URL path), and Auth.js extracts "api" as the action from
  // /api/auth/signin -- not a valid action -- returning "Bad request." 400.
  basePath: "/api/auth",
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;
        const email = creds.email as string;
        const password = creds.password as string;

        // Query our users table for the hashed password.
        // We store hashed_password on the users table -- not in the account table --
        // because Auth.js's DrizzleAdapter does not add a password column to account.
        // See CODE_REVIEW_2026-03-08.md AUTH-002 for the bug this replaces.
        const rows = await query<{
          id: string;
          email: string;
          display_name: string;
          hashed_password: string | null;
        }>(
          "SELECT id, email, display_name, hashed_password FROM users WHERE email = $1",
          [email],
        );
        const user = rows[0];
        if (!user || !user.hashed_password) return null;

        const valid = await bcrypt.compare(password, user.hashed_password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.display_name };
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async signIn({
      user,
    }: {
      user?: { email?: string | null; name?: string | null };
    }) {
      // when a user signs in via OAuth, create a profile row in the app-level
      // users table if it doesn't already exist. Credentials provider flow
      // creates the row during signup instead.
      if (!user?.email) return true;
      await query(
        "INSERT INTO users (email, display_name, skill_level, dietary_profile) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING",
        [user.email, user.name ?? "", "beginner", {}],
      );
      return true;
    },
    async jwt({
      token,
      user,
    }: {
      token: Record<string, unknown>;
      user?: { id?: string; role?: string };
    }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// helper to initialize auth config on Hono app -- consumed in index.ts
export const initAuth = () => initAuthConfig(() => authConfig);

// this file intentionally avoids any business logic beyond auth wiring
