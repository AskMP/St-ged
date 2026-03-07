# Guardrails

## Sign: Tailwind CSS not wired in web app
- **Trigger**: When building any UI feature or checking CSS styling in the browser
- **Instruction**: Verify that `apps/web/src/index.css` exists with `@import "tailwindcss"`, that `main.tsx` imports it, and that `vite.config.ts` includes `tailwindcss()` from `@tailwindcss/vite`. If any of these are missing, fix them before continuing UI work.
- **Context**: Iteration 5 -- Tailwind was installed but never wired into the app; all class names rendered as unstyled HTML until fixed.

