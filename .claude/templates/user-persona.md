# User Persona Template

Use this template when creating personas with `/personas` or Phase 2 of `/forge`. Create one document per persona, or a combined document with all personas.

---

```markdown
# Persona: [Name]

**Archetype**: [Behavioral archetype label — e.g., "The Overwhelmed Store Owner", "The Power User", "The Cautious Evaluator"]
**Priority**: Primary | Secondary | Edge Case
**Date**: YYYY-MM-DD
**Version**: 1.0

---

## 1. Identity

| Attribute | Detail |
|-----------|--------|
| **Role** | [job title or role description] |
| **Context** | [where/when they encounter the problem — work, home, mobile, etc.] |
| **Tech Comfort** | Novice / Intermediate / Advanced / Expert |
| **Decision Authority** | Makes decisions alone / Needs approval / Recommends to decision-maker |
| **Industry/Domain** | [their industry or domain if relevant] |

**One-Sentence Summary**: [Name] is a [role] who [key behavior/need] because [motivation].

## 2. Goals & Motivations

### Primary Goal
[The main outcome they're trying to achieve — framed as a desired end state, not a feature request]

### Secondary Goals
- [Goal 2]
- [Goal 3]

### Underlying Motivation
[The deeper WHY behind their goals — what drives them emotionally? Status, security, efficiency, creativity, control, recognition?]

## 3. Frustrations & Pain Points

| Pain Point | Severity | Frequency | Current Workaround |
|-----------|----------|-----------|-------------------|
| [frustration] | Critical/High/Medium/Low | Daily/Weekly/Monthly/Occasional | [how they cope today] |

### Quote (Representative)
> "[A quote that captures their frustration — either real from research or synthesized from evidence]"

## 4. Jobs-to-be-Done

| # | JTBD | Type | Frequency |
|---|------|------|-----------|
| 1 | When [situation], I want to [motivation], so I can [outcome]. | Functional | [how often] |
| 2 | When [situation], I want to [motivation], so I can [outcome]. | Emotional | [how often] |
| 3 | When [situation], I want to [motivation], so I can [outcome]. | Social | [how often] |

## 5. Behaviors & Patterns

### Decision-Making Style
[How do they evaluate and choose tools/solutions? Price-first? Feature comparison? Peer recommendation? Trial-and-error?]

### Information Sources
[Where do they go for help? Documentation, forums, YouTube, colleagues, support tickets, AI?]

### Technology Relationship
[How do they interact with technology? Eagerly adopt? Cautiously evaluate? Resist until forced? Customize everything? Use defaults?]

### Workflow Context
[What does their typical day/workflow look like? Where does the problem occur in that flow? What comes before and after?]

## 6. Empathy Map

### Thinks
[Internal thoughts — what occupies their mind about this problem space]
- "[thought 1]"
- "[thought 2]"

### Feels
[Emotions — what they feel when dealing with the problem]
- "[emotion 1 — e.g., frustrated by complexity]"
- "[emotion 2 — e.g., anxious about making wrong choice]"

### Says
[What they tell others — in meetings, reviews, forums, support tickets]
- "[quote 1]"
- "[quote 2]"

### Does
[Observable actions — what they actually do (which may differ from what they say)]
- "[action 1]"
- "[action 2]"

## 7. User Journey Map

### Current State (Without the Product)

| Stage | Actions | Thoughts | Emotions | Pain Points | Touchpoints |
|-------|---------|----------|----------|-------------|-------------|
| **Awareness** | [how they discover the problem] | [what they think] | [what they feel] | [friction] | [where] |
| **Research** | [how they look for solutions] | [what they think] | [what they feel] | [friction] | [where] |
| **Decision** | [how they choose] | [what they think] | [what they feel] | [friction] | [where] |
| **Use** | [how they use current solution] | [what they think] | [what they feel] | [friction] | [where] |
| **Ongoing** | [long-term relationship] | [what they think] | [what they feel] | [friction] | [where] |

### Future State (With the Product)

| Stage | Actions | Thoughts | Emotions | Improvements | Opportunities |
|-------|---------|----------|----------|-------------|---------------|
| **Discovery** | [how they find the product] | [what they think] | [what they feel] | [what's better] | [what we can do] |
| **Onboarding** | [first experience] | [what they think] | [what they feel] | [what's better] | [what we can do] |
| **Core Use** | [primary workflow] | [what they think] | [what they feel] | [what's better] | [what we can do] |
| **Expansion** | [discovering more features] | [what they think] | [what they feel] | [what's better] | [what we can do] |
| **Advocacy** | [recommending to others] | [what they think] | [what they feel] | [what's better] | [what we can do] |

## 8. Scenarios

### Scenario 1: [Title — Happy Path]
[A concrete narrative of this persona using the product successfully. 3-5 sentences describing the situation, what they do, and the outcome.]

### Scenario 2: [Title — Edge Case or Frustration]
[A concrete narrative where something goes wrong or is confusing. What happens? How do they recover? What do they need?]

### Scenario 3: [Title — First Encounter]
[A concrete narrative of their first interaction with the product. What's their mental model? What do they expect? What surprises them?]

## 9. Accessibility & Inclusion Considerations

| Factor | Detail | Design Implication |
|--------|--------|-------------------|
| [e.g., Screen reader user] | [context] | [what the product must do] |
| [e.g., Low bandwidth connection] | [context] | [what the product must do] |
| [e.g., Non-native English speaker] | [context] | [what the product must do] |
| [e.g., Color vision deficiency] | [context] | [what the product must do] |
| [e.g., Mobile-only user] | [context] | [what the product must do] |

## 10. Feature Relevance Map

[Which features matter most to this persona — used to validate MoSCoW prioritization]

| Feature | Relevance | Why |
|---------|-----------|-----|
| [feature] | Critical / Important / Nice / Irrelevant | [reasoning specific to this persona] |

## 11. Anti-Persona Notes

[If this persona represents a user we are NOT designing for, document why:]
- [reason this persona is out of scope]
- [what would change if we tried to serve them]
- [where serving them would conflict with primary personas]
```
