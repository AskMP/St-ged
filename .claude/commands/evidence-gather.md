---
name: "evidence-gather"
description: "Structured evidence collection for debugging and decision-making"
agent: "debugger"
---

# /evidence-gather

```
/evidence-gather <hypothesis> [--task <task-id>]
```

Structured evidence collection: define hypothesis, gather evidence, classify confidence, output evidence report. Governance: Standard+ (Rule S6).

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| hypothesis | yes | -- | The hypothesis to investigate (e.g., "The API timeout is caused by N+1 queries") |
| --task | no | auto-create | Link to existing task instead of creating new one |

## Behavior

### 1. Define Hypothesis

State the hypothesis clearly. A good hypothesis is:
- **Specific**: Names the component, behavior, and expected cause
- **Falsifiable**: Can be disproved with evidence
- **Scoped**: Addresses one thing at a time

### 2. Gather Evidence

Use one or more of these evidence-gathering methods:

| Method | When to Use | Example |
|--------|-------------|---------|
| **Reproduce** | Bug reports, intermittent failures | Run the failing scenario, capture output |
| **Measure** | Performance issues, resource usage | Profile, benchmark, count queries |
| **Trace** | Data flow issues, unexpected state | Follow execution path, log intermediate values |
| **Compare** | Regressions, environment differences | Diff working vs. broken state, compare configs |

For each piece of evidence gathered, record:
- **Source**: Where the evidence came from (file, log, profiler, etc.)
- **Observation**: What was observed
- **Relevance**: How it relates to the hypothesis

### 3. Classify Confidence

Based on gathered evidence, classify the hypothesis:

| Classification | Meaning | Action |
|----------------|---------|--------|
| **Confirmed** | Evidence strongly supports the hypothesis | Proceed to fix |
| **Likely** | Evidence leans toward the hypothesis but isn't conclusive | Gather more evidence or proceed with caution |
| **Uncertain** | Evidence is mixed or insufficient | Gather more evidence before acting |
| **Disproved** | Evidence contradicts the hypothesis | Form new hypothesis |

### 4. Output Evidence Report

```markdown
## Evidence Report

**Hypothesis**: <the hypothesis>
**Classification**: Confirmed / Likely / Uncertain / Disproved
**Confidence**: High / Medium / Low

### Evidence Gathered

| # | Method | Source | Observation | Supports Hypothesis? |
|---|--------|--------|-------------|---------------------|
| 1 | ... | ... | ... | Yes / No / Partial |

### Analysis

<Summary of what the evidence shows>

### Recommended Action

<What to do next based on the evidence>
```

If linked to a task, append the evidence report to task notes via `{{cmd:append_notes}}`.

## Examples

```
/evidence-gather "The login timeout is caused by the session middleware checking Redis on every request"
/evidence-gather "The build failure is caused by a circular dependency in the auth module" --task PROJ-42
```
