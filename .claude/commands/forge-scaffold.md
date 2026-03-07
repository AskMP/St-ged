---
name: "forge-scaffold"
description: "Interactive project scaffolding via Q&A — generates AGENTS.md, agent config, and PRD"
agent: "coordinator"
---

# /forge-scaffold

```
/forge-scaffold [project-name] [path]
```

Interactive Q&A → scaffold new project with AI agent configuration. Coordinator activates `project-scaffold` skill, walks user through 7 progressive-disclosure phases collecting technology decisions including AI agent choice. Generates AGENTS.md (universal config for all agents), agent-specific configuration, and Ralph-ready PRD. For Claude Code: deploys full infrastructure (agents, skills, commands, hooks, scripts, templates) into `.claude/`. For other agents: generates lightweight config files. Creates directory structure and suggests MCP servers (Claude Code only).

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| project-name | no | Project name (prompted during Phase 1 if not provided) |
| path | no | Project root directory. If provided, all assets generated directly in this path (no sub-directory). If omitted, asked during Phase 1. |
| --brief | no | Path to project brief (from `/forge`). Scaffold uses brief for informed defaults and generates comprehensive PRD with setup AND product tasks. |

## Behavior

1. **Activate scaffold mode** → `project-scaffold` skill
2. **Determine project location** — path argument → use as project root. Otherwise ask during Phase 1 (sub-directory of cwd, git root, or custom path).
3. **Run Q&A phases** — 7 phases: Foundation (language, framework, package manager, monorepo, AI agent), Dev Tools (linting, hooks, branching), Styling & Frontend (CSS, components, Storybook — frontend only), Backend & Data (API, database, ORM, cache), Auth (backend only), Testing (runner, E2E, coverage), Deployment (target, Docker, CI/CD).
4. **Present summary** — all decisions in table for confirmation
5. **Generate AGENTS.md** — from `templates/AGENTS.md.template` with tech stack, conventions, task management (always, all agents)
6. **Deploy infrastructure** (Claude Code only) — copy agents, skills, commands, hooks, scripts, templates into `<project-root>/.claude/`. Make scripts executable.
7. **Generate CLAUDE.md** (Claude Code only) — from `templates/CLAUDE.md.template` with tech stack, conventions, `@import` paths
8. **Generate agent config** (non-Claude agents) — from `templates/agent-configs/` for the selected agent
9. **Generate settings.json** (Claude Code only) — from `templates/settings.json.template` with hooks for chosen tools
10. **Generate prd-phases/ (multi-PRD architecture)** — manifest.md + individual PRD files in group subdirectories (00-foundation/ for setup tasks, 01-*/ for product features if brief provided). Each PRD is self-contained and Ralph-ready.
11. **Create directory structure** — skeleton layout for chosen framework (directories only)
12. **Suggest MCP servers** (Claude Code only) — query `mcp-catalog` for relevant servers
13. **Verify integrity** (Claude Code only) — confirm all `@import` references resolve
14. **Commit scaffold output** — if git repo, atomic commit of all scaffold files (files vary by agent). See `skills/project-scaffold/skill.md` Section 3G.
15. **Offer Ralph** — prompt `/ralph prd-phases/manifest.md`

## Output

**Always generated (all agents):**

| Output | Purpose |
|--------|---------|
| `AGENTS.md` | Universal project config (portable across AI agents) |
| `prd-phases/manifest.md` | Multi-PRD manifest with registry |
| `prd-phases/00-foundation/` | Foundation PRD files (setup tasks) |
| `src/` (or equivalent) | Skeleton directory structure |

**Claude Code only:**

| Output | Purpose |
|--------|---------|
| `.claude/agents/` | All agent definitions |
| `.claude/skills/` | All skill definitions |
| `.claude/commands/` | All command definitions |
| `.claude/hooks/` | All hook scripts |
| `.claude/scripts/` | Ralph loop scripts |
| `.claude/templates/` | Reference templates |
| `.claude/known-errors.md` | Known errors registry |
| `CLAUDE.md` | Project config with active `@import` directives (extends AGENTS.md) |
| `.claude/settings.json` | Hook configuration for chosen language/tools |

**Other agents (conditional):**

| Agent | Output |
|-------|--------|
| Cursor | `.cursorrules`, `.cursor/rules/project.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Windsurf | `.windsurfrules` |
| Kilo Code | `.kilo/rules.md` |
| Cline | `.clinerules` |
| Aider | `.aider.conf.yml`, `CONVENTIONS.md` |
| OpenAI Codex / Generic | *(AGENTS.md only)* |

## Examples

```
/forge-scaffold my-app
/forge-scaffold my-app /Users/me/projects/my-app
/forge-scaffold
```

## Brief-Driven Mode

With `--brief`, scaffold uses brief's scaffold hints as Q&A defaults (user can override). PRD includes both Phase 0 (setup tasks) and Phase 1+ (feature tasks from brief's scope with persona references). Generated CLAUDE.md includes persona references for UI-designer and frontend agents.

Recommended flow: `/forge` → `/forge-scaffold --brief docs/project-brief.md` → `/ralph`
