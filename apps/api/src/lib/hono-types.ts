// Shared Hono context variable types for typed c.get() / c.set() across all route files.
// Import AppVariables to get a typed Hono app: new Hono<{ Variables: AppVariables }>()

import type { SessionUser } from "../services/auth-service";

export interface AppVariables {
  user: SessionUser;
}
