---
name: "strategic-planning"
description: "Structured brainstorming, market research, opportunity evaluation, and project planning methodology"
auto_invoke: true
triggers: ["brainstorming product or project ideas", "evaluating market opportunities", "creating product specifications", "building project roadmaps", "conducting competitive analysis", "assessing risks for a project or portfolio"]
---

# Strategic Planning

## Instructions

### 1. Jobs-to-be-Done (JTBD) Framing

Before generating solutions, frame the problem as a job the user is trying to get done:

**JTBD Statement Template:**
```
When [situation/context],
I want to [motivation/action],
so I can [desired outcome/benefit].
```

**Rules:**
- Frame from the user/customer perspective, not the builder's
- Focus on the outcome, not the mechanism
- A single product may address multiple jobs — identify all of them
- Competing solutions include workarounds and manual processes, not just direct competitors

**Example:**
```
When I uninstall a Shopify app,
I want leftover code automatically removed from my theme,
so I can maintain storefront performance without hiring a developer.
```

### 2. Progressive Deepening Prompt Chain

Research should follow a deliberate sequence where each round builds on the previous:

**Round 1 — Market Validation (Broad)**
```
Is [domain] a viable opportunity? What are the major segments,
revenue models, and risks? Who are the key players?
```

**Round 2 — Gap Identification (Focused)**
```
Based on [Round 1 findings], identify specific gaps where there
is clear user need combined with poor existing solutions. Look for:
documented complaints, low ratings, unserved segments.
```

**Round 3 — Evidence Gathering (Deep)**
```
For each identified gap: What exactly do users complain about?
What do competitors advertise vs. what they actually deliver?
What are the specific pain points with sources?
```

**Round 4 — Solution Design (Specific)**
```
For the top [N] opportunities: Create detailed specs that address
the identified complaints, match or exceed competitor features,
and include pricing, phased build plan, and risk assessment.
```

**Round 5 — Stress Testing (Adversarial)**
```
Challenge every assumption: What if adoption is half our estimate?
What if a well-funded competitor enters? What don't we know?
What would make us abandon this? Who loses if we succeed?
```

### 3. Multi-Source Research Synthesis

When conducting research, gather perspectives from multiple sources and synthesize:

**Source Hierarchy:**

| Priority | Source Type | Trust Level | Use For |
|----------|-----------|-------------|---------|
| 1 | Primary data (reviews, forums, support tickets) | High | User pain points, feature requests |
| 2 | Competitor product pages and documentation | High | Feature baselines, pricing models |
| 3 | Industry reports and market data | Medium-High | Market size, growth trends |
| 4 | Community discussions (Reddit, HN, Discord) | Medium | Sentiment, emerging needs |
| 5 | AI-generated analysis (multiple models) | Medium | Pattern identification, synthesis |
| 6 | Blog posts and opinion pieces | Low-Medium | Trends, perspectives |

**Multi-Source Synthesis Process:**
1. **Gather** — Collect findings from 3+ sources on the same topic
2. **Deduplicate** — Identify overlapping insights (higher confidence when multiple sources agree)
3. **Resolve contradictions** — When sources disagree, note both positions with evidence quality
4. **Cluster** — Group related findings into themes
5. **Score confidence** — Rate each finding: High (3+ sources agree), Medium (2 sources), Low (single source)
6. **Produce brief** — Structure findings using the `templates/research-brief.md` template

### 4. RICE Scoring Framework

Use RICE to evaluate and rank opportunities objectively:

**Scoring Definitions:**

| Factor | Scale | How to Estimate |
|--------|-------|-----------------|
| **Reach** | 1-10 | 1=<100 users/mo, 3=1K, 5=10K, 7=100K, 10=1M+ |
| **Impact** | 1-5 | 1=minimal improvement, 2=noticeable, 3=significant, 4=major, 5=transformative |
| **Confidence** | 0-100% | Based on evidence quality: >3 sources = 80%+, 2 sources = 50-80%, 1 source = <50% |
| **Effort** | 1-10 | Team-months for MVP: 1=<1 week, 3=1 month, 5=3 months, 7=6 months, 10=12+ months |

**Formula:** `RICE Score = (Reach × Impact × Confidence) / Effort`

**Scoring Template:**
```markdown
| Opportunity | Reach | Impact | Confidence | Effort | RICE Score | Rank |
|-------------|-------|--------|------------|--------|------------|------|
| [Name]      | X     | X      | X%         | X      | X.XX       | #    |
```

**Rules:**
- Never assign scores without justification — add a reasoning note for each factor
- Confidence should reflect evidence quality, not optimism
- Effort should include research, design, build, test, launch, and docs — not just coding
- Re-score after adversarial challenge (confidence often drops)

### 5. MoSCoW Feature Scoping

Categorize features rigorously:

| Category | Criteria | Template |
|----------|----------|----------|
| **Must Have** | Without this, the core promise fails. Users won't adopt. No workaround exists. | MVP feature list |
| **Should Have** | Important for competitive parity. Product works without it but feels incomplete. | Phase 2 |
| **Could Have** | Nice to have. Users request it but don't need it. Build only if time allows. | Backlog |
| **Won't Have** | Deliberately excluded. Document the reasoning. Prevents scope creep. | Exclusion list |

**The Won't Have Rule:** For every Must Have feature, identify at least one related feature that is deliberately excluded. This forces scope discipline. Example:
- Must Have: Product reviews with photo uploads
- Won't Have: Video reviews (too expensive to store/serve, adds complexity, not in MVP scope)

### 6. Adversarial Questioning Framework

Stress-test every major decision with these challenge patterns:

**Market Challenges:**
- "What if the addressable market is 50% smaller than estimated?"
- "What if a well-funded competitor launches a similar product in 3 months?"
- "What if the platform (Shopify, AWS, etc.) builds this feature natively?"

**Execution Challenges:**
- "What if development takes 2x longer than planned?"
- "What if our first 100 users all request the same missing feature?"
- "What if we can't hire the expertise we need?"

**Business Model Challenges:**
- "What if free-tier users never convert to paid?"
- "What if churn is double our estimate?"
- "At what price point does this become unviable?"

**Kill Criteria:**
Define upfront what would make you abandon the project:
```
KILL CRITERIA:
- If user research yields fewer than [N] validated pain points → stop
- If no competitive advantage identified after [N] hours of research → stop
- If estimated effort exceeds [N] team-months for MVP → stop
- If projected Month-12 revenue < [threshold] → stop
```

### 7. Risk Assessment Methodology

Use a structured likelihood × impact matrix:

**Rating Scales:**

| Score | Likelihood | Impact |
|-------|-----------|--------|
| 1 | Rare | Negligible |
| 2 | Unlikely | Minor |
| 3 | Possible | Moderate |
| 4 | Likely | Major |
| 5 | Almost Certain | Catastrophic |

**Risk Score = Likelihood × Impact**

| Category | Score | Action |
|----------|-------|--------|
| Critical | 20-25 | Cannot proceed without mitigation |
| High | 12-19 | Priority mitigation, active monitoring |
| Medium | 6-11 | Mitigation plan in place, periodic review |
| Low | 1-5 | Accept and monitor |

**Risk Entry Template:**
```markdown
### Risk: [Name]
- **Description**: What could go wrong
- **Likelihood**: [1-5] — [Label]
- **Impact**: [1-5] — [Label]
- **Risk Score**: [N] — [Category]
- **Mitigation**: Specific actions to reduce likelihood or impact
- **Owner**: Who monitors this risk
- **Trigger**: What signals this risk is materializing
```

### 8. Document Progression Pattern

Planning documents should build on each other in a deliberate hierarchy:

```
Research Brief (broad findings, evidence, sources)
  ↓
Opportunity Assessment (RICE-scored, adversarial-tested)
  ↓
Product Specification (features, architecture, pricing, risks)
  ↓
Portfolio Roadmap (multi-product: dependencies, sequencing, shared infra)
  ↓
Implementation Plan (phases, milestones, tasks, timelines, DoD)
```

**Rules:**
- Each level references the previous level as its evidence base
- No specification should exist without a supporting opportunity assessment
- No implementation plan should exist without a supporting specification
- Portfolio-level documents reference all child specifications

### 9. Financial Projection Standards

Revenue and cost projections must follow these rules:

- **State all assumptions explicitly** — growth rate, churn rate, conversion rate, ARPU
- **Use conservative estimates** — if you think 1000 users, model for 500
- **Include three scenarios** — pessimistic, expected, optimistic
- **Account for platform fees** — marketplace revenue share, payment processing
- **Project infrastructure costs** — hosting, services, tools that scale with users
- **Calculate break-even point** — when does revenue exceed total costs?

**Financial Template:**
```markdown
| Metric | Month 3 | Month 6 | Month 12 | Assumptions |
|--------|---------|---------|----------|-------------|
| Active users | X | X | X | Growth rate: X%/mo |
| Paying users | X | X | X | Conversion: X% |
| MRR | $X | $X | $X | ARPU: $X |
| Churn | X% | X% | X% | Based on: [source] |
| Revenue (net) | $X | $X | $X | After platform fees |
| Infrastructure | $X | $X | $X | Hosting + services |
| Net margin | $X | $X | $X | Revenue - costs |
```

### 10. Definition of Done Template

Every project/product should define its DoD upfront:

```markdown
## Definition of Done

- [ ] Application builds with zero errors
- [ ] No placeholder content, dummy data, or Lorem Ipsum
- [ ] Tests written for new features (unit + integration minimum)
- [ ] Accessibility standards met (WCAG 2.2 AA)
- [ ] Performance budgets met (define per-project)
- [ ] Security review passed (no secrets, input validation, auth checks)
- [ ] Documentation written (user-facing + developer)
- [ ] UI/UX meets design standards
- [ ] User stories satisfied with manual QA
- [ ] Code reviewed by at least one other person
- [ ] Deployment steps documented and automated where possible
- [ ] Version bumped and changelog updated
```

Customize per project but never weaken — only add criteria.

