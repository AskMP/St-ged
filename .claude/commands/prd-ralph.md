---
name: "prd-ralph"
description: "Execute a PRD phase autonomously via Ralph loop — supports manifest-based multi-PRD chaining"
agent: "coordinator"
---

# /prd-ralph

Execute most recent (or specified) PRD phase autonomously via Ralph loop. Bridges `/prd-generate` -> `/ralph` into two-step pipeline. Auto-detects manifest vs single-PRD mode.

```
/prd-ralph
/prd-ralph prd-phases/manifest.md
/prd-ralph prd-phases/00-foundation/prd-00b-project-init.md
/prd-ralph --max-iterations 15
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| PRD phase file or manifest | no | Path to specific PRD file or manifest (default: auto-detect) |
| `--max-iterations` | no | Override Ralph's default iteration limit |

## Auto-Detection Order

Without arguments, prd-ralph detects the input in this order:

1. `prd-phases/manifest.md` exists -> manifest mode (multi-PRD chaining)
2. `prd-phases/prd-phase-*.md` exists -> legacy single-PRD mode (highest-numbered phase)
3. Neither exists -> error, suggest running `/prd-generate` first

## Behavior

### Per-Phase Setup: Batch BD Task Creation (runs once per PRD)

Before any implementation iteration begins for a PRD, front-load ALL task CLI interaction. This runs once at the start of each PRD execution -- not globally across all PRDs. After setup completes, subsequent iterations do NOT need the BD CLI reference material loaded, saving significant context/tokens.

1. **Locate PRD**: In manifest mode, read manifest registry and find first `status: pending` entry where all `requires` are `status: complete`. In legacy mode, scan `prd-phases/` for highest-numbered phase.
2. **Validate readiness**: PRD file exists, all task IDs present (look for `[BD:*]` markers inline).
3. **Check task CLI state**: Run `{{cmd:list_all}}` -- verify all PRD task IDs for this PRD exist in CLI.
4. **Create missing tasks for this PRD** (if PRD was written without IDs, or tasks were deleted):
   - Create all epics for this PRD -> capture IDs
   - Create all sub-tasks with parent links -> capture IDs
   - Wire all dependencies within this PRD
   - Wire PRD-level dependencies (entry tasks depend on prerequisite PRDs' final tasks)
   - Embed all `[BD:ID]` markers back into the PRD file
5. **Confirm with user**: Display summary (task count, priorities, manifest position if applicable) -> confirm before launch.

### Per-PRD Iterations: Minimal-Context Implementation

Each iteration gets only what it needs -- no BD CLI reference, no task management docs. Tasks already exist from this PRD's setup step.

6. **Launch Ralph**: Delegate to `/ralph` with PRD file (or manifest). Each iteration:
   - Reads ONE task step from the PRD (self-contained: Do/Files/Verify/Accept)
   - Sets task to `in_progress` via `{{cmd:set_status}}` (single command, no lookup needed -- ID is inline)
   - Implements the task
   - Marks complete via `{{cmd:close_task}}` and checks the PRD box
   - Appends learnings to progress.md

### Manifest Mode: Cross-PRD Chaining

7. **After completing all tasks in a PRD**: The final task updates the manifest (marks entry `status: complete`).
8. **Read manifest for next PRD**: Find next `status: pending` entry with all requires satisfied.
9. **Run per-phase setup for next PRD** (step 1-5): batch-create BD tasks for the new PRD.
10. **Continue iterations**: Execute the next PRD's tasks (step 6).
11. **Repeat** until all manifest entries are `status: complete` or max iterations reached.

## Context Efficiency

The per-PRD setup/iteration split means:
- **Setup** (once per PRD): Loads BD operator agent, task management skill, full CLI reference. Creates all tasks for this PRD.
- **Iterations**: Each iteration needs only the PRD file, progress.md, guardrails.md, and 2 BD CLI commands (`set_status`, `close_task`). No task creation, no dependency wiring, no search/lookup.
- **Manifest mode**: Between PRDs, a lightweight manifest read determines the next target. No full registry re-processing.

This minimizes token usage per iteration -- the bulk of BD interaction happens once at the start of each PRD.

## Prerequisites

- PRD file or manifest must exist (run `/prd-generate` or `/forge-scaffold` first)
- Per-phase setup creates/verifies tasks in CLI (no manual pre-creation needed)
- `.claude/ralph/` created automatically if missing
