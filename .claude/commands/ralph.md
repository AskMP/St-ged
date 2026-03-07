---
name: "ralph"
description: "Launch autonomous Ralph loop mode for AFK iterative task execution"
agent: "coordinator"
---

# /ralph

```
/ralph <PRD file, manifest, or task description> [--max-iterations N] [--completion-promise "TEXT"]
```

Autonomous iterative task execution. Each iteration completes one focused subtask, commits, captures learnings, proceeds to next. Use for AFK development through structured PRD without human intervention.

Supports two modes:
- **Manifest mode**: `/ralph prd-phases/manifest.md` -- reads PRD registry, chains PRDs automatically
- **Single-PRD mode**: `/ralph prd-phases/prd-scaffold.md` or any individual PRD file -- executes one PRD's tasks

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| PRD file / manifest / task description | yes | Path to manifest (multi-PRD chaining), single PRD file, or task description |
| `--max-iterations` | no | Maximum loop iterations (default: 25 single-PRD, 100 manifest) |
| `--completion-promise` | no | Custom completion signal text (default: "COMPLETE") |

## Mode Detection

Ralph detects the mode from the input file:

1. **Manifest file** (contains `## PRD Registry`): multi-PRD mode -- reads registry, selects next eligible PRD, chains between PRDs on completion
2. **Single PRD file** (contains `## Tasks` but no registry): single-PRD mode -- executes tasks within that one file
3. **Task description** (not a file path): generates a PRD with checkbox tasks, then executes in single-PRD mode

## Behavior

### Single-PRD Mode (unchanged)

1. **Parse input**: PRD file -> read. Task description -> generate PRD with checkbox tasks.
2. **Enter Ralph mode**: Create `.claude/ralph/` if needed, read `progress.md` + `guardrails.md` if resuming, check task CLI for in_progress tasks from prior context rotation -> resume first.
3. **Iterate**: Delegate to ralph-orchestrator with PRD + iteration number. Orchestrator creates/syncs CLI tasks, sets in_progress, breaks complex tasks into sub-tasks. On completion: close CLI task, commit, update progress, check completion promise.
4. **Complete**: All tasks checked or max iterations -> report final status.

### Manifest Mode (multi-PRD chaining)

1. **Read manifest**: Parse PRD Registry for all entries and their statuses.
2. **Select next PRD**: Find first `status: pending` entry where all `requires` dependencies have `status: complete`.
3. **Read that PRD file**: Load the selected PRD and enter single-PRD execution for its tasks.
4. **Execute tasks**: Same iteration loop as single-PRD mode.
5. **PRD complete**: The final task in every PRD updates the manifest (marks entry `status: complete`, increments progress counter).
6. **Chain to next**: Read manifest again, find next eligible PRD (step 2). Repeat.
7. **All complete**: All registry entries `status: complete` -> output completion promise.
8. **Blocked**: No pending PRDs with satisfied dependencies -> report blocked state, show which PRDs are blocking.

**Task CLI integration**: Every PRD task gets corresponding CLI task (bd, GitHub Issues, Linear, Jira, etc.) with in_progress status, notes, sub-tasks. Task state survives context rotations.

## Loop Flow

### Single-PRD
```
/ralph prd-phases/00-foundation/prd-00a-task-management.md
  |
  +-- Iteration 1: Task 1 -> commit -> continue
  +-- Iteration 2: Task 2 -> commit -> continue
  +-- ... until all tasks checked
      +-- Output: <promise>COMPLETE</promise>
```

### Manifest (multi-PRD chaining)
```
/ralph prd-phases/manifest.md
  |
  +-- Read manifest -> select prd-00a (first pending, no requires)
  |   +-- Iteration 1: Task 1 of prd-00a -> commit
  |   +-- Iteration 2: Task 2 of prd-00a -> commit
  |   +-- ... all prd-00a tasks done -> update manifest
  |
  +-- Read manifest -> select prd-00b (pending, requires 00a = complete)
  |   +-- Iteration N: Task 1 of prd-00b -> commit
  |   +-- ... all prd-00b tasks done -> update manifest
  |
  +-- ... chain through all PRDs in registry order
      +-- All PRDs complete -> Output: <promise>COMPLETE</promise>
```

## External AFK Script

For fully autonomous execution outside interactive Claude session:

```bash
bash .claude/scripts/ralph-loop.sh 10
```

Runs `claude -p` in loop, passing PRD/manifest and progress context each iteration, exits when completion promise detected in output.
