---
name: "research-methodology"
description: "Systematic approach to documentation and API research"
auto_invoke: true
triggers: ["researching a library or framework", "gathering documentation", "API exploration", "version-specific information needed"]
---

# Research Methodology

## Instructions

### 1. Define Research Scope

Establish before starting: topic, target version (specific, not "latest"), depth (surface/working/deep), context budget, consumer (planner/implementer/human).

### 2. Source Hierarchy

| Priority | Source Type | Trust Level |
|----------|-----------|-------------|
| 1 | Official documentation | High |
| 2 | Official repositories | High |
| 3 | Official blog posts | Medium-High |
| 4 | Reputable tutorials | Medium |
| 5 | Community answers | Low-Medium |
| 6 | AI-generated content | Low |

**Version accuracy rule**: Always verify against target version. APIs change between versions — never assume current docs match target.

### 3. Research Process

**Survey (Breadth)**: Locate official docs for target version, scan TOC/API reference, check changelog for breaking changes, note migration guides.

**Deep Dive (Depth)**: Read relevant sections, extract API signatures/types/parameters, identify constraints/limitations/known issues, find working code examples (prefer official).

**Validate**: Cross-reference across 2+ sources, verify code examples for target version, check deprecation notices, resolve contradictions (prefer higher-priority sources).

### 4. ResearchPack Structure

Metadata (topic, version, sources, date), summary, key findings (detail/source/confidence), API reference, code examples, constraints & limitations, open questions.

### 5. Quality Self-Check

All info tagged with source, version numbers explicit (no "latest"), code examples include imports, contradictions resolved, open questions listed.
