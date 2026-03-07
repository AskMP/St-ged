# AGENTS.md -- Universal Project Configuration

This file is the agent-agnostic project configuration for Stàged. It contains all information any AI coding agent needs to understand and work with this project. No tool-specific syntax -- pure markdown.

Claude Code users: see `CLAUDE.md` for extended configuration with `@import` directives, hooks, and agent definitions.

## Project Overview

**Name**: Stàged
**Description**: Free, offline-first PWA for household meal coordination. Replaces meal kit subscriptions with recipe discovery, collaborative meal planning, and one-tap Instacart grocery fulfillment. Core concept: "digital pre-portioning" -- buy exactly what you need, packaging-free.
**Language(s)**: TypeScript
**Framework(s)**: Turborepo monorepo -- Vite+React PWA (web) + Hono API + Socket.io (real-time sync)

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | Frontend UI (Progressive Web App) |
| Vite + vite-plugin-pwa | 6+ | Build tool + Service Worker + Web App Manifest |
| Workbox | 7+ | Service Worker caching (SWR for recipes, Cache-First for shell, Network-First for lists) |
| Dexie.js | 4+ | IndexedDB ORM -- offline data storage + sync queue |
| Zustand | 5+ | Client state management |
| React Router | 7 | Client-side routing |
| Tailwind CSS | v4 | Styling |
| Radix UI | latest | Accessible UI primitives |
| Hono | 4+ | TypeScript HTTP server (API) |
| Socket.io | 4+ | WebSocket real-time sync (per-household rooms) |
| Node.js | 22 LTS | API runtime |
| PostgreSQL | 16 | Primary database |
| Drizzle ORM | latest | TypeScript ORM + migrations |
| Better Auth | latest | Self-hosted auth (email, magic link, OAuth, guest sessions) |
| Turborepo | latest | Monorepo orchestration |
| pnpm | 9+ | Package manager (workspaces) |
| Vitest | 2+ | Unit + integration testing |
| Playwright | latest | E2E testing |
| Claude Haiku | claude-haiku-4-5 | LLM-as-parser: ingredient text -> USDA FDC ID |

## Project Structure

```
staged/
  apps/
    web/                    -- React PWA
      src/
        components/         -- Shared UI components
        lib/                -- API client, sync queue, Dexie setup, env validation
        pages/              -- Route-level page components
        styles/             -- Global CSS
        workers/            -- Service Worker (Workbox)
      public/               -- Static assets, icons, manifest.json
      tests/
        unit/               -- Vitest unit tests
        e2e/                -- Playwright E2E tests
    api/                    -- Hono + Socket.io API server
      src/
        routes/             -- Route handlers (auth, recipes, lists, plans, pantry, fulfillment)
        services/           -- Business logic layer
        middleware/         -- Auth middleware, rate limiting, CORS
        lib/                -- DB client, Socket.io, env, Anthropic client
      tests/                -- Vitest unit + integration tests
  packages/
    types/                  -- Shared TypeScript types
    db/                     -- Drizzle schema + migrations
    usda/                   -- USDA FoodData Central dataset utilities
  docs/                     -- Product docs (vision, personas, features, project-brief)
  prd-phases/               -- PRD manifest + phase subdirectories
```

## Coding Conventions

- camelCase for variables/functions; PascalCase for components and types; kebab-case for file names
- Barrel exports (`index.ts`) in each `src/` directory -- import from barrel, not deep paths
- Absolute imports via `@/` alias within each app
- Shared types in `packages/types/src/` -- never duplicate across packages
- Drizzle schema is the source of truth for DB shape; no raw SQL outside migrations
- No business logic in route handlers -- routes call services
- All async handlers use try/catch; use Hono's HTTPException for HTTP errors
- Environment variables typed and validated via Zod in `src/lib/env.ts` (fail fast on startup)
- No `any` types; no cross-layer imports (UI must not import server modules)

## Testing

- **Test runner**: Vitest (unit), Playwright (E2E)
- **Unit test location**: `tests/unit/` within each app
- **E2E test location**: `apps/web/tests/e2e/`
- **Run command**: `pnpm test`
- **Type check**: `pnpm type-check`
- **Coverage target**: 75%

## Build & Run

```bash
# Install dependencies
pnpm install

# Run all dev servers (web :5173, api :3000)
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check

# E2E tests
pnpm --filter web test:e2e

# Database migrations
pnpm --filter @staged/db migrate
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| Web PWA (Vite dev) | 5173 | React frontend + Service Worker |
| API server (Hono) | 3000 | REST API + Socket.io WebSocket |
| PostgreSQL | 5432 | Primary database |
| Socket.io | ws://localhost:3000 | Real-time household sync |

## Task Management

- **Task CLI**: bd (beads)
- **Task data path**: .beads/
- **Task ID prefix**: STG
- **Branch prefix**: stg
- **Branch format**: `stg-<task-id>/<description>`

ALL task state flows through **bd (beads)**. NEVER use other tools as substitutes -- they are invisible to the project's task history.

| Action | Command |
|--------|---------|
| Init | `bd init --prefix STG` |
| Create task | `bd create -t task -d "DESC" "TITLE"` |
| Create feature | `bd create -t feature -d "DESC" "Feature: TITLE"` |
| List active | `bd list -s in_progress` |
| Show task | `bd show TASK_ID` |
| Set status | `bd update TASK_ID -s STATUS` |
| Append notes | `bd update TASK_ID --append-notes "NOTE"` |
| Set dependency | `bd dep OTHER_ID --blocks TASK_ID` |
| Close task | `bd close TASK_ID` |

## Development Workflow

### Branch Rules

- Always create a feature branch before starting work
- Branch naming: `stg-<task-id>/<short-description>`
- Never commit directly to main
- One task per branch -- keep changes atomic

### Commit Rules

- Conventional commits: `type(scope): description`
- Types: feat, fix, chore, refactor, test, docs, style, perf, ci
- Run `pnpm test` and `pnpm type-check` before committing

### Task Workflow

1. Check for an in-progress task before starting new work
2. Set task to in-progress (`bd update TASK_ID -s in_progress`)
3. Create feature branch from main
4. Implement (test-first when possible)
5. Verify tests pass and types check
6. Commit referencing task ID
7. Close task (`bd close TASK_ID`)
8. Open PR

## Deployment

- **Web**: Vercel (CDN edge, Service Worker HTTPS support)
- **API**: Railway (persistent WebSocket, managed env vars)
- **Database**: Supabase (managed PostgreSQL 16)
- **CI/CD**: GitHub Actions
- **Environment variables**: `.env.local` for dev (never commit); platform dashboards for prod

## Project-Specific Rules

- **Offline-first**: Test in Chrome DevTools Offline mode before marking any feature complete
- **A2HS required**: Add-to-Home-Screen prompt is a functional requirement (iOS 7-day cache eviction for non-installed PWAs)
- **No Background Sync API**: Not supported on iOS. Use foreground-flush pattern: local write -> IndexedDB queue -> flush on `online`/`visibilitychange`
- **Instacart IDP** (not "Instacart Connect"): 5% affiliate commission via Impact.com; 7-day attribution window
- **USDA FDC self-hosted**: Dataset downloaded to `packages/usda/src/data/` (gitignored). Nutrition computed at save time; never re-called on view
- **No Spoonacular primary**: 1-hour cache limit incompatible with offline-first
- **Amazon Fresh excluded**: No public API
- **Screen Wake Lock**: Required in step-by-step cooking view
- **DMCA agent prerequisite**: Must register at copyright.gov/dmca-agent/ before recipe URL import ships
