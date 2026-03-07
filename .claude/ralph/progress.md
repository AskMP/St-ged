
## Iteration 1 — MVP Auth API (STG-281..STG-286)
- **Status**: Complete
- **Files changed**: apps/api/src/lib/auth.ts, apps/api/src/routes/auth.ts, apps/api/src/services/auth-service.ts, apps/api/src/middleware/auth.ts, apps/api/tests/auth/auth-routes.test.ts, prd-phases/01-mvp-api/prd-01-api-auth.md, prd-phases/manifest.md, plus many PRD & config updates
- **Patterns discovered**: using pg pool directly instead of full db package simplifies TS boundaries; vitest env config is needed for early env validation; Hono ctx typing workaround required for custom context vars
- **Gotchas**: ES modules hoist imports before runtime assignments (env vars need to be set in config or separate setup file); type-check across workspace packages is tricky—prefer minimal  boundaries for cross-package imports until full project references are configured
- **Time**: Sat Mar  7 16:46:16 UTC 2026
