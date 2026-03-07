---
name: "ralph-loop"
description: "Autonomous iterative loop execution with cross-iteration learning and context rotation"
auto_invoke: true
triggers: ["ralph loop mode active", "autonomous iterative execution", "AFK development mode", "/ralph or /ralph-once command invoked"]
---

# Ralph Loop Methodology

## Instructions

### 1. Progress Tracking Protocol

Every Ralph iteration follows this read-work-write cycle. **The project's task CLI is the authoritative task tracker** — PRD checkboxes are a secondary view. Both must stay in sync.

```
 1. READ:  Load .claude/ralph/progress.md (accumulated learnings)
 2. READ:  Load .claude/ralph/guardrails.md (known pitfalls)
 3. SYNC:  Check task CLI for in_progress tasks ({{cmd:list_active}})
           → If found, RESUME that task instead of selecting from PRD
 4. READ:  Load PRD and identify next incomplete task (first unchecked box)
 5. TRACK: Look up or create a CLI task for the selected PRD item
           → {{cmd:create_task}} if new, {{cmd:set_status}} to in_progress
           → Append starting note: {{cmd:append_notes}} "-> Starting. Ralph iteration N."
 6. BREAK: If task is complex (3+ steps), create sub-tasks via {{cmd:create_subtask}}
 7. WORK:  Execute the task via the standard pipeline
 8. NOTE:  Update CLI task notes during work: {{cmd:append_notes}} "[done] ..." or "[x] ..."
 9. WRITE: Mark task complete in PRD (check the box)
10. CLOSE: Close the CLI task: {{cmd:close_task}} (and all sub-tasks)
11. VERIFY: Smoke-check work before committing (see Smoke Verification Protocol below)
           → If verification fails, fix wiring issues and re-run tests before proceeding
12. WRITE: Commit changes with passing tests and verified wiring
13. WRITE: Append learnings to progress.md
14. CHECK: All tasks done? → If manifest mode: the manifest-update task (final task in PRD) handles
           state tracking. After that task commits, read manifest for next eligible PRD.
           If next PRD found with satisfied requires → chain to it (load new PRD, continue iterations).
           If no more PRDs or all blocked → output completion promise.
           If single-PRD mode → output completion promise. Otherwise → next iteration.
```

### 2. Progress File Format

`.claude/ralph/progress.md` is append-only across iterations:

```markdown
# Progress Log

## Iteration 1 — [Task title]
- **Status**: Complete
- **Files changed**: path/to/file.ts, path/to/other.ts
- **Patterns discovered**: [Any reusable patterns found]
- **Gotchas**: [Any surprises or issues encountered]
- **Time**: [Timestamp]

## Iteration 2 — [Task title]
...
```

### 3. Guardrails / Signs System

`.claude/ralph/guardrails.md` captures failure patterns so future iterations avoid them:

```markdown
# Guardrails

## Sign: [Descriptive title]
- **Trigger**: [When this applies — e.g., "When modifying auth middleware"]
- **Instruction**: [What to do instead — e.g., "Always run auth tests before committing"]
- **Context**: Iteration [N] — [Brief failure description]
```

**Rules for guardrails:**
- Read ALL guardrails before starting any work
- Follow every sign's instruction when its trigger condition matches
- After a failure (3 retries exhausted), add a new sign documenting the failure
- Guardrails are cumulative — never remove existing signs
- Signs are written in imperative form ("Always...", "Never...", "Check X before Y")

### 4. Context Rotation Triggers

Ralph mode uses context rotation instead of compression for long-running work:

| Context Level | Zone | Action |
|--------------|------|--------|
| < 60% | Green | Work freely, full pipeline execution |
| 60–80% | Yellow | Wrap up current task, commit work, prepare progress notes |
| > 80% | Red | Forced wrap-up: commit everything, write all learnings, prepare for fresh context |

**On rotation:**
1. Commit all current work (even if incomplete -- use WIP commit)
2. **Update task CLI**: Append a pause note to the current task: `{{cmd:append_notes}}` with `[pause] PAUSED AT: [describe exactly where you stopped and what remains]. Context rotating.`
3. Do NOT close the task -- leave it `in_progress` so the next context can find and resume it
4. Append all learnings to `progress.md`, including the task CLI ID for the in_progress task
5. **Manifest mode**: Also note which PRD file is currently active (e.g., `Active PRD: prd-phases/00-foundation/prd-00b-project-init.md`) so the next context knows which file to read
6. Add any new guardrails discovered
7. Update PRD task status (leave unchecked if not fully complete)
8. The next iteration starts with a fresh context window

**On resuming after rotation:**
1. Run `{{cmd:list_active}}` -- the in_progress task from the prior context will appear
2. Run `{{cmd:show_details}}` on that task to read the `[pause]` note with context on where to resume
3. **Manifest mode**: Read progress.md for the active PRD file path, then read the manifest to confirm the PRD is still the current target
4. Continue from where the prior context left off, rather than starting the task from scratch
5. This is why the task CLI is critical -- it survives context rotations while internal state does not

### 5. Completion Promise

When all PRD tasks are checked off, output the completion promise:

```
<promise>COMPLETE</promise>
```

This signals the external loop script (`ralph-loop.sh`) to stop iterating. The promise text can be customized via the `--completion-promise` flag.

### 6. Iteration Discipline

Each iteration MUST:
- Focus on **one task** (the next unchecked item in the PRD)
- Have a corresponding **task CLI entry** set to `in_progress` before work begins
- Break complex tasks into **sub-tasks** in the CLI (3+ steps = sub-tasks)
- Produce at least **one commit** with passing tests
- **Smoke-verify after commit** — confirm the feature is wired into the app (see Smoke Verification Protocol)
- **Distinguish "tests pass" from "app works"** — passing mocked tests is necessary but not sufficient
- **Update CLI notes** on completion or failure (`[done]` or `[x]`)
- **Close the CLI task** on success (`{{cmd:close_task}}`)
- Take no more than **one pipeline cycle** (research → plan → implement)
- End with updated progress notes

Each iteration MUST NOT:
- Attempt multiple unrelated tasks
- Leave uncommitted changes
- Skip the task CLI — **never track work only in PRD checkboxes or internal state**
- Skip writing learnings (even if the task was trivial)
- Continue past the red context zone
- Close a parent task before all sub-tasks are complete
- **Commit a UI feature without verifying its route/page exists** — an orphaned component is worse than no component (it creates false progress)
- **Treat passing mocked tests as proof the app works** — mocks prove the mock layer, not the app

### 7. Activity Log

`.claude/ralph/activity.log` is a machine-readable log for external tooling:

```
[2025-01-15T10:30:00Z] iteration=1 task="Set up project structure" status=complete commit=abc1234
[2025-01-15T10:45:00Z] iteration=2 task="Add auth middleware" status=complete commit=def5678
[2025-01-15T11:00:00Z] iteration=3 task="Add auth tests" status=failed error="timeout in test runner"
```

### 8. Smoke Verification Protocol

Lightweight checks run before every commit (step 11) to verify the app actually works — not just that tests pass. These checks require no E2E infrastructure (no Playwright/Cypress). Verifying before commit ensures broken wiring never enters the repo.

**For UI tasks**:
1. **Route exists**: The page/route file is present in the filesystem
2. **Route registered**: The route is listed in the app's router config (grep for the route path in router files)
3. **Component wired**: The component is imported by its host page (grep for the import statement)
4. **Navigation resolves**: Any nav links referencing this page point to a registered route

**For API tasks**:
1. **Endpoint registered**: The route handler is mounted in the server/router config
2. **Handler imported**: The handler file is imported by the route registration file

**For all tasks**:
1. **Build succeeds**: Run the build command — compilation errors mean the app is broken regardless of test results
2. **No orphaned exports**: New modules are imported somewhere in the app's dependency tree, not just exported into the void

**If smoke verification fails**: Do not commit. Fix the wiring issue first — it's usually a missing import, unregistered route, or broken navigation link. Re-run tests after fixing, then commit clean. These are fast fixes that prevent broken code from entering the repo.

### 9. Ralph Opportunity Detection Criteria

The coordinator and architect should proactively identify when a task is a good Ralph candidate. Check these indicators:

| Indicator | Signal |
|-----------|--------|
| Multiple discrete subtasks | Task has 3+ checkbox items or independent steps |
| Machine-verifiable success | Tests, linting, builds, coverage can confirm completion |
| Well-defined scope | Clear acceptance criteria, not open-ended |
| Repetitive pattern | Same type of change across multiple files/components |
| Greenfield work | New feature buildout with structured requirements |

If 3+ indicators match, suggest Ralph mode to the user:

> "This task looks like a good candidate for Ralph loop mode — it has [indicators]. Ralph would handle each subtask autonomously with iterative refinement. Would you like to use `/ralph` for this, or continue with interactive mode?"

**Only proceed with Ralph if the user explicitly confirms.** Standard interactive mode remains the default.

