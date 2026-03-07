# Options Audit

Audit and refresh technology option lists in project-scaffold skill. NOT deployed to scaffolded projects — FBU-Forge maintenance only.

## Instructions

### 1. Load Current Options

Read `.claude/skills/project-scaffold/skill.md` and extract all current option lists organized by phase and category:

- Phase 1: Languages, Frameworks (per language), Package managers
- Phase 2: Task management, Claude models, Linting (per language), Git hooks
- Phase 3: CSS approaches, Component libraries (per framework), State management, Form libraries, Animation libraries, Storybook alternatives
- Phase 4: API styles, Databases, ORMs (per language+DB), Cache layers, Message queues
- Phase 5: Auth strategies (per framework)
- Phase 6: Test runners (per language), E2E testing, API testing, Load testing
- Phase 7: Deployment targets, Docker, CI/CD, Monitoring/Observability, Documentation tools

### 2. Research Each Category

For each category, use web search to find:

**Popularity signals:**
- npm/PyPI/crates.io download trends (last 6 months)
- GitHub stars and recent commit activity
- Stack Overflow / Reddit discussion frequency
- "State of JS/CSS/Rust/Go" survey results (latest available)
- Tech blog mentions and comparison articles

**Health signals:**
- Last release date (flag if >12 months ago)
- Open issues vs. closed issues ratio
- Number of active maintainers
- Breaking changes or license changes
- Known security vulnerabilities

**Relevance signals:**
- Whether the tool still solves a unique problem or has been superseded
- Whether it's compatible with the latest versions of its ecosystem (e.g., React 19, Node 22, Python 3.13)
- Whether major companies or frameworks have adopted or dropped it

### 3. Score Each Tool

For each existing and candidate tool, assign:

| Signal | Weight | Score (1-5) |
|--------|--------|-------------|
| Active maintenance | 25% | 5=monthly releases, 1=abandoned |
| Community adoption | 25% | 5=dominant, 1=negligible |
| Ecosystem fit | 20% | 5=works with everything, 1=incompatible |
| Developer experience | 15% | 5=excellent DX, 1=poor |
| Stability | 15% | 5=production-ready, 1=alpha/experimental |

**Weighted score >= 3.5**: Recommend as **main option**
**Weighted score 2.5-3.4**: Recommend as **advanced option** (shown only if user asks)
**Weighted score < 2.5**: Recommend **removal** (or don't add)

### 4. Generate Report

Produce a structured report with three sections:

#### A. Removals (tools to drop)

| Tool | Category | Current Status | Reason | Replacement |
|------|----------|---------------|--------|-------------|
| ... | ... | ... | ... | ... |

#### B. Additions (tools to add)

| Tool | Category | Score | Type | Description | Conditional Logic |
|------|----------|-------|------|-------------|-------------------|
| ... | ... | ... | Main/Advanced | ... | ... |

#### C. Updates (tools to modify)

| Tool | Category | Change | Reason |
|------|----------|--------|--------|
| ... | ... | ... | ... |

#### D. Default Changes

| Category | Old Default | New Default | Reason |
|----------|------------|------------|--------|
| ... | ... | ... | ... |

### 5. Apply Changes (with confirmation)

After presenting the report, ask the user:
"Apply these changes to the project-scaffold skill? (yes / edit / skip)"

If yes:
1. Edit `skills/project-scaffold/skill.md` to add/remove/update options
2. Update conditional logic for any new options
3. Update the summary table example if defaults changed
4. Add a changelog entry at the bottom of the skill file

### 6. Changelog

Append to the bottom of `skills/project-scaffold/skill.md`:

```markdown
## Options Changelog

| Date | Change | Details |
|------|--------|---------|
| YYYY-MM-DD | Added X | Reason |
| YYYY-MM-DD | Removed Y | Superseded by Z |
| YYYY-MM-DD | Updated default for W | New community standard |
```

## Research Strategy

To keep searches efficient, group related tools and search for comparison articles rather than individual tool pages:

1. "best [category] tools 2026" (e.g., "best React state management 2026")
2. "State of [ecosystem] 2025 survey results" (e.g., "State of JS 2025")
3. "[tool A] vs [tool B] 2026" for head-to-head comparisons
4. "[tool] deprecated OR discontinued OR archived 2025 2026" for removal candidates
5. "npm trends [tool1] [tool2] [tool3]" for download comparisons

## Example Output

```
## Options Audit Report — 2026-02-06

### Removals
| Tool | Category | Reason | Replacement |
|------|----------|--------|-------------|
| styled-components | CSS (React) | Declining adoption, runtime overhead | vanilla-extract or Panda CSS |
| Formik | Forms (React) | Slow updates, losing to RHF | React Hook Form |

### Additions
| Tool | Category | Score | Type | Description |
|------|----------|-------|------|-------------|
| Biome | Linting (TS) | 4.2 | Main | Rust-based linter+formatter, 10-100x faster than ESLint |
| Lefthook | Git hooks | 3.8 | Main | Fast Go binary, no Node dependency |

### Updates
| Tool | Category | Change |
|------|----------|--------|
| Tailwind | CSS | Update version reference: v3 -> v4 |
| shadcn/ui | Components | Now supports Base UI backend in addition to Radix |

### Default Changes
| Category | Old Default | New Default | Reason |
|----------|------------|------------|--------|
| Linting (TS) | ESLint + Prettier | Biome | Faster, single tool, mature enough |
```
