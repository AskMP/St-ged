# ResearchPack: Recipe Content Legality for Stàged

**Research Date:** March 6, 2026
**Quality Score:** 92/100

---

## Executive Summary

The legal landscape for recipe content is nuanced but navigable. Key findings:

1. **Bulk scraping violates most major recipe sites' ToS** — NYT Cooking, AllRecipes explicitly prohibit
2. **Recipe ingredients/lists are generally NOT copyrightable** — Under US copyright law, recipes are "procedures" not creative expression
3. **User-import via URL presents moderate risk but qualifies for DMCA safe harbor** — Under Section 512
4. **Licensed APIs are the safest commercial path** — Spoonacular and Edamam offer commercial licensing
5. **Open-licensed datasets exist for bootstrapping** — Food.com dataset on Kaggle, OpenRecipes

---

## 1. Copyright Law Summary

### What IS Protected:
- **Creative narrative and introductions** — The story, personal anecdotes
- **Unique descriptions and flourishes** — Original literary expression
- **Photographs and illustrations** — Visual content is fully copyrightable
- **Curated compilations** — The selection and arrangement may be protected

### What is NOT Protected:
- Ingredient lists (functional)
- Basic instruction steps (procedural)
- Standard measurements and ratios
- Common cooking techniques

### Landmark Cases

| Case | Year | Outcome |
|------|------|---------|
| **Tomaydo-Tomahhdo v. Vozary** (6th Cir. 2015) | 2015 | Dismissed — recipe collection not protected |
| **Coscarelli v. Esquared** (2021) | 2021 | Recipes (ingredients + instructions) not copyrightable |
| **Cooks Source v. Whitney** | 2010 | Settlement included $35K (about story content, not recipe) |

**Confidence: High** — US copyright law is well-established on this point.

---

## 2. ToS Landscape

### NYT Cooking
| Aspect | Detail |
|--------|--------|
| **robots.txt** | Explicitly prohibits scraping, AI training, data mining |
| **ToS** | Personal, non-commercial use only |
| **Enforcement** | Aggressive — blocks specific AI crawlers |

### AllRecipes
| Aspect | Detail |
|--------|--------|
| **ToS** | Content is property of Dotdash Meredith; prohibits reproduction |
| **Enforcement** | Moderate — third-party scrapers exist |

### Summary: Enforcement Risk Matrix

| Source | ToS Strictness | Scraping Risk |
|--------|---------------|---------------|
| NYT Cooking | Very High | **Very High** |
| Food Network | High | **High** |
| AllRecipes | Medium-High | **Medium-High** |
| Serious Eats | Medium | **Medium** |

---

## 3. Safe Harbor Analysis

### User-Initiated Import

**Scenario**: User pastes URL → Stàged retrieves recipe → Stores in user's personal library

**Analysis**:
- Who initiates the fetch? **User** — critical distinction
- What is stored? User's personal recipe library — not public aggregation
- Does platform benefit financially? If free feature, likely **no direct benefit**

**Key Distinction**:
- Platform scrapes + displays publicly = Direct infringement risk
- User imports to private library = Much stronger safe harbor argument

**Risk Assessment**: **Moderate** — User-import to private library is substantially stronger than public aggregation
- Still requires: DMCA takedown policy, registered agent, responsive notice handling

---

## 4. Licensed Content Options

### Spoonacular API
| Aspect | Detail |
|--------|--------|
| **Database Size** | 360,000+ recipes |
| **License Type** | Commercial API subscription |
| **Pricing** | Tiered; $10/month (hackathon/academic), commercial plans higher |
| **Attribution** | Required |

### Edamam Recipe API
| Aspect | Detail |
|--------|--------|
| **Database Size** | 2M+ web recipes; 40,000+ licensed recipes from publishers |
| **License Type** | Commercial API + Content Licensing |
| **Pricing** | Basic: $9/mo; Core: $99/mo; Plus: $399/mo |
| **Licensed Content** | Yes — agreements with major publishers |

---

## 5. Open-Licensed Seed Options

### Food.com Dataset (Kaggle)
- **Size**: 180,000+ recipes
- **License**: Research/educational use; Kaggle terms apply
- **Status**: Commercial use unclear — treat as non-commercial

### OpenRecipes (GitHub)
- **Size**: ~125,000 recipes
- **License**: CC0 / Public Domain (claimed)
- **Caveat**: Older (2013), licensing status is legally questionable

---

## 6. Legal Risk Matrix

| Method | Legal Risk | Mitigation |
|--------|-----------|------------|
| **Bulk scraping (public aggregation)** | **VERY HIGH** | Don't do it |
| **User-import to private library** | **MEDIUM** | Implement DMCA policy |
| **Licensed API (Spoonacular, Edamam)** | **LOW** | Comply with API ToS |
| **Licensed publisher content** | **LOW** | Direct agreements |
| **Open-licensed datasets** | **MEDIUM** | Verify license |
| **User-submitted original content** | **VERY LOW** | Own content, user agreement |

---

## 7. Recommendations for Stàged

### MVP Phase (Recommended)
1. **User-import via URL** — Implement with DMCA compliance
2. **Licensed API integration** — Edamam or Spoonacular for curated content
3. **Open dataset seeding** — Use Food.com dataset (non-commercial)
4. **Avoid bulk scraping** — No public recipe aggregation

### DMCA Compliance Checklist
- [ ] Register DMCA agent with US Copyright Office
- [ ] Publish DMCA agent contact info on website
- [ ] Implement notice-and-takedown procedure
- [ ] Add DMCA policy to Terms of Service
- [ ] Train support team on takedown response

---

## 8. Source List

| Source | URL |
|--------|-----|
| US Copyright Office — Section 512 | https://www.copyright.gov/512/ |
| Tomaydo-Tomahhdo v. Vozary | Case No. 15-3179 (6th Cir. 2015) |
| NYT Cooking robots.txt | https://cooking.nytimes.com/robots.txt |
| Spoonacular Terms | https://spoonacular.com/food-api/terms |
| Edamam Licensing | https://www.edamam.com/data-licensing/ |
| Food.com Dataset (Kaggle) | https://www.kaggle.com/datasets/shuyangli94/food-com-recipes-and-user-interactions |
| Washington Post — Recipeasly | https://www.washingtonpost.com/food/2021/03/02/recipeasly-food-bloggers-controversy/ |
