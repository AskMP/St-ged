---
name: "task-management"
description: "Task lifecycle, note conventions, and task hygiene practices"
auto_invoke: true
triggers: ["creating or updating a task", "starting or ending a work session", "tracking work progress", "task hygiene review"]
---

# Task Management

Consistent task lifecycle management, progress tracking via structured notes, and task hygiene. All work tracked, no task left ambiguous, task history serves as project log.

## Decomposition Rule

Before beginning work on any non-trivial task, decompose into small, trackable steps:

1. **Break down**: Split into smallest reasonable units. Each step touches a focused set of files with a clear completion condition.
2. **Track each step**: Create sub-task/note per step. Mark `in_progress` before starting, `complete` with references when done.
3. **Reference everything**: On completion include: files created/modified, commit hash, test results, concerns/follow-ups.
4. **Never skip lifecycle**: Every step: claim → work → close with references. Skipping breaks the audit trail for progress review, context recovery, and accountability.

## 1. Command Reference

Tool: **{{task_cli_name}}** | Data path: `{{task_data_path}}`

| Operation | Command | Notes |
|-----------|---------|-------|
| **Init/setup** | `{{cmd:init_setup}}` | Run once during project setup |
| **Create task** | `{{cmd:create_task}}` | |
| **Create bug** | `{{cmd:create_bug}}` | |
| **Create feature** | `{{cmd:create_feature}}` | |
| **Create epic** | `{{cmd:create_epic}}` | |
| **Create sub-task** | `{{cmd:create_subtask}}` | |
| **List active** | `{{cmd:list_active}}` | |
| **List all open** | `{{cmd:list_all_open}}` | |
| **List all** | `{{cmd:list_all}}` | Includes closed |
| **List ready** | `{{cmd:list_ready}}` | |
| **Show details** | `{{cmd:show_details}}` | |
| **Set status** | `{{cmd:set_status}}` | |
| **Append notes** | `{{cmd:append_notes}}` | Use note prefixes below |
| **Set dependency** | `{{cmd:set_dependency}}` | |
| **Close task** | `{{cmd:close_task}}` | After PR merged |
| **Search tasks** | `{{cmd:search}}` | |

## 2. Task Types

**Always use the correct type** — types drive filtering, reporting, and workflow routing.

- **task**: Discrete implementation work item. Focused unit of code work with clear completion criteria. Default type.
- **bug**: Something broken or not matching spec. MUST include reproduction steps in the description.
- **feature**: New user-facing functionality or significant UX improvement. Maps to a persona JTBD.
- **chore**: Maintenance, refactoring, dependency updates, tooling, documentation. No user-visible behavior change.
- **epic**: Large initiative with 3+ sub-tasks spanning multiple sessions. Never work on an epic directly — work its children.

**Selection rule**: broken → `bug` | new capability → `feature` | maintenance → `chore` | implementation → `task` | 3+ children → `epic`

## 3. Nine-Phase Task Lifecycle

| Phase | Name | Gate |
|-------|------|------|
| 1 | **Define** | Acceptance criteria exist |
| 2 | **Reproduce/Prototype** | Evidence captured |
| 3 | **Research Internal** | Git log / task search done |
| 4 | **Research External** | Sources documented |
| 5 | **Propose** | Decision among 2-3 approaches documented |
| 6 | **Implement** | Code on feature branch, tests pass |
| 7 | **Verify** | Reproduction evidence reversed |
| 8 | **Iterate** | Return to Phase 5 if needed with new info |
| 9 | **Submit** | PR merged, task closed |

## 4. Note Conventions

Append notes with `{{cmd:append_notes}}`. Update minimum every 15 min during active work.

- `->` Starting/resuming — `-> Starting. Phase 1: Analyzing task goals.`
- `[done]` Progress/completed — `[done] Updated auth middleware`
- `[x]` Failed attempt — `[x] Attempted hooks approach, caused React error`
- `[!]` Blocker — `[!] BLOCKED: Missing API documentation`
- `[pause]` Paused — `[pause] PAUSED AT: Line 156, about to implement Y`

## 5. Task Creation Standards

Every task created with `{{cmd:create_task}}` (or `{{cmd:create_bug}}`, `{{cmd:create_feature}}`) must include:

- **Problem**: What is broken or missing
- **Expected Behavior**: What should happen instead
- **Acceptance Criteria**: Specific, measurable criteria including "Tests pass" and "Coverage meets threshold"
- **Reproduction Steps** (bugs only): Numbered steps ending with observed failure

## 6. Epic Structure

Create with `{{cmd:create_epic}}`, break down with `{{cmd:create_subtask}}`. Use sub-tasks for work >1-3 hours. Every epic must define:

- **Goal**: What this epic achieves when complete
- **Scope**: What's in, what's out
- **Sub-tasks**: Numbered list of child tasks
- **Success Criteria**: All sub-tasks closed, tests pass, docs updated

## 7. Critical Rules

1. **Every action needs a task** -- no work outside the task tracker
2. **Update notes every 15 min** during active work via `{{cmd:append_notes}}`
3. **Define acceptance criteria first** before implementation
4. **Use sub-tasks** for work >1-3 hours
5. **Update task before committing** -- no commits without corresponding task notes
6. **Close tasks only after merge** via `{{cmd:close_task}}` -- PR must be approved first
7. **Never edit task data files directly** -- always use the CLI

## 8. Task Hygiene

Verify periodically using `{{cmd:list_all}}`, `{{cmd:list_active}}`, and `{{cmd:search}}`:

- No tasks without acceptance criteria
- No stale tasks (no updates in 30+ days)
- No tasks without proper types
- No duplicates
- All in_progress tasks have recent notes
- All closed tasks have a summary note
