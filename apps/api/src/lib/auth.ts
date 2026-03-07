import Credentials from '@auth/core/providers/credentials'
import Google from '@auth/core/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { AuthConfig, initAuthConfig } from '@hono/auth-js'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// use a lightweight PG pool here for auth-related queries so we avoid
// importing the full @staged/db package (which complicates TypeScript setup)
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// create a minimal Drizzle instance for the auth adapter; schema not needed
const drizzleDb = drizzle(pool)

// helper to run simple queries
export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query(text, params)
  return res.rows as T[]
}

export const authConfig: AuthConfig = {
  adapter: DrizzleAdapter(drizzleDb),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds: any) => {
        if (!creds?.email || !creds?.password) return null
        const email: string = creds.email
        const password: string = creds.password

        // look up credentials account by providerId/email
        const accounts: any[] = await query(
          'SELECT * FROM account WHERE "providerId" = $1 AND "accountId" = $2',
          ['credentials', email]
        )
        const account = accounts[0]
        if (!account) return null

        const valid = await bcrypt.compare(password, account.password || '')
        if (!valid) return null

        // fetch the linked user record (Auth.js identity table is "user")
        const users: any[] = await query('SELECT * FROM "user" WHERE id = $1', [
          account.userId,
        ])
        const userRecord = users[0]
        if (!userRecord) return null
        return userRecord
      },
    }),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async signIn({ user }: { user?: any }) {
      // when a user signs in (either email/password or OAuth) create a profile row
      // in the app-level users table if it doesn't already exist
      if (!user?.email) return true
      await query(
        'INSERT INTO users (email, display_name, skill_level, dietary_profile) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.email, user.name || '', 'beginner', {}]
      )
      return true
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        // Auth.js default `user` object includes id and role
        token.userId = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// re-export getSession helper bound to our config
// helper to initialize auth config on Hono app – consumed in index.ts
export const initAuth = () => initAuthConfig(() => authConfig)

// this file intentionally avoids any business logic beyond auth wiring
