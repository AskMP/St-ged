# Research Response 05 — Nutrition Data APIs
**Source:** Claude (Sonnet 4.6) with live web research
**Date:** 2026-03-06
**Topic:** Edamam vs. USDA FoodData Central — accuracy, cost, rate limits, commercial ToS

---

## 1. API Comparison Table

| API | Accuracy | Free Tier | Paid Tier | Rate Limit (free) | Recipe Analysis | Commercial Use | ToS Key Restrictions |
|-----|----------|-----------|-----------|-------------------|----------------|----------------|----------------------|
| **Edamam Nutrition Analysis** | High (NLP-based ingredient parsing) | ~400 req/mo (via RapidAPI) | $49+/mo | 400 req/mo | Yes — full recipe text parsing | Yes (paid plans) | No automated/scraping requests; monthly fee per analyzed recipe; data must not be stored without license |
| **USDA FoodData Central** | High for whole foods; moderate for packaged | Unlimited (free) | Free (public domain) | None published | **No** — single-ingredient lookup only | Yes — CC0, public domain | Must attribute USDA as source; no usage caps |
| **Spoonacular** | High (sources USDA + user data) | Daily points quota (~50 points/day) | Up to $149/mo | ~50 points/day | Yes — recipe analysis endpoint | Yes (with attribution) | Must display Spoonacular logo/link; cannot compete directly with Spoonacular |
| **Nutritionix** | High — specializes in restaurant/packaged | Limited free tier | Commercial tier | Unknown free limits | Yes — track API | Yes | No bulk/commercial scraping without paid plan |
| **Open Food Facts** | Variable — community-contributed | Unlimited (open) | Free | None | No — product lookup only | Yes — Open Database License | Data is open; branded product focus |

---

## 2. Detailed API Analysis

### Edamam Nutrition Analysis API

**What it does:** Accepts free-text ingredient lists (e.g., "2 cups flour, 1 tbsp butter") and returns full macro and micronutrient breakdown per serving.

**Pricing (2025):**
- Free tier: ~400 requests/month on RapidAPI gateway; limited for production use
- Paid: Nutrition Analysis API starts at ~$49/mo; scales based on call volume
- Food & Grocery Database API: $0–$799/mo
- Recipe Search API: $0–$999/mo
- Custom/enterprise pricing available for unlimited access

**Accuracy:** Edamam uses NLP to parse ingredient text, which is the most practical approach for recipe apps. No published peer-reviewed accuracy study found; accuracy is developer-community-reported as good for standard ingredients, less reliable for non-standard or compound ingredients.

**Critical ToS restrictions:**
- Prohibits automated/programmatic scraping with the goal of collecting or saving data
- All plans require human-user-driven requests — bulk pre-computation of nutrition for an entire recipe catalog likely violates ToS without explicit enterprise agreement
- Monthly fee accrues per analyzed recipe — cost scales with recipe library size
- Data display and caching terms require careful review; nutritional data likely cannot be stored long-term without a specific license

**Source:** [Edamam Nutrition Analysis API](https://developer.edamam.com/edamam-nutrition-api), [Edamam Docs](https://developer.edamam.com/edamam-docs-nutrition-api), [RapidAPI pricing](https://rapidapi.com/edamam/api/edamam-nutrition-analysis/pricing)

### USDA FoodData Central

**What it does:** Government food database with detailed nutritional profiles for ~600,000+ foods including raw ingredients, branded products, and SR Legacy data.

**Pricing:** Completely free — public domain (CC0 1.0 Universal). No usage caps. API key required (free signup at fdc.nal.usda.gov).

**Endpoints:**
- Food Search: Returns matching foods by name/keyword
- Food Details: Returns full nutritional profile for a specific food item (by FDC ID)
- **No recipe analysis endpoint** — USDA FoodData Central is an ingredient lookup database, not a recipe analyzer

**Commercial Use:** Fully permitted. CC0 means no copyright restriction. Attribution as "USDA FoodData Central" is recommended but not legally required.

**Accuracy:** Excellent for whole/raw ingredients (e.g., chicken breast, white rice). Covers some branded/packaged foods but is less comprehensive than commercial databases for processed foods. Updated multiple times per year.

**Limitation for Stàged:** USDA FoodData Central alone cannot analyze a recipe — you must look up each ingredient individually and sum the results. This requires building a recipe parsing and aggregation layer, which is non-trivial (handling "2 tablespoons olive oil" requires ingredient parsing + unit conversion + USDA lookup + serving division).

**Source:** [USDA FoodData Central](https://fdc.nal.usda.gov/), [API Guide](https://fdc.nal.usda.gov/api-guide/), [FAQ](https://fdc.nal.usda.gov/faq/)

### Spoonacular

**What it does:** Comprehensive recipe + nutrition API with 365,000+ recipes and 86,000+ food products. Provides recipe analysis endpoint that returns full nutrition from a recipe URL or ingredient list.

**Pricing (2025):** Free tier (daily points — approximately 50 points/day for basic endpoints); paid plans up to $149/mo on RapidAPI. Specific point costs per endpoint vary.

**Data sources:** USDA FoodData Central + public recipe sites + user-contributed data. This means nutrition data quality inherits from USDA for base ingredients.

**Commercial Use:** Permitted with attribution (Spoonacular logo/link). Restriction: cannot build a competing product. This means Stàged — a recipe + nutrition app — must carefully review the non-compete clause. Spoonacular could argue a direct recipe platform competes with their own app/API.

**Caching:** Spoonacular's ToS requires review; nutrition data from their API likely can be cached per recipe to avoid repeated API calls (standard practice for recipe platforms).

**Source:** [Spoonacular food API](https://spoonacular.com/food-api), [Spoonacular terms](https://spoonacular.com/food-api/terms)

---

## 3. Commercial Use Verdict

For a **free consumer product at scale** with affiliate monetization:

| API | Verdict | Reasoning |
|-----|---------|-----------|
| **USDA FoodData Central** | ✅ Best for unit economics | Free, unlimited, CC0. Requires building ingredient parsing layer. No recipe analysis endpoint but powers custom implementation. |
| **Spoonacular** | ⚠️ Viable with caution | Affordable free-to-paid tier. Non-compete clause is a risk given Stàged's product category. Verify with Spoonacular before relying on it. |
| **Edamam** | ⚠️ Viable with plan | Most accurate for recipe parsing; but cost per analyzed recipe + anti-scraping ToS means pre-computation for a large library requires enterprise agreement. Good for user-submitted recipes (pay-as-analyzed). |
| **Open Food Facts** | ✅ Good supplement | Free, open. Best for branded/packaged ingredient lookup. Unreliable for whole food nutrition accuracy due to community-contributed data quality. |
| **Nutritionix** | ⚠️ Needs verification | Restaurant/packaged food specialist; pricing for commercial scale not confirmed in search results. |

**Recommended architecture for Stàged:**
- **Primary:** USDA FoodData Central (free, unlimited) as the base database for ingredient nutrition lookup
- **Recipe parsing layer:** Build NLP ingredient parsing internally OR use Edamam for user-submitted recipe analysis (pay per new recipe analyzed, not per view)
- **Cache results:** Compute and store nutrition per recipe at analysis time; never re-call API on recipe view
- **Supplement:** Open Food Facts for packaged/branded ingredient enrichment (free)

---

## 4. AI Estimation Assessment

**Question:** Is LLM-based nutritional estimation a viable fallback?

**Finding:** No published benchmarks were found comparing LLM nutritional estimation (GPT-4o, Claude) accuracy against lab-tested or API-sourced values. This is an inference gap.

**What is known:**
- LLMs can produce plausible macro estimates for common recipes
- Accuracy is highly variable for non-standard ingredients, obscure cuisines, or unusual preparations
- LLMs cannot look up real-time USDA data unless given retrieval access
- For a product promising "training-block macro planning" accuracy, LLM estimation alone is insufficient — the margin of error in LLM nutrition estimates is too high for precision use cases

**Recommended use of LLMs in nutrition:** As a fallback for recipes where USDA lookup fails (e.g., international ingredients without USDA entries), clearly labeled as "estimated." Not as a primary source.

---

## 5. Caching Strategy

**Can nutritional data be cached per recipe?**

Yes — and this is the standard approach:
1. When a user adds a recipe to their library, compute nutrition once using the API
2. Store the result in IndexedDB (client) and/or your database (server)
3. Serve cached nutrition on all subsequent views — no API call required
4. Re-compute only when the recipe ingredients are edited

This approach:
- Works with Edamam (compute on add, not on view — one-time API call per recipe)
- Works with USDA (custom pipeline: parse → lookup → aggregate → cache)
- Resolves the offline-first requirement: cached nutrition data is available in offline mode
- Reduces API costs dramatically vs. per-view API calls

**Edamam ToS note:** Caching computed nutritional data is standard practice; verify with Edamam that storing computed values server-side for display is permitted under your plan tier.

---

## 6. Recommended Approach

**Phase MVP:**
- Use **USDA FoodData Central** (free) for whole-ingredient lookup
- Build simple ingredient parser (parse quantity, unit, ingredient name → FoodData lookup)
- Cache per recipe in IndexedDB for offline access
- Label nutrition as "estimated" where parsing confidence is low

**Phase 2 (scale):**
- Add **Edamam Nutrition Analysis API** for user-submitted recipes (user pastes a recipe → Edamam analyzes → result cached)
- Keeps costs proportional to content growth (pay per new recipe, not per user)
- Supplement with **Open Food Facts** for packaged ingredient enrichment

**Rationale:** USDA is free and accurate for the whole-food ingredients that make up most home cooking recipes. Edamam fills the gap for complex multi-ingredient recipe text parsing. This hybrid keeps costs manageable without a per-user pricing structure.

---

## 7. Source List

| Source | Date | URL |
|--------|------|-----|
| Edamam Nutrition Analysis API | 2025 | https://developer.edamam.com/edamam-nutrition-api |
| Edamam API Documentation | 2025 | https://developer.edamam.com/edamam-docs-nutrition-api |
| Edamam RapidAPI pricing | 2025 | https://rapidapi.com/edamam/api/edamam-nutrition-analysis/pricing |
| Oreate AI — Edamam Pricing 2025 | 2025 | https://www.oreateai.com/blog/demystifying-edamam-api-pricing-what-to-expect-for-2025/6c48e42bb47615b946e1d7c81a1a93c3 |
| USDA FoodData Central | 2025 | https://fdc.nal.usda.gov/ |
| USDA FoodData Central API Guide | 2025 | https://fdc.nal.usda.gov/api-guide/ |
| USDA FoodData Central FAQ | 2025 | https://fdc.nal.usda.gov/faq/ |
| Spoonacular Food API | 2025 | https://spoonacular.com/food-api |
| Spoonacular Terms | 2025 | https://spoonacular.com/food-api/terms |
| Spoonacular RapidAPI pricing | 2025 | https://rapidapi.com/spoonacular/api/recipe-food-nutrition/pricing |
| Eat Fresh Tech — Top 8 Nutrition APIs | 2024 | https://www.eatfresh.tech/blog/top-8-nutrition-apis-for-meal-planning-2024 |
| TryBytes — Best APIs for Menu Nutrition | 2025 | https://trybytes.ai/blogs/best-apis-for-menu-nutrition-data |
| SpikeAPI — Top Nutrition APIs 2026 | 2025 | https://www.spikeapi.com/blog/top-nutrition-apis-for-developers-2026 |
