---
name: "quality-validation"
description: "Scoring rubrics and quality gates for agent artifacts"
auto_invoke: true
triggers: ["ResearchPack produced", "Implementation Plan produced", "agent artifact requires validation", "quality gate check"]
---

# Quality Validation

## Quality Gates

- ResearchPack: 80/100 min → blocks planner until met
- Implementation Plan: 85/100 min → blocks implementer until met

On failure, producing agent revises and resubmits. Max 2 attempts before escalating to architect.

## Scoring Rubrics

### ResearchPack Rubric (100 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| **Accuracy** | 25 | Factually correct and version-accurate |
| **Completeness** | 25 | All requested topics covered with sufficient depth |
| **Source Quality** | 20 | Official docs, repos, or authoritative sources |
| **Structure** | 15 | Clear sections, headings, cross-references |
| **Actionability** | 15 | Directly usable by planner agent |

90–100: Exceptional. 80–89: Sufficient. 70–79: Needs revision. <70: Major rework.

### Implementation Plan Rubric (100 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| **Feasibility** | 20 | Technically achievable with given constraints |
| **Completeness** | 20 | All requirements addressed with clear steps |
| **Test Coverage** | 20 | Happy path, edge cases, error scenarios |
| **Dependency Clarity** | 15 | Dependencies identified and sequenced |
| **Risk Mitigation** | 15 | Risks identified with concrete strategies |
| **Clarity** | 10 | Unambiguous and actionable by implementer |

90–100: Exceptional. 85–89: Sufficient. 75–84: Needs revision. <75: Major rework.

## Validation Process

1. **Score each criterion** — assign score (0 to max) with one-line justification, flag critical gaps blocking downstream agents
2. **Calculate total** — sum criterion scores, compare against gate threshold
3. **Generate report** — include: total score, gate decision (PASS/FAIL), criterion scores table, critical gaps, actionable recommendations
4. **Gate decision** — PASS → proceeds to next agent; FAIL (attempt 1–2) → return to producing agent with report; FAIL (attempt 3) → escalate to architect with full context
