---
name: "pipeline-plan"
description: "Invoke the planner agent to produce an Implementation Plan"
triggers: ["/pipeline-plan"]
agent: "planner"
---

# /pipeline-plan

## Usage

```
/pipeline-plan <task description> [--from-research]
```

## Description

Invokes **planner** agent → creates detailed Implementation Plan from ResearchPack. Plan is step-by-step blueprint the implementer agent executes using TDD.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| task description | yes | — | What needs to be built or changed |
| --from-research | no | auto-detect | Explicitly reference ResearchPack from current session |

## Behavior

1. Parse task description from user input
2. Locate most recent ResearchPack in session (or one specified by `--from-research`)
3. Delegate to `planner` agent with ResearchPack and task description
4. Planner:
   - Analyze ResearchPack for relevant findings
   - Read existing code files referenced in task
   - Decompose task into sequenced implementation steps
   - Design test strategy (unit, integration, edge cases)
   - Identify risks and mitigation strategies
5. Produce Implementation Plan artifact
6. Self-assess quality against Implementation Plan rubric (minimum: 85/100)
7. If quality gate fails, planner revises (up to 2 attempts)
8. Return Implementation Plan to user

## Output

Structured Implementation Plan (see planner agent).

## Examples

```
/pipeline-plan add user authentication with JWT
/pipeline-plan refactor the payment module to use Stripe API v3
/pipeline-plan create a CLI tool for database migrations --from-research
```

Chain: `/pipeline-research` → `/pipeline-plan` → `/pipeline-implement`, or use `/pipeline-workflow` for full auto pipeline.
