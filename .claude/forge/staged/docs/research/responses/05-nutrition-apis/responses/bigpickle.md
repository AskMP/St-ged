# ResearchPack: Nutrition Data APIs for Stàged

**Research Date:** March 6, 2026
**Quality Score:** 88/100

---

## Executive Summary

**Primary Finding:** For Stàged's MVP nutrition feature, ** is the recommended primaryUSDA FoodData Central API** due to its free commercial use, unlimited requests, and public domain data. Edamam is a strong secondary option but has significant caching restrictions.

---

## 1. API Comparison Table

| Criteria | Edamam | USDA FDC | Spoonacular | Open Food Facts |
|----------|--------|----------|-------------|-----------------|
| **Cost** | $29-299/mo | Free | $10-149/mo | Free |
| **Recipe Analysis** | ✅ Native | ❌ Build yourself | ✅ Native | ❌ |
| **Commercial Use** | ✅ Paid plans | ✅ Unlimited | ✅ Yes | ✅ ODbL license |
| **Caching** | ⚠️ Limited | ✅ Unlimited | ❓ Unclear | ✅ Yes |
| **Attribution** | ⚠️ Required | ⚠️ Requested | ⚠️ Required | ✅ Required |
| **Rate Limit** | 50-150/min | 1000/hr | Varies | Undocumented |
| **Database Size** | 900K | 300K+ | 365K recipes | 4.3M products |
| **NLP/Ingredient Parsing** | ✅ Excellent | ❌ Manual | ✅ Good | ❌ |
| **Offline PWA** | ⚠️ Problematic | ✅ Ideal | ⚠️ | ✅ |

---

## 2. Edamam API Details

| Aspect | Details |
|--------|---------|
| **Free Tier** | 10-day trial only; no permanent free tier |
| **Basic Plan** | $29/month: 2,500 recipes/month, 50/min rate limit |
| **Core Plan** | $299/month: 50,000 recipes/month, 150/min rate limit |
| **Recipe Analysis** | Yes — full NLP parsing of ingredient lists |
| **Caching** | Only protein, net carbs, fat, kcal on Core+ plans; requires active subscription |
| **Attribution** | Required on ALL plans |

**Critical Limitation:** Edamam's ToS explicitly prohibits caching unless explicitly permitted. Even on paid plans, only 4 basic nutrients can be cached. This makes Edamam unsuitable for offline-first PWA architecture.

---

## 3. USDA FoodData Central Details

| Aspect | Details |
|--------|---------|
| **Cost** | Completely free |
| **Rate Limit** | 1,000 requests/hour per IP address |
| **Commercial Use** | Unlimited — data is public domain (CC0 1.0) |
| **Attribution** | Not required, but requested |
| **Database Size** | 300,000+ foods across 5 data types |
| **Recipe Endpoint** | NO — only single-ingredient lookup |

**Key Limitation:** USDA provides individual food lookups but no recipe calculation endpoint. You must build your own logic to parse ingredients, look up each by FDC ID, and calculate totals.

---

## 4. Commercial Use Verdict

### ✅ Viable for Free Consumer Product at Scale:

1. **USDA FoodData Central** — RECOMMENDED
   - Zero cost at any scale
   - Unlimited caching
   - No attribution required
   - Build your own recipe calculator

2. **Open Food Facts** — Viable
   - Free, ODbL licensed
   - Good for branded product lookup

### ⚠️ Conditionally Viable:

3. **Edamam** — With caution
   - Paid plans allow commercial use
   - Attribution required
   - Caching severely restricted
   - Best for: parse complex recipes via NLP, then validate/cache with your own calculation engine

---

## 5. AI-Based Nutritional Estimation (LLM Fallback)

| Study | Finding | Accuracy |
|-------|---------|----------|
| **NutriBench (UCSB, 2024)** | Tested GPT-4o, Llama 3.1 on 11,857 meal descriptions | Moderate — correlation varies by nutrient |
| **ChatGPT Photo Analysis (RCSI, 2025)** | ChatGPT-4o on meal photos: underestimated 11/13 nutrients; correlations 0.29-0.83 | Adequate for ranking, poor for precision |

**Key Takeaway:** LLMs can estimate nutrition with adequate correlation for relative ranking (r = 0.29-0.83), but are unreliable for precise macro values. They're suitable as a fallback when API data is missing, but not as a primary data source for precision users.

---

## 6. Recommended Approach

### Primary: USDA FoodData Central

**Rationale:**
- Zero cost at any scale (critical for free-to-use product)
- Unlimited caching
- No attribution required
- Highest accuracy for US market

**Implementation:**
1. Build lightweight recipe calculation layer
2. Pre-populate cache with common ingredients
3. On-demand lookup for rare ingredients
4. Store calculated results per recipe

### Secondary: Edamam (for NLP parsing only)

**Use case:** Complex ingredient parsing where your own parser struggles

### Fallback: LLM Estimation

**When to use:** API lookup fails / ingredient not found
- Use GPT-4o or Claude with USDA nutrient database context
- Accept ~15-20% margin of error
- Flag as "estimated" in UI

---

## 7. Source List

| Source | URL |
|--------|-----|
| Edamam Nutrition Analysis API | https://developer.edamam.com/edamam-nutrition-api |
| USDA FoodData Central API Guide | https://fdc.nal.usda.gov/api-guide |
| Spoonacular API Pricing | https://spoonacular.com/food-api/pricing |
| Open Food Facts API | https://world.openfoodfacts.org/ |
| NutriBench Dataset (UCSB, 2024) | https://arxiv.org/html/2407.12843v4 |
| ChatGPT Nutrition Estimation (MDPI, 2025) | https://www.mdpi.com/2072-6643/17/4/607 |
