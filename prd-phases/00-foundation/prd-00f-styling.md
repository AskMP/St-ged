---
task: "Styling -- Tailwind CSS v4, Radix UI, frontend-design skill, design tokens"
branch: "stg-00f/styling"
test_command: "pnpm --filter web build"
completion_promise: "COMPLETE"
max_iterations: 8
chain_next: "00g"
requires: ["00b"]
parallel_safe: true
group: 0
manifest_id: "00f"
---

# PRD: Styling Setup

## Context for Agent

### What This PRD Does

Installs and configures Tailwind CSS v4, Radix UI primitives, and the project's "Chef-Noir" design system. Establishes design tokens (colors, typography, spacing), creates a minimal component scaffold, and validates the frontend-design skill is active. By the end, `pnpm --filter web build` succeeds with Tailwind styles applied.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00b | Vite+React app skeleton with `src/App.tsx` | `apps/web/` |

### Key Files to Read First

- `CLAUDE.md` -- design language: "Chef-Noir" (black, white, stainless steel, high-contrast), Tailwind v4, Radix UI
- `.claude/skills/frontend-design/SKILL.md` -- Anthropic Frontend Design skill guidelines
- `apps/web/vite.config.ts` -- current Vite config
- `apps/web/src/App.tsx` -- current placeholder

### Patterns to Follow

```css
/* apps/web/src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* Chef-Noir design tokens */
  --color-chef-black: #0a0a0a;
  --color-chef-white: #f5f5f0;
  --color-chef-steel: #8a9099;
  --color-chef-steel-light: #c4cad1;
  --color-chef-accent: #d4a843;   /* warm gold -- the "flame" accent */
  --color-chef-accent-dim: #8a6b25;
  --color-chef-danger: #c0392b;
  --color-chef-success: #27ae60;

  --font-family-display: 'Playfair Display', Georgia, serif;
  --font-family-body: 'Inter', system-ui, sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
}

/* Base: high-contrast for kitchen/grocery aisle readability */
body {
  background-color: var(--color-chef-black);
  color: var(--color-chef-white);
  font-family: var(--font-family-body);
}
```

```tsx
// apps/web/src/components/Button.tsx -- example Radix-composed component
import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chef-accent',
        variant === 'primary' && 'bg-chef-accent text-chef-black hover:bg-chef-accent-dim',
        variant === 'ghost' && 'border border-chef-steel text-chef-white hover:border-chef-white',
        variant === 'danger' && 'bg-chef-danger text-white hover:opacity-90',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-base',
        size === 'lg' && 'h-12 px-6 text-lg',
        className
      )}
      {...props}
    />
  )
}
```

### Skills and Commands

| Action | Command |
|--------|---------|
| Build web | `pnpm --filter web build` |
| Dev web | `pnpm --filter web dev` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Install Tailwind CSS v4 and configure** `[BD:STG-33]`
  - **Type**: task
  - **Do**: Add `tailwindcss@next` (v4 alpha/beta) and `@tailwindcss/vite` to `apps/web` devDependencies. Update `apps/web/vite.config.ts` to add the `@tailwindcss/vite` plugin. Create `apps/web/src/styles/globals.css` with the full CSS shown in the patterns above (Chef-Noir design tokens). Import `globals.css` in `apps/web/src/main.tsx`. Remove any existing `index.css` if present.
  - **Files**: `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/src/styles/globals.css`, `apps/web/src/main.tsx`
  - **Verify**: `pnpm --filter web build` completes without errors; Tailwind classes in `App.tsx` produce CSS output
  - **Accept**: Build succeeds; design tokens available as CSS custom properties

- [ ] **Task 2: Install Radix UI primitives** `[BD:STG-34]`
  - **Type**: task
  - **Do**: Add `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-checkbox`, `@radix-ui/react-switch`, `@radix-ui/react-label`, `@radix-ui/react-toast`, `@radix-ui/react-progress` to `apps/web` dependencies. Add `clsx` and `tailwind-merge` as utilities. Create `apps/web/src/lib/cn.ts` exporting a `cn()` utility: `import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...inputs) { return twMerge(clsx(inputs)) }`.
  - **Files**: `apps/web/package.json`, `apps/web/src/lib/cn.ts`
  - **Verify**: `pnpm install` succeeds; `import { cn } from '@/lib/cn'` resolves in TypeScript
  - **Accept**: Radix UI packages installed; `cn` utility available

- [ ] **Task 3: Create primitive UI components** `[BD:STG-35]`
  - **Type**: feature
  - **Do**: Create the following components in `apps/web/src/components/ui/`. Each should use the Chef-Noir design tokens and be built on Radix UI where applicable. Export all from `apps/web/src/components/ui/index.ts`.
    - `Button.tsx` -- primary/ghost/danger variants, sm/md/lg sizes (pattern shown above)
    - `Card.tsx` -- dark card with steel border; props: `children`, `className`
    - `Badge.tsx` -- small tag for dietary labels (Vegan, GF, etc.); variants: default (steel), eco (accent gold), alert (danger)
    - `Input.tsx` -- text input with chef-noir styling; dark background, white text, steel border, accent focus ring
    - `Checkbox.tsx` -- Radix Checkbox with chef-noir styling (used for grocery list items)
    - `Dialog.tsx` -- Radix Dialog wrapped with Chef-Noir overlay and panel styling
    - `Toast.tsx` -- Radix Toast for offline sync notifications, success messages
    These components are the design system foundation used by all feature pages.
  - **Files**: `apps/web/src/components/ui/Button.tsx`, `apps/web/src/components/ui/Card.tsx`, `apps/web/src/components/ui/Badge.tsx`, `apps/web/src/components/ui/Input.tsx`, `apps/web/src/components/ui/Checkbox.tsx`, `apps/web/src/components/ui/Dialog.tsx`, `apps/web/src/components/ui/Toast.tsx`, `apps/web/src/components/ui/index.ts`
  - **Verify**: `pnpm --filter web build` succeeds; no TypeScript errors in component files
  - **Accept**: All 7 components exist, build cleanly, and export from the barrel

- [ ] **Task 4: Update App.tsx with design system demo** `[BD:STG-36]`
  - **Type**: task
  - **Do**: Update `apps/web/src/App.tsx` to render a simple design system preview: show the project name "Stàged" in the display font, a few Badge components (Vegan, Zero-Waste, Quick), a Button (primary), and an Input. This validates the entire styling stack works in the browser before feature development begins.
  - **Files**: `apps/web/src/App.tsx`
  - **Verify**: `pnpm --filter web dev` -- browser shows "Stàged" in Playfair Display font on a dark background with styled components visible
  - **Accept**: Design system renders correctly; Chef-Noir theme visible; no console errors

- [ ] **Task 5: Update manifest** `[BD:STG-37]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00f`. Change `status: pending` to `status: complete`. Update Current State accordingly. Confirm `01-ui-pwa` (requires: 00f, 00g) moves closer to unblocked.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00f" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated

---

## Discovered Tasks

_None yet._
