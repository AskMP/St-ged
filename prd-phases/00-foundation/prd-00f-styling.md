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

Installs and configures Tailwind CSS v4, Radix UI primitives, and the project's first real design system. Establishes bold design tokens, expressive typography, motion-ready primitives, and validates that the local `frontend-design` skill guidance is being followed from the start. By the end, `pnpm --filter web build` succeeds and the web app renders a distinct, non-generic aesthetic in a real browser.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00b | Vite+React app skeleton with `src/App.tsx` | `apps/web/` |

### Key Files to Read First

- `CLAUDE.md` -- design language, Tailwind v4, Radix UI
- `.claude/skills/frontend-design/skill.md` -- local frontend-design skill guidelines
- `apps/web/vite.config.ts` -- current Vite config
- `apps/web/src/App.tsx` -- current placeholder

### Patterns to Follow

```css
/* apps/web/src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* Stàged editorial-industrial tokens */
  --color-ink: #13110f;
  --color-bone: #f4ede2;
  --color-brass: #b57a2f;
  --color-brass-deep: #8a5920;
  --color-smoke: #6d6a63;
  --color-steel: #9ea3ad;
  --color-danger: #b9412e;
  --color-success: #2b8a57;

  --font-family-display: 'Cormorant Garamond', Georgia, serif;
  --font-family-body: 'IBM Plex Sans', sans-serif;
  --font-family-mono: 'IBM Plex Mono', monospace;

  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
}

body {
  background:
    radial-gradient(circle at top, rgba(181, 122, 47, 0.18), transparent 35%),
    linear-gradient(180deg, #201a16 0%, #13110f 55%, #0f0d0b 100%);
  color: var(--color-bone);
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]',
        variant === 'primary' && 'bg-[var(--color-brass)] text-[var(--color-ink)] hover:bg-[var(--color-brass-deep)]',
        variant === 'ghost' && 'border border-[var(--color-steel)] text-[var(--color-bone)] hover:border-[var(--color-bone)]',
        variant === 'danger' && 'bg-[var(--color-danger)] text-[var(--color-bone)] hover:opacity-90',
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

- [x] **Task 1: Install Tailwind CSS v4 and configure** `[BD:STG-33]`
  - **Type**: task
  - **Do**: Add `tailwindcss@^4`, `@tailwindcss/vite@^4`, `@fontsource/cormorant-garamond`, `@fontsource/ibm-plex-sans`, and `@fontsource/ibm-plex-mono` to `apps/web`. Update `apps/web/vite.config.ts` to add the `@tailwindcss/vite` plugin. Create `apps/web/src/styles/globals.css` with the full CSS shown in the patterns above and import the chosen font packages. Import `globals.css` in `apps/web/src/main.tsx`. Remove any existing `index.css` if present.
  - **Files**: `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/src/styles/globals.css`, `apps/web/src/main.tsx`
  - **Verify**: `pnpm --filter web build` completes without errors; Tailwind classes in `App.tsx` produce CSS output
  - **Accept**: Build succeeds; expressive fonts and design tokens are available as CSS custom properties

- [x] **Task 2: Install Radix UI primitives** `[BD:STG-34]`
  - **Type**: task
  - **Do**: Add `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-checkbox`, `@radix-ui/react-switch`, `@radix-ui/react-label`, `@radix-ui/react-toast`, `@radix-ui/react-progress` to `apps/web` dependencies. Add `clsx` and `tailwind-merge` as utilities. Create `apps/web/src/lib/cn.ts` exporting a `cn()` utility: `import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...inputs) { return twMerge(clsx(inputs)) }`. Add a short design note in comments or docs describing the chosen aesthetic direction so the UI remains intentional rather than generic.
  - **Files**: `apps/web/package.json`, `apps/web/src/lib/cn.ts`
  - **Verify**: `pnpm install` succeeds; `import { cn } from '@/lib/cn'` resolves in TypeScript
  - **Accept**: Radix UI packages installed; `cn` utility available

- [x] **Task 3: Create primitive UI components** `[BD:STG-35]`
  - **Type**: feature
  - **Do**: Create the following components in `apps/web/src/components/ui/`. Each should use the editorial-industrial design tokens and be built on Radix UI where applicable. Export all from `apps/web/src/components/ui/index.ts`.
    - `Button.tsx` -- primary/ghost/danger variants, sm/md/lg sizes (pattern shown above)
    - `Card.tsx` -- dark card with smoked-metal border; props: `children`, `className`
    - `Badge.tsx` -- small tag for dietary labels (Vegan, GF, etc.); variants: default (steel), eco (brass), alert (danger)
    - `Input.tsx` -- text input with the staged styling; dark background, warm text, steel border, brass focus ring
    - `Checkbox.tsx` -- Radix Checkbox with staged styling (used for grocery list items)
    - `Dialog.tsx` -- Radix Dialog wrapped with atmospheric overlay and panel styling
    - `Toast.tsx` -- Radix Toast for offline sync notifications, success messages
    These components are the design system foundation used by all feature pages.
  - **Files**: `apps/web/src/components/ui/Button.tsx`, `apps/web/src/components/ui/Card.tsx`, `apps/web/src/components/ui/Badge.tsx`, `apps/web/src/components/ui/Input.tsx`, `apps/web/src/components/ui/Checkbox.tsx`, `apps/web/src/components/ui/Dialog.tsx`, `apps/web/src/components/ui/Toast.tsx`, `apps/web/src/components/ui/index.ts`
  - **Verify**: `pnpm --filter web build` succeeds; no TypeScript errors in component files
  - **Accept**: All 7 components exist, build cleanly, and export from the barrel

- [x] **Task 4: Update App.tsx with design system demo** `[BD:STG-36]`
  - **Type**: task
  - **Do**: Update `apps/web/src/App.tsx` to render a simple design system preview: show the project name "Stàged" in the display font, a few Badge components (Vegan, Zero-Waste, Quick), a Button (primary), and an Input. Validate the result in a real browser so typography, spacing, contrast, and motion are inspected outside the build log before feature development begins.
  - **Files**: `apps/web/src/App.tsx`
  - **Verify**: `pnpm --filter web dev` -- browser shows "Stàged" in the chosen display font on the new themed background with styled components visible
  - **Accept**: Design system renders correctly in a browser; the frontend-design skill guidance is visibly reflected; no console errors

- [x] **Task 5: Update manifest** `[BD:STG-37]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00f`. Change `status: pending` to `status: complete`. Update Current State to `6 / 38 PRDs complete`. Confirm `01-ui-pwa` (requires: 00f, 00g) moves closer to unblocked.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00f" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated

---

## Discovered Tasks

_None yet._
