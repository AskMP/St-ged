---
name: "strategy-opportunity"
description: "Deep-evaluate and score specific opportunities from research"
agent: "strategist"
---

# /strategy-opportunity

```
/strategy-opportunity <topic> [--existing-research <path>] [--focus <market|competitive|technical|financial>]
```

Deep evaluation of specific opportunities. Raw research → rigorous Opportunity Assessment with RICE scores, competitive analysis, adversarial stress-testing, ranked GO/INVESTIGATE/PASS recommendation. **Evaluate** depth of strategist agent.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| topic | yes | — | Specific opportunity or domain to evaluate |
| --existing-research | no | none | Path to prior research |
| --focus | no | all | `market` (sizing, trends), `competitive` (landscape, gaps), `technical` (feasibility), `financial` (revenue, costs) |

## Behavior

1. **Load context** — read existing research, identify known vs. needs investigation, frame evaluation criteria
2. **Deep competitive analysis** — direct competitors (same category) + indirect (alternative JTBD solutions). Per competitor: features, pricing, user complaints (with sources), position. Map gaps users want but nobody provides well.
3. **Evidence deep-dive** — specific user quotes/complaints with sources, advertised vs. actual experience, quantify problem (users affected, frequency, financial impact)
4. **RICE scoring** — Reach/Impact/Confidence/Effort with 2-3 sentence justification per factor, ranked
5. **Adversarial challenge** — market (competitor entry, platform native features, contraction), execution (complexity, timeline, resources), business model (pricing, churn, conversion). Define kill criteria per opportunity.
6. **Recommendation** — rank by post-adversarial RICE. GO → next steps toward spec. INVESTIGATE → what to validate. PASS → document reasoning.
7. **Assemble Opportunity Assessment** using `templates/opportunity-assessment.md`
8. **Quality self-assessment** (minimum 80/100)

## Output

Opportunity Assessment → competitive landscape matrix, user evidence summary, RICE scores with justification, adversarial results, kill criteria, GO/INVESTIGATE/PASS recommendations, next steps.

## Examples

```
/strategy-opportunity "headless wishlist tools for Shopify Hydrogen"
/strategy-opportunity "code cleanup tools" --existing-research docs/research/brainstorm-shopify.md
/strategy-opportunity "accessibility compliance" --focus competitive
/strategy-opportunity "review apps for headless commerce" --focus financial
```
