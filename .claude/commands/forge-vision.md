---
name: "forge-vision"
description: "Define product vision — principles, value propositions, scope boundaries, and success metrics"
agent: "product-owner"
---

# /forge-vision

```
/forge-vision <product idea or description> [--constraints "<constraints>"] [--existing-research <path>]
```

Produces Product Vision document: positioning statement, product principles, value proposition canvas, success metrics, scope boundaries, assumptions. Phase 1 of `/forge` as standalone command.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| product idea | yes | — | Product name/description or problem statement |
| --constraints | no | none | Team size, budget, timeline, tech preferences |
| --existing-research | no | none | Path to prior research (from `/strategy-brainstorm`, `/strategy-opportunity`) |

## Behavior

1. **Gather context** — read existing research, identify known vs. assumed
2. **Define vision statement** — For [target user] who [need], [Product] is a [category] that [benefit]. Unlike [alternative], our product [differentiation].
3. **Establish product principles** — 3-5 opinionated rules; each must make at least one plausible alternative explicitly wrong
4. **Build value proposition canvas** — map jobs/pains/gains → features; flag unmapped features
5. **Set success metrics** — leading/lagging indicators, North Star with evidence-based targets
6. **Define scope boundaries** — IS / IS NOT / Scope Fences
7. **Document assumptions** — prioritize by risk (what kills product if wrong)
8. **Quality self-assessment** — minimum 80/100

## Output

Product Vision document following `templates/product-vision.md`.

**Output location logic:**
1. If active forge workspace exists (`.claude/forge/<project-name>/docs/`) → write `.claude/forge/<project-name>/docs/vision.md`
2. Otherwise → `./docs/vision.md` (creating `docs/` if needed)

## Pipeline

`/strategy-brainstorm` → `/forge-vision` → `/forge-personas` → `/forge` continues or `/strategy-spec`

## Examples

```
/forge-vision "Tails - a pet wellness tracking platform for dog owners"
/forge-vision "CleanSlate - orphaned code cleanup for Shopify themes" --constraints "solo dev, 3 months"
/forge-vision "Developer productivity tool" --existing-research docs/research/brainstorm-devtools.md
```
