# Research Response 05 — Nutrition Data APIs

**Source:** MiniMax Researcher
**Date:** 2026-03-06
**Topic:** Edamam vs. USDA FoodData Central — accuracy, cost, rate limits, commercial ToS

---

## 1. API Comparison Table

| Feature | Edamam | USDA FoodData Central | Spoonacular | Nutritionix | Open Food Facts |
|---------|--------|----------------------|-------------|------------|-----------------|
| **Recipe Analysis** | ✅ Native (NLP) | ❌ Manual build | ✅ Native | ✅ Native | ❌ No |
| **Free Tier** | ✅ 400/mo (limited) | ✅ Unlimited | ✅ 50 pts/day | ❌ Enterprise only | ✅ Unlimited |
| **Paid Tiers** | $29-299/mo | Free | $29-149/mo | ~$1,850+/mo | Free |
| **Rate Limits** | 50/min (Core) | 1,000/hr | 1-20/sec | Varies | Aggressive |
| **Accuracy** | High (proprietary) | Very High (lab-validated) | Moderate | High | Variable |
| **Data Type** | Calculated | Lab-validated | Calculated | Verified | Crowd-sourced |
| **Commercial Use** | ✅ Paid plans | ✅ Free (CC0) | ✅ Paid plans | ✅ Enterprise | ✅ AGPL |
| **Attribution** | Required | Requested | Required (free) | Required | Required |
| **Caching Allowed** | ❌ Basic, ✅ Core | ✅ Yes | ✅ Yes | Likely no | ✅ Yes |
| **Database Size** | 2.3M+ recipes | 260K+ foods | 365K+ recipes | 1.9M+ foods | 2.5M+ products |

---

## 2. Commercial Use Verdict

### Viable for Free Consumer Product at Scale

| API | Verdict | Reasoning |
|-----|---------|-----------|
| **USDA FoodData Central** | ✅ **Fully viable** | Public domain (CC0), no usage caps, no attribution required (only requested), 1,000 requests/hour rate limit is generous for cached usage |
| **Open Food Facts** | ⚠️ **Partial viability** | Free but AGPL license may require sharing modifications; data quality inconsistent |
| **Edamam** | ❌ **Problematic at scale** | Free tier too limited (400/mo); Core plan at $299/mo for 50K recipes — scales poorly for free product; attribution required |
| **Spoonacular** | ❌ **Problematic at scale** | Free tier essentially unusable (50 pts/day = ~5 recipe lookups); paid plans scale to $149/mo but requires per-user charging or-subsidy model |
| **Nutritionix** | ❌ **Not viable** | Enterprise-only pricing (~$1,850+/mo minimum) — only for large commercial operations |

### Key Finding on Commercial Use

**USDA FoodData Central is the only truly free option suitable for commercial products at scale.** The data is in the public domain (CC0 1.0 Universal), with no licensing fees or per-request charges. The only "requirement" is a request to attribute USDA as the source.

**Edamam is problematic** because:
- Free tier: ~400 requests/month — exhausted in days with active users
- Core plan ($299/month): 50,000 recipes/month — at 100K users viewing recipes, this is $0.003 per user/month just for API costs
- Attribution required and visible
- Data caching restrictions on lower tiers

---

## 3. Edamam Detailed Analysis

### Pricing Tiers (2025-2026)

| Tier | Price | Recipes/Month | Rate Limit | Data Caching |
|------|-------|---------------|------------|--------------|
| Basic Multilingual | $29/mo | 2,500 | 50/min | ❌ No |
| Core Multilingual | $299/mo | 50,000 | Higher | ✅ Yes |
| Unlimited | Custom | Unlimited | Custom | ✅ Yes |

### Accuracy

Edamam does not publish specific accuracy metrics vs. laboratory values. However:
- Uses proprietary NLP and semantic technology for ingredient parsing
- Database built from multiple sources including USDA
- Generally considered accurate for standard recipes but can struggle with:
  - Non-standard measurements ("a handful", "one large")
  - Regional/international ingredients
  - Mixed dishes with complex preparation

**No published peer-reviewed accuracy comparisons found** — this is a gap in available research.

### Terms of Service Restrictions

- **Attribution required**: "Powered by Edamam" badge required on all displays
- **Data caching**: Only allowed on Core tier and above
- **No storage of raw data**: Cannot store ingredient lists, only computed results

---

## 4. USDA FoodData Central Detailed Analysis

### Commercial Use Terms

- **License**: CC0 1.0 Universal (Public Domain)
- **Attribution**: Requested but not legally required — "We request that users list FoodData Central as the source"
- **Usage caps**: None
- **Rate limit**: 1,000 requests/hour per API key (generous; increase available on request)
- **Data updates**: Monthly for branded foods, periodic for foundation foods

### Recipe Analysis Capability

**Critical finding**: USDA FoodData Central does **NOT** have a built-in recipe analysis endpoint. You must:

1. Parse ingredient list yourself (or use NLP service)
2. Look up each ingredient individually via API
3. Apply portion/serving size conversions manually
4. Sum nutrients

This is a **significant development effort** compared to Edamam's one-call analysis.

### Data Freshness & Coverage (2025-2026)

| Data Type | Coverage | Update Frequency | Accuracy |
|-----------|----------|------------------|----------|
| Foundation Foods | ~8,000 items | Quarterly | Very High (lab-validated) |
| SR Legacy | ~15,000 items | Legacy (no updates) | High |
| Branded Foods | ~280,000+ items | Monthly | High (label-derived) |
| FNDDS | ~7,000 items | Periodic | High |

**Key coverage issue**: USDA excels at whole ingredients but has variable coverage for:
- Packaged/processed foods (better in Branded)
- International foods
- Restaurant items

---

## 5. Alternative APIs

### Spoonacular

| Plan | Price | Requests/Day | Key Limitation |
|------|-------|--------------|----------------|
| Free | $0 | 50 points (~5 recipes) | Barely functional |
| Cook | $29/mo | 1,500 points | Attribution required |
| Culinarian | $79/mo | Higher | No SLA on free tier |
| Chef | $149/mo | 10,000/day | — |

**Verdict**: Not viable for free product at scale. Per-user economics don't work.

### Nutritionix (Syndigo)

- **Database**: 1.9M+ foods, 700M monthly API calls
- **Pricing**: Enterprise only (~$1,850+/mo minimum)
- **Strengths**: Natural language processing, restaurant data, largest branded database
- **Verdict**: Not viable for startup/free product

### Open Food Facts

- **Cost**: Free
- **License**: AGPL (requires source sharing if modified)
- **Coverage**: 2.5M+ products (crowd-sourced)
- **Accuracy**: Variable — depends on user submissions
- **Verdict**: Useful as supplement but not primary source due to data quality concerns

### Cronometer

- No public API available (as of 2025-2026)
- Only export functionality
- Not viable for integration

---

## 6. AI Estimation Assessment

### Research Findings

Multiple studies (2024-2025) have evaluated LLM accuracy for nutritional estimation:

| Study | Finding | Error Rate |
|-------|---------|------------|
| MDPI Nutrients (2025) | ChatGPT-4o for meal photos | ~10% underestimation for 13 nutrients; ICC 0.31-0.67 |
| ScienceDirect (2025) | GPT-4o, Claude, Gemini for food images | "Adequate to good" correlations (r=0.29-0.83) but poor portion size estimation |
| Nature Scientific Reports (2024) | RD exam evaluation | Claude 3.5 Sonnet performed comparably to GPT-4o |

**Key limitations**:
- LLMs **cannot see** — estimates from text descriptions are worse than from photos
- Struggle with portion sizes ("medium", "large" = ambiguous)
- Compound dishes with multiple ingredients = compounding errors
- Can confidently give wrong answers

### Accuracy vs. Cost Trade-off

| Method | Accuracy | Cost/1K recipes | Best For |
|--------|----------|-----------------|----------|
| Edamam | High | ~$6-60 | Standard recipes |
| USDA (manual) | Very High | $0 | Whole ingredients |
| GPT-4o API | Moderate | ~$0.50-2.00 | Missing ingredients |
| Claude API | Moderate | ~$0.50-2.00 | Missing ingredients |

**Recommendation**: AI estimation is a viable **fallback** for:
- Ingredients not found in any database
- Non-standard recipes
- Handling missing data gracefully

Not recommended as primary source due to accuracy limitations and API costs at scale.

---

## 7. Caching Strategy Analysis

### Can Nutrition Data Be Pre-Computed and Cached?

| API | Caching Allowed | Stàged Strategy |
|-----|-----------------|-----------------|
| **USDA** | ✅ Yes (public domain) | **Recommended**: Cache all recipe nutrition permanently |
| **Edamam Core+** | ✅ Yes | Cache per recipe, invalidate monthly |
| **Edamam Basic** | ❌ No | Cannot cache (violates ToS) |
| **Spoonacular** | ✅ Yes | Cache per recipe |
| **Open Food Facts** | ✅ Yes | Cache product data |

### Recommended Architecture for Stàged

```
User views recipe
    │
    ▼
┌─────────────────────────┐
│ Check local cache/DB    │
│ (cached nutrition data) │
└─────────────────────────┘
    │
    ├── Cache hit → Display instantly
    │
    └── Cache miss
            │
            ├── Primary: Call Edamam (if paid tier)
            │
            ├── Fallback 1: Build from USDA (manual calculation)
            │
            └── Fallback 2: AI estimate (GPT-4o/Claude)
```

**Key insight**: USDA data is public domain — you can **permanently store** computed nutrition per recipe. This eliminates API calls for repeat views.

---

## 8. Recommended Approach for Stàged

### Primary Recommendation: Hybrid Architecture

#### Option A: Edamam + USDA Fallback (Best UX)

1. **Use Edamam Core ($299/mo)** for:
   - NLP-powered ingredient parsing
   - One-call recipe analysis
   - Fast integration

2. **Supplement with USDA** for:
   - Free tier users (manual calculation)
   - Cross-validation of Edamam results
   - Fallback when Edamam limits hit

3. **AI fallback** for:
   - Unknown ingredients
   - Graceful degradation

**Cost at scale**: $299/mo base + ~$0.002/recipe over 50K = scales to ~$500-1,000/mo at significant user base

#### Option B: USDA-First (Best Economics)

1. **Build recipe calculator on USDA data**
   - Parse ingredients with open-source NLP (e.g., compromise)
   - Look up each ingredient in USDA
   - Sum nutrients

2. **Free at any scale** — only development cost

3. **AI fallback** for missing ingredients

**Trade-off**: Higher development effort, slower initial response

### Specific Recommendations by User Persona

| Persona | Primary Need | Recommendation |
|---------|-------------|----------------|
| **Nadia** (training block) | Precision macros | Edamam (higher accuracy) or USDA + AI validation |
| **Linda** (family awareness) | General accuracy | Either — USDA sufficient |
| **Phase 3 tracking** | Precise targets | Edamam for reliability |

---

## 9. Source List

| Source | URL | Trust Level |
|--------|-----|-------------|
| USDA FoodData Central API Guide | https://fdc.nal.usda.gov/api-guide | High (Official) |
| USDA Data Type Documentation | https://fdc.nal.usda.gov/data-documentation | High (Official) |
| USDA Update Log (Jan 2026) | https://fdc.nal.usda.gov/log | High (Official) |
| Edamam Nutrition API Pricing | https://developer.edamam.com/edamam-nutrition-api | High (Official) |
| Edamam API Terms | https://www.edamam.com/terms/api/ | High (Official) |
| Edamam Attribution Guidelines | https://developer.edamam.com/attribution | High (Official) |
| Spoonacular Pricing | https://spoonacular.com/food-api/pricing | High (Official) |
| Nutritionix API | https://www.nutritionix.com/api | High (Official) |
| Open Food Facts | https://world.openfoodfacts.org/ | Medium (Crowd-sourced) |
| MDPI Nutrients Study (2025) | https://www.mdpi.com/2072-6643/17/4/607 | High (Peer-reviewed) |
| ScienceDirect LLM Study (2025) | https://www.sciencedirect.com/science/article/pii/S2475299125030185 | High (Peer-reviewed) |
| Nature Scientific Reports (2024) | https://www.nature.com/articles/s41598-024-85003-w | High (Peer-reviewed) |
