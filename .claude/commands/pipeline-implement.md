---
name: "pipeline-implement"
description: "Invoke the implementer agent to execute an Implementation Plan"
triggers: ["/pipeline-implement"]
agent: "implementer"
---

# /pipeline-implement

## Usage

```
/pipeline-implement [--from-plan] [--dry-run]
```

## Description

Invokes **implementer** agent → executes Implementation Plan using TDD with 3-retry self-correction loop. Writes tests first, then implements code to pass them.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| --from-plan | no | auto-detect | Explicitly reference Implementation Plan from current session |
| --dry-run | no | false | Preview what would be done without writing code |

## Behavior

1. Locate most recent Implementation Plan in session (or one specified by `--from-plan`)
2. Also locate associated ResearchPack for reference
3. Delegate to `implementer` agent with both artifacts
4. Implementer executes each plan step using TDD:
   - **Red**: Write test, confirm it fails
   - **Green**: Write minimum code to pass test
   - **Refactor**: Clean up while keeping tests green
5. On test failure, enter self-correction loop:
   - Retry 1: Analyze error, fix likely cause
   - Retry 2: Re-read ResearchPack, verify API usage
   - Retry 3: Reassess approach, try alternative
   - If all retries fail: escalate to architect
6. After all steps, run full test suite
7. Produce Implementation Report

## Output

Structured Implementation Report (see implementer agent).

## Examples

```
/pipeline-implement
/pipeline-implement --dry-run
/pipeline-implement --from-plan
```

Chain: `/pipeline-research` → `/pipeline-plan` → `/pipeline-implement`, or use `/pipeline-workflow` for full auto pipeline.
