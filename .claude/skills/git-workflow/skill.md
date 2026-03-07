---
name: "git-workflow"
description: "Git branching strategy, pre-implementation gates, and commit discipline"
auto_invoke: true
triggers: ["code changes about to begin", "git commit or push", "branch creation needed", "PR workflow"]
---

# Git Workflow

Mandatory gates before implementation and commits. Prevents working on main, committing without task references, pushing broken code.

## 1. Branch Rules

- Code (features, fixes, refactors) → **feature branch + PR** (required)
- Test changes → **feature branch + PR** (required)
- Documentation (`.md`) → direct to main
- Task/config data → direct to main
- Claude config (`.claude/`) → direct to main

## 2. Branch Naming

`<project-prefix>-<task-id>/<brief-description>` (e.g., `myapp-507/fix-login-redirect`)

## 3. Pre-Implementation Gate (MANDATORY)

Before writing/modifying ANY code:

1. Create feature branch from latest main
2. Create or claim task in tracker
3. Set task to in_progress
4. Spawn coordinator agent

Enforced by `check-branch.sh` hook — Write/Edit blocked on main.

## 4. Pre-Commit Gate (MANDATORY)

Before ANY git commit:

1. Task notes updated with current progress
2. Task status reflects current state
3. Branch name matches task ID pattern
4. Tests pass
5. Coverage meets minimum threshold

Verify: `{{cmd:list_active}}`, `{{cmd:show_details}}`, `git branch --show-current`, `<test-command>`.
Enforced by: `check-commit-msg.sh` (task ref), `check-coverage.sh` (coverage).

## 5. Commit Messages

Reference task ID: `Fix login redirect when email contains + (<PREFIX>-507)`

**Exempt prefixes** (no task ID required): `Docs:`, `Chore:`, `Meta:`, `Release:`

## 6. Code Change Workflow

1. Feature branch from main
2. Commit with task reference
3. Push and create PR: `gh pr create --title "Type: Brief description (<prefix>-<task-id>)"`
4. Review, address feedback, merge via GitHub, close task

## 7. Pre-Push Gate

Tests must pass before pushing. Enforced by `check-tests-before-push.sh`.

## 8. Dangerous Commands

Blocked by `block-dangerous-commands.sh`: `git reset --hard`, `git push --force` (use `--force-with-lease`), `git clean -f`, `git checkout .` / `git restore .`, `git branch -D`.
