import { JWT as DefaultJWT, Session as DefaultSession } from "next-auth"

// augment next-auth types with our custom fields
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      /** Auth.js user id (from the auth_users table) */
      id: string
      /** role embedded by callbacks ("user" | "admin" | "guest" etc) */
      role: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string
    role?: string
  }
}
