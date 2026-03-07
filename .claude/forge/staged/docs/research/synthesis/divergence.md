# Temper Synthesis — Divergence Points
**Date:** 2026-03-06
**Source:** Cross-platform synthesis of 56 research responses across 8 AI models

These are areas where platforms disagree, conflict, or show significantly different confidence levels. Each divergence is assessed for which position the strongest primary sources support.

---

## Topic 02: Fulfillment APIs

### DIVERGENCE-01: Instacart commission rate
**Positions:**
- Claude, ChatGPT, Copilot, BigPickle, Raptor Mini: **5% flat rate** (documented at docs.instacart.com)
- Grok: **2–8% via Awin network** (references a 2023 Awin launch, different program)
- Gemini: **1.5–2.5% "Tastemaker" negotiated revenue share**
- MiniMax: **5% with $10 CPA alternative**

**Assessment:** The 5% rate is the best-documented figure, directly cited from Instacart's official developer platform documentation. Grok's "2–8% via Awin" may reference a different, older affiliate program (general content affiliate, not IDP). Gemini's "1.5–2.5% Tastemaker" may reflect a different Instacart partnership tier (influencer/content creator program, not IDP developer program).

**Verdict:** Use **5% IDP** as the planning assumption. Acknowledge that 2–8% range may apply across different Instacart partnership programs; the exact rate depends on which program Stàged qualifies for.

---

## Topic 03: Competitive Landscape

### DIVERGENCE-02: AnyList delivery integration details
**Positions:**
- ChatGPT, BigPickle, MiniMax: AnyList fully supports Instacart, Amazon Fresh, Walmart, Kroger, Safeway, Albertsons, H-E-B, Shipt (extensive integration)
- Copilot: AnyList has "no delivery integration" — marked the claim as accurate
- Raptor Mini: Lists AnyList as having no grocery delivery link

**Assessment:** ChatGPT and BigPickle both cite the AnyList help documentation and blog post confirming "Introducing Online Shopping" (January 2022). The platforms marking AnyList as "no delivery" appear to have used outdated information predating the 2022 update.

**Verdict:** AnyList DOES have extensive grocery delivery integration. The "AnyList has no fulfillment" claim in the brief is **false**.

### DIVERGENCE-03: Samsung Food eco features
**Positions:**
- Claude, Copilot, MiniMax: Samsung Food has NO eco/sustainability features — gap validated
- ChatGPT: Samsung Food "explicitly promises food-waste reduction" — not zero-waste-first but eco-adjacent
- Gemini: Samsung Food has "Secondary (Indirect)" eco positioning
- BigPickle: Samsung Food has "partial" eco positioning

**Assessment:** All platforms agree Samsung Food is NOT a zero-waste-first product. The disagreement is about whether Samsung Food has any eco messaging at all. ChatGPT found Samsung Food publishes food-waste reduction content; Claude and others found no dedicated eco feature.

**Verdict:** Samsung Food has eco-adjacent messaging (food waste blog posts) but no dedicated filter or eco-mode. The eco positioning gap for Stàged is real but "soft" — it's positioning, not an unbuildable feature.

### DIVERGENCE-04: Mealime delivery integration details
**Positions:**
- Claude: Mealime has confirmed Instacart, Kroger, Walmart, Amazon Fresh integration
- Copilot: Mealime has "partial" delivery ("grocery delivery options")
- Raptor Mini: Mealime has no grocery delivery link
- MiniMax: Mealime has Walmart + Instacart integration

**Assessment:** Mealime was acquired by Albertsons in 2022, and their grocery integration status has been in flux. The range of findings likely reflects the complexity of Mealime's Albertsons ownership and retailer partnerships. Claude's finding of multi-retailer integration is best-supported.

**Verdict:** Mealime has some delivery integration (Albertsons/Kroger ecosystem likely), but the exact retailer list requires app-level verification.

### DIVERGENCE-05: Jow as emerging threat
**Positions:**
- BigPickle, Raptor Mini: Jow is a HIGH threat ($13M Series A, US expansion with Instacart tie-in)
- Claude: No venture-backed direct competitor found as of early 2026
- Gemini: Mentions Jow as an emerging app

**Assessment:** BigPickle cites Northzone investment ($13M Series A, February 2024) and US launch. This appears to be a real, funded competitor that Claude's research didn't surface as prominently.

**Verdict:** Jow is a real emerging threat. Stàged should monitor and account for it in competitive strategy.

---

## Topic 05: Nutrition APIs

### DIVERGENCE-06: Edamam pricing and caching terms
**Positions:**
- Claude: ~$49/mo paid tier; caching likely prohibited without enterprise agreement
- Gemini: $299/mo Core tier; caching "only allowed on $299+ tiers"
- Grok: Free tier with 5,000 calls/month; $49/mo Developer tier
- ChatGPT: Pricing "opaque" — not transparently published in current docs
- Copilot: Warns Spoonacular only allows 1-hour cache; Edamam better for caching

**Assessment:** Edamam pricing appears to vary by product (Recipe API vs. Nutrition API vs. Food Database API) and has changed between research passes. The inconsistency across platforms reflects genuine opacity in Edamam's pricing documentation.

**Verdict:** Contact Edamam directly before committing to this as primary nutrition provider. Pricing and caching terms are not reliably verifiable from public sources alone.

### DIVERGENCE-07: AI nutrition estimation accuracy
**Positions:**
- Gemini: "70-90% Rule" — ~85% accuracy for Calories/Protein/Carbs with clear weights
- Grok/Copilot: 70-85% accuracy for simple recipes, 50-70% for complex
- Claude: No published benchmarks found; viability not confirmed
- ChatGPT: No strong current benchmark for LLM-only nutrition estimation

**Assessment:** The accuracy estimates are plausible inferences from model testing, not from peer-reviewed studies. Gemini found a citation from "Journal of Nutrition (Sept 2025)" for LLM accuracy — this claim requires verification.

**Verdict:** Treat LLM nutrition estimation accuracy as an **unverified inference**. 70-85% for macros is a reasonable working assumption, but do not publish this as a product guarantee.

---

## Topic 06: Monetization Benchmarks

### DIVERGENCE-08: Recipe-to-order conversion rate
**Positions:**
- Claude: 5–10% (inference; no published benchmark found)
- Grok: 7.7% implied in break-even math
- ChatGPT: 5% or 10% presented as bracket; acknowledges no sourced benchmark
- Gemini: 10% implied in break-even models

**Assessment:** No platform found a published conversion rate benchmark for recipe apps to grocery orders. All figures are estimates. Actual conversion may be lower (1–3%) given typical recipe-to-purchase friction.

**Verdict:** Conversion rate is the most uncertain variable in the monetization model. Plan for 2–5% conservative case; stress-test the model at 1%.

### DIVERGENCE-09: CPG placement CPM rates
**Positions:**
- Grok: $5–$20 CPM for contextual placements
- Gemini: $11.12–$17.80 CPM for Food & Beverage contextual ads
- Claude: $8–$25 CPM (inference; labeled as not sourced)
- BigPickle: $20+ CPM for "Kerrygold Model" default ingredient placement

**Assessment:** No platform found published rate cards from Chicory or SideChef. All CPM figures are inferences from adjacent industry benchmarks.

**Verdict:** Use **$10–$20 CPM** as a planning range; treat as an inference. Actual rates depend on Chicory negotiation and brand partnerships.

---

## Topic 07: Recipe Content Legality

### DIVERGENCE-10: User-initiated import ToS exposure
**Positions:**
- Claude, Gemini: Section 512(c) covers copyright exposure; ToS violation (from the user's scraping) is a separate, distinct risk not covered by 512
- ChatGPT: Medium-high risk even for user-initiated import — "still raises ToS, caching, and redistribution risk"
- BigPickle: "Low" risk for user URL import; straightforward safe harbor

**Assessment:** The technical legal analysis is consistent — 512(c) addresses copyright, not ToS breach. The disagreement is in risk severity assessment. The legal risk is real but primarily lands on the user (who agreed to the source site's ToS), not Stàged (which is acting at user direction).

**Verdict:** Risk is MEDIUM-LOW for Stàged, but requires DMCA agent registration and careful implementation (structured data import only; no full-article republication). Legal review recommended.

### DIVERGENCE-11: Lambing v. Godiva as a landmark case
**Positions:**
- Claude: "Often misattributed" — the principle is established but the specific case citation may be wrong
- Gemini, ChatGPT: Cite other cases (Tomaydo-Tomahdo v. Vozary) as more relevant
- Some platforms: cite Lambing confidently

**Assessment:** The recipe non-copyrightability principle is well-established regardless of which specific case is cited. The US Copyright Office FAQ is the primary definitive source.

**Verdict:** Do not cite specific cases without legal verification. Reference US Copyright Office Circular 33 and the FAQ as primary sources.
