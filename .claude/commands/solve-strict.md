---
name: "solve-strict"
description: "Five Whys root cause analysis with evidence at each level"
agent: "debugger"
---

# /solve-strict

```
/solve-strict <problem-statement> [--task <task-id>]
```

Five Whys root cause analysis where each "why" requires evidence (not assumptions). Stops at an actionable root cause, proposes a fix addressing the root cause not symptoms, and includes a regression test. Governance: Full (Rule F2).

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| problem-statement | yes | -- | The observable problem to analyze (e.g., "Users see a 500 error on the checkout page") |
| --task | no | auto-create | Link to existing task instead of creating new one |

## Behavior

### 1. State the Problem

Document the observable problem. Must be specific and verifiable:
- What is happening?
- What should be happening instead?
- When did it start (if known)?
- Who is affected?

### 2. Five Whys Analysis

For each "why" level (up to 5):

1. **Ask Why**: Why is this happening?
2. **Gather Evidence**: Use `/evidence-gather` methodology -- reproduce, measure, trace, or compare. No speculation allowed.
3. **Classify**: Is the evidence Confirmed, Likely, Uncertain, or Disproved?
4. **Record**: Document the why, evidence, and classification
5. **Decide**: Is this the actionable root cause, or do we go deeper?

**Stop conditions** (do not always go to 5):
- Reached an actionable root cause (something the team can directly fix)
- Evidence is uncertain at this level (gather more evidence before going deeper)
- Reached a system boundary outside the team's control

### 3. Root Cause Identification

The root cause must be:
- **Actionable**: The team can fix it directly
- **Specific**: Points to a concrete code path, configuration, or process
- **Evidenced**: Supported by confirmed or likely evidence from the analysis

### 4. Propose Fix

The fix must address the root cause, not symptoms:
- **What to change**: Specific files, functions, configurations
- **Why this fixes it**: Trace back through the why chain
- **Blast radius**: What else could be affected by this change
- **Regression test**: A test that would have caught this problem

### 5. Output

```markdown
## Five Whys Analysis

**Problem**: <problem statement>
**Date**: <date>

### Why Chain

| Level | Why | Evidence | Classification | Source |
|-------|-----|----------|----------------|--------|
| 1 | Why is <problem> happening? | <evidence> | Confirmed | <source> |
| 2 | Why is <level 1 cause> happening? | <evidence> | Likely | <source> |
| 3 | Why is <level 2 cause> happening? | <evidence> | Confirmed | <source> |

**Root Cause (Level 3)**: <actionable root cause>

### Proposed Fix

**Change**: <what to change>
**Files**: <affected files>
**Rationale**: <why this addresses the root cause>
**Blast Radius**: <what else could be affected>

### Regression Test

**Test file**: <path>
**Test description**: <what the test verifies>
**Ensures**: This problem cannot recur without failing CI
```

If linked to a task, append the analysis to task notes via `{{cmd:append_notes}}`.

## Examples

```
/solve-strict "Users see a 500 error when submitting the checkout form with a coupon code"
/solve-strict "CI pipeline takes 12 minutes when it used to take 4" --task PROJ-88
```
