---
name: "prd-generate"
description: "Generate prioritized, structured PRD files from task list — supports multi-PRD manifest architecture"
agent: "prd-generator"
---

# /prd-generate

```
/prd-generate [<task list>] [--manifest]
```

Analyze existing phases + project context -> classify, decompose, create tracked tasks with dependencies -> generate PRD files. Auto-detects multi-PRD mode when `prd-phases/manifest.md` exists. Falls back to legacy single-PRD mode otherwise.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| task list | no | Free-text, markdown, or numbered task list. Prompts interactively if not provided. |
| `--manifest` | no | Force multi-PRD mode. Default: auto-detect (manifest exists = multi-PRD, otherwise legacy single-PRD) |

## Mode Detection

1. Check for `prd-phases/manifest.md`
2. If found (or `--manifest` flag): **multi-PRD mode** -- generate individual PRD files in group subdirectories, register in manifest
3. If not found: **legacy single-PRD mode** -- generate `prd-phases/prd-phase-<N>.md` (unchanged behavior for backward compatibility)

## Multi-PRD Workflow

1. **Read manifest** -- `prd-phases/manifest.md` for current state, existing PRD registry, available IDs
2. **Read project context** -- `CLAUDE.md` for stack, conventions, task config
3. **Prompt for task list** (if not provided) -- accepts free-text, markdown, numbered, mixed formats
4. **Determine group and IDs** -- scan manifest registry for next available group/IDs. New PRDs get sequential IDs within their group.
5. **Group into PRDs** -- by feature domain (NOT type-based). Each PRD = 6-20 atomic tasks. Split features that would produce 20+ tasks.
6. **Classify tasks within each PRD** -- type (feature/bug/task/chore), priority, complexity
7. **Batch create ALL tracked tasks** -- epics first, then sub-tasks with parent linking. Capture ALL IDs into a mapping.
8. **Wire dependencies** -- `{{cmd:set_dependency}}` for cross-PRD deps. PRD requires chain from manifest.
9. **Generate individual PRD files** -- one file per PRD in `prd-phases/<group>/prd-<id>-<description>.md` using `templates/prd-multi-template.md`. Embed all task IDs inline. Include manifest-update as final task.
10. **Update manifest** -- register each new PRD in the manifest registry with correct group, requires, status. Update total count.
11. **Self-check** -- validate structure, task system, all `[BD:ID]` markers present, manifest registry consistent

## Legacy Single-PRD Workflow

When no manifest exists and `--manifest` not specified, use the original workflow:

1. **Scan existing phases** -- read `prd-phases/prd-phase-*.md` -> next phase number, formatting, prior-phase epic IDs
2. **Read project context** -- `CLAUDE.md` for stack, conventions, task config
3. **Prompt for task list** (if not provided)
4. **Group into epics** -- by epic (NOT type-based). Aim 4-8 epics per phase.
5. **Classify and prioritize** -- type, priority (P0-P3), complexity
6. **Batch create ALL tracked tasks** -- epics first, then sub-tasks with parent linking
7. **Wire dependencies** -- cross-epic deps + phase gate
8. **Verify task system**
9. **Generate PRD file** -- `prd-phases/prd-phase-<N>.md` with Ralph-compatible format
10. **Self-check**

## Critical Requirements

- **No agent conversation text in output** -- PRD file is specification, not chat transcript
- **Task CLI syntax must be correct** -- all operations use `{{task_cli_name}}` with exact syntax from configured token map
- **Epic priorities must match** -- if PRD says P0, task creation must set P0
- **P0 epics need P0 sub-tasks** -- at least one child must match parent priority
- **Cross-PRD deps wired** -- every inter-PRD dependency reflected in manifest `requires` and `{{cmd:set_dependency}}`
- **Output self-contained** -- agent reading only generated file must know scope, sequence, quality gates
- **Type field required** -- every task step must have a `**Type**:` line (feature, bug, task, or chore). Type must match the CLI create command used (feature -> `{{cmd:create_feature}}`, bug -> `{{cmd:create_bug}}`, task/chore -> `{{cmd:create_task}}`)
- **Atomic Do fields** -- every Do field must contain concrete implementation details: exact function signatures, specific file paths, precise behavior descriptions, or config values. Vague Do fields ("Set up auth", "Configure database") are rejected
- **Manifest-update final task** -- every multi-PRD file must end with a task that updates the manifest registry

## Delegation

Invokes **prd-generator** agent. May delegate to **planner** (epic decomposition + acceptance criteria) or **task-manager** (task creation + dependency wiring).

## Output

**Multi-PRD mode:**
- Individual PRD files in `prd-phases/<group>/prd-<id>-<description>.md`
- Updated `prd-phases/manifest.md` with new registry entries
- All epics/sub-tasks created in {{task_cli_name}} with correct priorities + parent links
- Summary: PRD count, task counts per PRD, recommended starting point

**Legacy mode:**
- `prd-phases/prd-phase-<N>.md` with full Ralph-compatible format
- All epics/sub-tasks created in {{task_cli_name}} with correct priorities + parent links
- Cross-epic dependencies and phase gate wired
- Summary: task counts, priority breakdown, recommended starting point

## Quality Gate

prd-generator runs self-check before delivering. Manual verification:
- Confirm epics exist with correct priorities via `{{cmd:list_all}}`
- Confirm dependencies match PRD declarations
- Confirm phase gate wired (entry-point epics depend on prior-phase epics)
- Confirm no circular dependencies
- **Multi-PRD mode**: Confirm manifest registry matches generated files, all PRD files exist, total count accurate
