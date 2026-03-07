---
name: "strategy-spec"
description: "Generate a complete product or feature specification from evaluated opportunities"
agent: "strategist"
---

# /strategy-spec

```
/strategy-spec <product-or-feature> [--existing-research <path>] [--constraints "<constraints>"] [--portfolio]
```

Comprehensive product/feature specification from evaluated opportunities: MoSCoW features, architecture sketch, pricing, risk assessment, phased roadmap, Definition of Done. **Specify** depth of strategist agent.

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| product-or-feature | yes | — | Name and brief description |
| --existing-research | no | none | Path to prior research or opportunity assessment |
| --constraints | no | none | Team size, budget, timeline, tech stack |
| --portfolio | no | false | Generate portfolio-level planning (shared infra, dependencies, cross-sell) |

## Behavior

1. **Load context** — read existing research, extract pain points, competitive gaps, RICE scores. Warn if skipping `/strategy-opportunity`.
2. **Problem statement** — evidence-grounded, JTBD statement(s), quantify affected users/frequency/impact
3. **Feature scoping (MoSCoW)** — Must Have (core promise fails without), Should Have (competitive parity), Could Have (backlog), Won't Have (excluded with reasoning). Each: description, user story, acceptance criteria.
4. **Technical architecture sketch** — stack recommendation with rationale, components/interactions, APIs/integrations, data model, performance budgets
5. **Competitive positioning** — how product wins, defensible differentiators, pricing position
6. **Pricing strategy** — tier structure, revenue projections (conservative/expected/optimistic), assumptions, break-even
7. **Risk assessment** — likelihood x impact matrix, mitigation for High/Critical, kill criteria
8. **Phased roadmap** — Phase 0: setup, Phase 1: MVP (Must Have), Phase 2: Should Have, Phase 3: growth. Each: duration, objectives, deliverables, dependencies.
9. **Definition of Done** — project DoD: code, tests, docs, UI, accessibility, security standards
10. **Portfolio planning** (if --portfolio) — shared infra, inter-product deps/sequencing, cross-sell, aggregate risk, parallelized timeline
11. **Create task** — `{{cmd:create_epic}}` with title `Epic: <Product Name>`:

    ```markdown
    ## Overview
    <problem statement>

    ## Spec Location
    <path to spec document>

    ## Acceptance Criteria
    - [ ] Product spec reviewed and approved
    - [ ] Phase 1 roadmap finalized
    - [ ] MVP features estimated
    - [ ] Infrastructure requirements identified
    ```

    Then `{{cmd:create_subtask}}` for each Phase 1 Must Have feature.

12. **Quality self-assessment** (minimum 80/100)

## Output

Product Specification → problem statement, JTBDs, MoSCoW features with acceptance criteria, architecture sketch, competitive positioning, pricing projections, risk matrix, phased roadmap, DoD, optional portfolio planning.

## Pipeline

`/strategy-brainstorm` → `/strategy-opportunity` → `/strategy-spec` → `/pipeline-research` → `/pipeline-plan`

## Examples

```
/strategy-spec "CleanSlate - post-uninstall code cleanup for Shopify"
/strategy-spec "headless wishlist" --existing-research docs/research/opportunity-headless.md
/strategy-spec "accessibility compliance tool" --constraints "2 devs, React/TypeScript, 4 months"
/strategy-spec "Tempered Tools portfolio" --portfolio --existing-research docs/research/
```
