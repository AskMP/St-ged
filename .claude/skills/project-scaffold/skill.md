---
name: "project-scaffold"
description: "Interactive Q&A-driven project scaffolding with progressive disclosure"
auto_invoke: false
triggers: ["project initialization", "new project setup", "scaffolding"]
---

# Project Scaffold

## Instructions

### 1. Q&A Phases (Progressive Disclosure)

Present questions one phase at a time. Only show phases and questions that are relevant based on prior answers. Show defaults in brackets -- the user can press Enter to accept or type a different choice.

---

#### Phase 1: Foundation

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | Project name | free text | (from command arg, or prompt) |
| 2 | Project location | free text path, or choose from options | (see below) |
| 3 | Language | TypeScript, Python, Go, Rust, Java | TypeScript |
| 4 | Framework | (conditional on language) | (first in list) |
| 5 | Package manager | (conditional on language) | pnpm (TS), uv (Python) |
| 6 | Monorepo? | Yes (Turborepo/Nx), No | No |
| 7 | AI coding agent | Claude Code, Cursor, GitHub Copilot, Windsurf, OpenAI Codex, Kilo Code, Cline, Aider, Generic/Other | Claude Code |

**AI coding agent conditional logic:**

The selected AI agent determines which config files are generated alongside AGENTS.md:

| Agent | Config files generated | Notes |
|-------|----------------------|-------|
| **Claude Code** | `CLAUDE.md`, `.claude/settings.json`, `.claude/` infrastructure | Full agent system with @import directives, hooks, skills, commands |
| **Cursor** | `.cursorrules`, `.cursor/rules/project.md` | Self-contained config referencing AGENTS.md |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Self-contained config referencing AGENTS.md |
| **Windsurf** | `.windsurfrules` | Self-contained config referencing AGENTS.md |
| **OpenAI Codex** | *(AGENTS.md only)* | No additional config file needed |
| **Kilo Code** | `.kilo/rules.md` | Self-contained config referencing AGENTS.md |
| **Cline** | `.clinerules` | Self-contained config referencing AGENTS.md |
| **Aider** | `.aider.conf.yml`, `CONVENTIONS.md` | YAML config + conventions file referencing AGENTS.md |
| **Generic/Other** | *(AGENTS.md only)* | Universal config only — user configures their agent manually |

All agents always get `AGENTS.md` + `prd-phases/manifest.md` + `prd-phases/<group>/` PRD files. Only Claude Code gets the full `.claude/` infrastructure deployment.

**Project location logic:**
- If a path was provided as a second arg to `/forge-scaffold` (e.g., `/forge-scaffold my-app /path/to/dir`), use that path directly as the project root. Do NOT create a sub-directory — generate all assets directly in the specified path.
- If no path was provided, present options:
  1. `./<project-name>/` — sub-directory of the current working directory (default)
  2. `<current-repo-root>/<project-name>/` — sub-directory of the nearest git root (shown only if cwd is inside a git repo and differs from option 1)
  3. Custom path — user types a full path
- The chosen path becomes the **project root**. All generated files (`CLAUDE.md`, `.claude/`, `prd-phases/manifest.md`, `prd-phases/<group>/`, `src/`, etc.) go directly into this directory.
- Create the directory if it doesn't exist. If it already exists and contains files, warn and ask before proceeding.

**Framework options by language:**

- **TypeScript**: Next.js (App Router), Vite+React, Vite+Vue, Vite+Svelte, Express, Fastify, NestJS, Hono
- **Python**: FastAPI, Django, Flask
- **Go**: Gin, Echo, Fiber, Chi, stdlib net/http
- **Rust**: Axum, Actix-web, Rocket
- **Java**: Spring Boot, Quarkus, Micronaut

**Package manager options by language:**

- **TypeScript**: npm, yarn, pnpm, bun
- **Python**: pip, poetry, uv
- **Go**: go modules (automatic, no choice needed)
- **Rust**: cargo (automatic, no choice needed)
- **Java**: Maven, Gradle

**Conditional logic:**
- If Language = Go or Rust, skip the package manager question (built-in tooling).
- If Monorepo = Yes and Language = TypeScript, ask: "Monorepo tool?" with options Turborepo, Nx.

---

#### Phase 2: Development Tools

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | Task management | bd (beads), GitHub Issues, Linear, Jira, Claude built-in tasks, None | bd (beads) |
| 2 | Linting | (auto by language) | Auto |
| 3 | Pre-commit hooks | Yes, No | Yes |
| 4 | Git branching strategy | feature branches, trunk-based | feature branches |

**Task management constraint**: Claude built-in tasks (TaskCreate/TaskUpdate/TaskList) are only available when the AI agent is Claude Code. If a different agent was selected in Phase 1 Q7, remove "Claude built-in tasks" from the options list.

**Task management options:**

| Option | Benefits | Trade-offs |
|--------|----------|------------|
| **bd (beads)** | Built into Claude Forge agents. Local-first, no external service. Agents can create/update/close tasks autonomously. Branch naming, commit notes, and coordinator all integrate natively. Best for solo or small team AI-assisted development. | CLI-only, no web UI. Less suited for large teams with non-technical stakeholders. |
| **GitHub Issues** | Native to GitHub. Visible to collaborators. Links to PRs automatically. Free for public repos. | Requires network access. Agents need GitHub token. Less structured than bd for AI task lifecycle. |
| **Linear** | Modern UI, keyboard-first. Excellent API for automation. Cycles and roadmaps. Great for teams. | External service (paid for teams). Requires API key setup. Agent integration needs custom configuration. |
| **Jira** | Enterprise standard. Rich workflow customization. Extensive integrations. | Heavy setup. Complex API. Slower for AI-driven workflows. Overkill for small projects. |
| **Claude built-in tasks** | Zero setup. Uses Claude's native TaskCreate/TaskUpdate/TaskList tools. No external CLI or service needed. Works immediately. Lowest friction option with task tracking. | Tasks only persist within a Claude session — no external history, no branch/commit associations outside the session. Less visible to collaborators. |
| **None** | No overhead. Minimal token usage. Just use PRD checklists and git commits. | No task tracking, no coordination between agents, no progress history. |

**Conditional logic:**
- If task management = bd: Token map populates all `{{cmd:*}}` tokens with bd commands. Task CLI commands work immediately after `bd init`. Branch naming follows `<prefix>-<task-id>/<description>`.
- If task management = GitHub Issues: Token map populates with `gh issue` commands. Import the GitHub MCP server.
- If task management = Linear or Jira: Token map populates with the respective CLI commands. Note in PRD that API key setup is a prerequisite task.
- If task management = Claude built-in tasks: Token map populates with Claude tool instructions (e.g., `TaskCreate with subject "TITLE"`). No external CLI needed. Task-manager agent import is commented out (Claude tools are used directly). Branch naming still follows `<prefix>-<task-id>/<description>`.
- If task management = None: Token map sets all `{{cmd:*}}` values to `*(skip)*`. Comment out task-manager agent import. Coordinator skips task lifecycle phases. Ralph tracks progress via PRD checklists only. `{{task_cli_exclusivity_note}}` is set to empty.

**Linting defaults by language:**

- **TypeScript**: ESLint + Prettier
- **Python**: Ruff
- **Go**: golangci-lint
- **Rust**: clippy + rustfmt
- **Java**: Checkstyle + google-java-format

**Pre-commit hook tooling by language:**

- **TypeScript**: Husky + lint-staged
- **Python**: pre-commit framework
- **Go**: golangci-lint as pre-commit hook
- **Rust**: cargo fmt + clippy as pre-commit hook
- **Java**: pre-commit framework with Checkstyle

---

#### Phase 3: Governance & Quality

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | Governance tier | Minimal, Standard, Full | Standard |

**Tier descriptions:**

| Tier | Rules | Key Features |
|------|-------|-------------|
| **Minimal** | 5 | Permission deny-list, auto-format, branch naming, ASCII punctuation, thin main module |
| **Standard** | +10 | LOC thresholds (400/file, 150/PR), agent identity, review labels, domain purity, evidence gathering, coverage consistency |
| **Full** | +15 | Multi-mind review, proactive playbooks, strict feature workflow, Five Whys root cause, glossary |

Present each tier with a one-line summary. Default is Standard.

**Conditional deployment logic by tier:**

| Asset | Minimal | Standard | Full |
|-------|---------|----------|------|
| `ascii-punctuation.sh` hook | Active | Active | Active |
| `check-loc-threshold.sh` hook | Not deployed | Active | Active |
| `agent-governance/skill.md` | Deployed (Minimal rules) | Deployed (Standard rules) | Deployed (Full rules) |
| `permissions.deny` in settings.json | Active | Active | Active |
| `/evidence-gather` command | Not imported | Imported | Imported |
| `/code-review-audit` command | Not imported | Imported | Imported |
| `/code-review-multi-mind` command | Not imported | Not imported | Imported |
| `/solve-strict` command | Not imported | Not imported | Imported |
| `{{governance_section}}` in AGENTS.md | Minimal block | Standard block | Full block |

---

#### Phase 4: Styling (Frontend Only)

**Skip this phase entirely if the selected framework is backend-only** (Express, Fastify, NestJS, Hono, FastAPI, Django, Flask, Gin, Echo, Fiber, Chi, net/http, Axum, Actix-web, Rocket, Spring Boot, Quarkus, Micronaut).

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | CSS approach | Tailwind, CSS Modules, styled-components, Sass/SCSS, None | Tailwind |
| 2 | Component library | shadcn/ui, Radix UI, Headless UI, Material UI, Chakra UI, None | shadcn/ui (if Tailwind), None (otherwise) |
| 3 | Frontend design approach | (see options below) | Anthropic Frontend Design skill |
| 4 | Storybook? | Yes, No | Yes |

**Conditional logic:**
- Component library question only shown if CSS approach is not None.
- shadcn/ui default only applies when Tailwind is selected.

**Frontend design approach options:**

| Option | Strengths | Weaknesses |
|--------|-----------|------------|
| **Anthropic Frontend Design skill** | Zero-config — single SKILL.md file injected into Claude's context. Pushes Claude away from generic "AI slop" toward bold, intentional design (typography, color, motion, layout). No external dependencies. Works with any CSS/component stack. Lightweight (~50 lines). Backed by Anthropic. | Prompt-only — no runtime tools, no live preview, no design tokens. Cannot inspect existing designs or import from Figma. Quality depends entirely on Claude's interpretation. No visual iteration feedback loop. |
| **Figma MCP** | Bridges Figma design files directly into Claude. Selection-based and link-based workflows. Converts real designer output to code. Best for teams with existing Figma workflows. Gives Claude actual design specs (spacing, colors, typography) to implement. | Requires Figma Desktop running locally. Cannot intelligently update existing code as designs evolve. Struggles with multi-frame interactions. No visual diff feedback. Setup overhead (local MCP server on port 3845). |
| **shadcn/ui MCP** | Real-time access to the shadcn/ui component registry. Eliminates hallucinated component APIs — Claude gets actual TypeScript props, variants, and patterns. One-line MCP config. Works immediately. | Only useful if using shadcn/ui (React + Tailwind). Not a design system — provides component data, not design direction. Narrow scope compared to full design tools. |
| **21st.dev Magic MCP** | Generates UI components from natural language descriptions. Browse existing component library for inspiration. Logo search. Good for rapid prototyping. | External API dependency (21st.dev service). Generated components may need significant customization. Less control than hand-coding. Limited to what the Magic API supports. |
| **Multiple (combine)** | Mix and match — e.g., Frontend Design skill for direction + Figma MCP for specs + shadcn/ui MCP for component accuracy. Covers design intent, design source, and implementation accuracy. | More setup. More context consumed. Potential for conflicting guidance between tools. |
| **None** | No design tooling overhead. Claude uses its training knowledge only. Simplest setup. | Claude defaults to safe, generic patterns. No design guardrails. Bland, cookie-cutter output likely. |

**Frontend design conditional logic:**
- If component library = shadcn/ui (or variant): include shadcn/ui MCP as a sub-option under "Multiple" and note it in MCP suggestions (Section E).
- If user selects Figma MCP: add MCP server config to `.mcp.json` during generation. Note Figma Desktop prerequisite in PRD styling task.
- If user selects shadcn/ui MCP: add MCP server config (`https://www.shadcn.io/api/mcp`) to `.mcp.json`.
- If user selects 21st.dev Magic MCP: add MCP server config to `.mcp.json`. Note API key setup in PRD.
- If user selects Anthropic Frontend Design skill: deploy `skills/frontend-design/SKILL.md` into `.claude/skills/frontend-design/` during foundation deployment. Add `@import .claude/skills/frontend-design/SKILL.md` to CLAUDE.md.
- If user selects Multiple: deploy/configure all selected options.
- If user selects None: skip all frontend design tooling.

**Frontend Design skill deployment:**

When the Anthropic Frontend Design skill is selected (either standalone or as part of "Multiple"), create `.claude/skills/frontend-design/SKILL.md` with the official Anthropic frontend-design skill content. This is a prompt-engineering document that instructs Claude to:

1. **Think before coding** — consider purpose, audience, and aesthetic direction
2. **Pick an extreme** — commit to a distinctive style (brutalist, editorial, retro-futuristic, etc.)
3. **Typography** — use distinctive, characterful fonts; avoid Inter/Roboto/system defaults
4. **Color & theme** — cohesive palette with dominant colors and sharp accents; avoid purple-gradient-on-white
5. **Motion** — focus on high-impact moments (page load, scroll, hover); prefer CSS animations
6. **Spatial composition** — embrace asymmetry, overlap, diagonal flow; avoid predictable grid layouts
7. **Never produce generic AI aesthetics** — every design choice must be intentional

Source: `https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design`

---

#### Phase 5: Backend & Data

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | API style | REST, GraphQL, tRPC, gRPC, None | REST |
| 2 | Database | PostgreSQL, MySQL, MongoDB, SQLite, Redis, None | PostgreSQL |
| 3 | ORM / query tool | (conditional on language + DB) | (first in list) |
| 4 | Cache layer | Redis, None | None |

**ORM options by language + database type:**

- **TypeScript + SQL**: Prisma, Drizzle, TypeORM
- **TypeScript + MongoDB**: Mongoose
- **Python + SQL**: SQLAlchemy + Alembic, Django ORM (if Django), Tortoise
- **Python + MongoDB**: Motor, Beanie
- **Go + SQL**: GORM, sqlc, sqlx
- **Go + MongoDB**: mongo-driver
- **Rust + SQL**: Diesel, sqlx, SeaORM
- **Rust + MongoDB**: mongodb crate
- **Java + SQL**: Spring Data JPA, jOOQ, MyBatis
- **Java + MongoDB**: Spring Data MongoDB

**Conditional logic:**
- If Database = None, skip ORM question.
- If Database = Redis only, skip ORM question (Redis is key-value, not relational).
- tRPC option only shown for TypeScript.
- If API style = None and framework is frontend-only, skip the rest of Phase 5.
- Cache layer: if Database already includes Redis, default to Redis; otherwise None.

---

#### Phase 6: Authentication (Backend Only)

**Skip this phase if no backend framework is selected and API style = None.**

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | Auth strategy | (conditional on framework) | (conditional) |

**Auth options by framework:**

- **Next.js**: NextAuth/Auth.js, Clerk, Supabase Auth, Firebase Auth, Custom JWT, None
  - Default: NextAuth/Auth.js
- **Other TypeScript backend**: Passport.js, Custom JWT, Clerk, Supabase Auth, None
  - Default: Custom JWT
- **Python (FastAPI/Flask)**: Custom JWT, Authlib, None
  - Default: Custom JWT
- **Python (Django)**: Django Auth (built-in), django-allauth, Custom JWT, None
  - Default: Django Auth
- **Go**: Custom JWT, None
  - Default: Custom JWT
- **Rust**: Custom JWT, None
  - Default: Custom JWT
- **Java (Spring Boot)**: Spring Security, Custom JWT, None
  - Default: Spring Security

---

#### Phase 7: Testing

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | Unit test runner | (conditional on language) | Auto |
| 2 | E2E testing | Playwright, Cypress, None | Playwright (if frontend), None (if backend-only) |
| 3 | Coverage target | 60%, 75%, 85%, 90% | 75% |

**Unit test runner by language:**

- **TypeScript**: Vitest, Jest -- Default: Vitest
- **Python**: pytest -- Default: pytest (no choice needed)
- **Go**: go test (built-in) -- Default: go test (no choice needed)
- **Rust**: cargo test (built-in) -- Default: cargo test (no choice needed)
- **Java**: JUnit 5, TestNG -- Default: JUnit 5

**Conditional logic:**
- If Language has only one test runner option (Python, Go, Rust), inform the user of the default and skip the question.
- E2E testing question only shown if a frontend framework was selected.
- If E2E testing = Playwright: auto-suggest the Playwright MCP server in Section E (MCP Server Suggestions). Add the MCP entry to `.mcp.json` if the user confirms.

---

#### Phase 8: Deployment & Infrastructure

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | Deployment target | Vercel, Netlify, Railway, Render, Fly.io, AWS, GCP, Azure, Docker only, None | (conditional) |
| 2 | Docker? | Yes, No | Yes |
| 3 | CI/CD | GitHub Actions, GitLab CI, None | GitHub Actions |
| 4 | CI monitoring | Yes, No | No |

**Deployment target defaults by framework:**

- **Next.js**: Vercel
- **Vite+React/Vue/Svelte (static)**: Netlify
- **All other frameworks**: Docker only

**Conditional logic:**
- If Deployment target = Vercel or Netlify, Docker question default changes to No (but still asked).
- If Deployment target = Docker only, skip the Docker question (implicitly Yes).
- CI monitoring question only shown if CI/CD != None. If Yes, the `ci-monitor.sh` hook is activated in settings.json (added to PostToolUse Bash matcher with `"timeout": 30`). If No, `ci-monitor.sh` is deployed to `.claude/hooks/` but not activated — the user can ask Claude to monitor CI manually at any time during development via `gh pr checks <PR_NUMBER> --watch`.

---

### 2. Summary and Confirmation

After all phases, present a summary table of all collected decisions:

```
## Project Configuration Summary

| Category | Choice |
|----------|--------|
| Project name | my-app |
| Project location | /Users/me/projects/my-app |
| Language | TypeScript |
| Framework | Next.js (App Router) |
| Package manager | pnpm |
| Monorepo | No |
| AI coding agent | Claude Code |
| Linting | ESLint + Prettier |
| Pre-commit hooks | Husky + lint-staged |
| Branching | feature branches |
| Governance tier | Standard |
| CSS | Tailwind |
| Component library | shadcn/ui |
| Frontend design | Anthropic Frontend Design skill |
| Storybook | Yes |
| API style | REST |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | None |
| Auth | NextAuth/Auth.js |
| Test runner | Vitest |
| E2E testing | Playwright |
| Coverage target | 75% |
| Deployment | Vercel |
| Docker | No |
| CI/CD | GitHub Actions |
| CI monitoring | No |
```

Ask: "Does this look correct? (yes / edit phase N / start over)"

- **yes** -- proceed to output generation
- **edit phase N** -- re-run that phase's questions
- **start over** -- restart from Phase 1

---

### 3. Output Generation

After confirmation, generate the following outputs in the chosen **project root** directory (from Phase 1, Q2):

#### A0. AGENTS.md (always generated — all agents)

Populate from `templates/AGENTS.md.template`:

- Fill in **Project Overview** with name, description, language, framework.
- Fill in **Tech Stack** table with all chosen technologies and their purposes.
- Fill in **Project Structure** with the generated directory layout.
- Fill in **Coding Conventions** with language-appropriate conventions.
- Fill in **Testing** section with chosen test runner, location, command, coverage target.
- Fill in **Build & Run** commands appropriate to the package manager and framework.
- Fill in **Services** table based on framework and database choices.
- Fill in **Task Management** section based on chosen task management tool (same logic as CLAUDE.md — see token maps below).
- Fill in **Deployment** section with target, CI/CD, and env var locations.

AGENTS.md is always generated regardless of which AI agent is selected. It uses the same `{{cmd:*}}` token replacement system as CLAUDE.md. It contains NO `@import` directives, NO Claude-specific syntax — pure portable markdown.

#### A. CLAUDE.md (only when agent = Claude Code)

**Skip this section entirely if the selected AI agent is not Claude Code.**

Populate from `templates/CLAUDE.md.template`:

- Fill in **Project Overview** with name, description, language, framework.
- Fill in **Tech Stack** table with all chosen technologies and their purposes.
- Fill in **Project Structure** with the generated directory layout.
- Fill in **Coding Conventions** with language-appropriate conventions:
  - TypeScript: camelCase, barrel exports, absolute imports
  - Python: snake_case, PEP 8, type hints
  - Go: exported/unexported naming, error returns
  - Rust: snake_case, Result types, clippy lints
- Fill in **Testing** section with chosen test runner, location, command, coverage target.
- Fill in **Build & Run** commands appropriate to the package manager and framework.
- Fill in **Services** table based on framework and database choices.
- Fill in **Task Management** section based on chosen task management tool:
  - All tools: Set the task CLI name and task data path
  - bd: Task data path = `.beads/`
  - GitHub Issues: Task data path = *(none -- stored on GitHub)*
  - Linear/Jira: Note API key requirement
  - Claude built-in tasks: Task data path = *(none -- managed by Claude internally)*
  - None: Remove or minimize the Task Management section
- After copying all `.claude/` files, run token replacement across ALL `.md` files using the token map for the chosen task CLI tool (see "Token Replacement Maps" below)
- Set hook config variables (`TASK_CLI`, `TASK_NOTE_COMMAND`, `TASK_DATA_PATH`) in `.sh` files
- Update `settings.local.json.template` permissions for the chosen CLI
- Configure **Agent Configuration** imports:
  - Always import core agents (coordinator, architect, researcher, planner, implementer, debugger).
  - Uncomment ralph-orchestrator and ralph-loop skill.
  - Uncomment domain agents based on choices:
    - Frontend framework selected: uncomment `frontend.md`
    - Backend framework or API style: uncomment `backend.md`
    - E2E testing: uncomment `qa-testing.md`
    - Docker or cloud deployment: uncomment `devops.md`
  - Import relevant skills based on choices.

#### B. settings.json (only when agent = Claude Code)

**Skip this section entirely if the selected AI agent is not Claude Code.**

Populate from `templates/settings.json.template`:

- Include all standard hooks (check-branch, large-file-guard, check-commit-msg, check-types, check-coverage, check-tests-before-push, block-dangerous-commands, auto-format, log-edits, auto-task-note).
- Add governance hooks: `ascii-punctuation.sh` (all tiers) and `check-loc-threshold.sh` (Standard+ only -- comment out for Minimal tier).
- Add `permissions.deny` block with specific deny entries (all tiers): `rm -rf /`, `rm -rf ~`, `chmod 777 *`, Write/Edit on `.env`, `.env.local`, `.env.production`.
- Add ralph-progress hook.
- Add pre-compact-capture hook (PreCompact trigger — saves session snapshots before context compaction).
- Add prompt-improver hook (UserPromptSubmit trigger — advisory hints for vague prompts).
- If CI monitoring = Yes: Add `ci-monitor.sh` to the PostToolUse Bash matcher with `"timeout": 30`. This hook triggers after `gh pr create` and reports CI check status.
- Adjust auto-format hook command based on chosen linting tools:
  - TypeScript: `npx prettier --write` / `npx eslint --fix`
  - Python: `ruff format` / `ruff check --fix`
  - Go: `gofmt -w` / `golangci-lint run --fix`
  - Rust: `cargo fmt`

#### C. prd-phases/ (Multi-PRD Architecture)

Generate a multi-PRD system using `templates/manifest-template.md` and `templates/prd-multi-template.md`. Create the `prd-phases/` directory tree with a manifest and individual PRD files. Each PRD is self-contained -- an agent with zero prior context can execute it independently.

**Critical: Task management setup is always the first PRD.** The coordinator, ralph-orchestrator, and all pipeline agents depend on task management being operational before any other work begins.

##### C.1 -- Determine PRD Structure from Q&A Answers

Foundation PRDs (Group 0) are derived deterministically from Q&A answers. Always present:

| ID | File | Description | Condition |
|----|------|-------------|-----------|
| `00a` | `prd-00a-task-management.md` | Task CLI setup + verification | Always first |
| `00b` | `prd-00b-project-init.md` | Framework initialization, package install, dev server | Always |
| `00c` | `prd-00c-code-quality.md` | Linting, formatting, pre-commit hooks | If linting/formatting selected |
| `00d` | `prd-00d-database.md` | Database, ORM, migrations, auth scaffolding | If database selected |
| `00e` | `prd-00e-api-foundation.md` | API layer setup, example endpoint | If API layer selected |
| `00f` | `prd-00f-styling.md` | CSS approach, component library, Storybook | If styling/component lib selected |
| `00g` | `prd-00g-testing.md` | Unit + E2E test runner, sample tests, coverage | If test runner selected |
| `00h` | `prd-00h-cicd-deploy.md` | CI/CD pipeline, Docker, deployment config | If CI/CD or Docker selected |

Omit PRDs for features the user declined. Adjust `requires` and `chain_next` fields in remaining PRDs accordingly. For example, if no database is selected, `00e` (API) requires only `00b` instead of `00d`.

**Task management setup instructions by choice (embedded in prd-00a):**

- **bd (beads)**: Run `{{cmd:init_setup}}`. Then use `{{cmd:create_task}}`/`{{cmd:create_feature}}` for each subsequent task. Use `{{cmd:set_dependency}}` for dependency chains. All agents use token-replaced commands throughout the session.
- **GitHub Issues**: Create a GitHub milestone for the scaffold. Use `{{cmd:create_task}}` for each task as an issue with labels (`scaffold`, `phase-N`). Note dependency relationships in issue bodies.
- **Linear**: Set up Linear API key in `.env`. Create a project for the scaffold. Use `{{cmd:create_task}}` for each issue. Map dependencies as blocking relationships.
- **Jira**: Set up Jira API credentials. Create an epic for the scaffold. Use `{{cmd:create_task}}` for each story. Link dependencies as "blocks/is blocked by" relationships.
- **Claude built-in tasks**: No external setup needed. Use `TaskCreate` to create each task, `TaskUpdate` to set dependencies and status. All agents use Claude's built-in task tools directly. Note: tasks only persist within a Claude session.
- **None**: Skip prd-00a entirely. Use PRD checklists only. Ralph tracks completion via checkbox state. No agent task coordination.

##### C.2 -- Add Product PRDs from Brief (when invoked via `/forge --brief`)

If the scaffold was invoked with `--brief <path>`, read the brief's features (MoSCoW categorized from Phase 3 of `/forge`) and generate product PRDs:

**Group 1 -- MVP (Must Have features):**
- One PRD per Must Have feature, decomposed into atomic tasks
- Sub-groups allowed based on feature domains: `01-mvp-data/` (schemas, models), `01-mvp-api/` (endpoints, services), `01-mvp-ui/` (components, layouts), `01-mvp-pages/` (routes, page composition), `01-mvp-verify/` (E2E persona flows, integration tests)
- Each PRD gets 6-20 atomic tasks. If a feature would produce 20+ tasks, split into multiple PRDs
- Data/schema PRDs separate from API PRDs separate from UI PRDs
- Verification PRDs at end of group (E2E persona flows, accessibility)

**Group 2 -- Launch (Should Have features):**
- One PRD per Should Have feature in `02-launch/`
- Same decomposition heuristics as Group 1

**Group 3 -- Traction (Could Have features):**
- One PRD per Could Have feature in `03-traction/`
- Same decomposition heuristics as Group 1

**PRD decomposition heuristics:**
- Each PRD should have 6-20 atomic tasks
- If a feature would produce 20+ tasks, split into multiple PRDs
- Data/schema PRDs separate from API PRDs separate from UI PRDs
- Each PRD must be self-contained (agent reads nothing except the PRD + manifest)
- Every PRD ends with a manifest-update task

##### C.3 -- Generate manifest.md

Use `templates/manifest-template.md`. Fill in:

- `{{PROJECT_NAME}}`: from Q&A answer
- `{{BRANCH_PREFIX}}`: from Q&A answer
- `{{TOTAL_PRD_COUNT}}`: count of all PRDs (foundation + product)
- `{{GROUP_0_COUNT}}` through `{{GROUP_3_COUNT}}`: per-group counts
- `{{FOUNDATION_REGISTRY_ENTRIES}}`: one entry per foundation PRD in format:
  ```
  - [ ] **00a** | `prd-phases/00-foundation/prd-00a-task-management.md` | Task management setup | status: pending | requires: none |
  ```
- `{{MVP_REGISTRY_ENTRIES}}`, `{{LAUNCH_REGISTRY_ENTRIES}}`, `{{TRACTION_REGISTRY_ENTRIES}}`: entries for product PRDs (if brief provided), or `_None -- no brief provided._` if scaffold-only

Write to `prd-phases/manifest.md`.

##### C.4 -- Generate Individual PRD Files

**Foundation PRDs (Group 0):** Generate directly from Q&A answers -- these are deterministic. For each foundation PRD:

1. Use `templates/prd-multi-template.md` as the base
2. Fill YAML frontmatter: `manifest_id`, `group: 0`, `requires` (dependency chain), `chain_next` (next foundation PRD), `parallel_safe: false`, `branch`
3. Fill "Context for Agent" with project-specific details from Q&A
4. Fill "Patterns to Follow" with actual code patterns matching the chosen tech stack
5. Fill "Tasks" with atomic self-contained tasks (Do/Files/Verify/Accept)
6. Final task is always "Update manifest" with the PRD's manifest_id

**Product PRDs (Groups 1+):** Do NOT generate these inline in the scaffold. Instead, delegate to the **prd-generator** agent in multi-PRD mode:
- Pass the brief path, manifest path, and group assignments
- The prd-generator handles complex feature decomposition into atomic tasks
- Each generated PRD follows `templates/prd-multi-template.md` format
- Each is registered in the manifest

This keeps the scaffold skill focused on foundation setup while letting the prd-generator handle feature decomposition.

##### C.5 -- Directory Structure

```
prd-phases/
  manifest.md
  00-foundation/
    prd-00a-task-management.md
    prd-00b-project-init.md
    prd-00c-code-quality.md        (if applicable)
    prd-00d-database.md            (if applicable)
    prd-00e-api-foundation.md      (if applicable)
    prd-00f-styling.md             (if applicable)
    prd-00g-testing.md             (if applicable)
    prd-00h-cicd-deploy.md         (if applicable)
  01-mvp-data/                     (if brief provided)
  01-mvp-api/                      (if brief provided)
  01-mvp-ui/                       (if brief provided)
  01-mvp-pages/                    (if brief provided)
  01-mvp-verify/                   (if brief provided)
  02-launch/                       (if brief provided)
  03-traction/                     (if brief provided)
```

Group subdirectory names are derived from the project's feature domains. Foundation always uses `00-foundation/`. Only create subdirectories that will contain PRD files.

#### D. Directory Structure

Create the initial directory layout appropriate to the framework. Do not install dependencies or generate code files -- just create the skeleton directories:

**TypeScript (Next.js):** `src/{app,components,lib,styles}`, `tests/{unit,e2e}`, `public/`
**Python (FastAPI):** `src/app/{api,models,schemas,services}`, `tests/{unit,integration}`
**Go (Gin):** `cmd/server/`, `internal/{handlers,models,services}`, `pkg/`, `tests/`
**Rust (Axum):** `src/{handlers,models,services}`, `tests/`

#### E. MCP Server Suggestions (only when agent = Claude Code)

**MCP servers are only configurable for Claude Code.** Skip this section entirely if the selected AI agent is not Claude Code.

Based on the tech choices, suggest relevant MCP servers from the mcp-catalog skill. Present as a checklist the user can opt into:

| Technology | Suggested MCP Server | Purpose | Default |
|-----------|---------------------|---------|---------|
| Any project | @upstash/context7-mcp | Live, version-accurate docs for any library/framework | **On** (recommended) |
| PostgreSQL | @modelcontextprotocol/server-postgres | Query database directly | Off |
| GitHub Actions | @modelcontextprotocol/server-github | Manage workflows and PRs | Off |
| Playwright (E2E) | playwright-mcp | Browser automation and test debugging | **On** if Playwright selected |
| Docker | docker MCP server | Manage containers | Off |
| General web research | @anthropic/mcp-fetch | Fetch documentation | Off |

Context7 is recommended for all projects — it provides live documentation lookups so Claude always has version-accurate API references for the project's dependencies. No API key required.

Playwright MCP is automatically suggested when the user selects Playwright in Phase 7 (E2E testing). It provides browser automation capabilities for debugging and test development.

Ask: "Would you like me to add any of these MCP servers to your configuration?" Pre-check Context7 and any conditionally-triggered servers (Playwright).

#### F1. Agent-Specific Config Generation (non-Claude agents)

**Skip this section if the selected AI agent is Claude Code** (Claude gets `.claude/` infrastructure instead — see Section F below).

For non-Claude agents, generate the agent-specific config file(s) from the corresponding template in `templates/agent-configs/`. Populate all `TODO` fields with the project's actual values (same data used for AGENTS.md). Run `{{cmd:*}}` token replacement on the generated file(s).

| Agent | Template | Output file(s) |
|-------|----------|----------------|
| Cursor | `cursorrules.template` | `.cursorrules` and `.cursor/rules/project.md` (same content) |
| GitHub Copilot | `copilot-instructions.template` | `.github/copilot-instructions.md` |
| Windsurf | `windsurfrules.template` | `.windsurfrules` |
| Kilo Code | `kilo-rules.template` | `.kilo/rules.md` |
| Cline | `clinerules.template` | `.clinerules` |
| Aider | `aider-conf.template` + `aider-conventions.template` | `.aider.conf.yml` + `CONVENTIONS.md` |
| OpenAI Codex | *(none)* | AGENTS.md only |
| Generic/Other | *(none)* | AGENTS.md only |

For Cursor, create both `.cursorrules` (root) and `.cursor/rules/project.md` (directory) with the same content.

#### F. Claude Forge Infrastructure (only when agent = Claude Code)

**Skip this section entirely if the selected AI agent is not Claude Code.**

**This is the critical deployment step.** Deploy the full Claude Forge agent system into the new project's `.claude/` directory. The `@import` directives in CLAUDE.md reference these files -- they must exist for agents, skills, commands, and hooks to function.

**Source**: The Claude Forge files. When running from a project that already has Claude Forge installed, copy from the existing `.claude/` directory. When running standalone, copy from the `crucible-templates/` template directory.

**Always deploy (core infrastructure):**

```
.claude/
  agents/
    coordinator.md, architect.md, researcher.md, planner.md,
    implementer.md, debugger.md, ralph-orchestrator.md, prd-generator.md,
    strategist.md, task-manager.md, product-owner.md, ux-researcher.md,
    _template-agent.md, _template-domain-agent.md
  skills/
    context-engineering/skill.md, quality-validation/skill.md,
    research-methodology/skill.md, git-workflow/skill.md,
    task-management/skill.md, test-scaffolding/skill.md,
    coverage-analysis/skill.md, dependency-health/skill.md,
    task-audit/skill.md, ralph-loop/skill.md,
    mcp-catalog/skill.md, project-scaffold/skill.md,
    strategic-planning/skill.md, product-vision/skill.md,
    user-research/skill.md, agent-governance/skill.md,
    _template-skill/skill.md
  commands/
    pipeline-research.md, pipeline-plan.md, pipeline-implement.md, pipeline-workflow.md,
    prd-generate.md, prd-ralph.md,
    ralph.md, ralph-once.md, forge-scaffold.md, forge.md,
    forge-vision.md, forge-personas.md,
    session-context.md, session-start.md, session-end.md,
    session-preflight.md, session-reflect.md,
    git-snapshot.md, git-diff-summary.md, git-review-pr.md,
    strategy-brainstorm.md, strategy-opportunity.md, strategy-spec.md,
    investigate.md,
    evidence-gather.md, code-review-audit.md,
    code-review-multi-mind.md, solve-strict.md,
    _template-command.md
  hooks/
    check-branch.sh, large-file-guard.sh, check-commit-msg.sh,
    check-coverage.sh, check-tests-before-push.sh,
    block-dangerous-commands.sh, auto-format.sh, log-edits.sh,
    auto-task-note.sh, ralph-progress.sh, run-tests.sh,
    ci-monitor.sh, pre-compact-capture.sh, prompt-improver.sh,
    ascii-punctuation.sh, check-loc-threshold.sh,
    _resolve-node-path.sh, _template-hook.sh
  scripts/
    ralph-loop.sh, ralph-once.sh
  templates/
    CLAUDE.md.template, settings.json.template,
    settings.local.json.template, prd-template.md,
    mcp-catalog.md, scaffold-questions.md,
    project-structures.md, agents-overview.md,
    skills-overview.md, workflows-overview.md,
    pr-template.md, adr-template.md, bug-investigation.md,
    task-templates.md, session-checklist.md,
    research-brief.md, opportunity-assessment.md,
    product-spec.md, risk-matrix.md, product-vision.md,
    user-persona.md, project-brief.md
  known-errors.md
```

**Conditionally deploy (domain agents and skills based on Q&A choices):**

| Condition | File | Action |
|-----------|------|--------|
| Frontend framework selected | `agents/frontend.md` | Uncomment `@import` in CLAUDE.md |
| Frontend framework selected | `agents/ui-designer.md` | Uncomment `@import` in CLAUDE.md |
| Database selected | `agents/database.md` | Uncomment `@import` in CLAUDE.md |
| Frontend design = Anthropic skill (or Multiple including it) | `skills/frontend-design/SKILL.md` | Create file with official content, add `@import` to CLAUDE.md |
| Governance = Minimal | `hooks/check-loc-threshold.sh` | Deploy but comment out hook entry in settings.json |
| Governance = Standard+ | `hooks/check-loc-threshold.sh` | Deploy and activate hook entry in settings.json |
| Governance = Standard+ | `commands/evidence-gather.md` | Add `@import` to CLAUDE.md |
| Governance = Standard+ | `commands/code-review-audit.md` | Add `@import` to CLAUDE.md |
| Governance = Full | `commands/code-review-multi-mind.md` | Add `@import` to CLAUDE.md |
| Governance = Full | `commands/solve-strict.md` | Add `@import` to CLAUDE.md |

Domain agents not triggered by the user's choices are still copied (as templates for later use) but their `@import` lines remain commented out in CLAUDE.md.

**Post-copy steps:**

1. Make all `.sh` files executable: `chmod +x .claude/hooks/*.sh .claude/scripts/*.sh`
2. Run token replacement: For every `.md` file in `.claude/` and the root `CLAUDE.md` and `AGENTS.md`, replace all `{{cmd:*}}`, `{{task_cli_name}}`, `{{task_data_path}}`, `{{task_cli_exclusivity_note}}`, `{{type_check_command}}`, and governance tokens (`{{governance_tier}}`, `{{loc_file_threshold}}`, `{{loc_pr_threshold}}`, `{{governance_section}}`, `{{governance_command_imports}}`) using the appropriate token maps (see "Token Replacement Maps" and "Governance Token Maps" below)
3. Set hook config variables (`TASK_CLI`, `TASK_NOTE_COMMAND`, `TASK_DATA_PATH`, `TYPE_CHECK_COMMAND`) in all `.sh` files. For `check-types.sh`, set `TYPE_CHECK_COMMAND` to the value of `{{type_check_command}}`. For `check-loc-threshold.sh`, set `LOC_FILE_THRESHOLD` to `{{loc_file_threshold}}` value.
4. Update `settings.local.json.template` with the permissions list for the chosen CLI
5. Apply governance-conditional deployment:
   - **Minimal**: Comment out `check-loc-threshold.sh` hook entry in settings.json. Remove governance command `@import` lines from CLAUDE.md.
   - **Standard**: Activate `check-loc-threshold.sh` hook. Add `@import .claude/commands/evidence-gather.md` and `@import .claude/commands/code-review-audit.md` to CLAUDE.md.
   - **Full**: Activate `check-loc-threshold.sh` hook. Add `@import .claude/commands/evidence-gather.md`, `@import .claude/commands/code-review-audit.md`, `@import .claude/commands/code-review-multi-mind.md`, `@import .claude/commands/solve-strict.md` to CLAUDE.md.
6. Create `.claude/ralph/` directory (empty -- populated on first Ralph run)
7. Verify all files referenced by `@import` directives in the generated CLAUDE.md actually exist in `.claude/`

#### G. Commit Scaffold Output

**This step is critical.** All scaffold-generated files must be committed to git before offering Ralph execution or any other downstream work. Without this commit, foundation files can be lost to branch divergence if Ralph (or the user) creates branches from an uncommitted state.

**Preconditions:**
1. Check if the project directory is a git repo (`git rev-parse --git-dir`). If NOT a git repo, skip this step but warn: "Warning: Project directory is not a git repository. Scaffold files are on disk but not version-controlled. Consider running `git init` and committing before running Ralph."
2. Check for pre-existing uncommitted changes (`git status --porcelain`). If there are changes that are NOT scaffold-generated files, warn the user: "There are pre-existing uncommitted changes. The scaffold commit will only include scaffold-generated files. You may want to commit or stash your existing changes first." Ask before proceeding.

**Commit procedure:**
1. Stage ONLY the files the scaffold created — do NOT use `git add -A` or `git add .`. The files to stage depend on the selected AI agent:

   **Claude Code:**
   ```bash
   git add .claude/ CLAUDE.md AGENTS.md prd-phases/
   ```

   **Cursor:**
   ```bash
   git add .cursor/ .cursorrules AGENTS.md prd-phases/
   ```

   **GitHub Copilot:**
   ```bash
   git add .github/copilot-instructions.md AGENTS.md prd-phases/
   ```

   **Windsurf:**
   ```bash
   git add .windsurfrules AGENTS.md prd-phases/
   ```

   **Kilo Code:**
   ```bash
   git add .kilo/ AGENTS.md prd-phases/
   ```

   **Cline:**
   ```bash
   git add .clinerules AGENTS.md prd-phases/
   ```

   **Aider:**
   ```bash
   git add .aider.conf.yml CONVENTIONS.md AGENTS.md prd-phases/
   ```

   **OpenAI Codex / Generic:**
   ```bash
   git add AGENTS.md prd-phases/
   ```

   Also stage any other scaffold-generated files (e.g., `src/` skeleton directories if they contain `.gitkeep` files, `settings.local.json`). Do NOT stage `node_modules/`, `.env`, or other files that should be gitignored.

   **If running via forge with `--brief`:** Also stage migrated forge artifacts:
   ```bash
   git add docs/
   ```
   This includes `docs/vision.md`, `docs/personas/`, `docs/features.md`, and `docs/project-brief.md` — all migrated from the forge workspace.
2. Commit with a clear scaffold message. Adapt the message based on the selected AI agent:

   **Claude Code:**
   ```bash
   git commit -m "chore: scaffold project with Claude Forge

   Deployed Claude Forge infrastructure (.claude/), generated
   AGENTS.md, CLAUDE.md, settings.json, prd-phases/manifest.md,
   prd-phases/<group>/ PRD files, and directory skeleton.

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

   **Non-Claude agents:**
   ```bash
   git commit -m "chore: scaffold project with Claude Forge

   Generated AGENTS.md, AGENT_CONFIG_FILE(s),
   prd-phases/manifest.md, prd-phases/<group>/ PRD files,
   and directory skeleton.

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

   If forge artifacts were migrated (any agent), append to the message:
   ```bash
   git commit -m "chore: scaffold project with Claude Forge (via forge)

   Generated project scaffold with AGENT_NAME config,
   prd-phases/manifest.md, prd-phases/<group>/ PRD files,
   directory skeleton, and migrated forge artifacts
   (docs/vision.md, docs/personas/, docs/features.md,
   docs/project-brief.md).

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```
3. Confirm success: verify the commit landed (`git log --oneline -1`).

**If the commit fails** (e.g., pre-commit hooks reject it), report the error to the user and suggest fixing it before running Ralph. Do NOT skip the commit.

---

### 4. Generation Strategy

The scaffold deploys both the agent infrastructure AND project configuration. The actual project code (dependencies, framework init, configs) is created by executing the PRD through the Ralph loop:

1. `/forge-scaffold` generates AGENTS.md (always) and agent-specific config (CLAUDE.md + `.claude/` for Claude Code, or lightweight config for other agents)
2. `/forge-scaffold` runs token replacement across all generated `.md` files for the chosen task CLI (scope depends on agent — see Section 5)
3. `/forge-scaffold` generates prd-phases/manifest.md + prd-phases/<group>/ PRD files + directory skeleton
4. If `--brief` was provided: migrate forge workspace artifacts to `<project-root>/docs/` and clean up the workspace from the originating directory
5. `/forge-scaffold` verifies integrity (all `@import` paths resolve)
6. `/forge-scaffold` commits ALL scaffold output to git as a single atomic commit (including `docs/` if migrated)
7. User reviews the generated files and adjusts if needed
8. User runs `/ralph prd-phases/manifest.md` to have agents build out each PRD sequentially
9. Each Ralph iteration installs dependencies, creates config files, and scaffolds code
10. The result is a fully configured, buildable project

This separation ensures:
- The scaffold deploys everything the chosen AI agent needs to operate (`.claude/` for Claude Code, or lightweight config for others)
- Token replacement makes all config files concrete for the chosen task CLI -- no runtime resolution needed
- The scaffold generates everything the project needs to be configured (AGENTS.md, agent config, prd-phases/manifest.md + PRD files)
- **The scaffold commit guarantees foundation files are version-controlled before Ralph runs** -- preventing loss from branch divergence
- Complex setup tasks (dependency installation, config generation) are handled by the full agent pipeline with proper error recovery
- Each setup step is committed individually, making it easy to review or revert

---

### 5. Token Replacement Maps

When deploying files, scaffold replaces ALL `{{cmd:*}}`, `{{task_cli_name}}`, `{{task_data_path}}`, `{{task_cli_exclusivity_note}}`, `{{type_check_command}}`, and governance tokens (`{{governance_tier}}`, `{{loc_file_threshold}}`, `{{loc_pr_threshold}}`, `{{governance_section}}`, `{{governance_command_imports}}`). The scope of replacement depends on the selected AI agent:

- **Claude Code**: All `.md` files in `.claude/` + root `CLAUDE.md` + root `AGENTS.md` + `.sh` hook config variables (including `TYPE_CHECK_COMMAND` in `check-types.sh`)
- **All other agents**: Root `AGENTS.md` + the agent-specific config file(s) only (e.g., `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`, etc.)

Token replacement uses the same token maps regardless of which agent is selected — only the set of files processed changes.

#### bd (beads)

| Token | Replacement |
|-------|-------------|
| `{{task_cli_name}}` | bd (beads) |
| `{{task_data_path}}` | .beads/ |
| `{{task_cli_exclusivity_note}}` | ALL task state flows through **bd (beads)**. NEVER use Claude's built-in TaskCreate / TaskUpdate / TaskList tools as substitutes — those tools are invisible to the project's task history and will not create the audit trail needed for progress tracking, context recovery, and accountability. |
| `{{cmd:init_setup}}` | `bd init --prefix PREFIX && bd dolt set port 3306` |
| `{{cmd:create_task}}` | `bd create -t task -d "DESC" "TITLE"` |
| `{{cmd:create_bug}}` | `bd create -t bug -p high -d "DESC" "Bug: TITLE"` |
| `{{cmd:create_feature}}` | `bd create -t feature -d "DESC" "Feature: TITLE"` |
| `{{cmd:create_epic}}` | `bd create -t epic -d "DESC" "Epic: TITLE"` |
| `{{cmd:create_subtask}}` | `bd create -t task --parent ID -d "DESC" "Sub-task: TITLE"` |
| `{{cmd:list_active}}` | `bd list -s in_progress` |
| `{{cmd:list_all_open}}` | `bd list` |
| `{{cmd:list_all}}` | `bd list --all` |
| `{{cmd:list_ready}}` | `bd ready` |
| `{{cmd:show_details}}` | `bd show TASK_ID` |
| `{{cmd:set_status}}` | `bd update TASK_ID -s STATUS` |
| `{{cmd:append_notes}}` | `bd update TASK_ID --append-notes "NOTE"` |
| `{{cmd:set_dependency}}` | `bd dep OTHER_ID --blocks TASK_ID` |
| `{{cmd:close_task}}` | `bd close TASK_ID` |
| `{{cmd:search}}` | `bd search "keyword"` |

Hook config: `TASK_CLI="bd"`, `TASK_NOTE_COMMAND='bd update {TASK_ID} --append-notes "{NOTE}"'`, `TASK_DATA_PATH=".beads/"`
Settings permissions: `Bash(bd create:*)`, `Bash(bd list:*)`, `Bash(bd show:*)`, `Bash(bd update:*)`, `Bash(bd close:*)`, `Bash(bd ready:*)`, `Bash(bd search:*)`, `Bash(bd status:*)`, `Bash(bd dep:*)`, `Bash(bd sync:*)`, `Bash(bd dolt:*)`, `Bash(bd audit:*)`, `Bash(bd reopen:*)`, `Bash(bd defer:*)`, `Bash(bd comments:*)`

#### GitHub Issues

| Token | Replacement |
|-------|-------------|
| `{{task_cli_name}}` | GitHub Issues |
| `{{task_data_path}}` | *(none -- stored on GitHub)* |
| `{{task_cli_exclusivity_note}}` | ALL task state flows through **GitHub Issues**. NEVER use Claude's built-in TaskCreate / TaskUpdate / TaskList tools as substitutes — those tools are invisible to the project's task history and will not create the audit trail needed for progress tracking, context recovery, and accountability. |
| `{{cmd:init_setup}}` | `gh label create scaffold && gh milestone create "Project Setup"` |
| `{{cmd:create_task}}` | `gh issue create --title "TITLE" --body "DESC" --label "task"` |
| `{{cmd:create_bug}}` | `gh issue create --title "Bug: TITLE" --body "DESC" --label "bug"` |
| `{{cmd:create_feature}}` | `gh issue create --title "Feature: TITLE" --body "DESC" --label "feature"` |
| `{{cmd:create_epic}}` | `gh issue create --title "Epic: TITLE" --body "DESC" --label "epic"` |
| `{{cmd:create_subtask}}` | `gh issue create --title "Sub-task: TITLE" --body "DESC\n\nParent: #ID" --label "task"` |
| `{{cmd:list_active}}` | `gh issue list --state open --label "in-progress"` |
| `{{cmd:list_all_open}}` | `gh issue list --state open` |
| `{{cmd:list_all}}` | `gh issue list --state all` |
| `{{cmd:list_ready}}` | `gh issue list --state open --label "ready"` |
| `{{cmd:show_details}}` | `gh issue view ISSUE_NUMBER` |
| `{{cmd:set_status}}` | `gh issue edit ISSUE_NUMBER --add-label "STATUS" --remove-label "OLD_STATUS"` |
| `{{cmd:append_notes}}` | `gh issue comment ISSUE_NUMBER --body "NOTE"` |
| `{{cmd:set_dependency}}` | *(note in issue body: "Blocked by #OTHER_ID")* |
| `{{cmd:close_task}}` | `gh issue close ISSUE_NUMBER` |
| `{{cmd:search}}` | `gh issue list --search "keyword"` |

Hook config: `TASK_CLI="gh"`, `TASK_NOTE_COMMAND='gh issue comment {TASK_ID} --body "{NOTE}"'`, `TASK_DATA_PATH=""`
Settings permissions: `Bash(gh issue create:*)`, `Bash(gh issue list:*)`, `Bash(gh issue view:*)`, `Bash(gh issue edit:*)`, `Bash(gh issue close:*)`, `Bash(gh issue comment:*)`

#### Linear

| Token | Replacement |
|-------|-------------|
| `{{task_cli_name}}` | Linear |
| `{{task_data_path}}` | *(none -- stored on Linear)* |
| `{{task_cli_exclusivity_note}}` | ALL task state flows through **Linear**. NEVER use Claude's built-in TaskCreate / TaskUpdate / TaskList tools as substitutes — those tools are invisible to the project's task history and will not create the audit trail needed for progress tracking, context recovery, and accountability. |
| `{{cmd:init_setup}}` | *(Set up LINEAR_API_KEY in .env, create project)* |
| `{{cmd:create_task}}` | `linear issue create --title "TITLE" --description "DESC"` |
| `{{cmd:create_bug}}` | `linear issue create --title "Bug: TITLE" --description "DESC" --label "Bug"` |
| `{{cmd:create_feature}}` | `linear issue create --title "Feature: TITLE" --description "DESC" --label "Feature"` |
| `{{cmd:create_epic}}` | `linear project create --name "Epic: TITLE" --description "DESC"` |
| `{{cmd:create_subtask}}` | `linear issue create --title "Sub-task: TITLE" --description "DESC" --project ID` |
| `{{cmd:list_active}}` | `linear issue list --status "In Progress"` |
| `{{cmd:list_all_open}}` | `linear issue list` |
| `{{cmd:list_all}}` | `linear issue list --include-completed` |
| `{{cmd:list_ready}}` | `linear issue list --status "Todo"` |
| `{{cmd:show_details}}` | `linear issue show ISSUE_ID` |
| `{{cmd:set_status}}` | `linear issue update ISSUE_ID --status "STATUS"` |
| `{{cmd:append_notes}}` | `linear issue update ISSUE_ID --comment "NOTE"` |
| `{{cmd:set_dependency}}` | `linear issue update ISSUE_ID --blocked-by OTHER_ID` |
| `{{cmd:close_task}}` | `linear issue update ISSUE_ID --status "Done"` |
| `{{cmd:search}}` | `linear issue list --query "keyword"` |

Hook config: `TASK_CLI="linear"`, `TASK_NOTE_COMMAND='linear issue update {TASK_ID} --comment "{NOTE}"'`, `TASK_DATA_PATH=""`
Settings permissions: `Bash(linear issue create:*)`, `Bash(linear issue list:*)`, `Bash(linear issue show:*)`, `Bash(linear issue update:*)`, `Bash(linear project create:*)`

#### Jira

| Token | Replacement |
|-------|-------------|
| `{{task_cli_name}}` | Jira |
| `{{task_data_path}}` | *(none -- stored on Jira)* |
| `{{task_cli_exclusivity_note}}` | ALL task state flows through **Jira**. NEVER use Claude's built-in TaskCreate / TaskUpdate / TaskList tools as substitutes — those tools are invisible to the project's task history and will not create the audit trail needed for progress tracking, context recovery, and accountability. |
| `{{cmd:init_setup}}` | *(Set up JIRA_API_TOKEN in .env, configure project key)* |
| `{{cmd:create_task}}` | `jira issue create --type Task --summary "TITLE" --description "DESC"` |
| `{{cmd:create_bug}}` | `jira issue create --type Bug --summary "Bug: TITLE" --description "DESC" --priority High` |
| `{{cmd:create_feature}}` | `jira issue create --type Story --summary "Feature: TITLE" --description "DESC"` |
| `{{cmd:create_epic}}` | `jira issue create --type Epic --summary "Epic: TITLE" --description "DESC"` |
| `{{cmd:create_subtask}}` | `jira issue create --type Sub-task --parent KEY --summary "Sub-task: TITLE" --description "DESC"` |
| `{{cmd:list_active}}` | `jira issue list --status "In Progress"` |
| `{{cmd:list_all_open}}` | `jira issue list` |
| `{{cmd:list_all}}` | `jira issue list --status all` |
| `{{cmd:list_ready}}` | `jira issue list --status "To Do"` |
| `{{cmd:show_details}}` | `jira issue view ISSUE_KEY` |
| `{{cmd:set_status}}` | `jira issue move ISSUE_KEY "STATUS"` |
| `{{cmd:append_notes}}` | `jira issue comment add ISSUE_KEY --body "NOTE"` |
| `{{cmd:set_dependency}}` | *(add "blocks" link in Jira UI or API)* |
| `{{cmd:close_task}}` | `jira issue move ISSUE_KEY "Done"` |
| `{{cmd:search}}` | `jira issue list --query "keyword"` |

Hook config: `TASK_CLI="jira"`, `TASK_NOTE_COMMAND='jira issue comment add {TASK_ID} --body "{NOTE}"'`, `TASK_DATA_PATH=""`
Settings permissions: `Bash(jira issue create:*)`, `Bash(jira issue list:*)`, `Bash(jira issue view:*)`, `Bash(jira issue move:*)`, `Bash(jira issue comment:*)`

#### Claude built-in tasks

| Token | Replacement |
|-------|-------------|
| `{{task_cli_name}}` | Claude built-in tasks |
| `{{task_data_path}}` | *(none -- managed by Claude internally)* |
| `{{task_cli_exclusivity_note}}` | ALL task state flows through Claude's built-in **TaskCreate / TaskUpdate / TaskList** tools. Use these consistently for all task lifecycle tracking. Do not create ad-hoc tracking systems, skip task updates, or use external CLIs that are not configured for this project. |
| `{{cmd:init_setup}}` | *(no setup needed -- Claude's built-in task tools are always available)* |
| `{{cmd:create_task}}` | `TaskCreate` with subject "TITLE" and description "DESC" |
| `{{cmd:create_bug}}` | `TaskCreate` with subject "Bug: TITLE" and description "DESC" |
| `{{cmd:create_feature}}` | `TaskCreate` with subject "Feature: TITLE" and description "DESC" |
| `{{cmd:create_epic}}` | `TaskCreate` with subject "Epic: TITLE" and description "DESC" |
| `{{cmd:create_subtask}}` | `TaskCreate` with subject "Sub-task: TITLE" and description "DESC", then `TaskUpdate` TASK_ID with addBlockedBy [PARENT_ID] |
| `{{cmd:list_active}}` | `TaskList` (filter for in_progress status) |
| `{{cmd:list_all_open}}` | `TaskList` (show all non-completed tasks) |
| `{{cmd:list_all}}` | `TaskList` (show all tasks including completed) |
| `{{cmd:list_ready}}` | `TaskList` (filter for pending tasks with no blockers) |
| `{{cmd:show_details}}` | `TaskGet` TASK_ID |
| `{{cmd:set_status}}` | `TaskUpdate` TASK_ID with status "STATUS" |
| `{{cmd:append_notes}}` | `TaskUpdate` TASK_ID with description appended with "NOTE" |
| `{{cmd:set_dependency}}` | `TaskUpdate` TASK_ID with addBlockedBy [OTHER_ID] |
| `{{cmd:close_task}}` | `TaskUpdate` TASK_ID with status "completed" |
| `{{cmd:search}}` | `TaskList` (scan subjects/descriptions for "keyword") |

Hook config: `TASK_CLI=""`, `TASK_NOTE_COMMAND=''`, `TASK_DATA_PATH=""`
Comment out `@import .claude/agents/task-manager.md` in CLAUDE.md (Claude tools are used directly by all agents).
Settings permissions: *(none needed -- Claude's built-in task tools require no Bash permissions)*

#### None

| Token | Replacement |
|-------|-------------|
| `{{task_cli_name}}` | None |
| `{{task_data_path}}` | *(none)* |
| `{{task_cli_exclusivity_note}}` | *(empty -- no task management configured)* |
| `{{cmd:init_setup}}` | *(skip)* |
| `{{cmd:create_task}}` | *(skip)* |
| `{{cmd:create_bug}}` | *(skip)* |
| `{{cmd:create_feature}}` | *(skip)* |
| `{{cmd:create_epic}}` | *(skip)* |
| `{{cmd:create_subtask}}` | *(skip)* |
| `{{cmd:list_active}}` | *(skip)* |
| `{{cmd:list_all_open}}` | *(skip)* |
| `{{cmd:list_all}}` | *(skip)* |
| `{{cmd:list_ready}}` | *(skip)* |
| `{{cmd:show_details}}` | *(skip)* |
| `{{cmd:set_status}}` | *(skip)* |
| `{{cmd:append_notes}}` | *(skip)* |
| `{{cmd:set_dependency}}` | *(skip)* |
| `{{cmd:close_task}}` | *(skip)* |
| `{{cmd:search}}` | *(skip)* |

Hook config: `TASK_CLI=""`, `TASK_NOTE_COMMAND=''`, `TASK_DATA_PATH=""`
Comment out `@import .claude/agents/task-manager.md` in CLAUDE.md.

---

### Governance Token Maps

These tokens are replaced based on the governance tier selected in Phase 3.

#### Minimal

| Token | Replacement |
|-------|-------------|
| `{{governance_tier}}` | Minimal |
| `{{loc_file_threshold}}` | *(not enforced)* |
| `{{loc_pr_threshold}}` | *(not enforced)* |
| `{{governance_command_imports}}` | *(empty)* |

`{{governance_section}}` resolves to:

```markdown
## Agent Governance (Minimal)

- Keep the main entry module thin -- routing and bootstrap only, no business logic in the entry point
- Use ASCII punctuation in code, comments, and documentation -- no smart quotes, em-dashes, or curly apostrophes
```

#### Standard

| Token | Replacement |
|-------|-------------|
| `{{governance_tier}}` | Standard |
| `{{loc_file_threshold}}` | 400 |
| `{{loc_pr_threshold}}` | 150 |
| `{{governance_command_imports}}` | `@import .claude/commands/evidence-gather.md` followed by `@import .claude/commands/code-review-audit.md` (each on its own line) |

`{{governance_section}}` resolves to:

```markdown
## Agent Governance (Standard)

Governance rules are defined in the agent-governance skill. Key rules for agents:

- Keep the main entry module thin -- routing and bootstrap only
- Use ASCII punctuation in code, comments, and documentation
- **Agent identity**: State your role and confidence level (High/Medium/Low) when providing recommendations
- **Review labels**: Use `[block]`, `[warn]`, `[nit]`, `[question]` on all code review feedback
- **File size**: Keep source files under 400 lines. The `check-loc-threshold.sh` hook warns automatically.
- **PR size**: Keep PRs under 150 net lines. Split larger changes into focused PRs.
- **Domain purity**: No cross-layer imports. UI must not import server modules. Config from env only.
- **Contract drift**: Commit generated types. Use `--check` mode in CI to detect drift.
- **Coverage consistency**: Use the project's coverage target consistently -- no per-module overrides.
- **Evidence-based debugging**: Use `/evidence-gather` to hypothesize, gather evidence, and classify before proposing fixes.
```

#### Full

| Token | Replacement |
|-------|-------------|
| `{{governance_tier}}` | Full |
| `{{loc_file_threshold}}` | 400 |
| `{{loc_pr_threshold}}` | 150 |
| `{{governance_command_imports}}` | `@import .claude/commands/evidence-gather.md` followed by `@import .claude/commands/code-review-audit.md` followed by `@import .claude/commands/code-review-multi-mind.md` followed by `@import .claude/commands/solve-strict.md` (each on its own line) |

`{{governance_section}}` resolves to:

```markdown
## Agent Governance (Full)

Governance rules are defined in the agent-governance skill. Key rules for agents:

- Keep the main entry module thin -- routing and bootstrap only
- Use ASCII punctuation in code, comments, and documentation
- **Agent identity**: State your role and confidence level (High/Medium/Low) when providing recommendations
- **Review labels**: Use `[block]`, `[warn]`, `[nit]`, `[question]` on all code review feedback
- **File size**: Keep source files under 400 lines. The `check-loc-threshold.sh` hook warns automatically.
- **PR size**: Keep PRs under 150 net lines. Split larger changes into focused PRs.
- **Domain purity**: No cross-layer imports. UI must not import server modules. Config from env only.
- **Contract drift**: Commit generated types. Use `--check` mode in CI to detect drift.
- **Coverage consistency**: Use the project's coverage target consistently -- no per-module overrides.
- **Evidence-based debugging**: Use `/evidence-gather` to hypothesize, gather evidence, and classify before proposing fixes.

### Proactive Playbook

Agents proactively address these concerns without being asked:

- **Dead code**: Flag unused exports, unreachable branches, and orphan files during implementation
- **README**: Update README when public API or setup steps change, in the same PR
- **Fix-main-red**: If CI is red on main, fix it before starting new work (blast radius: affected test files + direct dependencies only)
- **Glossary**: When introducing domain terms, add them to `docs/glossary.md`
- **ADR**: Document significant architectural decisions in `docs/adr/`

### Additional Full-Tier Rules

- **Frontend anti-monolith**: No component file >250 lines -- extract sub-components proactively
- **Strict feature workflow**: Research -> plan -> implement, no skipping phases
- **Five Whys**: Use `/solve-strict` for root cause analysis on complex bugs
- **Multi-mind review**: Use `/code-review-multi-mind` for complex PRs
- **Dependency review**: New dependencies require justification (size, maintenance, alternatives)
- **API versioning**: Breaking changes require version bump and migration guide
```

---

### Type Check Command

The `{{type_check_command}}` token is set based on the project's primary language, determined during Phase 1 of the Q&A. This command is used by the implementer agent (between test and refactor), the coordinator (pre-commit gate), the preflight command, and the `check-types.sh` hook.

| Language / Framework | `{{type_check_command}}` | Notes |
|---------------------|--------------------------|-------|
| TypeScript (any framework) | `pnpm type-check` or `npx tsc --noEmit` | Use `pnpm type-check` if a `type-check` script exists in package.json; otherwise `npx tsc --noEmit`. Vitest/Jest strip types — this is the only way to verify type safety. |
| Python (with mypy) | `mypy .` | Only if mypy is in the project's dependencies. Otherwise `*(skip)*`. |
| Python (without mypy) | `*(skip)*` | |
| Go | `go vet ./...` | `go build` also catches type errors, but `go vet` catches additional issues. |
| Rust | `*(skip)*` | `cargo build` catches type errors during compilation. Separate check not needed. |
| Java / Kotlin | `*(skip)*` | Compiled languages catch types at build time. |
| Ruby / Elixir / PHP | `*(skip)*` | Dynamic languages without standard type checkers. |

When `{{type_check_command}}` is `*(skip)*`, the implementer skips step D, the preflight skips the type-check line, and the `check-types.sh` hook exits immediately (no-op).

During token replacement (Step F.2), also replace `{{type_check_command}}` in `check-types.sh` (the `TYPE_CHECK_COMMAND` variable on line 34).

---

### 6. Error Handling

- If the user provides an invalid option, re-prompt with the valid options listed.
- If the project directory already contains an AGENTS.md or CLAUDE.md, warn and ask before overwriting.
- If the project directory already contains source files, ask whether to scaffold around existing files or start fresh.
- If a framework CLI is not installed, note it in the PRD as a prerequisite task.

## Example

```
> /forge-scaffold my-saas-app

Phase 1: Project name = my-saas-app, location = ./my-saas-app/
Phases 1-8 collect: TypeScript, Next.js, pnpm, bd (beads), Standard governance,
Tailwind, shadcn/ui, PostgreSQL, Prisma, NextAuth, Vitest, Playwright, Vercel, GitHub Actions.

Generated in /Users/me/projects/my-saas-app/:
  - .claude/ (80 files -- agents, skills, commands, hooks, scripts, templates)
  - Token replacement: all {{cmd:*}} tokens resolved to bd commands across .claude/*.md
  - AGENTS.md (universal project config, portable across AI agents)
  - CLAUDE.md (populated, 43 active @imports, bd task management)
  - .claude/settings.json (with hooks)
  - prd-phases/manifest.md (8 PRDs across 1 group, chained with dependencies)
  - prd-phases/00-foundation/ (8 PRD files with atomic tasks, Task 1 = bd init)
  - Directory skeleton created
  - MCP suggestions: context7 (default), server-postgres, server-github, playwright-mcp
  - Committed: "chore: scaffold project with Claude Forge" (abc1234)

Run /ralph prd-phases/manifest.md to build out the project.
```

```
> /forge-scaffold my-api /Users/me/existing-repo

All assets generated directly in /Users/me/existing-repo/ (no sub-directory created).
```
