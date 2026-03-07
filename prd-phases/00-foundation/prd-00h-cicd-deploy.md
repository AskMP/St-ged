---
task: "CI/CD -- GitHub Actions, Docker, Vercel config, Railway config"
branch: "stg-00h/cicd-deploy"
test_command: "pnpm build"
completion_promise: "COMPLETE"
max_iterations: 8
chain_next: null
requires: ["00g"]
parallel_safe: false
group: 0
manifest_id: "00h"
---

# PRD: CI/CD and Deployment

## Context for Agent

### What This PRD Does

Configures GitHub Actions CI (lint, type-check, test, build on every PR), Dockerfile for the API server, Vercel configuration for the web PWA, and Railway configuration for the API. By the end, opening a PR triggers the full CI pipeline.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00c | ESLint, Prettier, Husky | `eslint.config.mjs`, `.prettierrc`, `.husky/` |
| 00g | Vitest + Playwright test suites passing | `apps/web/vitest.config.ts`, `apps/api/vitest.config.ts` |

### Key Files to Read First

- `CLAUDE.md` -- deployment targets: Vercel (web), Railway (API), GitHub Actions
- `apps/api/package.json` -- API scripts
- `apps/web/package.json` -- web scripts

### Patterns to Follow

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm build
      - run: pnpm test
```

```dockerfile
# apps/api/Dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
RUN pnpm install --frozen-lockfile --filter api...
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```json
// vercel.json (web app root)
{
  "buildCommand": "pnpm --filter web build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": null
}
```

### Skills and Commands

| Action | Command |
|--------|---------|
| Build all | `pnpm build` |
| Build web only | `pnpm --filter web build` |
| Build API only | `pnpm --filter api build` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Create GitHub Actions CI workflow** `[BD:STG-45]`
  - **Type**: task
  - **Do**: Create `.github/workflows/ci.yml` with the pattern shown above. The workflow runs on push to `main` and all PRs. Steps: checkout, pnpm setup, Node 22 setup, `pnpm install --frozen-lockfile`, `pnpm type-check`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`. Set `CI=true` environment variable so Playwright uses the correct mode. Note: E2E tests are excluded from CI at this stage (Playwright E2E requires a running server; add to CI in prd-01-verify when the app has real routes).
  - **Files**: `.github/workflows/ci.yml`
  - **Verify**: Workflow file is valid YAML; `act` (local GitHub Actions runner) or push to GitHub shows green CI
  - **Accept**: CI workflow runs lint + type-check + build + unit tests on PR

- [ ] **Task 2: Create Dockerfile for API** `[BD:STG-46]`
  - **Type**: task
  - **Do**: Create `apps/api/Dockerfile` using the multi-stage pattern shown above. Add `.dockerignore` at the project root ignoring: `node_modules/`, `.git/`, `*.log`, `.env*`, `packages/usda/src/data/` (large dataset), `apps/web/` (not needed for API image). Verify the API `tsconfig.json` has `outDir: "dist"` so `pnpm --filter api build` produces `apps/api/dist/`. Test the Docker build locally: `docker build -f apps/api/Dockerfile -t staged-api .` from project root.
  - **Files**: `apps/api/Dockerfile`, `.dockerignore`, `apps/api/tsconfig.json` (ensure outDir set)
  - **Verify**: `docker build -f apps/api/Dockerfile -t staged-api .` exits 0
  - **Accept**: Docker image builds successfully; image size < 500MB

- [ ] **Task 3: Configure Vercel for web PWA** `[BD:STG-47]`
  - **Type**: task
  - **Do**: Create `vercel.json` at the project root with the config shown above (buildCommand, outputDirectory, installCommand). This tells Vercel to build only the web app from the monorepo root. Create `.vercelignore` to exclude `packages/usda/src/data/`, `apps/api/`, `node_modules/`. Add environment variable documentation: create `docs/deployment.md` listing all required environment variables for each deployment target (Vercel web, Railway API) with descriptions and whether they're required or optional.
  - **Files**: `vercel.json`, `.vercelignore`, `docs/deployment.md`
  - **Verify**: `pnpm --filter web build` generates `apps/web/dist/` with `index.html` and `manifest.webmanifest`
  - **Accept**: `vercel.json` present; web build produces PWA-ready dist; deployment docs written

- [ ] **Task 4: Create Railway configuration** `[BD:STG-48]`
  - **Type**: task
  - **Do**: Create `railway.json` at the project root specifying the API service: `{"$schema": "https://railway.app/railway.schema.json", "build": {"builder": "DOCKERFILE", "dockerfilePath": "apps/api/Dockerfile"}, "deploy": {"startCommand": "node dist/index.js", "healthcheckPath": "/health", "healthcheckTimeout": 30}}`. Add a `Procfile` as an alternative: `web: node apps/api/dist/index.js`. Document Railway deployment steps in `docs/deployment.md`: set DATABASE_URL (Supabase connection string), BETTER_AUTH_SECRET, ANTHROPIC_API_KEY, PORT=3000 in Railway environment variables.
  - **Files**: `railway.json`, `docs/deployment.md` (updated)
  - **Verify**: `railway.json` is valid JSON; healthcheck path matches the actual `/health` endpoint
  - **Accept**: Railway config present; API can be deployed from the Dockerfile

- [ ] **Task 5: Add build scripts and validate full pipeline** `[BD:STG-49]`
  - **Type**: task
  - **Do**: Ensure `apps/api/tsconfig.json` has `compilerOptions.outDir: "./dist"` for the production build. Run the full local CI simulation: `pnpm install --frozen-lockfile && pnpm type-check && pnpm lint && pnpm format:check && pnpm build && pnpm test`. All commands must exit 0. Fix any issues discovered (document in `.claude/known-errors.md` if a known limitation). Run `pnpm --filter web build` and verify `apps/web/dist/` contains `index.html`, `manifest.webmanifest`, and at least one service worker file.
  - **Files**: `apps/api/tsconfig.json`, `.claude/known-errors.md` (update if issues)
  - **Verify**: Full pipeline simulation exits 0; web dist contains PWA manifest
  - **Accept**: CI pipeline passes locally; PWA build artifact present

- [ ] **Task 6: Update manifest** `[BD:STG-50]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00h`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `00h`, set progress to `8 / 29 PRDs complete`. All Group 0 PRDs are now complete. The project is ready to begin MVP feature development (Group 1). Note this milestone in the Current State section.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00h" prd-phases/manifest.md` shows `status: complete`; all 8 Group 0 entries show `status: complete`
  - **Accept**: All foundation PRDs complete; Group 1 PRDs unblocked; progress = 8/29

---

## Discovered Tasks

_None yet._
