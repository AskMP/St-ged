---
name: "session-end"
description: "Automates work session teardown checklist"
agent: "coordinator"
---

# /session-end

```
/session-end
```

Automates session teardown: runs tests, shows active tasks for status updates, prompts for closing notes, checks uncommitted work.

## Behavior

1. **Verify current state** — run test suite, confirm nothing broken, show results summary.

2. **Update task notes**
   - Run `{{cmd:list_active}}` → show in-progress tasks
   - Prompt for closing / pause notes on each:
     - Run `{{cmd:append_notes}}` with `[done] Completed: <summary>`
     - Run `{{cmd:append_notes}}` with `[pause] PAUSED AT: <location>`
   - Run `{{cmd:close_task}}` for completed tasks

3. **Check uncommitted work** — `git status` → show unstaged/uncommitted changes. If changes exist, prompt: commit / stash / leave?

4. **Remind about PRs** — on feature branch with unpushed commits → remind to push. Work complete → remind to create PR.

5. **Show session manifest** — display session edit log if exists: `cat .claude/session-manifest.log 2>/dev/null`. Summarize files modified.

6. **Run `/git-diff-summary`** if uncommitted changes — suggest commit message and task note.

7. **Session summary** — tasks worked on + status, commits made, files modified (from manifest), remaining action items.

