---
task: "Turborepo monorepo init -- pnpm workspaces, app skeletons, dev servers"
branch: "stg-00b/project-init"
test_command: "pnpm build"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "00c"
requires: ["00a"]
parallel_safe: false
group: 0
manifest_id: "00b"
---

# PRD: Project Initialization

## Context for Agent

### What This PRD Does

Initializes the Turborepo monorepo with pnpm workspaces. Creates the `apps/web` (React PWA via Vite) and `apps/api` (Node.js + Hono) app skeletons, along with the `packages/types`, `packages/db`, and `packages/usda` shared packages. Both dev servers must start cleanly at the end of this PRD.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00a | bd initialized, STG prefix set | `.beads/` |

### Key Files to Read First

- `CLAUDE.md` -- project conventions, tech stack, structure
- `AGENTS.md` -- universal config

### Patterns to Follow

```json
// pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
// turbo.json (root)
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "persistent": true, "cache": false },
    "test": { "dependsOn": ["^build"] },
    "type-check": { "dependsOn": ["^build"] }
  }
}
```

```json
// root package.json scripts
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "type-check": "turbo run type-check"
  }
}
```

```typescript
// packages/types/src/index.ts -- export all shared types
export * from './recipe'
export * from './household'
export * from './list'
export * from './plan'
export * from './pantry'
export * from './events'
```

### Skills and Commands

| Action | Command |
|--------|---------|
| Install deps | `pnpm install` |
| Run all dev | `pnpm dev` |
| Build all | `pnpm build` |
| Run web only | `pnpm --filter web dev` |
| Run api only | `pnpm --filter api dev` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |
| Append notes | `bd update STG-ID --append-notes "NOTE"` |

---

## Problem-Solving Protocol

1. **Try the task as specified** -- follow the Do field exactly
2. **If blocked**: check that pnpm and Node.js 22 are installed; check that `turbo` is in devDependencies
3. **If a new task is needed**: add it to the Discovered Tasks section
4. **If unresolvable after 3 attempts**: add guardrail, skip to next task, log in progress.md

---

## Tasks

- [x] **Task 1: Create root package.json and workspace config** `[BD:STG-5]`
  - **Type**: task
  - **Do**: Create `/Users/mdpotter/Documents/GitHub/staged/package.json` with name `staged`, private: true, engines `{node: ">=22"}`, scripts `{dev, build, test, type-check}` all delegating to `turbo run <script>`. Create `pnpm-workspace.yaml` with `packages: ["apps/*", "packages/*"]`. Create `turbo.json` with pipeline for `build`, `dev`, `test`, `type-check` tasks. Add root devDependencies: `turbo`, `typescript@5`, `@types/node`.
  - **Files**: `package.json`, `pnpm-workspace.yaml`, `turbo.json`
  - **Verify**: Files exist; `pnpm install` runs without error
  - **Accept**: `pnpm install` succeeds; `turbo` binary available at `node_modules/.bin/turbo`

- [x] **Task 2: Create shared types package** `[BD:STG-6]`
  - **Type**: task
  - **Do**: Create `packages/types/package.json` with name `@staged/types`, version `0.0.1`, main `src/index.ts`, exports `{"." : "./src/index.ts"}`. Create `packages/types/tsconfig.json` extending root tsconfig. Create `packages/types/src/index.ts` with empty exports. Create stub type files: `recipe.ts`, `household.ts`, `list.ts`, `plan.ts`, `pantry.ts`, `events.ts` (each exports an empty `// TODO` comment placeholder -- types added in 01-data-schema PRD).
  - **Files**: `packages/types/package.json`, `packages/types/tsconfig.json`, `packages/types/src/index.ts`, `packages/types/src/recipe.ts`, `packages/types/src/household.ts`, `packages/types/src/list.ts`, `packages/types/src/plan.ts`, `packages/types/src/pantry.ts`, `packages/types/src/events.ts`
  - **Verify**: `pnpm --filter @staged/types build` exits 0 (or type-check passes)
  - **Accept**: Package resolves; other packages can import from `@staged/types`

- [x] **Task 3: Create shared db package skeleton** `[BD:STG-7]`
  - **Type**: task
  - **Do**: Create `packages/db/package.json` with name `@staged/db`, devDependencies: `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`. Create `packages/db/src/index.ts` exporting `export * from './schema'`. Create `packages/db/src/schema/index.ts` as empty placeholder. Create `packages/db/drizzle.config.ts` (config for drizzle-kit: dialect `postgresql`, schema `./src/schema`, out `./src/migrations`). Add `migrate` and `generate` scripts to package.json.
  - **Files**: `packages/db/package.json`, `packages/db/src/index.ts`, `packages/db/src/schema/index.ts`, `packages/db/drizzle.config.ts`
  - **Verify**: Package installs without error
  - **Accept**: `@staged/db` package exists and is resolvable from other packages

- [x] **Task 4: Create shared usda package skeleton** `[BD:STG-8]`
  - **Type**: task
  - **Do**: Create `packages/usda/package.json` with name `@staged/usda`. Create `packages/usda/src/index.ts` with exports placeholder. Add a `download.ts` script stub (empty async function `downloadFDCDataset()` with a TODO comment: "// See prd-00d for full USDA FDC download implementation"). Create `packages/usda/src/data/.gitkeep`.
  - **Files**: `packages/usda/package.json`, `packages/usda/src/index.ts`, `packages/usda/src/download.ts`, `packages/usda/src/data/.gitkeep`
  - **Verify**: Package resolves in workspace
  - **Accept**: `@staged/usda` visible in `pnpm list --filter @staged/usda`

- [x] **Task 5: Create Vite + React web app skeleton** `[BD:STG-9]`
  - **Type**: task
  - **Do**: Create `apps/web/package.json` with name `web`, scripts `{dev: "vite", build: "vite build", preview: "vite preview", test: "vitest run", type-check: "tsc --noEmit"}`. Add devDependencies: `vite@6`, `@vitejs/plugin-react`, `vite-plugin-pwa`, `typescript`. Add dependencies: `react@19`, `react-dom@19`, `react-router@7`, `zustand`, `dexie`, `dexie-react-hooks`. Create `apps/web/vite.config.ts` with React plugin and PWA plugin (minimal config -- full PWA config in prd-00f). Create `apps/web/tsconfig.json`. Create `apps/web/index.html` with `<div id="root">` mount point. Create `apps/web/src/main.tsx` with `ReactDOM.createRoot(document.getElementById('root')!).render(<App />)`. Create `apps/web/src/App.tsx` with a minimal `<h1>Stàged</h1>` placeholder.
  - **Files**: `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/tsconfig.json`, `apps/web/index.html`, `apps/web/src/main.tsx`, `apps/web/src/App.tsx`
  - **Verify**: `pnpm --filter web dev` starts Vite dev server on port 5173 without error
  - **Accept**: Browser loads `http://localhost:5173` and displays "Stàged" heading

- [x] **Task 6: Create Hono API server skeleton** `[BD:STG-10]`
  - **Type**: task
  - **Do**: Create `apps/api/package.json` with name `api`, scripts `{dev: "tsx watch src/index.ts", build: "tsc", start: "node dist/index.js", test: "vitest run", type-check: "tsc --noEmit"}`. Add dependencies: `hono`, `@hono/node-server`, `socket.io`, `@hono/auth-js`, `@auth/core`, `@auth/drizzle-adapter`, `next-auth`, `bcryptjs`, `drizzle-orm`, `pg`, `zod`, `@anthropic-ai/sdk`. Add devDependencies: `tsx`, `typescript`, `vitest`. Create `apps/api/tsconfig.json`. Create `apps/api/src/index.ts` with: import Hono, create app, add a GET `/health` route returning `{status: "ok"}`, start server on port 3000 via `@hono/node-server`. Create `apps/api/src/lib/env.ts` stub (TODO: add Zod env validation in prd-00e).
  - **Files**: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/src/index.ts`, `apps/api/src/lib/env.ts`
  - **Verify**: `pnpm --filter api dev` starts without error; `curl http://localhost:3000/health` returns `{"status":"ok"}`
  - **Accept**: API server starts on port 3000; health endpoint returns 200 with expected JSON

- [x] **Task 7: Create root tsconfig** `[BD:STG-11]`
  - **Type**: task
  - **Do**: Create `tsconfig.json` at the project root with `compilerOptions`: `strict: true`, `target: "ES2022"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `esModuleInterop: true`, `skipLibCheck: true`, `noUncheckedIndexedAccess: true`. Set `references` to all packages and apps. Add `type-check` script to root package.json: `turbo run type-check`.
  - **Files**: `tsconfig.json`
  - **Verify**: `pnpm type-check` runs without fatal errors (may have stub-related warnings)
  - **Accept**: TypeScript resolves across all workspace packages; no import errors on the skeleton code

- [x] **Task 8: Verify full dev setup** `[BD:STG-12]`
  - **Type**: task
  - **Do**: Run `pnpm install` to ensure all packages are linked. Run `pnpm build` and verify it completes. Confirm `pnpm --filter web dev` and `pnpm --filter api dev` can each start independently. Document any issues found in `.claude/known-errors.md`.
  - **Files**: `.claude/known-errors.md` (update if issues found)
  - **Verify**: `pnpm build` exits 0; both dev servers start without crashing
  - **Accept**: Full monorepo builds cleanly; both dev servers start

- [x] **Task 9: Update manifest** `[BD:STG-13]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00b`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `00b`, increment progress to `2 / 38 PRDs complete`. Confirm `00c` and `00d` (both require 00b) are now unblocked.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00b" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated; progress = 2/38

---

## Discovered Tasks

_None yet._
