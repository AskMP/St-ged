# Temper Synthesis Report — Stàged
**Date:** 2026-03-06
**Methodology:** 56 research responses across 7 topics × 8 AI platforms (Gemini Deep Research, ChatGPT, GitHub Copilot, Claude Sonnet 4.6, BigPickle, Grok, Raptor Mini, MiniMax)
**Phase:** 3.5 — Research & Hardening (--temper flag)

---

## Executive Summary

The Stàged business brief is directionally correct but contains 9 factual claims that need to be corrected or removed before architecture begins. The product's core positioning — free kitchen coordination platform targeting meal kit rejecters — is well-supported by market data. The competitive differentiation strategy needs refinement: two of the three claimed differentiators are already table stakes in the market.

**Overall brief accuracy: 41% of specific claims confirmed as stated.** The product concept is sound; the facts need updating.

---

## Section 1: What the Research Validates

### 1.1 The Market Problem is Real

All 8 platforms confirmed:
- HelloFresh churn is staggeringly high (50% cancel month 1; 90% by month 12)
- HelloFresh is losing revenue (3–8% decline forecast, 2025)
- US meal kit market is ~$9.1B with ~21.2M subscribers — a large, accessible addressable market
- Users strongly prefer free-to-download apps (73.6% of recipe app usage)
- The pool of "meal kit rejecters" is arguably larger than the current subscriber base

**The opportunity is real and the timing window is open.**

### 1.2 The Competitive Gap is Real (But Narrower Than the Brief Claims)

All 8 platforms confirmed that NO competitor currently offers:
1. **Eco/zero-waste filtering** as a core product feature
2. **Potluck/event coordination** combined with grocery fulfillment
3. **Live chef events** integrated into the product
4. **Offline-first PWA** architecture (all competitors are native apps)

These are genuine, unoccupied spaces. The combination of all four is uniquely Stàged's territory.

### 1.3 The Technology Architecture is Feasible

All 8 platforms confirmed:
- PWA on iOS 17+ can deliver reliable offline recipe access
- IndexedDB is sufficient for thousands of locally-cached recipes
- <3s load on 3G is achievable with Workbox + app shell architecture
- WebRTC in a PWA is viable for live events (Safari-compatible)
- Service workers + foreground sync queue can replace Background Sync (iOS limitation)

### 1.4 The Legal Framework is Clear

All 8 platforms confirmed:
- Recipe ingredient lists are NOT copyrightable (US Copyright Office, Circular 33)
- User-initiated URL import is protected by DMCA 512(c) safe harbor with proper implementation
- USDA FoodData Central is free for commercial use (CC0 public domain)
- Licensed recipe APIs (Edamam, Spoonacular with caveats) are the safe content acquisition path

---

## Section 2: What the Research Corrects

### 2.1 The "14.5M Tons" Claim is a Ghost Stat
**Impact: HIGH — removes a core environmental positioning argument**

This figure has no credible primary source for meal-kit-specific packaging waste. It appears to conflate total US food packaging waste with meal kit packaging specifically.

**The correct eco narrative (supported by research):**
> The University of Michigan LCA study (2019) found meal kits produce LESS CO2 overall than equivalent grocery-purchased meals (6.1 vs 8.1 kg CO2e) because portioned ingredients reduce food waste. However, meal kits use significantly MORE packaging per meal.
>
> Stàged's position is unique: digital pre-portioning captures the food-waste-reduction benefit without the physical packaging. This is a stronger and more defensible claim than the raw tonnage.

### 2.2 "Instacart Connect" is the Wrong Product
**Impact: HIGH — affects every integration reference in the brief**

"Instacart Connect" is Instacart's retailer-facing API (for grocery chains). The consumer developer program is the **Instacart Developer Platform (IDP)**, launched March 2024.

Named IDP partners confirmed by Instacart: NYT Cooking, WeightWatchers, GE Appliances, eMeals, Eatlove, Foodsmart — proving consumer recipe apps can and do get access.

### 2.3 Amazon Fresh Cannot Be a Fulfillment Partner at MVP
**Impact: HIGH — removes one-third of the assumed fulfillment network**

Amazon Fresh has no public API for third-party cart integration. The Amazon Product Advertising API (PA-API) — which covers general Amazon products — deprecates April 30, 2026. Any Amazon Fresh integration requires a direct business development relationship with Amazon, which is not a self-serve path.

**Replacement:** Kroger has a public developer API (developer.kroger.com) and is a viable Phase 2 fulfillment partner.

### 2.4 Instacart Commission is 5% Flat, Not 3–7%
**Impact: MEDIUM — affects financial modeling**

The publicly documented IDP affiliate rate is 5% of total cart value, via Impact.com, with a 7-day attribution window. The CPA alternative is $10 per new customer acquisition.

With Instacart's $112–$116 average order value, this yields ~$5.70 per converted order.

### 2.5 Cost-Per-Serving Gap is Smaller Than Claimed
**Impact: LOW — affects messaging nuance**

Brief claims: meal kits $10–$15 vs. grocery $4–$7 (implied $6–$10 gap).
Reality: meal kits $10.99–$12.49 vs. grocery-equivalent $7–$10 (actual $3–$5 gap).

The gap is still meaningful and the argument still works — but "save $6–$10 per serving" overstates it.

### 2.6 Event Pricing is Too Low to Be Sustainable
**Impact: MEDIUM — affects business model**

$5–$15 ticket pricing for live chef events is at or below the instructor cost floor for a quality experience. Market comparables:
- Consumer virtual cooking classes: $35–$100/person
- Corporate cooking events: $75–$150/person
- General cooking class average: $45/hour

A revised model at $25–$45 consumer/$75–$150 corporate is financially viable.

---

## Section 3: What the Research Refutes (Remove From Product Story)

| Claim | Status | Replacement |
|-------|--------|-------------|
| "14.5M tons of packaging waste from meal kits" | REMOVE | U Michigan LCA: more packaging per meal, less CO2 overall |
| "Instacart Connect integration" | RENAME | Instacart Developer Platform (IDP) |
| "Amazon Fresh integration at MVP" | REMOVE | Kroger API in Phase 2 |
| "Uber Eats/Postmates grocery integration" | REMOVE | No grocery API available |
| "Instacart integration is a differentiator" | REMOVE | Table stakes; Samsung Food, AnyList, Mealime all have it |
| "AnyList has no delivery integration" | CORRECT | AnyList added multi-retailer delivery in 2022 |
| "Samsung Food lacks household sharing" | CORRECT | Samsung Food supports shared lists and private communities |
| "Background sync works on iOS PWAs" | CORRECT | Background Sync not supported on iOS; foreground flush required |
| "Stàge Events at $5–$15 are high-margin" | REVISE | At market pricing ($25–$45 consumer), margins become viable |

---

## Section 4: New Information Not in the Brief

### 4.1 Emerging Competitive Threats

| Competitor | Threat Level | Why |
|------------|-------------|-----|
| **Jow** | HIGH | $13M Series A, European recipe app expanding to US with Instacart tie-in |
| **Samsung Food + Instacart (CES 2025)** | HIGH | Multi-year partnership, 200M+ Galaxy users, active AI development |
| **Walmart "Dinner Tonight"** | HIGH | Retailer-native recipe-to-cart launched early 2025 |
| **Zestyplan** | MEDIUM | "Climate-friendly decisions" meal planning — direct eco-positioning overlap |
| **Ollie AI** | MEDIUM | VC-backed AI-first family meal planner gaining traction |
| **Kroger "Meal Boards"** | MEDIUM | Retailer-native recipe feature (Q4 2025) |

### 4.2 Market Exit Events (Opportunities)

| Event | Opportunity |
|-------|------------|
| **Yummly shut down December 20, 2024** | Validates the category; users looking for alternatives |
| **PlateJoy shut down July 1, 2025** | Premium health-conscious planners actively seeking replacement |
| **HelloFresh 3–8% revenue decline (2025)** | Window is open; HelloFresh is distracted |

### 4.3 CPG Placement Infrastructure Exists

Chicory, SideChef, and Gourmet Ads operate the "featured ingredient placement" model already. Stàged does not need to invent this — it can integrate with Chicory (B2B publisher API) to access CPG ad budgets. However, CPG brands require audience scale before committing spend. This revenue stream should be planned for Phase 2 (10,000+ MAU), not MVP.

---

## Section 5: Revised Assumptions for Architecture Phase

The following revised facts should inform the Phase 4 project brief:

### Fulfillment
- **MVP:** Instacart IDP only (5% commission via Impact.com)
- **Phase 2:** Add Kroger developer API
- **Phase 3:** Amazon Fresh requires BD relationship; not self-serve

### Monetization Model
- **Affiliate:** 5% Instacart commission, $5.70/order, ~35,000 MAU for $10K/mo at 5% conversion
- **CPG Placement:** Phase 2 via Chicory publisher integration; not at MVP
- **Events:** Revise to $25–$45 consumer, $75–$150 corporate; 1–2 premium events/month is sustainable
- **Sustainability:** Will require long runway; all streams need 10K–100K+ MAU before meaningful revenue

### Nutrition
- **Primary:** USDA FoodData Central (self-hosted dataset; free; CC0)
- **Parser:** LLM-as-parser (ingredient text → USDA FDC ID) + USDA nutritional math
- **User-submitted recipes:** Edamam Nutrition Analysis API (pay per new recipe analyzed, not per view)
- **Avoid:** Spoonacular as primary (1-hour cache limit conflicts with offline-first)

### Content Acquisition
- **Legal:** Register DMCA agent before launch
- **MVP:** User-created recipes + user URL import (JSON-LD structured data only)
- **Seed library:** Open Recipes (openrecip.es, CC BY 3.0) + Edamam licensed access
- **Prohibited:** Bulk scraping any major recipe site (ToS violation regardless of copyright status)

### PWA Architecture
- **Install:** A2HS prompting is a functional requirement (not optional polish) for iOS data persistence
- **Sync:** Foreground-flush pattern (no Background Sync on iOS)
- **Stack:** Workbox 7+ + Dexie.js + WebSocket with polling fallback
- **Caching:** Stale-While-Revalidate (recipes), Cache-First (shell), Network-First (live lists)

---

## Section 6: Confidence Heatmap

| Topic | Brief Accuracy | Key Risk |
|-------|---------------|----------|
| Market size & churn | HIGH | Minor — numbers are right; direction is right |
| Eco positioning | MEDIUM | "14.5M tons" removed; eco framing needs rebuild |
| Fulfillment APIs | LOW | Major corrections needed; Amazon Fresh removed |
| Competitive analysis | MEDIUM | 2 of 3 claimed gaps are already filled by competitors |
| PWA feasibility | HIGH | Architecture needs iOS sync workaround; otherwise solid |
| Nutrition APIs | HIGH | USDA + Edamam is the right call; Spoonacular caching issue is real |
| Monetization model | MEDIUM | Event pricing wrong; CPG placement is real but delayed; scale needed |
| Recipe legality | HIGH | Brief's instinct (no bulk scraping) was correct; now substantiated |

---

*Synthesis files:*
- `consensus.md` — 32 high-confidence findings (6+/8 platforms)
- `divergence.md` — 11 areas of model disagreement with verdict
- `blind-spots.md` — 14 unique insights from individual platforms
- `recommendations.md` — 19 actionable recommendations (Critical → Medium)
- `temper-audit.md` — Per-claim confidence table (46 claims audited)
