---
name: "user-research"
description: "Methodology for creating research-backed user personas, journey maps, empathy maps, and user stories"
auto_invoke: true
triggers: ["creating user personas", "user journey mapping", "empathy mapping", "user story generation", "understanding target users", "/forge-personas or /forge Phase 2"]
---

# User Research & Persona Methodology

## Instructions

### 1. Research Foundation

Before creating personas, gather evidence about real user behavior. Personas built on assumptions are worse than no personas — they create false confidence.

**Evidence Sources (prioritized):**

| Priority | Source | What It Reveals | Confidence |
|----------|--------|----------------|------------|
| 1 | **User interviews / surveys** | Direct user voice, motivations, frustrations | High |
| 2 | **App reviews / forum posts** | Unfiltered complaints and praise | High |
| 3 | **Support tickets / FAQ analysis** | Where users get stuck | High |
| 4 | **Competitor reviews** | What users want but don't get | Medium-High |
| 5 | **Community discussions** (Reddit, HN, Discord, X) | Trends, emerging needs, sentiment | Medium |
| 6 | **Analytics / usage data** | Actual behavior patterns | High (if available) |
| 7 | **Domain expertise** | Industry patterns and conventions | Medium |
| 8 | **Analogous products** | How users behave in similar contexts | Low-Medium |

**Minimum evidence threshold:**
- Each persona should be supported by evidence from at least 3 sources
- Claims about user behavior should cite specific evidence, not assumptions
- If evidence is insufficient, mark the persona as "hypothetical" and note what needs validation

### 2. Persona Creation Process

**Step 1: Identify behavioral variables**

List the dimensions along which users vary in their relationship to the problem:

| Variable | Spectrum |
|----------|---------|
| Tech comfort | Novice ← → Expert |
| Usage frequency | Occasional ← → Daily |
| Decision authority | Recommender ← → Decision maker |
| Price sensitivity | Budget-conscious ← → Value-focused |
| Complexity tolerance | Wants simplicity ← → Wants power |
| Adoption style | Early adopter ← → Late majority |

**Step 2: Identify clusters**

Map evidence to the behavioral variables. Look for natural clusters — groups of users who share similar positions across multiple variables. These clusters become personas.

Rules:
- 3-5 personas is the target range (fewer = too generic, more = too fragmented)
- 1-2 primary personas (the product is designed FOR them)
- 1-2 secondary personas (the product accommodates them but doesn't optimize for them)
- 0-1 edge case / anti-personas (documented to explain who we're NOT designing for)

**Step 3: Build each persona**

For each persona cluster, use the `templates/user-persona.md` template. Fill every section with evidence-backed details. Where evidence is thin, mark explicitly as "[hypothesis — needs validation]".

**Step 4: Name and humanize**

Give each persona a memorable name and archetype label:
- Name: A first name that's easy to reference in conversation
- Archetype: A descriptive label that captures their core behavior
- Example: "Maya — The Overwhelmed Store Owner" or "Alex — The Power User"

The name and archetype should be evocative enough that the team can say "Would Maya use this?" in a meeting and everyone immediately knows who they mean.

### 3. Empathy Mapping

For each persona, build an empathy map using the four-quadrant model:

```
         ┌─────────────────────────────────┐
         │           THINKS                │
         │  (beliefs, concerns, priorities) │
         │                                 │
         │  "I don't have time to learn    │
         │   another tool"                 │
         │  "This should just work"        │
         ├────────────────┬────────────────┤
         │     FEELS      │     SAYS       │
         │  (emotions)    │  (to others)   │
         │                │                │
         │  Frustrated    │  "It's fine,   │
         │  Overwhelmed   │   I'll figure  │
         │  Anxious       │   it out"      │
         │                │                │
         ├────────────────┴────────────────┤
         │            DOES                 │
         │  (observable actions/behaviors)  │
         │                                 │
         │  Googles the error message      │
         │  Asks in a Facebook group       │
         │  Gives up and hires someone     │
         └─────────────────────────────────┘
```

**Key insight:** The gap between SAYS and DOES is where the real design opportunities live. Users say "I want more features" but do "I only use 3 of the 30 settings." Users say "It's fine" but do "I spend 2 hours on a task that should take 10 minutes."

**Empathy map rules:**
- THINKS and FEELS should come from user evidence (quotes, reviews, interviews)
- DOES should describe observable behavior, not intentions
- Look for contradictions between quadrants — those are design opportunities
- Each quadrant should have 3-5 entries minimum

### 4. User Journey Mapping

Map the user's experience across time, from first awareness to long-term use.

**Journey Map Structure:**

| Element | Description |
|---------|-------------|
| **Stages** | The high-level phases of the user's experience (Awareness → Evaluation → Onboarding → Core Use → Expansion → Advocacy) |
| **Actions** | What the user does at each stage |
| **Thoughts** | What they're thinking (internal monologue) |
| **Emotions** | What they're feeling (use an emotional curve: 😊 positive → 😐 neutral → 😫 negative) |
| **Pain Points** | Where they experience friction, confusion, or frustration |
| **Touchpoints** | Where the interaction happens (website, app, email, support, etc.) |
| **Opportunities** | Where the product can improve the experience |

**Two journey maps per persona:**
1. **Current State** — How they experience the problem TODAY (with existing solutions/workarounds)
2. **Future State** — How they'll experience the product (our vision of the improved journey)

The gap between current state pain points and future state improvements = the product's value.

**Journey map quality checks:**
- Does the journey include failure paths, not just the happy path?
- Are the emotions grounded in evidence (reviews, quotes) or assumed?
- Do the opportunities map to specific features in the product vision?
- Is the first-time experience (onboarding) mapped in sufficient detail?

### 5. Scenario Writing

Scenarios are concrete narratives that bring personas and journeys to life. They describe a specific person in a specific situation using the product.

**Scenario Types:**

| Type | Purpose | When to Write |
|------|---------|---------------|
| **Context scenario** | Describes the user's world and how the product fits in | During persona creation |
| **Key path scenario** | Describes the primary workflow step-by-step | During feature scoping |
| **Edge case scenario** | Describes unusual situations and error recovery | During design |
| **First-use scenario** | Describes the onboarding experience | During onboarding design |

**Scenario Template:**
```
[Persona name] is [doing what] when [trigger event].
They [action 1], expecting [expectation].
[What actually happens — success or friction].
They [reaction and next action].
The outcome: [what they achieved or didn't].
```

**Scenario rules:**
- Write in present tense, third person
- Include specific details (device, time of day, emotional state)
- Show the user's mental model (what they expect vs. what happens)
- Each persona should have at least 3 scenarios: happy path, error/edge, and first-use
- Scenarios should reference real features from the product vision

### 6. User Story Generation

Convert persona insights into user stories that feed directly into feature specifications and the PRD.

**User Story Format:**
```
As [persona name / archetype],
I want to [action/capability],
so that [outcome/benefit aligned with their JTBD].
```

**Acceptance criteria format:**
```
Given [context/precondition],
When [action],
Then [expected outcome].
```

**Story generation process:**
1. For each persona, review their JTBDs, pain points, and journey pain points
2. For each pain point, write a user story that addresses it
3. For each JTBD, write a story that fulfills it
4. Cross-reference stories against the product vision's feature scope
5. Tag each story with its persona and priority (Primary persona stories > Secondary)
6. Group stories into epics (natural feature clusters)

**Story quality checks:**
- Does the "so that" clause reference a real outcome from the persona's JTBDs?
- Is the action specific enough to be implementable?
- Do the acceptance criteria cover the happy path AND at least one error path?
- Can this story be tested without subjective judgment?

### 7. Accessibility Persona Integration

Every persona set should include accessibility considerations. This is not a separate persona — it's a lens applied to every persona.

**Accessibility dimensions to consider for each persona:**

| Dimension | Questions |
|-----------|-----------|
| **Vision** | Could this persona have low vision, color blindness, or use a screen reader? |
| **Motor** | Could they have limited fine motor control, use keyboard-only, or use assistive devices? |
| **Cognitive** | Could they have attention difficulties, reading challenges, or memory limitations? |
| **Auditory** | Could they be deaf or hard of hearing? Does the product use audio? |
| **Situational** | Could they be in bright sunlight, noisy environment, one-handed, or on a slow connection? |
| **Language** | Could they be a non-native speaker? What reading level is appropriate? |

**Rules:**
- At least one persona should explicitly represent a user with an accessibility need
- Every primary persona should have a "situational accessibility" note (e.g., "uses the product on mobile while commuting")
- Accessibility requirements discovered through persona analysis feed directly into the ui-designer agent's work

### 8. Persona Validation

Before finalizing personas, validate them:

**Internal Validation (can do now):**
- [ ] Each persona is supported by evidence from 3+ sources
- [ ] Behavioral variables are distinct between personas (they don't blur together)
- [ ] Primary persona is clearly defined (the product optimizes for them)
- [ ] Anti-personas documented (who we're NOT designing for)
- [ ] Empathy maps reveal at least one SAYS/DOES contradiction per persona
- [ ] Journey maps include failure paths, not just happy paths
- [ ] Scenarios are specific enough to inform design decisions
- [ ] Accessibility considerations are addressed for every primary persona
- [ ] User stories trace back to specific persona JTBDs and pain points

**External Validation (needs user/customer input):**
- [ ] Personas reviewed by someone with direct user contact (support, sales, user research)
- [ ] At least one real user could read the persona and say "that's me"
- [ ] No persona is aspirational (describes who we WISH our users were, not who they ARE)

### 9. Persona Maintenance

Personas are living documents. They should be updated when:

- New user research reveals different behavioral patterns
- The product pivots or expands to a new market
- Usage data contradicts persona assumptions
- A feature decision can't be resolved by existing personas (signals a missing persona)

**Staleness indicators:**
- No one on the team can name the personas from memory
- Feature decisions are made without referencing personas
- New user feedback doesn't match any existing persona
- The personas were created more than 6 months ago and never updated

