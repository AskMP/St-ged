---
name: "forge-personas"
description: "Create research-backed user personas with journey maps, empathy maps, and user stories"
agent: "ux-researcher"
---

# /forge-personas

```
/forge-personas <product or domain> [--vision <path>] [--existing-research <path>] [--count N]
```

Creates research-backed behavioral personas (not demographic profiles) with empathy maps, journey maps, scenarios, accessibility considerations, and user stories for feature scoping. Phase 2 of `/forge` as standalone command.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| product or domain | yes | — | Product name/description or domain to research users for |
| --vision | no | none | Path to product vision document (provides target user and JTBD context) |
| --existing-research | no | none | Path to prior research, reviews, forum data, or interview notes |
| --count | no | 3-5 | Target number of personas to create |

## Behavior

1. **Gather evidence** — collect from vision document, research files, web research. Build evidence catalog (source, type, confidence). Minimum 15 evidence points before clustering.
2. **Identify behavioral variables** — dimensions users vary on (tech comfort, usage frequency, decision authority, etc.). Plot evidence on spectrums.
3. **Cluster into personas** — 3-5 groupings: 1-2 primary (product optimizes for), 1-2 secondary, 0-1 anti-personas.
4. **Build full personas** — per cluster: identity, goals/motivations/frustrations (with evidence), JTBDs (functional/emotional/social), empathy map (thinks/feels/says/does), behaviors, journey maps (current + future), scenarios (happy/error/first-use), accessibility considerations, feature relevance map.
5. **Identify insights** — SAYS/DOES contradictions (design opportunities), cross-persona patterns, accessibility requirements.
6. **Generate user stories** — convert JTBDs and pain points → prioritized stories with acceptance criteria, grouped by epic.
7. **Produce persona summary** — quick-reference table for cross-agent use.
8. **Quality self-assessment** — minimum 80/100

## Output

- Individual persona documents following `templates/user-persona.md`
- Persona summary table (for project brief and cross-agent reference)
- Prioritized user stories (grouped by epic, tagged by persona)

**Output location logic:**
1. If active forge workspace exists (`.claude/forge/<project-name>/docs/`) → write `.claude/forge/<project-name>/docs/personas/<name>.md`
2. Otherwise → `./docs/personas/<name>.md` (creating directories if needed)

## Pipeline

`/forge-vision` → `/forge-personas` → `/strategy-spec` or `/forge` Phase 3 → `/forge-scaffold`

Runs independently or as part of forge pipeline. When vision exists, personas anchor to vision's target user and JTBDs.

## Examples

```
/forge-personas "Tails - pet wellness platform" --vision docs/vision.md
/forge-personas "Shopify theme developers" --existing-research docs/research/shopify-forum-analysis.md
/forge-personas "small business inventory management" --count 4
/forge-personas "developer productivity tools" --vision docs/vision.md --existing-research docs/interviews/
```
