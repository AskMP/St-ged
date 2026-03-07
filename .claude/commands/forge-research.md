---
name: "forge-research"
description: "Multi-model deep research — generate focused prompts, collect cross-platform AI responses, synthesize into validated insights"
agent: "strategist"
---

# /forge-research

```
/forge-research <project or domain> [--vision <path>] [--features <path>] [--personas <path>] [flags]
```

Generates focused research prompts for cross-platform AI deep research, manages response collection, and synthesizes results into validated insights. Sits between feature scoping and architecture in the `/forge` pipeline — validates assumptions and fills knowledge gaps before committing to technical decisions.

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| project or domain | yes | — | Product name/description or domain to research |
| --vision | no | auto-detect | Path to product vision document |
| --features | no | auto-detect | Path to features document |
| --personas | no | auto-detect | Path to personas directory |

## Depth Flags

Each flag activates a research processing mode. Combine freely. Each successive flag adds depth and processing time.

| Flag | Metaphor | Mode | What It Does |
|------|----------|------|-------------|
| `--temper` | Resilience | **Verify** | Stress-test claims and assumptions. Cross-reference findings against multiple sources. Challenge consensus — find counter-evidence. Flag low-confidence claims masquerading as high-confidence. |
| `--smelt` | Extraction | **Extract** | Find the needle in the haystack. Deep-dive into overlooked edge cases, buried competitive intelligence, non-obvious failure modes. Mine technical documentation, patent filings, postmortem reports, niche forums. |
| `--anneal` | Structure | **Synthesize** | Reorganize complex findings into clear mental models. Build decision matrices, trade-off frameworks, and architecture decision records. Map cross-domain patterns to project-specific recommendations. |
| `--alloy` | Combination | **Merge** | Cross-pollinate insights across research areas. Identify where findings from one domain contradict or reinforce another. Build a unified knowledge graph from disparate threads. Resolve conflicting recommendations. |
| `--harden` | Perfection | **All + Ultra** | Run all four modes, then apply a final hardening pass: rate every recommendation by confidence (validated / likely / speculative), identify the single highest-risk assumption, and produce a "what we still don't know" inventory. Maximum depth. |

**No flag specified** → defaults to `--anneal` (synthesize only — fastest useful output).

## Behavior

### Phase A: Analyze & Scope

1. **Read existing artifacts** — vision.md, personas, features.md, project-brief.md (whatever exists)
2. **Identify research gaps** — what assumptions are unvalidated? What technical decisions lack evidence? Where do personas say "assumption" or confidence is Low/Medium?
3. **Derive research areas** — cluster gaps into 5-8 focused research topics. Each topic maps to a specific product decision or risk.
4. **Select AI platform assignments** — recommend primary/secondary platforms per topic based on platform strengths:
   - **ChatGPT**: Systems architecture, distributed systems, Web APIs, protocol design
   - **Gemini (Deep Research)**: Market data, competitive landscape, pricing research, hardware surveys, case studies
   - **GitHub Copilot**: Code-level SDK patterns, implementation specifics, developer ergonomics, library comparisons

### Phase B: Generate Prompts

For each research area, generate a self-contained prompt file:

```
docs/research/prompts/NN-<topic-slug>.md
```

Each prompt contains:
- **Project context block** (~500 words) — consistent across all prompts, pulled from vision + personas + features
- **Research questions** (10-15) — specific, answerable, grounded in identified gaps
- **Platform recommendation** — which AI to run this prompt on (primary + secondary)
- **Output format specification** — standardized markdown structure for comparable results

### Phase C: Scaffold Response Directories

```
docs/research/
  WORKFLOW.md                     # Step-by-step instructions for the user
  prompts/                        # Generated prompt files
    01-<topic>.md
    ...
  responses/                      # User pastes model outputs here
    01-<topic>/
      chatgpt.md
      gemini.md
      copilot.md
    ...
  synthesis/                      # Generated after responses collected
```

**Breakpoint**: Present the research plan — topics, questions per topic, platform assignments. Ask: "These are the research areas I've identified. Ready to run these prompts? (approve / add topic / remove topic / adjust questions)"

### Phase D: Synthesis (triggered when user returns with responses)

When the user has collected responses and triggers synthesis:

1. **Read all response files** from `docs/research/responses/`
2. **Apply active depth flags** (see processing modes below)
3. **Generate synthesis artifacts** in `docs/research/synthesis/`

#### Synthesis Outputs

| File | Contents |
|------|----------|
| `synthesis-report.md` | Full cross-model comparison organized by research area |
| `consensus.md` | High-confidence findings — all models agree |
| `divergence.md` | Disagreements between models — flagged for user judgment |
| `blind-spots.md` | Unique insights from only one model — potential discoveries |
| `recommendations.md` | Actionable recommendations with confidence ratings |

#### Processing by Flag

**`--temper` (Verify)**:
- For each claim in model responses, check: did multiple models corroborate? Is a source cited? Is the source current (within 2 years)?
- Flag unsourced claims that all models repeat (potential hallucination echo)
- Generate a "confidence audit" table: claim × models agreeing × source quality → confidence score
- Add a `temper-audit.md` to synthesis with full verification results

**`--smelt` (Extract)**:
- Scan all responses for buried insights — single sentences that don't match the surrounding topic
- Look for: competitor failures not widely discussed, technical limitations mentioned in passing, regulatory requirements, accessibility mandates, patent/IP risks
- Cross-reference with niche sources (Stack Overflow answers, GitHub issues, HN discussions, spec drafts)
- Add an `extracted-insights.md` with each finding, source, and relevance to project

**`--anneal` (Synthesize)**:
- Build decision matrices for every open technical choice (protocol, framework, architecture pattern)
- Create trade-off frameworks: option A vs. B with criteria weighted by product principles
- Map findings to the project's phases — what research applies to Phase 1 vs. Phase 3?
- Produce architecture decision records (ADRs) for key technical choices
- Default output when no flag specified

**`--alloy` (Merge)**:
- Cross-pollinate: does the networking research contradict the PWA research?
- Build a dependency graph: which research findings block which architectural decisions?
- Resolve conflicts: when Protocol research says X but Reliability research says Y, what's the synthesis?
- Produce a unified recommendations list with cross-references to supporting evidence

**`--harden` (All + Ultra)**:
- Run all four modes above
- Final pass: rate every recommendation (validated / likely / speculative / contradicted)
- Identify the top 5 riskiest assumptions that research didn't fully resolve
- Produce a "what we still don't know" document with suggested next steps (user testing, prototype, expert consultation)
- Generate a `hardened-brief.md` — a single document summarizing all validated findings, ready to feed into architecture decisions

### Phase E: Update Artifacts (optional, user-triggered)

After synthesis review, offer to:
- Add newly discovered personas to `docs/personas/`
- Rewrite `docs/features.md` with research-informed scope changes
- Update `docs/project-brief.md` with validated technical requirements
- Update `docs/vision.md` if scope boundaries shifted
- Generate phased PRDs (if project complexity warrants splitting the monolithic PRD)

## Output Location Logic

1. If active forge workspace exists (`.claude/forge/<project-name>/docs/`) → write under workspace
2. If project has `docs/` directory → write under `docs/research/`
3. Otherwise → create `docs/research/` in current directory

## Pipeline

```
/forge-vision → /forge-personas → /forge (Phase 3: features) → /forge-research → /forge (Phase 4: architecture) → /forge-scaffold
```

Runs independently or as part of forge pipeline. When invoked within `/forge`, inherits all prior phase artifacts automatically.

## Examples

```
# Standalone — basic synthesis (default --anneal)
/forge-research "Curtain Call - communal gaming platform"

# With vision context and full verification
/forge-research "Curtain Call" --vision docs/vision.md --temper

# Maximum depth — all modes
/forge-research "Curtain Call" --vision docs/vision.md --features docs/features.md --harden

# Just extraction and merging
/forge-research "Curtain Call" --smelt --alloy

# Within forge pipeline (flags passed through)
/forge "Curtain Call" --harden
```
