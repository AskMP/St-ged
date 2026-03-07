---
task: "Code quality -- ESLint, Prettier, Husky, lint-staged, TypeScript strict"
branch: "stg-00c/code-quality"
test_command: "pnpm lint"
completion_promise: "COMPLETE"
max_iterations: 8
chain_next: "00f"
requires: ["00b"]
parallel_safe: true
group: 0
manifest_id: "00c"
---

# PRD: Code Quality Setup

## Context for Agent

### What This PRD Does

Installs and configures ESLint, Prettier, Husky pre-commit hooks, and lint-staged for the monorepo. Adds `pnpm lint` and `pnpm format` scripts. Enforces TypeScript strict mode across all packages. This PRD runs in parallel with 00d (database setup) since they touch different files.

### What Was Built Before This

| PRD | Key Output | Files |
|-----|-----------|-------|
| 00b | Turborepo monorepo, app skeletons | `package.json`, `turbo.json`, `tsconfig.json`, `apps/`, `packages/` |

### Key Files to Read First

- `CLAUDE.md` -- coding conventions (ESLint + Prettier specified)
- `apps/web/package.json` -- web app dependencies
- `apps/api/package.json` -- api app dependencies

### Patterns to Follow

```js
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

```js
// eslint.config.mjs (root, flat config)
import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
```

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yaml,yml}": ["prettier --write"]
}
```

### Skills and Commands

| Action | Command |
|--------|---------|
| Run lint | `pnpm lint` |
| Fix lint | `pnpm lint:fix` |
| Format | `pnpm format` |
| Set task in-progress | `bd update STG-ID -s in_progress` |
| Close task | `bd close STG-ID` |

---

## Tasks

- [ ] **Task 1: Install ESLint and Prettier** `[BD:STG-14]`
  - **Type**: task
  - **Do**: Add to root devDependencies: `eslint@9`, `@eslint/js`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `prettier`, `eslint-config-prettier`. Run `pnpm install`. Create `.prettierrc` at project root with the config pattern shown above. Create `.prettierignore` ignoring `node_modules/`, `dist/`, `.turbo/`, `prd-phases/`, `docs/`.
  - **Files**: `package.json`, `.prettierrc`, `.prettierignore`
  - **Verify**: `pnpm exec prettier --version` prints a version string
  - **Accept**: Prettier and ESLint installed; `.prettierrc` exists with correct config

- [ ] **Task 2: Create ESLint flat config** `[BD:STG-15]`
  - **Type**: task
  - **Do**: Create `eslint.config.mjs` at project root using the flat config pattern shown above. Add `ignores` for `node_modules/`, `dist/`, `.turbo/`. Add `pnpm lint` script to root package.json: `turbo run lint`. Add `lint` task to each app's `package.json`: `eslint src/`. Add `lint` task to `turbo.json` pipeline.
  - **Files**: `eslint.config.mjs`, `package.json`, `apps/web/package.json`, `apps/api/package.json`, `turbo.json`
  - **Verify**: `pnpm lint` runs without crashing (warnings ok; errors from stub files not yet written are acceptable -- fix them or add targeted ignores)
  - **Accept**: `pnpm lint` exits 0 on the current codebase

- [ ] **Task 3: Install and configure Husky + lint-staged** `[BD:STG-16]`
  - **Type**: task
  - **Do**: Run `pnpm exec husky init` from the project root (creates `.husky/` directory and installs the prepare script). Create `.husky/pre-commit` with content: `pnpm exec lint-staged`. Add `lint-staged` to root devDependencies. Run `pnpm install`. Create `.lintstagedrc.json` at root with the pattern shown above (lint + format TS/TSX files, format JSON/MD/YAML).
  - **Files**: `.husky/pre-commit`, `.lintstagedrc.json`, `package.json`
  - **Verify**: `.husky/pre-commit` is executable; `pnpm exec lint-staged --help` exits 0
  - **Accept**: Husky pre-commit hook installed; lint-staged config present

- [ ] **Task 4: Add format scripts and CI lint command** `[BD:STG-17]`
  - **Type**: task
  - **Do**: Add `format` script to root package.json: `prettier --write "**/*.{ts,tsx,json,md,yaml}"`. Add `format:check` script: `prettier --check "**/*.{ts,tsx,json,md,yaml}"` (used in CI). Run `pnpm format` on the current codebase to normalize all files.
  - **Files**: `package.json` (scripts updated); all source files (formatted in-place)
  - **Verify**: `pnpm format:check` exits 0 after running `pnpm format`
  - **Accept**: All current files pass prettier check

- [ ] **Task 5: Update manifest** `[BD:STG-18]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00c`. Change `status: pending` to `status: complete`. Update Current State: "Last completed PRD" = `00c`, increment progress to `3 / 29 PRDs complete`.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00c" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest updated; progress = 3/29

---

## Discovered Tasks

_None yet._
