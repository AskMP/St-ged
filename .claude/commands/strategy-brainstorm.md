---
name: "strategy-brainstorm"
description: "Launch a structured brainstorming session with multi-source research"
agent: "strategist"
---

# /strategy-brainstorm

```
/strategy-brainstorm <topic> [--constraints "<constraints>"] [--existing-research <path>]
```

Structured brainstorming via progressive deepening. Explores problem space, gathers multi-source evidence, produces Research Brief with scored opportunity candidates. **Explore** depth of strategist agent.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| topic | yes | — | Domain, market, or problem space to explore |
| --constraints | no | none | Team size, budget, timeline, tech stack (quote value) |
| --existing-research | no | none | Path to prior research to incorporate |

## Behavior

1. **Frame problem** using JTBD — define statements for target user, identify constraints, state assumptions, define session success criteria
2. **Divergent research** via progressive deepening — Round 1: market validation, Round 2: gap identification (need + poor solutions), Round 3: evidence gathering (user complaints). Consult reviews, forums, competitor pages, community discussions.
3. **Synthesize** — deduplicate, resolve contradictions, cluster into opportunity themes, assign confidence (High/Medium/Low)
4. **Score opportunities** using RICE — estimate Reach/Impact/Confidence/Effort, justify with evidence, rank
5. **Adversarial challenge** — top 3-5 opportunities: "What if competitor enters?" / "What if adoption is 50%?" Adjust confidence.
6. **Assemble Research Brief** using `templates/research-brief.md`
7. **Quality self-assessment** (minimum 80/100)

## Output

Research Brief → JTBD framing, multi-source findings with confidence levels, 5-10 opportunity candidates with RICE scores, competitive landscape, risks/unknowns, next steps.

## Pipeline

`/strategy-brainstorm` → `/strategy-opportunity` → `/strategy-spec`

## Examples

```
/strategy-brainstorm "Shopify app ecosystem"
/strategy-brainstorm "developer tools for headless commerce" --constraints "solo dev, TypeScript stack, 3 months"
/strategy-brainstorm "accessibility compliance tools" --existing-research docs/research/
/strategy-brainstorm "AI-assisted code review" --constraints "2-person team, $0 marketing budget"
```
