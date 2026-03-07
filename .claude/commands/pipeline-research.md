---
name: "pipeline-research"
description: "Invoke the researcher agent to produce a ResearchPack"
triggers: ["/pipeline-research"]
agent: "researcher"
---

# /pipeline-research

## Usage

```
/pipeline-research <topic> [--version <version>] [--depth surface|working|deep]
```

## Description

Invokes **researcher** agent → gathers version-accurate documentation about a topic → produces structured ResearchPack. Output feeds into `/pipeline-plan` for Implementation Plan creation.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| topic | yes | — | Library, framework, API, or technical topic to research |
| --version | no | latest stable | Target version to research |
| --depth | no | working | Research depth: `surface`, `working`, or `deep` |

## Behavior

1. Parse topic and flags from user input
2. Delegate to `researcher` agent with parsed input
3. Researcher follows research-methodology skill:
   - Define research scope
   - Discover and prioritize sources
   - Survey breadth, then dive into depth
   - Validate findings across multiple sources
4. Produce ResearchPack artifact
5. Self-assess quality against ResearchPack rubric (minimum: 80/100)
6. If quality gate fails, researcher revises (up to 2 attempts)
7. Return ResearchPack to user

## Output

Structured ResearchPack (see researcher agent).

## Examples

```
/pipeline-research next.js app router
/pipeline-research prisma --version 5.0 --depth deep
/pipeline-research react-query --depth surface
```

Chain: `/pipeline-research` → `/pipeline-plan` → `/pipeline-implement`, or use `/pipeline-workflow` for full auto pipeline.
