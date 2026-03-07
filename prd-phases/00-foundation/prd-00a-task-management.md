---
task: "Task management setup -- bd init + verification"
branch: "stg-00a/task-management-setup"
test_command: "bd list"
completion_promise: "COMPLETE"
max_iterations: 5
chain_next: "00b"
requires: []
parallel_safe: false
group: 0
manifest_id: "00a"
---

# PRD: Task Management Setup

## Context for Agent

### What This PRD Does

Initializes the bd (beads) task management system for the Stàged project. This is the first PRD executed and must complete before any other work begins -- all subsequent PRDs create and track tasks via bd.

### What Was Built Before This

Nothing. This is the first PRD.

### Key Files to Read First

- `CLAUDE.md` -- project conventions and bd command reference
- `AGENTS.md` -- universal project config

### Patterns to Follow

```bash
# bd init creates .beads/ directory and sets the task prefix
bd init --prefix STG

# Verify it works
bd list
bd create -t task -d "Test task creation" "Test: verify bd works"
bd close STG-1
```

### Skills and Commands

| Action | Command |
|--------|---------|
| Init bd | `bd init --prefix STG` |
| Create task | `bd create -t task -d "DESC" "TITLE"` |
| List tasks | `bd list` |
| Close task | `bd close TASK_ID` |

---

## Problem-Solving Protocol

1. **Try the task as specified** -- follow the Do field exactly
2. **If blocked**: check that bd is installed (`which bd`); if not installed, see installation instructions at the bd GitHub repo
3. **If unresolvable after 3 attempts**: note the blocker in this PRD's Discovered Tasks section

---

## Tasks

- [ ] **Task 1: Verify bd is installed** `[BD:STG-1]`
  - **Type**: task
  - **Do**: Run `which bd` and `bd --version` to confirm bd (beads) is installed and accessible. If not installed, the agent must stop and instruct the user to install bd before proceeding.
  - **Files**: none (shell only)
  - **Verify**: `bd --version` exits with code 0 and prints a version string
  - **Accept**: bd is confirmed installed and accessible in PATH

- [ ] **Task 2: Initialize bd in the project** `[BD:STG-2]`
  - **Type**: task
  - **Do**: Run `bd init --prefix STG` from the project root (`/Users/mdpotter/Documents/GitHub/staged/`). This creates the `.beads/` directory and sets the task ID prefix to STG. If `.beads/` already exists, skip this step.
  - **Files**: `.beads/` (created by bd)
  - **Verify**: `ls .beads/` shows bd configuration files; `bd list` runs without error
  - **Accept**: `.beads/` directory exists; `bd list` returns empty list or existing tasks without error

- [ ] **Task 3: Create foundation tracking tasks** `[BD:STG-3]`
  - **Type**: task
  - **Do**: Create bd tasks for each remaining foundation PRD so they are tracked in the system. Run these commands in order:
    ```bash
    bd create -t task -d "Turborepo monorepo init, pnpm workspaces, dev servers" "Foundation: Project initialization (00b)"
    bd create -t task -d "ESLint, Prettier, Husky, lint-staged, TypeScript strict" "Foundation: Code quality setup (00c)"
    bd create -t task -d "PostgreSQL + Drizzle schema + Better Auth + USDA FDC dataset" "Foundation: Database setup (00d)"
    bd create -t task -d "Hono server + Socket.io + route skeleton + env validation" "Foundation: API foundation (00e)"
    bd create -t task -d "Tailwind CSS v4 + Radix UI + frontend-design skill" "Foundation: Styling setup (00f)"
    bd create -t task -d "Vitest + Playwright + sample tests + coverage baseline" "Foundation: Testing setup (00g)"
    bd create -t task -d "GitHub Actions + Docker + Vercel + Railway configs" "Foundation: CI/CD and deploy (00h)"
    ```
  - **Files**: `.beads/` (updated by bd)
  - **Verify**: `bd list` shows 7 new tasks with STG- IDs
  - **Accept**: 7 foundation tracking tasks visible in `bd list` output

- [ ] **Task 4: Update manifest** `[BD:STG-4]`
  - **Type**: chore
  - **Do**: Open `prd-phases/manifest.md`. Find the registry entry for `00a`. Change `status: pending` to `status: complete`. Update the Current State section: set "Last completed PRD" to `00a`, update timestamp to current date/time, change progress to `1 / 29 PRDs complete`. Confirm `00b`'s `requires: 00a` is now satisfied.
  - **Files**: `prd-phases/manifest.md`
  - **Verify**: `grep "00a" prd-phases/manifest.md` shows `status: complete`
  - **Accept**: Manifest registry shows 00a complete; progress counter reads 1/29

---

## Discovered Tasks

_None yet._
