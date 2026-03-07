---
name: "pipeline-workflow"
description: "Run the full research → plan → implement pipeline"
triggers: ["/pipeline-workflow"]
agent: "architect"
---

# /pipeline-workflow

## Usage

```
/pipeline-workflow <task description> [--topic <research topic>] [--version <version>] [--stop-at research|plan]
```

## Description

Runs full pipeline — research → plan → implement — orchestrated by **architect** agent. Automated equivalent of running `/pipeline-research`, `/pipeline-plan`, `/pipeline-implement` in sequence with quality gates enforced between stages.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| task description | yes | — | What needs to be built or changed |
| --topic | no | inferred from task | Explicit research topic (if different from task) |
| --version | no | latest stable | Target version for research |
| --stop-at | no | implement | Stop after `research` or `plan` stage |

## Behavior

1. Parse task description, topic, and flags
2. Delegate to **architect** agent to orchestrate pipeline
3. Architect executes stages:

### Stage 1: Research
- Invoke `researcher` agent with topic → ResearchPack
- **Quality gate: 80/100** — blocks pipeline if not met
- On failure: researcher revises (up to 2 attempts), then escalates to user

### Stage 2: Plan
- Invoke `planner` agent with ResearchPack + task description → Implementation Plan
- **Quality gate: 85/100** — blocks pipeline if not met
- On failure: planner revises (up to 2 attempts), then escalates to user

### Stage 3: Implement
- Invoke `implementer` agent with ResearchPack + Implementation Plan
- Execute TDD with 3-retry self-correction
- On failure: individual steps escalate to architect for resolution

4. Architect produces Orchestration Report summarizing full workflow

## Output

Structured Orchestration Report (see architect agent).

## Examples

```
/pipeline-workflow add OAuth2 authentication using Auth.js
/pipeline-workflow build a REST API for user management --topic express.js --version 4.18
/pipeline-workflow create a data pipeline --stop-at plan
/pipeline-workflow add real-time notifications --topic websockets --stop-at research
```

## Pipeline Flow

researcher (80+ gate) → planner (85+ gate) → implementer. On failure: revise x2, then escalate to architect.

## Interruption

- `--stop-at research` — review ResearchPack before planning
- `--stop-at plan` — review Plan before coding
- Resume with `/pipeline-plan` or `/pipeline-implement`
