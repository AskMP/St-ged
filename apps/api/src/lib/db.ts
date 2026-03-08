import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Single shared pool for all API services.
// Import from here -- do not create new Pool() instances in individual files.
// Rationale: Three independent pools existed before this module (auth.ts,
// auth-service.ts, index.ts). On Supabase free tier (25-conn limit) this
// caused intermittent connection exhaustion. See CODE_REVIEW AUTH-004.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // conservative limit; leaves headroom for Auth.js adapter connections
});

// Drizzle instance without schema -- rescue-03 will add typed schema queries.
// Currently used only by DrizzleAdapter in auth.ts for session storage.
export const db = drizzle(pool);

// Convenience raw-query wrapper for services that need raw SQL
// (to be removed incrementally in rescue-03 as services migrate to Drizzle ORM)
export async function query<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
