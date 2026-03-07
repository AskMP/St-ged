# Temper Synthesis — Actionable Recommendations
**Date:** 2026-03-06
**Source:** Cross-platform synthesis of 56 research responses across 8 AI models

Recommendations are organized by urgency (Critical → High → Medium) and mapped to the artifact they affect (Vision, Features, Architecture, Legal, Business Model).

---

## Critical — Fix Before Proceeding to Phase 4

### REC-01: Kill the "14.5M tons" stat everywhere
**Confidence: 8/8 platforms**
**Affects:** Vision, marketing copy, business brief
Remove the "14.5M+ tons of packaging waste from meal kits" claim from all product materials. It is a fabricated/ghost statistic with no credible primary source.

**Replacement messaging:** "Meal kits generate more packaging waste per meal than grocery shopping — but Stàged captures the food waste reduction benefit of pre-portioning (digital pre-portioning) without the physical packaging entirely."

---

### REC-02: Reframe eco-positioning around digital pre-portioning
**Confidence: 8/8 platforms**
**Affects:** Vision, F-series feature "Eco/Zero-Waste Mode"
The correct eco claim is not "we eliminate waste compared to meal kits" (meal kits actually have lower CO2 overall). The correct claim is:
> "Stàged eliminates physical packaging while capturing the food-waste-reduction benefit of pre-portioned recipes — digital pre-portioning means you buy exactly what you need."

This framing is scientifically defensible, emotionally resonant, and distinct from all competitor positioning.

---

### REC-03: Replace all references to "Instacart Connect" with "Instacart IDP"
**Confidence: 7/8 platforms**
**Affects:** Brief, Architecture planning, API integration tickets
"Instacart Connect" is the retailer-facing enterprise API. The correct developer program is the **Instacart Developer Platform (IDP)**, launched March 2024.
- Apply to IDP at: `docs.instacart.com/developer_platform_api/`
- Affiliate enrollment: via Impact.com (requires live integration first)
- Commission: 5% flat (7-day attribution window)

---

### REC-04: Remove Amazon Fresh from MVP scope entirely
**Confidence: 8/8 platforms**
**Affects:** Feature spec, Architecture, Fulfillment partner list
Amazon Fresh has no public API for third-party grocery cart integration. The PA-API (Amazon Associates) deprecates April 30, 2026. Any Amazon Fresh integration requires a direct business relationship with Amazon.
- **MVP:** Instacart IDP only
- **Phase 2:** Add Kroger API (public developer API exists at developer.kroger.com)
- **Phase 3+:** Amazon Fresh requires business development, not engineering

---

### REC-05: Register a DMCA agent before any recipe import feature goes live
**Confidence: 8/8 platforms**
**Affects:** Legal, Feature timeline for Recipe Import (F01/F02)
DMCA Section 512(c) safe harbor requires a registered designated agent with the US Copyright Office. This is a legal requirement, not optional. Cost: ~$6/year via copyright.gov.

Actions:
1. Register DMCA agent at copyright.gov/dmca-agent/
2. Add DMCA notice-and-takedown policy to Terms of Service
3. Design recipe import to fetch only schema.org JSON-LD (structured data), not full article HTML
4. Do not republish user-imported recipes to other users' feeds (keeps them as private user data)

---

### REC-06: Revise event pricing or reposition Stàge Events
**Confidence: 7/8 platforms**
**Affects:** Business model, Feature F12 (Stàge Events), Revenue projections
$5–$15 ticket pricing for live cooking events is likely unprofitable:
- Market rate: $35–$100/person (consumer); $75–$150/person (corporate)
- Instructor cost: $200–$500/session minimum
- At $10/ticket, 100 attendees barely covers instructor cost

**Options:**
1. Revise to $25–$45 consumer pricing (still accessible, sustainable margins)
2. Prioritize corporate/B2B bookings at $75–$150/person (higher value, same product)
3. Reframe early events as loss-leader community builders, with premium-tier pricing later
4. MasterClass-style: event bundle subscription rather than per-ticket

---

## High Priority — Address Before Architecture Phase

### REC-07: Acknowledge Instacart integration is NOT a differentiator
**Confidence: 7/8 platforms**
**Affects:** Competitive positioning, marketing
Samsung Food, AnyList, Mealime all have Instacart integration. Stàged's differentiation must be the COMBINATION of:
- Eco/zero-waste filtering (unique gap)
- Potluck/event coordination (unique gap)
- Offline-first PWA (technical differentiator vs. all native-app competitors)
- Household coordination across households (not just within one household)
- Free with no subscription (vs. subscription incumbents)

---

### REC-08: Add A2HS (Add-to-Home-Screen) as a first-run product requirement
**Confidence: 7/8 platforms**
**Affects:** UX design, iOS onboarding flow, Architecture
On iOS, the 7-day cache eviction does NOT apply to installed PWAs. A recipe user who doesn't install the app to their home screen risks losing their offline recipe cache if they don't open the app for 7+ days.

This means prompting A2HS installation is not optional UX polish — it is a functional data preservation requirement. Design a clear, benefit-focused A2HS prompt as part of onboarding.

---

### REC-09: Design foreground-flush sync architecture (not Background Sync)
**Confidence: 8/8 platforms**
**Affects:** Architecture, real-time list sync design
Background Sync API is not supported on iOS. All offline sync must use:
1. Local-first writes → IndexedDB (optimistic UI)
2. Sync queue in IndexedDB (pending mutations)
3. Flush on `visibilitychange` (app comes to foreground) + `online` event
4. WebSocket when connected; HTTP polling fallback

Do not architect around Background Sync. Do not promise "automatic background sync" to iOS users.

---

### REC-10: Use USDA FoodData Central as primary nutrition source (self-hosted)
**Confidence: 8/8 platforms**
**Affects:** Architecture, Nutrition Intelligence feature (F09)
- Download USDA FoodData Central as a full dataset (not just API calls)
- Host a lightweight ingredient search service internally
- Build NLP ingredient parser: "2 cups flour" → USDA "Wheat flour, all-purpose, self-rising, enriched" (FDC ID)
- Cache computed nutrition per recipe at save-time; never re-call on recipe view
- Use Edamam (paid, per-analyzed-recipe) for user-submitted recipes where USDA lookup fails
- Label nutrition as "estimated" when parser confidence is low

**Do NOT use Spoonacular** as primary: 1-hour cache limit is incompatible with offline-first architecture.

---

### REC-11: Monitor Zestyplan as eco-positioning competitor
**Confidence: MEDIUM (2/8 platforms)**
**Affects:** Competitive strategy
Zestyplan markets itself as a "climate-friendly decisions" meal planning app — directly competing on Stàged's primary differentiation. Currently early-stage but worth monitoring. If Zestyplan gains funding or traction, Stàged's eco-gap may close before launch.

**Action:** Set a Google Alert for "Zestyplan" and "climate meal planning app." Quarterly competitive review.

---

### REC-12: Plan Chicory integration for Phase 2 CPG revenue
**Confidence: 7/8 platforms**
**Affects:** Business model, Phase 2 timeline
Chicory is the most accessible path for CPG featured ingredient revenue. They offer B2B publisher integrations (not just SideChef's closed ecosystem). At MVP, Chicory integration is not needed. At Phase 2 (10,000+ MAU), initiate Chicory publisher partnership.

CPG brands require audience proof (MAU, session depth, demographic data) before committing spend. This revenue stream will not exist until Stàged reaches meaningful scale.

---

## Medium Priority — Inform Architecture Without Blocking It

### REC-13: Adjust cost-per-serving claims in all materials
**Confidence: 7/8 platforms**
**Affects:** Vision, marketing messaging
- Brief states: meal kits $10–$15 vs. grocery $4–$7 (implies $6–$10 savings)
- Reality: meal kits $10.99–$12.49 vs. grocery-equivalent $7–$10 (implies $3–$5 savings)
- Update comparative claims to the defensible range

### REC-14: Build a realistic conversion rate assumption for financial modeling
**Confidence: No platform found a primary source**
**Affects:** Business model projections
No published benchmark exists for recipe app → grocery order conversion rates. Use a conservative range:
- Conservative: 2–3% of active users placing one Instacart order/month
- Base case: 5% conversion
- Optimistic: 10% conversion
Stress-test the business model at 2% conversion. The sustainability math changes significantly.

### REC-15: Evaluate Jow as a funded direct competitor
**Confidence: MEDIUM (BigPickle, Raptor Mini)**
**Affects:** Competitive strategy, go-to-market timing
Jow raised a $13M Series A (February 2024, Northzone) and is expanding from Europe to the US market with deep Instacart integration. This is a well-funded competitor entering Stàged's exact space.
**Action:** Research Jow's US launch status, feature set, and market positioning. If Jow is actively acquiring users in the US, factor into go-to-market timing.

### REC-16: Use Screen Wake Lock in recipe cooking view
**Confidence: MEDIUM (Gemini only — but technically sound)**
**Affects:** UX feature, iOS Safari 18.4+ supported
Screen Wake Lock prevents the screen from turning off while a user is actively cooking from a recipe. This is a high-impact, low-effort feature. Safari 18.4 added support. Implement in the recipe step-by-step view.

### REC-17: Implement "LLM-as-parser" for USDA ingredient mapping
**Confidence: MEDIUM (Gemini blind spot)**
**Affects:** Nutrition Intelligence architecture
Use an LLM (Claude claude-haiku-4-5, low cost) as the ingredient parser layer that maps free-text recipe ingredients to USDA FDC IDs, rather than as a direct nutrition estimator. The LLM does the natural language mapping; USDA provides the actual nutritional values. More accurate than LLM estimation alone, cheaper than Edamam per-recipe.

### REC-18: Design recipe import to use schema.org JSON-LD
**Confidence: 8/8 platforms**
**Affects:** F01 (Recipe Engine), Legal risk
Most modern recipe pages include structured data in schema.org/Recipe JSON-LD format. This includes: recipe name, ingredients, instructions, servings, nutrition. Parsing JSON-LD instead of HTML scraping:
- Reduces legal risk (structured data is more defensible than full-article scraping)
- Produces cleaner data
- Is explicitly what tools like Paprika, Whisk, and AnyList use for their own import

### REC-19: Consider PlateJoy refugee positioning
**Confidence: LOW (Gemini only — but tactically interesting)**
**Affects:** Go-to-market, acquisition messaging
PlateJoy shut down July 1, 2025, leaving a user cohort that: (a) has demonstrated willingness to pay for structured meal planning, (b) has health-conscious motivations, (c) is actively seeking an alternative. Stàged's free model could explicitly target this migration opportunity.
