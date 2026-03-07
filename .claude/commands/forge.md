---
name: "forge"
description: "Full vision-to-scaffold pipeline — product vision, personas, feature scoping, architecture, then scaffold"
agent: "coordinator"
---

# /forge

```
/forge <product idea or description> [--constraints "<constraints>"] [--existing-research <path>] [--temper] [--smelt] [--anneal] [--alloy] [--harden]
```

Raw idea → project ready to build. Orchestrates five phases (product vision, user research, feature scoping, architecture, scaffold) with user review breakpoints. Output: scaffolded project with comprehensive PRD containing setup AND product tasks. Chains product-owner, ux-researcher, strategist, and architect agents; each phase builds on previous with user approval gates.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| product idea | yes | — | Product name/description or problem statement |
| --constraints | no | none | Team size, budget, timeline, tech preferences |
| --existing-research | no | none | Path to prior research (from `/strategy-brainstorm`, `/strategy-opportunity`, `/strategy-spec`) |

## Depth Flags (Research & Hardening)

Activates Phase 3.5 between Feature Scoping and Architecture. Delegates to `/forge-research` with approved artifacts. Flags combine freely; each adds depth.

| Flag | Metaphor | Mode | What It Does |
|------|----------|------|-------------|
| `--temper` | Resilience | **Verify** | Stress-test claims and assumptions. Cross-reference findings. Flag low-confidence assumptions masquerading as high-confidence. |
| `--smelt` | Extraction | **Extract** | Mine overlooked edge cases, buried competitive intel, non-obvious failure modes, technical gotchas. |
| `--anneal` | Structure | **Synthesize** | Build decision matrices, trade-off frameworks, ADRs. Map findings to project phases. Default mode if any flag present. |
| `--alloy` | Combination | **Merge** | Cross-pollinate findings across research areas. Resolve conflicting recommendations. Build unified knowledge graph. |
| `--harden` | Perfection | **All + Ultra** | Run all four modes, then apply a final pass: rate every recommendation by confidence, identify highest-risk assumption, produce "what we still don't know" inventory. |

**No flag** → Phase 3.5 skipped entirely; proceeds directly Phase 3 → Phase 4.

## Workspace

All phase outputs written to workspace scoped to project:

```
.claude/forge/<project-name>/docs/
  vision.md
  personas/<persona-name>.md
  features.md
  project-brief.md
```

**Workspace lifecycle:**

1. **Phase 1 start** — Ask for project name, create `.claude/forge/<project-name>/docs/`. If exists, offer resume or fresh start.
2. **Phases 1-4** — All artifacts written to workspace.
3. **Phase 5 (scaffold)** — User selects final output directory. After scaffold: migrate workspace `docs/` → `<project-root>/docs/`, clean up `.claude/forge/<project-name>/`.
4. **Standalone commands** — `/forge-vision` or `/forge-personas` outside `/forge` check for active workspace first → write there if found, else `./docs/`.

---

## Phases

### Phase 1: Product Vision

**Agent**: product-owner | **Skills**: product-vision, strategic-planning
**Input**: Product idea + constraints + existing research
**Output**: `.claude/forge/<project-name>/docs/vision.md`

Product-owner defines: vision statement (For/Who/Is/That/Unlike/We), product principles (3-5 opinionated rules), value proposition canvas (jobs/pains/gains → features), success metrics (leading/lagging/North Star), scope boundaries (IS / IS NOT / Scope Fences), assumptions & validation plan.

**Breakpoint**: Present vision. Ask: "Does this vision capture what you're building? (approve / revise [section] / restart)" — do not proceed until approved.

---

### Phase 2: User Research & Personas

**Agent**: ux-researcher | **Skills**: user-research, research-methodology
**Input**: Approved product vision + existing research
**Output**: `.claude/forge/<project-name>/docs/personas/<name>.md`, summary table, user stories

UX-researcher creates: evidence catalog, 3-5 behavioral personas (identity, goals, frustrations, JTBDs, empathy maps with SAYS/DOES contradictions, journey maps, scenarios, accessibility considerations, feature relevance map), persona summary table, prioritized user stories from persona insights.

**Breakpoint**: Present all personas. Ask: "Do these personas represent your users accurately? (approve / revise [persona] / add / remove)" — do not proceed until approved.

---

### Phase 3: Feature Scoping

**Agent**: strategist | **Skills**: strategic-planning
**Input**: Approved vision + personas + existing research
**Output**: `.claude/forge/<project-name>/docs/features.md`

Strategist performs: feature definition grounded in persona JTBDs, MoSCoW categorization (Must/Should/Could/Won't), feature validation (every Must Have → primary persona pain point), RICE scoring for ambiguous priorities, user flow mapping for critical paths, risk assessment, phased roadmap (MVP → Phase 2 → Phase 3).

**Validation**: For each Must Have — which persona needs it (must be primary)? Which JTBD? What breaks if cut (must break core promise)?

**Breakpoint**: Present feature scope. Ask: "Does this feature scope look right? (approve / move features between tiers / add / remove)" — do not proceed until approved.

---

### Phase 3.5: Research & Hardening *(conditional — any depth flag present)*

**Agent**: strategist | **Command**: forge-research
**Trigger**: Any of `--temper`, `--smelt`, `--anneal`, `--alloy`, `--harden` passed to `/forge`
**Input**: Approved vision + personas + features
**Output**: `.claude/forge/<project-name>/docs/research/` (prompts, response dirs, synthesis artifacts)

Delegates to `/forge-research` with all approved artifacts and the active depth flag(s). Identifies unvalidated assumptions and knowledge gaps from prior phases, generates focused research prompts, scaffolds response directories, and synthesizes findings before architecture is committed.

Flag behavior (see `/forge-research` for full detail):
- `--temper` → verify claims, flag low-confidence assumptions, generate `temper-audit.md`
- `--smelt` → extract edge cases, buried competitive intel, failure modes into `extracted-insights.md`
- `--anneal` → synthesize decision matrices, trade-off frameworks, ADRs (default if any flag present)
- `--alloy` → cross-pollinate findings across research areas, resolve conflicts
- `--harden` → all modes + final confidence ratings, risk inventory, `hardened-brief.md`

**Breakpoint**: Present research synthesis summary. Ask: "Research complete — any findings that should revise vision, personas, or features before architecture? (proceed / revise [artifact] / run additional research)"

**If no depth flag** → this phase is skipped entirely.

---

### Phase 4: Architecture & Technical Requirements

**Agent**: product-owner | **Skills**: product-vision, strategic-planning
**Input**: Approved vision + personas + features + constraints
**Output**: `.claude/forge/<project-name>/docs/project-brief.md`

Product-owner assembles project brief: combine all approved artifacts into single handoff document, derive technical requirements (scale from persona analysis, real-time needs from features, data model from scope, integrations, performance from persona contexts), generate scaffold hints (tech recommendations with rationale), validate coherence (every feature → persona, every pain → feature).

**Breakpoint**: Present brief. Ask: "This is the complete brief driving the scaffold. Ready for tech choices? (approve / revise / go back to [phase])" — do not proceed until approved.

---

### Phase 5: Scaffold & Migration

**Agent**: coordinator (project-scaffold skill)
**Input**: Approved project brief
**Output**: Scaffolded project (`.claude/`, `CLAUDE.md`, `prd-phases/manifest.md`, `prd-phases/<group>/` subdirectories, directory skeleton) with forge artifacts migrated

Pass `--brief .claude/forge/<project-name>/docs/project-brief.md` to `/forge-scaffold`. Tech questions use brief's scaffold hints as defaults. Foundation PRDs generated directly from scaffold; product PRDs delegated to prd-generator for feature decomposition (referencing personas and user stories).

**After scaffold, migrate workspace artifacts:**

1. Copy workspace `docs/` → `<project-root>/docs/` (vision.md, personas/, features.md, project-brief.md)
2. Update internal references for new location
3. Add `docs/` to scaffold git commit (Section 3G of scaffold skill)
4. Clean up `.claude/forge/<project-name>/` from originating directory
5. If migration fails (e.g., target has `docs/`), warn user and leave workspace intact

**PRD structure via forge (multi-PRD architecture):**
```
Group 0: Foundation (setup tasks -- from scaffold, in 00-foundation/)
Group 1: MVP (Must Have features -- per-feature PRDs in 01-*/ subdirectories)
Group 2: Launch (Should Have features -- in 02-launch/)
Group 3: Traction (Could Have features -- in 03-traction/)
```

**Breakpoint**: Present scaffold summary. Ask: "Ready to run `/ralph prd-phases/manifest.md` to build this out? (yes / review PRDs first / adjust)"

---

## Resumability

Each phase produces persistent artifact. If user stops mid-forge:
- Completed phases saved in `.claude/forge/<project-name>/docs/`
- Re-running `/forge` → detects existing workspace, offers continue from last incomplete phase
- Detection: check `.claude/forge/*/docs/` → show project name + last completed phase, ask "Continue from Phase N, or start new forge?"
- `/forge-vision` or `/forge-personas` detect active workspace and write there
- Workspace persists until Phase 5 migrates artifacts

## File Outputs

| Phase | File | Workspace → Final |
|-------|------|-------------------|
| 1 | Vision | `.claude/forge/<name>/docs/vision.md` → `<project-root>/docs/vision.md` |
| 2 | Personas | `.claude/forge/<name>/docs/personas/<p>.md` → `<project-root>/docs/personas/<p>.md` |
| 3 | Features | `.claude/forge/<name>/docs/features.md` → `<project-root>/docs/features.md` |
| 4 | Brief | `.claude/forge/<name>/docs/project-brief.md` → `<project-root>/docs/project-brief.md` |
| 5 | Scaffold | — → `<project-root>/.claude/`, `CLAUDE.md`, `prd-phases/manifest.md`, `prd-phases/<group>/`, `src/` |

## Examples

```
/forge "A pet health tracking app for dog owners who want to monitor their pet's wellness"

/forge "Developer tool for cleaning up orphaned code in Shopify themes" --constraints "solo dev, TypeScript, 3 month runway"

/forge "SaaS dashboard for small business inventory management" --existing-research docs/research/

/forge "Tails - a pet wellness platform" --constraints "2-person team, Next.js, 6 months"

# With research hardening — stress-test assumptions before architecture
/forge "Tails - a pet wellness platform" --constraints "2-person team, Next.js, 6 months" --temper

# Full depth — all research modes before committing to architecture
/forge "SaaS inventory dashboard" --existing-research docs/research/ --harden

# Combine flags freely
/forge "Kitchen coordination PWA" --smelt --alloy
```
