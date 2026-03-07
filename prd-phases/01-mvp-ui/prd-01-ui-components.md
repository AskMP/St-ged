---
task: "MVP UI components -- shared design system for recipes, lists, filters, avatars, and nutrition"
branch: "stg-01-ui-components/design-system"
test_command: "pnpm --filter web test && pnpm --filter web test:e2e"
completion_promise: "COMPLETE"
max_iterations: 10
chain_next: "01-pages-onboarding"
requires: ["01-ui-pwa"]
parallel_safe: false
group: 1
manifest_id: "01-ui-components"
---

# PRD: MVP UI Components

## Context for Agent

### What This PRD Does

Builds the first feature-grade design system components on top of the shell and primitives: recipe cards, grocery items, household avatars, filter chips, nutrition badges, and supporting empty/loading states. This PRD is where the product stops looking like scaffolding and starts looking intentional.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00f | Styling tokens and primitive UI components | `apps/web/src/components/ui/`, `apps/web/src/styles/` |
| 01-ui-pwa | Real app shell and route scaffolding | `apps/web/src/App.tsx`, `apps/web/src/routes/` |

### Key Files to Read First

- `apps/web/src/components/ui/`
- `.claude/skills/frontend-design/skill.md`
- `docs/features.md`

### Patterns to Follow

- Reuse tokens and non-generic typography from the styling PRD
- Test components in isolation and through at least one real route/gallery surface
- Motion, states, and responsive behavior should feel deliberate, not default

### Skills and Commands

| Action | Command |
|--------|---------|
| Run web tests | `pnpm --filter web test` |
| Run browser smoke | `pnpm --filter web test:e2e` |
| Start dev server | `pnpm --filter web dev` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Problem-Solving Protocol

1. Start with failing component and route-harness tests
2. Preserve the established visual direction; do not fall back to generic defaults
3. Add accessible states as part of the first pass, not as cleanup
4. Validate components in a real browser route before calling them done

---

## Tasks

- [ ] **Task 1: Add failing component and gallery-route tests** `[BD:STG-109]`
  - **Type**: task
  - **Do**: Add component tests and at least one route-level gallery/testbed route that fails until the new design-system components are present and wired into the app. Cover visual states and accessibility labels where relevant.
  - **Files**: `apps/web/tests/unit/components.test.tsx`, `apps/web/tests/unit/component-gallery.test.tsx`
  - **Verify**: The component suite fails before implementation
  - **Accept**: Design-system expectations are explicit before code changes

- [ ] **Task 2: Implement feature-grade shared components** `[BD:STG-110]`
  - **Type**: feature
  - **Do**: Implement `RecipeCard`, `GroceryItem`, `HouseholdAvatar`, `FilterChip`, `NutritionBadge`, and any essential loading/empty helpers needed by the MVP pages. Export them through the established barrels and keep responsive/mobile states strong.
  - **Files**: `apps/web/src/components/`, `apps/web/src/components/index.ts`
  - **Verify**: Component tests pass
  - **Accept**: MVP pages have a reusable component set that matches the product aesthetic

- [ ] **Task 3: Add motion, state variants, and accessibility refinements** `[BD:STG-111]`
  - **Type**: feature
  - **Do**: Add loading, selected, disabled, and success/error states plus a restrained but intentional motion layer for reveal and interaction moments. Ensure focus states and screen-reader labels remain intact.
  - **Files**: `apps/web/src/components/`, `apps/web/src/styles/`
  - **Verify**: Updated tests cover state variants and focus behavior
  - **Accept**: Components feel production-grade rather than static mockups

- [ ] **Task 4: Verify the component system in a browser route** `[BD:STG-112]`
  - **Type**: task
  - **Do**: Render the component gallery/testbed route in a real browser and confirm layout, motion, contrast, and responsive behavior feel intentional on desktop and mobile-emulation viewports.
  - **Files**: `apps/web/src/routes/`, `apps/web/tests/e2e/component-gallery.spec.ts`
  - **Verify**: `pnpm --filter web test:e2e`
  - **Accept**: Components are proven in a browser route, not just snapshot-like tests

- [ ] **Task 5: Update manifest** `[BD:STG-113]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `01-ui-components`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `01-ui-components`, progress = `19 / 38 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "01-ui-components" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated and the onboarding page can build on shared components

---

## Discovered Tasks

_None yet._
