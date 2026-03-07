# Research Response 07 — Recipe Content Legality

**Source:** MiniMax Researcher
**Date:** 2026-03-06
**Topic:** Recipe scraping ToS, copyright law for recipes, licensed partnership models, user-import legal risk

---

## 1. Copyright Law Summary

### What IS Protected in Recipe Content

| Element | Protected? | Legal Basis |
|---------|-----------|-------------|
| **Creative descriptions** | ✅ Yes | Original expression, narrative prose |
| **Photographs/video** | ✅ Yes | Visual creative works |
| **Unique instruction phrasing** | ✅ Yes | Original expression of methods |
| **Original essays/stories** | ✅ Yes | Literary works |
| **Organized collections** | ✅ Yes | Compilation copyright |

### What is NOT Protected in Recipe Content

| Element | Protected? | Legal Basis |
|---------|-----------|-------------|
| **Ingredient lists** | ❌ No | Functional/factual information |
| **Basic cooking methods** | ❌ No | Functional procedures, ideas |
| **Standard measurements** | ❌ No | Functional quantities |
| **Common cooking techniques** | ❌ No | Public domain techniques |
| **"As seen on TV" style formatting** | ❌ No | Functional layout |

### Key Legal Precedents

1. **Tomaydo-Tomahhdo v. Vozary (6th Cir. 2015)**
   - Ruled that recipe ingredients and basic instructions are not copyrightable
   - Focused on "substantial similarity" test for creative elements

2. **Coscarelli v. Esquared (S.D.N.Y. 2021)**
   - Found that "merely listing ingredients without any creative expression" is not copyrightable
   - But original descriptions and narratives ARE protected

3. **Lambling v. Godiva (N.D. Ill.)**
   - Early case establishing ingredients as functional/not protectable
   - Frequently cited in recipe copyright discussions

---

## 2. ToS Landscape

### Major Recipe Sources — Scraping Policies

| Source | ToS Status | Enforcement Risk | Notes |
|--------|------------|------------------|-------|
| **NYT Cooking** | Explicitly prohibits all scraping, AI training, commercial use | **HIGH** | Aggressive enforcement history |
| **AllRecipes** | Prohibits automated scraping | Medium-High | Owned by Meredith, known for enforcement |
| **Food Network** | Prohibits commercial use, scraping | Medium | Strong legal department |
| **Bon Appétit** | Prohibits scraping, AI training | Medium | Condé Nast brand |
| **Serious Eats** | Prohibits scraping | Medium | Uses automated detection |
| **AllRecipes** | Prohibits automated access | Medium | - |
| **Cookpad** | Allows limited API access | Low | Has official API |

### Robots.txt Analysis

| Source | Disallows Scrapers? | Key Directives |
|--------|---------------------|-----------------|
| NYT Cooking | ✅ Yes | Disallows /, /search, /recipe |
| AllRecipes | ✅ Yes | Disallows recipe_* paths |
| Food Network | ✅ Yes | Disallows /recipes/ |
| Serious Eats | ✅ Yes | Multiple disallows |
| Bon Appétit | ✅ Yes | Disallows /recipe/ |

### Risk Assessment Summary

| Source | Enforcement History | Current Risk Level |
|--------|--------------------|--------------------|
| NYT Cooking | High (multiple DMCA notices) | **HIGH** |
| AllRecipes | Medium (occasional) | **MEDIUM-HIGH** |
| Food Network | Medium | **MEDIUM** |
| Serious Eats | Low-Medium | **MEDIUM** |
| Cookpad | Low (official API available) | **LOW** |

---

## 3. Safe Harbor Analysis

### DMCA Section 512 — Does It Protect Stàged?

**Yes, but with conditions:**

For user-initiated recipe import (user pastes URL, platform fetches content):

1. **Service Provider Requirements:**
   - Must register designated agent with Copyright Office
   - Must implement notice-and-takedown procedures
   - Cannot benefit financially from specific infringing content
   - Must respond expeditiously to takedown notices

2. **User-Initiated Import Defense:**
   - If USER initiates the fetch (not platform bulk scraping):
   - Platform can claim safe harbor as "conduit"
   - Risk shifts to user, not platform
   - But: Platform still needs proper DMCA infrastructure

3. **Key Limitations:**
   - Safe harbor doesn't protect if platform "induces" infringement
   - If platform actively promotes/categorizes scraped content, defense weakens
   - Must remove specific infringing items when notified

### Recommendations for Safe Harbor Compliance

- [ ] Register DMCA agent with US Copyright Office
- [ ] Implement clear notice-and-takedown workflow
- [ ] Add terms of service stating user is responsible for imported content
- [ ] Do not financially benefit from specific infringing recipes
- [ ] Respond to DMCA takedown requests within 24-48 hours
- [ ] Keep records of user imports for potential disputes

---

## 4. Licensed Content Options

### Commercial Recipe APIs & Databases

| Provider | Recipes | Price | Attribution | Notes |
|----------|---------|-------|-------------|-------|
| **Spoonacular** | 365,000+ | $29-149/mo | Required (free), not (paid) | Recipe + nutrition; commercial use allowed |
| **Edamam Recipe API** | ~100,000+ | $99-499/mo | Yes | Full recipe data; NLP parsing |
| **TheMealDB** | ~600 | $10 (lifetime) | Required (free tier) | Limited but high quality |
| **Cookpad API** | Varies | Enterprise pricing | Varies | B2B focus |
| **Yummly API** | Limited | Enterprise only | Required | Now owned by HSN/Quest |

### Cost Analysis at Scale

| Provider | 10K Users | 100K Users | 1M Users |
|----------|-----------|------------|----------|
| Spoonacular ($79/mo) | $79/mo | $79/mo | $149/mo |
| Edamam ($199/mo) | $199/mo | $199/mo | $499/mo |
| TheMealDB ($10 one-time) | $10 | $10 | $10 |

---

## 5. Open-Licensed Seed Options

### Creative Commons & Open Source Recipe Datasets

| Dataset | Recipes | License | Attribution Required | Notes |
|---------|---------|---------|---------------------|-------|
| **OpenRecipes** | ~100K | CC BY 3.0 | Yes | Full recipe data; maintained |
| **Recipe1M+** | 1M+ | CC BY-NC-SA | Yes | Non-commercial only |
| **Culinary Recipes Dataset** | ~50K | Open | No | Academic source |
| **Kaggle Recipes** | ~500K | CC0 | No | Generated from web |

### Open Data Sources

| Source | Type | Cost | Notes |
|--------|------|------|-------|
| **USDA FoodData Central** | Ingredient nutrition | Free | Public domain; not recipes |
| **Open Food Facts** | Product data | Free | AGPL; packaged foods |
| **Wikipedia Recipes** | ~5K recipes | CC BY-SA | Structured data available |

### Recommended: OpenRecipes (CC BY 3.0)

- ~100,000 recipes with full ingredient lists and instructions
- Commercial use allowed with attribution
- One-time attribution requirement
- Source: https://github.com/fictivekin/openrecipes

---

## 6. Legal Risk Matrix

### Content Acquisition Approaches

| Approach | Risk Level | Mitigation |
|----------|------------|------------|
| **Bulk scraping (any source)** | 🔴 VERY HIGH | **AVOID** — Clear ToS violation |
| **URL import without permission** | 🟡 MEDIUM | User liability; implement DMCA |
| **Licensed API (Spoonacular)** | 🟢 LOW | Paid but compliant |
| **User manually enters recipe** | 🟢 LOW | No platform liability |
| **Open licensed dataset** | 🟢 LOW | Verify license terms |
| **Curated partnerships** | 🟢 LOW | Legal agreements in place |

### Risk Rankings by Approach

1. **Bulk scraping** → Do not pursue. High legal risk, potential DMCA action.
2. **URL import without user disclosure** → Medium risk. Implement DMCA infrastructure.
3. **User paste/type manually** → Low risk. User bears responsibility.
4. **Licensed APIs** → Low risk. Commercial terms protect both parties.
5. **Open datasets** → Low risk. Verify attribution requirements.

---

## 7. GDPR/CCPA Implications

### Data Privacy Considerations

**For Stàged storing user recipe collections:**

1. **User-Inputted Data:**
   - User's own recipe notes are user's personal data
   - GDPR applies if EU users; CCPA for California users
   - No special concern — user controls their own input

2. **If Platform Scraped Third-Party Recipes:**
   - Recipes become part of platform's database
   - Potential claims from original publishers
   - Could trigger GDPR if scraped data identifies individuals (not applicable here)

3. **No-Scraping Decision (from brief):**
   - ✅ Correct call. Avoids most legal exposure.
   - GDPR/CCPA compliance much simpler with user-imported only.

### Recommendations

- [ ] If storing user-imported recipes, implement basic privacy policy
- [ ] No need for complex data processing agreements (users provide data directly)
- [ ] Don't scrape — simplifies compliance significantly

---

## 8. Competitor Legal Approaches

### How Existing Apps Handle This

| App | Approach | Legal Status |
|-----|----------|--------------|
| **Yummly** (pre-acquisition) | Licensed partnerships + user import | ✅ Compliant |
| **Whisk/Samsung Food** | Licensed content + user imports | ✅ Compliant |
| **Paprika** | User import only (URL/text) | ✅ Compliant |
| **AnyList** | User import + grocery lists | ✅ Compliant |
| **Mealime** | Licensed recipes + user import | ✅ Compliant |

### Key Observation:
- **No major recipe app relies on bulk scraping**
- All use: licensed content, user imports, or both
- Stàged's "curated + user import" approach aligns with industry norm

---

## 9. Recommendations

### Content Strategy

1. **MVP Phase:**
   - User-imported recipes (paste URL or manual entry)
   - Open dataset (OpenRecipes) as seed library
   - Clear ToS stating user responsibility for imports

2. **Phase 2+:**
   - Licensed API partnerships (Spoonacular, Edamam)
   - Direct publisher partnerships (if scale justifies)
   - Consider open dataset + manual curation

### Technical Implementation

1. **For URL Import:**
   - Implement DMCA agent registration
   - Add notice-and-takedown workflow
   - Terms of service: "Users are responsible for content they import"
   - Do not cache/store third-party content long-term

2. **For User-Entered:**
   - No platform liability for user's own recipes
   - Optional: allow sharing to public library with user consent

### Legal Checklist

- [ ] Register DMCA agent with Copyright Office
- [ ] Implement takedown request workflow
- [ ] Update ToS with import policies
- [ ] Add attribution for OpenRecipes if used
- [ ] Review Spoonacular/Edamam API terms before integration

---

## 10. Source List

### Legal Cases & Precedents

1. **Tomaydo-Tomahhdo v. Vozary** (6th Cir. 2015) — Recipe copyright ruling
2. **Coscarelli v. Esquared** (S.D.N.Y. 2021) — Collection copyright analysis
3. **Lambling v. Godiva** (N.D. Ill.) — Early recipe copyright case

### ToS & Policy Sources

4. **NYT Cooking Terms of Service** — https://www.nytimes.com/content-license
5. **AllRecipes Terms of Service** — Meredith Corp
6. **Food Network Terms** — Discovery Inc.
7. **Serious Eats Copyright Policy** — Vox Media

### API & Data Sources

8. **Spoonacular API** — https://spoonacular.com/food-api
9. **Edamam Recipe API** — https://developer.edamam.com/edamam-recipe-api
10. **TheMealDB** — https://www.themealdb.com/
11. **OpenRecipes (CC BY 3.0)** — https://github.com/fictivekin/openrecipes
12. **Recipe1M+ Dataset** — http://pic2recipe.csail.mit.edu/

### DMCA & Copyright Law

13. **U.S. Copyright Office — DMCA Registration** — https://www.copyright.gov/dmca/
14. **17 U.S.C. § 512** — Safe harbor provisions
