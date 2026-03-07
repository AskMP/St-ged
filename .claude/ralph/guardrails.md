# Guardrails

## Sign: Zustand localStorage injection for E2E tests
- **Trigger**: When setting Zustand persist store state in Playwright E2E tests
- **Instruction**: Use `page.addInitScript()` to set localStorage BEFORE `page.goto()`. Never use `page.evaluate()` to set state that Zustand reads at mount time -- the store is already hydrated and won't react to post-mount localStorage changes. Pattern: `await page.addInitScript((val) => localStorage.setItem(key, JSON.stringify(val)), storeValue)` then `await page.goto(...)`.
- **Context**: Iteration 6 -- setOnboardingComplete used page.evaluate which couldn't update already-mounted Zustand stores.

## Sign: Component testids must cover ALL render states
- **Trigger**: When testing a React component that conditionally renders different JSX (loading/error/success states)
- **Instruction**: Ensure `data-testid` is present on the outermost element in EVERY conditional return path (loading, error, empty, success). If testid is only on the success state, tests without a live API will fail to find it.
- **Context**: Iteration 6 -- RecipeDetail only had data-testid="recipe-detail" on the success path; loading and error states had plain divs.

## Sign: Tailwind CSS not wired in web app
- **Trigger**: When building any UI feature or checking CSS styling in the browser
- **Instruction**: Verify that `apps/web/src/index.css` exists with `@import "tailwindcss"`, that `main.tsx` imports it, and that `vite.config.ts` includes `tailwindcss()` from `@tailwindcss/vite`. If any of these are missing, fix them before continuing UI work.
- **Context**: Iteration 5 -- Tailwind was installed but never wired into the app; all class names rendered as unstyled HTML until fixed.

