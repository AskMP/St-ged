---
name: "product-vision"
description: "Methodology for defining coherent product vision, principles, value propositions, and success metrics"
auto_invoke: true
triggers: ["defining product vision or strategy", "creating product principles", "defining value propositions", "establishing success metrics", "scoping product boundaries", "/forge-vision or /forge Phase 1"]
---

# Product Vision Methodology

## Instructions

### 1. Vision Statement Framework

Craft the vision statement using Geoffrey Moore's positioning template, adapted for product definition:

```
For [target user/persona]
who [statement of need or opportunity],
[Product Name] is a [product category]
that [key benefit / reason to adopt].
Unlike [primary competitive alternative],
our product [statement of primary differentiation].
```

**Rules for a strong vision statement:**
- The target user should be specific enough to exclude people (not "everyone")
- The need should be validated by evidence (not assumed)
- The category should be recognizable (users need a mental model)
- The benefit should be an outcome, not a feature
- The differentiation must be defensible — not "better UX" or "easier to use"

**Test the vision statement with these challenges:**
- Can a new team member read this and understand what we're building?
- Does it help us say "no" to feature requests that don't align?
- Would a user recognize their problem in the "who" clause?
- Is the differentiation something a competitor can't trivially copy?

### 2. Product Principles

Define 3-5 principles that guide every downstream decision. Principles are not aspirational — they are decision-making tools. Each principle should make at least one plausible alternative explicitly wrong.

**Principle Quality Test:**

| Criteria | Good Principle | Bad Principle |
|----------|---------------|---------------|
| Opinionated | "Speed over features — we ship fewer things that are fast" | "We value performance" (who doesn't?) |
| Actionable | "Every interaction completes in < 100ms or we redesign" | "We care about user experience" |
| Exclusive | "Privacy by default — no tracking without explicit opt-in" | "We respect our users" |
| Trade-off visible | "Simple over powerful — 3 settings, not 30" | "We build great products" |

**Principle categories to consider:**
- **User experience**: How should the product feel to use?
- **Technical philosophy**: How should the system behave?
- **Business posture**: How do we relate to users and the market?
- **Scope discipline**: What do we deliberately NOT do?
- **Quality bar**: What's the minimum acceptable standard?

### 3. Value Proposition Canvas

Map the user's world to the product's offering using the Value Proposition Canvas (Osterwalder):

**User Side (Profile):**

| Dimension | Questions to Answer |
|-----------|-------------------|
| **Jobs-to-be-Done** | What functional tasks are they trying to accomplish? What emotional outcomes do they seek? What social role are they fulfilling? |
| **Pains** | What frustrates them about current solutions? What risks do they fear? What obstacles block them? What keeps them up at night about this problem? |
| **Gains** | What outcomes would delight them? What would make their life easier? What social/emotional benefits do they seek? What would exceed their expectations? |

**Product Side (Map):**

| Dimension | Questions to Answer |
|-----------|-------------------|
| **Pain Relievers** | Which specific pains does each feature address? How does it reduce frustration, risk, or obstacles? |
| **Gain Creators** | Which specific gains does each feature enable? How does it create delight, efficiency, or status? |

**Fit validation:**
- Every Must Have feature should relieve at least one critical pain
- Every pain should have at least one feature that addresses it
- Gains without corresponding features = future roadmap items
- Features without corresponding jobs/pains/gains = scope creep, cut them

### 4. Success Metrics Definition

Define metrics in two tiers — leading indicators (early signals) and lagging indicators (business outcomes):

**Leading Indicators** (measure within days/weeks — early warning system):

| Type | Example Metrics |
|------|----------------|
| **Activation** | % of signups who complete setup, time-to-first-value |
| **Engagement** | DAU/MAU ratio, feature adoption rates, session frequency |
| **Satisfaction** | NPS, CSAT, support ticket volume, review ratings |
| **Retention** | Day 1/7/30 retention, cohort survival curves |

**Lagging Indicators** (measure over months — business validation):

| Type | Example Metrics |
|------|----------------|
| **Revenue** | MRR, ARPU, LTV, conversion rate |
| **Growth** | User growth rate, viral coefficient, organic vs. paid |
| **Efficiency** | CAC, CAC payback period, LTV:CAC ratio |
| **Market** | Market share, competitive win rate |

**North Star Metric:**
Choose ONE metric that best captures whether the product is succeeding for BOTH users and the business. This is the single number the team rallies around.

Criteria for a good North Star:
- Measures value delivered to users (not just business value)
- Leads to revenue when it grows (not vanity)
- Actionable by the team (not external market forces)
- Measurable with available data

### 5. Scope Boundary Definition

Scope boundaries are stronger than MoSCoW's "Won't Have" — they define what the product IS and IS NOT at an identity level.

**IS / IS NOT Framework:**

| Statement Type | Purpose | Example |
|---------------|---------|---------|
| **This product IS** | Positive identity — what it does and stands for | "A focused writing tool for long-form content" |
| **This product IS NOT** | Negative identity — what it refuses to become | "Not a collaboration platform — single-author by design" |
| **Scope Fence** | Specific boundary with rationale | "Supports Markdown only — no WYSIWYG editor, because constraints enable focus" |

**Scope Boundary Rules:**
- Every IS NOT should be something someone has asked for or will ask for
- Every Scope Fence should reference a product principle
- Revisit boundaries when principles change, not when users complain
- Document WHY a boundary exists — future-you will forget

### 6. Assumptions & Validation

Every vision contains assumptions. Make them explicit and plan to validate them:

**Assumption Categories:**

| Category | Example | Risk if Wrong |
|----------|---------|---------------|
| **User assumptions** | "Store owners manage their own themes" | Building for wrong persona |
| **Problem assumptions** | "Orphaned code causes measurable performance degradation" | Solving a non-problem |
| **Solution assumptions** | "Automated cleanup is possible without breaking themes" | Core promise fails |
| **Market assumptions** | "Store owners will pay $10/mo for this" | No viable business model |
| **Technical assumptions** | "We can access the theme code via API" | Can't build it |

**Validation priority:** Validate assumptions in order of risk — the ones that would kill the product if wrong go first. Use the cheapest validation method available (desk research → user interviews → prototype → MVP).

### 7. Vision Coherence Check

Before finalizing, verify the vision document is internally consistent:

- [ ] Vision statement target user matches the primary persona
- [ ] Vision statement benefit maps to at least one product principle
- [ ] Vision statement differentiation is supported by evidence (not aspirational)
- [ ] Every product principle resolves at least one real trade-off
- [ ] Value proposition canvas has no orphan features (features without matching jobs/pains)
- [ ] Value proposition canvas has no unaddressed critical pains
- [ ] North Star metric is influenced by the team's work (not external factors)
- [ ] Success metric targets are grounded in evidence or comparable benchmarks
- [ ] IS NOT statements reference things someone would plausibly request
- [ ] All critical assumptions have a validation plan
- [ ] The vision can be explained in 30 seconds to someone with no context

