---
name: "session-start"
description: "Automates work session startup checklist"
agent: "coordinator"
---

# /session-start

```
/session-start [--task <task-id>]
```

Automates session startup: checks state, shows available tasks, sets up branch, spawns coordinator. No work begins without task tracking and branch setup.

- `--task <task-id>` (optional): Resume specific existing task

## Behavior

1. **Run `/session-context`** — full session context summary (git, tasks, services, environment, prior manifest).

2. **Handle leftover state** — uncommitted changes exist → warn, ask: stash / commit / continue. Stale session manifest → clear it (`> .claude/session-manifest.log`).

3. **Consult known-errors.md** — remind about recurring issues relevant to environment state.

4. **Claim / create work**
   - If `--task` provided: run `{{cmd:show_details}}` and claim it
   - Otherwise: run `{{cmd:list_ready}}` → show available/unblocked tasks
   - Prompt user to pick task / create new one

5. **Set up branch** (if code changes needed)
   - Ensure on latest main: `git checkout main && git pull`
   - Create feature branch: `git checkout -b <prefix>-<task-id>/<description>`
   - Or switch to existing branch if resuming

6. **Set task to in_progress**
   - Run `{{cmd:set_status}}` → mark in_progress
   - Run `{{cmd:append_notes}}` with `-> Starting. Phase 1: Analyzing task.`

7. **Spawn coordinator** — coordinator agent takes over session management, routes to domain agents.

