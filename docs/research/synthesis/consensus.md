# Temper Synthesis — Consensus Findings
**Date:** 2026-03-06
**Source:** Cross-platform synthesis of 56 research responses across 8 AI models
**Platforms:** Gemini, ChatGPT, GitHub Copilot, Claude, BigPickle, Grok, Raptor Mini, MiniMax
**Confidence threshold:** Claim confirmed by 6+ of 8 platforms OR by 4+ with primary source citations

---

## Topic 01: Market Validation

### CONSENSUS-01: The "14.5M tons of packaging waste" stat is unsourced
**Confidence: CRITICAL (8/8 platforms flag this)**
All 8 models flagged the 14.5M+ tons claim as unverifiable for meal kits specifically. The closest defensible figures:
- Total US food packaging waste: millions of tons annually (not meal-kit-specific)
- University of Michigan LCA study (2019): meal kit packaging = 7% of meal kit emissions (vs 4% for grocery)
- Meal-kit-specific packaging waste estimate: ~0.7–1.5M tons (inference, not sourced)
**Action:** Remove "14.5M tons" from all product materials. Replace with the U Michigan finding: meal kits have more packaging per meal, but less total environmental impact due to food waste reduction.

### CONSENSUS-02: Meal kits produce less CO2 than equivalent grocery-bought meals
**Confidence: HIGH (7/8 platforms confirm)**
University of Michigan LCA (2019): meal kits = 6.1 kg CO2e/meal vs 8.1 kg CO2e for grocery equivalents — a 33% reduction from reduced food waste and optimized logistics.
**Action:** Reframe Stàged's eco-positioning. The true claim is: eliminate physical packaging AND preserve the food-waste-reduction benefit of pre-portioning (digital pre-portioning = the best of both worlds).

### CONSENSUS-03: HelloFresh churn is staggeringly high
**Confidence: HIGH (7/8 platforms confirm)**
- 50% of HelloFresh subscribers cancel in month 1
- 85% cancel by month 6
- 90% cancel by month 12
Source: Second Measure, Cotera Blog (2024)
**Implication:** The pool of "meal kit rejecters" is massive and immediately addressable.

### CONSENSUS-04: US meal kit TAM is validated
**Confidence: HIGH (6/8 platforms confirm with sources)**
- US market: ~$9.1B in 2025 (IBISWorld)
- ~21.2M US subscribers (2024)
- HelloFresh holds ~74% market share and is in decline (3-8% revenue decrease forecast 2025)

### CONSENSUS-05: The cost gap is smaller than the brief implies
**Confidence: HIGH (7/8 platforms confirm)**
- HelloFresh: $10.99–$12.49/serving
- Grocery equivalent: $7–$10/serving (not $4–$7 as brief states)
- Real gap: $3–$5/serving (not $6–$10)
**Action:** Adjust cost comparison language in all product materials.

---

## Topic 02: Fulfillment APIs

### CONSENSUS-06: "Instacart Connect" is the wrong product
**Confidence: CRITICAL (7/8 platforms explicitly correct this)**
"Instacart Connect" is the retailer-facing enterprise API (for grocery retailers to manage inventory). The correct consumer developer program is the **Instacart Developer Platform (IDP)**, launched March 27, 2024.
**Action:** Update all product materials to reference "Instacart Developer Platform (IDP)."

### CONSENSUS-07: Instacart affiliate commission is 5% flat
**Confidence: HIGH (6/8 platforms confirm at 5%)**
- Rate: 5% of total cart value
- Attribution window: 7 days from click
- Enrollment: via Impact.com affiliate network
- Average cart value (2024): $112–$116
- Per-order value: ~$5.70
- CPA alternative: $10 per new customer acquisition
**Action:** Correct brief's "3–7%" to "5% baseline" with note that higher rates require volume-based negotiation.

### CONSENSUS-08: Amazon Fresh has no public API
**Confidence: CRITICAL (8/8 platforms confirm)**
Amazon Fresh has no publicly accessible API for third-party grocery cart integration. The Product Advertising API (PA-API) — for Amazon Associates — deprecates April 30, 2026. Any "Amazon Fresh integration" relies on informal URL heuristics that break when Amazon changes their URL structure.
**Action:** Remove Amazon Fresh from MVP scope. Do not promise Amazon Fresh integration without a direct Amazon business relationship.

### CONSENSUS-09: Uber Eats API is restaurant-only
**Confidence: HIGH (7/8 platforms confirm)**
Uber Eats developer tools are oriented toward restaurant ordering, not grocery. No affiliate track for recipe apps confirmed.
**Action:** Remove Uber Eats from fulfillment partner list.

### CONSENSUS-10: Kroger has a public developer API
**Confidence: MEDIUM (5/8 platforms mention)**
Kroger offers a public developer API (developer.kroger.com) with product search and cart capabilities. This is a viable alternative/addition to Instacart IDP.
**Action:** Add Kroger API to Phase 2 fulfillment roadmap.

---

## Topic 03: Competitive Landscape

### CONSENSUS-11: Eco/zero-waste filtering is a genuine, unoccupied gap
**Confidence: HIGH (8/8 platforms confirm absence in all competitors)**
No current consumer recipe app has eco/zero-waste filtering, carbon footprint tracking, or sustainability-focused recipe curation as a core feature. Samsung Food has published blog posts on food waste but no dedicated feature.
**Caveat:** This gap is not technically difficult. Samsung Food could add it rapidly if Stàged demonstrates market demand.

### CONSENSUS-12: Potluck/event coordination is a genuine, unoccupied gap
**Confidence: HIGH (8/8 platforms confirm absence)**
No current consumer recipe app offers multi-household event planning (potluck dish assignment, guest dietary aggregation, party-scale shopping) combined with grocery fulfillment.

### CONSENSUS-13: Instacart integration is NOT a differentiator
**Confidence: CRITICAL (7/8 platforms confirm competitors already have it)**
Samsung Food confirmed Instacart partnership (CES 2025). AnyList has had Instacart, Amazon Fresh, Walmart, Kroger integration since 2022. Mealime has multi-retailer fulfillment.
**Action:** Remove "Instacart integration" from competitive differentiation messaging. Position the COMBINATION of features as the differentiator.

### CONSENSUS-14: AnyList has grocery delivery integration
**Confidence: HIGH (7/8 platforms confirm)**
AnyList added Instacart, Amazon Fresh, Walmart, Kroger, Safeway, Albertsons, H-E-B, Shipt integration in 2022. The brief's assumption that AnyList "has no delivery integration" is false.

### CONSENSUS-15: Yummly shut down December 20, 2024
**Confidence: HIGH (6/8 platforms confirm)**
Yummly (Whirlpool-owned) shut down its consumer app December 20, 2024. This validates that sustainable business models matter in this category.

### CONSENSUS-16: Samsung Food is the primary platform threat
**Confidence: HIGH (7/8 platforms agree)**
Samsung Food has: 6M+ users, active development, multi-year Instacart partnership (CES 2025), AI-powered features (Gemini integration), and 200M+ Galaxy device distribution advantage.

---

## Topic 04: PWA Feasibility

### CONSENSUS-17: PWA architecture is technically viable for Stàged's use case
**Confidence: HIGH (8/8 platforms confirm)**
Service workers, IndexedDB, and Cache API are all supported on iOS Safari 17+ and Android Chrome. The <3s load target on 3G is achievable with proper architecture.

### CONSENSUS-18: Background Sync API is NOT available on iOS
**Confidence: CRITICAL (8/8 platforms confirm)**
Background Sync and Periodic Background Sync are not supported on iOS Safari. All offline mutation queuing must use the foreground flush pattern (detect `online` event or `visibilitychange` → flush queue).
**Action:** Design sync architecture around foreground-initiated flush, not background sync.

### CONSENSUS-19: iOS 7-day eviction does not apply to installed (A2HS) PWAs
**Confidence: HIGH (7/8 platforms confirm)**
For non-installed browser tabs, iOS evicts script-writable storage after 7 days of inactivity. For Add-to-Home-Screen installed PWAs, persistent storage can be requested and 7-day eviction does not apply.
**Action:** Aggressively prompt A2HS installation on iOS. This is a product requirement, not a nice-to-have.

### CONSENSUS-20: Recommended PWA stack
**Confidence: HIGH (7/8 platforms agree on core choices)**
- Service worker management: **Workbox 7+**
- Local storage: **IndexedDB via Dexie.js**
- Sync: **Custom queue + WebSocket with polling fallback**
- Caching strategy: **Stale-While-Revalidate** for recipes, **Cache-First** for static assets, **Network-First** for live lists

---

## Topic 05: Nutrition APIs

### CONSENSUS-21: USDA FoodData Central is the best cost basis
**Confidence: HIGH (8/8 platforms recommend USDA as primary)**
USDA FoodData Central: free, CC0, no usage caps, ~600K food entries, government-lab-tested accuracy. The limitation is that it has no recipe analysis endpoint — requires building an ingredient parser.

### CONSENSUS-22: Spoonacular's 1-hour cache limit conflicts with offline-first architecture
**Confidence: HIGH (6/8 platforms flag this)**
Spoonacular's public ToS specifies user-requested data can only be cached for 1 hour. This is fundamentally incompatible with Stàged's offline-first, pre-computed nutrition approach.
**Action:** Do not anchor nutrition on Spoonacular if offline caching is a core product promise.

### CONSENSUS-23: LLM nutritional estimation is viable as a fallback only
**Confidence: MEDIUM (6/8 platforms agree, with different accuracy estimates)**
LLMs can estimate macros at ~70-90% accuracy for calories/protein/carbs in simple recipes. Micronutrient accuracy is poor (30-50% underestimation of sodium). Suitable as a labeled fallback; not sufficient for precision nutrition use cases (e.g., Nadia's macro planning persona).

### CONSENSUS-24: Pre-compute and cache nutrition at recipe-save time
**Confidence: HIGH (8/8 platforms agree)**
Compute nutritional data once when a recipe is saved/imported. Cache the result in IndexedDB. Never re-call the API on recipe view. This eliminates per-view API costs and enables offline nutrition access.

---

## Topic 06: Monetization Benchmarks

### CONSENSUS-25: Stàge Events at $5–$15 is likely unprofitable
**Confidence: HIGH (7/8 platforms flag this)**
Market benchmarks:
- Virtual team cooking events: $75/person minimum
- Consumer chef classes (Classpop, Cozymeal): $35–$100/person
- General cooking class average: $45/hour (Thumbtack 2024)
- Instructor cost: $200–$500/hour
At $10/ticket with 100 attendees = $1,000 gross, before instructor cost. Contribution margin can be negative.
**Action:** Revise event pricing to $25–$45 consumer / $75–$150 corporate. Or reframe as a loss-leader community feature with premium tier at correct market price.

### CONSENSUS-26: CPG featured ingredient placement is a real format, but not self-serve
**Confidence: HIGH (7/8 platforms confirm format exists)**
Chicory, SideChef, and Gourmet Ads operate this model. CPG brands pay premium rates for default ingredient placement. However, brands work through established platforms and require audience scale proof before committing spend. This revenue stream will NOT exist at MVP.
**Action:** Plan Chicory integration (B2B publisher API) for Phase 2 as the fastest path to CPG revenue.

### CONSENSUS-27: Scale requirements for sustainability
**Confidence: HIGH (consensus across all platforms)**
Break-even math (at 5% Instacart commission, $114 AOV, 5% conversion rate):
- $1K/mo MRR: ~3,500 MAU
- $10K/mo MRR: ~35,000 MAU
- $100K/mo MRR: ~350,000 MAU
All three revenue streams require significant MAU before generating meaningful revenue. Stàged needs a long runway.

---

## Topic 07: Recipe Content Legality

### CONSENSUS-28: Ingredient lists are NOT copyrightable
**Confidence: CRITICAL (8/8 platforms confirm, citing US Copyright Office)**
US Copyright Office FAQ: "A mere listing of ingredients or contents is not subject to copyright." This applies to ingredient quantities and bare procedural steps.

### CONSENSUS-29: Expressive prose surrounding recipes IS copyrightable
**Confidence: HIGH (8/8 platforms agree)**
Headnotes, personal narrative, food photography, creative method descriptions, and unique voice are protected expression. Copying full recipe page content (the 800-word blog story + photos) is copyright infringement even if the ingredient list is not.
**Action:** Recipe import must extract only structured data (schema.org/Recipe JSON-LD), not full article text.

### CONSENSUS-30: Bulk scraping violates ToS (regardless of copyright status)
**Confidence: HIGH (8/8 platforms confirm)**
NYT Cooking, Allrecipes, Bon Appétit, Serious Eats, Food Network all explicitly prohibit automated data collection in their ToS. Enforcement mechanism: breach of contract and CFAA (Computer Fraud and Abuse Act).
**Action:** Do not scrape recipe sites at scale. The original brief's "AI-Aggregated Library: Scrape and normalize countless recipes" is not viable.

### CONSENSUS-31: User-initiated URL import is protected by DMCA 512(c) safe harbor
**Confidence: HIGH (7/8 platforms confirm, with implementation requirements)**
When the user pastes a URL and initiates the import, the platform qualifies for 512(c) protection IF:
1. DMCA agent is registered with US Copyright Office
2. Notice-and-takedown policy is implemented
3. Infringing content is removed promptly upon notification
4. Platform has no red-flag knowledge of systematic infringement
**Action:** Register DMCA agent before launch. This is a legal requirement, not optional.

### CONSENSUS-32: Spoonacular non-compete clause is a risk for Stàged
**Confidence: HIGH (6/8 platforms flag this)**
Spoonacular's ToS prohibits using their API to build a product that "provides the same experience as Spoonacular." Given Stàged is a recipe + nutrition app, Spoonacular may invoke this clause.
**Action:** Legal review required before relying on Spoonacular for core recipe library. Edamam is the safer licensed option.
