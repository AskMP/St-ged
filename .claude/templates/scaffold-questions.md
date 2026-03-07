# Scaffold Q&A Decision Tree

This document is a human-readable reference for the complete project scaffolding question flow. Agents use `skills/project-scaffold/skill.md` as the authoritative source.

## How It Works

The scaffold system uses **progressive disclosure** -- questions are shown one phase at a time, and later phases adapt based on earlier answers. Entire phases may be skipped when irrelevant (e.g., styling questions are hidden for backend-only projects). Each question has a sensible default shown in brackets; the user presses Enter to accept or types a different choice.

After all phases, a summary table is presented for confirmation before any files are generated.

---

## Phase 1: Foundation

Core project identity and language choices. Every project goes through this phase.

| # | Question | Options | Default | Notes |
|---|----------|---------|---------|-------|
| 1 | Project name | free text | (from arg) | Used for directory, package name, and PRD |
| 2 | Project location | path or choice | `./<project-name>/` | If path arg given, used directly (no sub-dir). Otherwise: cwd sub-dir, git root sub-dir, or custom path |
| 3 | Language | TypeScript, Python, Go, Rust, Java | TypeScript | Drives all downstream conditional logic |
| 4 | Framework | (see table below) | (first in list) | Determines frontend vs. backend classification |
| 5 | Package manager | (see table below) | pnpm / uv | Skipped for Go and Rust (built-in tooling) |
| 6 | Monorepo? | Yes, No | No | If Yes + TypeScript, asks Turborepo vs. Nx |
| 7 | AI coding agent | Claude Code, Cursor, GitHub Copilot, Windsurf, OpenAI Codex, Kilo Code, Cline, Aider, Generic/Other | Claude Code | Determines which config files are generated |

### Framework Options

| Language | Frameworks |
|----------|-----------|
| TypeScript | Next.js (App Router), Vite+React, Vite+Vue, Vite+Svelte, Express, Fastify, NestJS, Hono |
| Python | FastAPI, Django, Flask |
| Go | Gin, Echo, Fiber, Chi, stdlib net/http |
| Rust | Axum, Actix-web, Rocket |
| Java | Spring Boot, Quarkus, Micronaut |

### Frontend vs. Backend Classification

| Type | Frameworks |
|------|-----------|
| **Frontend** (triggers Phase 4) | Next.js, Vite+React, Vite+Vue, Vite+Svelte |
| **Backend** (skips Phase 4) | Express, Fastify, NestJS, Hono, FastAPI, Django, Flask, Gin, Echo, Fiber, Chi, net/http, Axum, Actix-web, Rocket, Spring Boot, Quarkus, Micronaut |
| **Full-stack** (both phases) | Next.js (has both frontend and API routes) |

### Package Manager Options

| Language | Options | Default |
|----------|---------|---------|
| TypeScript | npm, yarn, pnpm, bun | pnpm |
| Python | pip, poetry, uv | uv |
| Go | (go modules -- automatic) | -- |
| Rust | (cargo -- automatic) | -- |
| Java | Maven, Gradle | Maven |

---

## Phase 2: Development Tools

Task management, linting, formatting, and git workflow configuration.

| # | Question | Options | Default | Notes |
|---|----------|---------|---------|-------|
| 1 | Task management | bd (beads), GitHub Issues, Linear, Jira, None | bd (beads) | First PRD task sets this up; agents depend on it |
| 2 | Linting | (auto by language) | Auto | Shown as informational, not a choice |
| 3 | Pre-commit hooks | Yes, No | Yes | Tool depends on language |
| 4 | Git branching | feature branches, trunk-based | feature branches | Affects CLAUDE.md conventions |

### Task Management Options

| Option | Best For | Agent Integration | Notes |
|--------|----------|------------------|-------|
| **bd (beads)** | Solo / small team AI dev | Native — coordinator, task-manager agent, task-management skill all use bd directly | Local-first, no external deps, instant setup (`bd init`) |
| **GitHub Issues** | Open source, team visibility | Via `gh issue` CLI — agents can create/update/close issues | Needs GitHub token, links to PRs natively |
| **Linear** | Modern teams, roadmaps | Via API — requires custom config, agents fall back to PRD checklists until configured | Paid for teams, excellent API |
| **Jira** | Enterprise, compliance | Via API — requires custom config, agents fall back to PRD checklists until configured | Heavy setup, complex workflows |
| **None** | Prototyping, throwaway | PRD checklists only — no task coordination between agents | No progress tracking or history |

### Linting and Hook Tools by Language

| Language | Linter + Formatter | Hook Tool |
|----------|-------------------|-----------|
| TypeScript | ESLint + Prettier | Husky + lint-staged |
| Python | Ruff (lint + format) | pre-commit framework |
| Go | golangci-lint + gofmt | golangci-lint pre-commit |
| Rust | clippy + rustfmt | cargo fmt/clippy pre-commit |
| Java | Checkstyle + google-java-format | pre-commit framework |

---

## Phase 3: Governance & Quality

| # | Question | Options | Default | Notes |
|---|----------|---------|---------|-------|
| 1 | Governance tier | Minimal, Standard, Full | Standard | Each tier includes all rules from lower tiers |

### Tier Summary

| Tier | Rules | Key Features |
|------|-------|-------------|
| Minimal | 5 | Permission deny-list, auto-format, branch naming, ASCII punctuation, thin main module |
| Standard | +10 | LOC thresholds (400/file), agent identity, review labels, domain purity, evidence gathering, coverage consistency |
| Full | +15 | Multi-mind review, proactive playbooks, strict feature workflow, Five Whys, glossary |

---

## Phase 4: Styling

**Condition: Only shown if a frontend framework was selected in Phase 1.**

| # | Question | Options | Default | Notes |
|---|----------|---------|---------|-------|
| 1 | CSS approach | Tailwind, CSS Modules, styled-components, Sass/SCSS, None | Tailwind | |
| 2 | Component library | shadcn/ui, Radix UI, Headless UI, Material UI, Chakra UI, None | shadcn/ui (if Tailwind) | Skipped if CSS = None |
| 3 | Storybook? | Yes, No | Yes | |

### Component Library Defaults

| CSS Approach | Default Component Library |
|-------------|--------------------------|
| Tailwind | shadcn/ui |
| CSS Modules | Radix UI |
| styled-components | Radix UI |
| Sass/SCSS | None |
| None | (question skipped) |

---

## Phase 5: Backend & Data

API design and data layer choices.

| # | Question | Options | Default | Notes |
|---|----------|---------|---------|-------|
| 1 | API style | REST, GraphQL, tRPC, gRPC, None | REST | tRPC only for TypeScript |
| 2 | Database | PostgreSQL, MySQL, MongoDB, SQLite, Redis, None | PostgreSQL | |
| 3 | ORM / query tool | (see table below) | (first in list) | Skipped if Database = None or Redis |
| 4 | Cache layer | Redis, None | None | Defaults to Redis if DB already includes Redis |

### ORM Options

| Language | DB Type | Options | Default |
|----------|---------|---------|---------|
| TypeScript | SQL | Prisma, Drizzle, TypeORM | Prisma |
| TypeScript | MongoDB | Mongoose | Mongoose |
| Python | SQL | SQLAlchemy + Alembic, Django ORM*, Tortoise | SQLAlchemy + Alembic |
| Python | MongoDB | Motor, Beanie | Beanie |
| Go | SQL | GORM, sqlc, sqlx | GORM |
| Go | MongoDB | mongo-driver | mongo-driver |
| Rust | SQL | Diesel, sqlx, SeaORM | sqlx |
| Rust | MongoDB | mongodb crate | mongodb crate |
| Java | SQL | Spring Data JPA, jOOQ, MyBatis | Spring Data JPA |
| Java | MongoDB | Spring Data MongoDB | Spring Data MongoDB |

*Django ORM only shown when Framework = Django.

---

## Phase 6: Authentication

**Condition: Only shown if a backend framework is selected or API style is not None.**

| # | Question | Options | Default | Notes |
|---|----------|---------|---------|-------|
| 1 | Auth strategy | (see table below) | (conditional) | |

### Auth Options by Framework

| Framework | Options | Default |
|-----------|---------|---------|
| Next.js | NextAuth/Auth.js, Clerk, Supabase Auth, Firebase Auth, Custom JWT, None | NextAuth/Auth.js |
| Express / Fastify / NestJS / Hono | Passport.js, Custom JWT, Clerk, Supabase Auth, None | Custom JWT |
| FastAPI / Flask | Custom JWT, Authlib, None | Custom JWT |
| Django | Django Auth, django-allauth, Custom JWT, None | Django Auth |
| Go (all) | Custom JWT, None | Custom JWT |
| Rust (all) | Custom JWT, None | Custom JWT |
| Spring Boot | Spring Security, Custom JWT, None | Spring Security |
| Quarkus / Micronaut | Custom JWT, None | Custom JWT |

---

## Phase 7: Testing

| # | Question | Options | Default | Notes |
|---|----------|---------|---------|-------|
| 1 | Unit test runner | (see table below) | Auto | Skipped if only one option |
| 2 | E2E testing | Playwright, Cypress, None | Playwright* | *Only if frontend; otherwise skipped |
| 3 | Coverage target | 60%, 75%, 85%, 90% | 75% | |

### Test Runner by Language

| Language | Options | Default | Choice needed? |
|----------|---------|---------|---------------|
| TypeScript | Vitest, Jest | Vitest | Yes |
| Python | pytest | pytest | No (auto) |
| Go | go test | go test | No (auto) |
| Rust | cargo test | cargo test | No (auto) |
| Java | JUnit 5, TestNG | JUnit 5 | Yes |

---

## Phase 8: Deployment & Infrastructure

| # | Question | Options | Default | Notes |
|---|----------|---------|---------|-------|
| 1 | Deployment target | Vercel, Netlify, Railway, Render, Fly.io, AWS, GCP, Azure, Docker only, None | (conditional) | |
| 2 | Docker? | Yes, No | Yes | Skipped if target = Docker only |
| 3 | CI/CD | GitHub Actions, GitLab CI, None | GitHub Actions | |

### Deployment Defaults by Framework

| Framework | Default Deployment |
|-----------|-------------------|
| Next.js | Vercel |
| Vite+React / Vite+Vue / Vite+Svelte | Netlify |
| All other frameworks | Docker only |

---

## Conditional Logic Map

This section summarizes which answers trigger which follow-up behavior across all phases.

### Language Selection Cascades

```
Language = TypeScript
  -> Framework options: Next.js, Vite+React, Vite+Vue, Vite+Svelte, Express, Fastify, NestJS, Hono
  -> Package manager: npm, yarn, pnpm, bun (default: pnpm)
  -> Linting: ESLint + Prettier
  -> Hooks: Husky + lint-staged
  -> Test runner choice: Vitest vs. Jest
  -> tRPC available in API style options

Language = Python
  -> Framework options: FastAPI, Django, Flask
  -> Package manager: pip, poetry, uv (default: uv)
  -> Linting: Ruff
  -> Hooks: pre-commit framework
  -> Test runner: pytest (auto, no choice)

Language = Go
  -> Framework options: Gin, Echo, Fiber, Chi, stdlib net/http
  -> Package manager: skipped (go modules)
  -> Linting: golangci-lint
  -> Test runner: go test (auto, no choice)

Language = Rust
  -> Framework options: Axum, Actix-web, Rocket
  -> Package manager: skipped (cargo)
  -> Linting: clippy + rustfmt
  -> Test runner: cargo test (auto, no choice)

Language = Java
  -> Framework options: Spring Boot, Quarkus, Micronaut
  -> Package manager: Maven, Gradle (default: Maven)
  -> Linting: Checkstyle + google-java-format
  -> Test runner choice: JUnit 5 vs. TestNG
```

### Framework Selection Cascades

```
Framework = Next.js
  -> Phase 4 (Styling): shown
  -> Auth default: NextAuth/Auth.js
  -> Deployment default: Vercel
  -> E2E testing: shown (Playwright default)

Framework = Vite+React/Vue/Svelte
  -> Phase 4 (Styling): shown
  -> Phase 5 (Auth): skipped unless API style != None
  -> Deployment default: Netlify
  -> E2E testing: shown (Playwright default)

Framework = Express/Fastify/NestJS/Hono (backend TS)
  -> Phase 4 (Styling): skipped
  -> Auth default: Custom JWT
  -> Deployment default: Docker only
  -> E2E testing: skipped

Framework = Django
  -> ORM: Django ORM available
  -> Auth default: Django Auth (built-in)
```

### Database Selection Cascades

```
Database = PostgreSQL
  -> ORM question: shown (options by language)
  -> MCP suggestion: server-postgres

Database = MongoDB
  -> ORM question: shown (MongoDB-specific options)
  -> No server-postgres MCP suggestion

Database = Redis (alone)
  -> ORM question: skipped
  -> Cache question: defaults to Redis

Database = None
  -> ORM question: skipped
  -> Phase 5 may still show if backend framework selected
```

### Governance Selection Cascades

```
Governance = Minimal
  -> Hooks: ascii-punctuation.sh active, check-loc-threshold.sh NOT deployed
  -> Commands: none governance-specific
  -> AGENTS.md: thin main + ASCII punctuation rules only
  -> settings.json: permission deny-list active

Governance = Standard
  -> Hooks: ascii-punctuation.sh + check-loc-threshold.sh active
  -> Commands: evidence-gather + code-review-audit imported
  -> AGENTS.md: agent identity, review labels, LOC thresholds, domain purity, contract drift, coverage consistency
  -> settings.json: permission deny-list active

Governance = Full
  -> Hooks: ascii-punctuation.sh + check-loc-threshold.sh active
  -> Commands: evidence-gather + code-review-audit + code-review-multi-mind + solve-strict imported
  -> AGENTS.md: everything in Standard + proactive playbooks, frontend anti-monolith, glossary reference, Five Whys
  -> settings.json: permission deny-list active
```

### Styling Selection Cascades

```
CSS = Tailwind
  -> Component library default: shadcn/ui

CSS = CSS Modules / styled-components
  -> Component library default: Radix UI

CSS = None
  -> Component library question: skipped
```

---

## Output Files

After confirmation, the scaffold generates config files in the chosen project root. The exact files depend on the selected AI agent:

### Always generated (all agents)

| Output | Source | Description |
|--------|--------|-------------|
| `AGENTS.md` | `templates/AGENTS.md.template` | Universal project config (portable across AI agents) |
| `prd-phases/manifest.md` | `templates/manifest-template.md` | Multi-PRD manifest with registry and chaining |
| `prd-phases/00-foundation/` | `templates/prd-multi-template.md` | Individual PRD files for setup tasks |
| `src/` (varies) | (generated) | Skeleton directory structure for the framework |

### Claude Code only

| Output | Source | Description |
|--------|--------|-------------|
| `.claude/agents/` | crucible-templates | All agent definitions (13 files) |
| `.claude/skills/` | crucible-templates | All skill definitions (14 files) |
| `.claude/commands/` | crucible-templates | All command definitions (19 files) |
| `.claude/hooks/` | crucible-templates | All hook scripts (12 files) |
| `.claude/scripts/` | crucible-templates | Ralph loop scripts (2 files) |
| `.claude/templates/` | crucible-templates | Reference templates (19+ files) |
| `.claude/known-errors.md` | crucible-templates | Known error solutions |
| `CLAUDE.md` | `templates/CLAUDE.md.template` | Project config with tech stack, conventions, agent imports (extends AGENTS.md) |
| `.claude/settings.json` | `templates/settings.json.template` | Hook config tuned to chosen language and tools |

### Other agents (conditional on Q7)

| Agent | Output file(s) | Source |
|-------|---------------|--------|
| Cursor | `.cursorrules`, `.cursor/rules/project.md` | `templates/agent-configs/cursorrules.template` |
| GitHub Copilot | `.github/copilot-instructions.md` | `templates/agent-configs/copilot-instructions.template` |
| Windsurf | `.windsurfrules` | `templates/agent-configs/windsurfrules.template` |
| Kilo Code | `.kilo/rules.md` | `templates/agent-configs/kilo-rules.template` |
| Cline | `.clinerules` | `templates/agent-configs/clinerules.template` |
| Aider | `.aider.conf.yml`, `CONVENTIONS.md` | `templates/agent-configs/aider-*.template` |
| OpenAI Codex | *(AGENTS.md only)* | — |
| Generic/Other | *(AGENTS.md only)* | — |

### What Gets Generated vs. What Ralph Builds

| Scaffold deploys/generates (files on disk) | Ralph builds (via PRD tasks) |
|---------------------------------------------|------------------------------|
| AGENTS.md (universal project config) | Task management setup (bd init, create tasks, set deps) |
| Agent-specific config (CLAUDE.md + .claude/, or .cursorrules, etc.) | Framework initialization (CLI) |
| settings.json (hooks — Claude Code only) | Dependency installation |
| prd-phases/manifest.md + prd-phases/00-foundation/ (multi-PRD task plan) | Linting and formatting config |
| Empty directory skeleton | Database and ORM setup |
| | Auth scaffolding |
| | Test configuration |
| | Docker and CI/CD files |
| | Initial routes/pages/components |
