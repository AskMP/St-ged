import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@staged/db";

// Single shared pool for all API services.
// Import from here -- do not create new Pool() instances in individual files.
// Rationale: Three independent pools existed before this module (auth.ts,
// auth-service.ts, index.ts). On Supabase free tier (25-conn limit) this
// caused intermittent connection exhaustion. See CODE_REVIEW AUTH-004.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // conservative limit; leaves headroom for Auth.js adapter connections
});

// Drizzle instance with schema -- enables db.query.* relational API.
// Schema is imported from @staged/db (packages/db/src/schema).
export const db = drizzle(pool, { schema });

// Convenience raw-query wrapper -- keep for Auth.js raw SQL (signup/me endpoints)
// and full-text search against usda_ingredients.search_vector.
// Services should prefer db.select()... over this wrapper.
export async function query<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
