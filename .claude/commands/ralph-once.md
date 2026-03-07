---
name: "ralph-once"
description: "Run a single Ralph iteration with human review before continuing"
agent: "coordinator"
---

# /ralph-once

```
/ralph-once <PRD file or task description>
```

Single Ralph iteration with human review. Pick next incomplete task, execute, commit, report. User reviews before next `/ralph-once`. HITL bridge between interactive work and full AFK `/ralph`.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| PRD file / task description | yes | Path to PRD file with checkbox tasks, or task description |

## Behavior

1. **Parse input**: Read PRD file or generate from task description
2. **Load state**: Read `progress.md` + `guardrails.md`. Check task CLI for in_progress tasks from prior rotation → resume first.
3. **Select task**: First unchecked PRD task → create/lookup CLI task, set in_progress. Complex tasks (3+ steps) → break into sub-tasks.
4. **Execute**: Delegate to ralph-orchestrator. Update CLI notes (`[done]` for progress, `[x]` for failures).
5. **Complete**: Success → close CLI task, mark PRD checkbox. Failure → leave in_progress with notes.
6. **Report**: Task status, files changed, tests, next task.
7. **Wait**: User reviews and invokes `/ralph-once` again.

**Task CLI integration**: Every PRD task gets CLI task (bd, GitHub Issues, Linear, Jira) with in_progress status, notes, sub-tasks. State survives context rotations.

## When to Use

- Validate approach before going AFK
- After Ralph failure (review and fix before continuing)
- Iterative progress with review checkpoints

## External HITL Script

For single-iteration execution outside interactive session:

```bash
bash .claude/scripts/ralph-once.sh
```
