---
task: "MVP PWA shell -- app router, Workbox, Dexie, sync queue, installability"
branch: "stg-01-ui-pwa/pwa-shell"
test_command: "pnpm --filter web test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 12
chain_next: "01-ui-components"
requires: ["00f", "00g"]
parallel_safe: false
group: 1
manifest_id: "01-ui-pwa"
---

# PRD: MVP PWA Shell

## Context for Agent

### What This PRD Does

Builds the offline-first application shell: router, layout, Workbox service worker behavior, Dexie persistence, sync queue, connection status, and installability hooks. This PRD establishes the runtime platform every later page uses.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00f | Design tokens and UI primitives | `apps/web/src/components/ui/`, `apps/web/src/styles/` |
| 00g | Vitest, Playwright, offline/device verification baseline | `apps/web/vitest.config.ts`, `apps/web/playwright.config.ts` |

### Key Files to Read First

- `apps/web/src/main.tsx`
- `apps/web/vite.config.ts`
- `docs/features.md` -- F02 offline-first PWA architecture
- `.claude/skills/frontend-design/skill.md`

### Patterns to Follow

- Write to Dexie first, then queue and flush mutations on `online` and `visibilitychange`
- Service worker strategies must match the product brief: shell cache-first, recipes stale-while-revalidate, live lists network-first
- Installability and persistent storage are functional requirements, not polish

### Skills and Commands

| Action | Command |
|--------|---------|
| Run web tests | `pnpm --filter web test` |
| Run E2E tests | `pnpm --filter web test:e2e` |
| Run offline smoke | `pnpm test:offline` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Start with failing route/offline/installability tests before implementation
2. Keep service worker, Dexie, and UI shell responsibilities separate
3. If iOS/A2HS quirks require a fallback, document them explicitly instead of hiding them in code
4. Browser validation is mandatory for this PRD; device validation is additive when available

---

## Tasks

- [ ] **Task 1: Add failing shell, router, and offline tests** `[BD:STG-103]`
  - **Type**: task
  - **Do**: Add route-level and Playwright tests that fail until the app has a real shell, router, offline indicator, and service-worker-ready boot flow. Include expectations for install prompt state and connection status UI.
  - **Files**: `apps/web/tests/unit/app-shell.test.tsx`, `apps/web/tests/e2e/pwa-shell.spec.ts`
  - **Verify**: The shell suite fails before implementation begins
  - **Accept**: Runtime expectations are explicit before platform code is added

- [ ] **Task 2: Implement app shell, router, and layout primitives** `[BD:STG-104]`
  - **Type**: feature
  - **Do**: Build the shared router, shell layout, top-level navigation, route outlets, and runtime status surfaces needed by the MVP pages. Ensure the design direction from `00f` carries through the shell rather than reverting to generic scaffolding.
  - **Files**: `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/routes/`, `apps/web/src/components/`
  - **Verify**: Route-level tests pass
  - **Accept**: The PWA has a real application shell and navigable route structure

- [ ] **Task 3: Implement Workbox and Dexie offline foundation** `[BD:STG-105]`
  - **Type**: feature
  - **Do**: Configure Workbox/service-worker behavior, Dexie stores, and the local-first sync queue contract. Add cache strategies, local persistence, and queue flushing on `online` and `visibilitychange`.
  - **Files**: `apps/web/src/lib/dexie.ts`, `apps/web/src/lib/sync-queue.ts`, `apps/web/src/workers/`, `apps/web/vite.config.ts`
  - **Verify**: Offline-oriented tests pass and the queue contract exists
  - **Accept**: Offline-first infrastructure is present and ready for page-level data flows

- [ ] **Task 4: Add installability, storage persistence, and connection UX** `[BD:STG-106]`
  - **Type**: feature
  - **Do**: Implement the A2HS prompt state, `navigator.storage.persist()` request flow, connectivity indicators, and reconnect messaging that later pages can reuse.
  - **Files**: `apps/web/src/lib/install.ts`, `apps/web/src/components/`, `apps/web/src/lib/network.ts`
  - **Verify**: Browser tests cover install prompt visibility and connection-state changes
  - **Accept**: The app exposes installability and storage persistence as runtime features

- [ ] **Task 5: Verify shell behavior in a real browser** `[BD:STG-107]`
  - **Type**: task
  - **Do**: Run the shell suite in a real browser and in offline mode. Confirm routing, shell rendering, offline indicator behavior, service worker registration, and reconnect flow all behave as expected.
  - **Files**: `apps/web/tests/e2e/`, local browser profile
  - **Verify**: `pnpm --filter web test:e2e && pnpm test:offline`
  - **Accept**: The PWA shell is proven in a browser, not just in jsdom

- [ ] **Task 6: Update manifest** `[BD:STG-108]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-ui-pwa`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-ui-pwa`, progress = `18 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-ui-pwa" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and component/page work can build on a real PWA shell

---

## Discovered Tasks

_None yet._
