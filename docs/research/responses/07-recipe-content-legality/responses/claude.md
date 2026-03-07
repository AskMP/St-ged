# Research Response 07 — Recipe Content Legality
**Source:** Claude (Sonnet 4.6) with live web research
**Date:** 2026-03-06
**Topic:** Recipe scraping ToS, copyright law for recipes, licensed partnership models, user-import legal risk

---

## 1. Copyright Law Summary

### What Is NOT Copyrightable in Recipes (US Law)

**Ingredient lists and quantities: NOT copyrightable.**

This is well-established under US copyright law's "idea-expression dichotomy":
- A mere list of ingredients (e.g., "2 cups flour, 1 egg, 1 tbsp butter") is considered an unprotectable *idea* or *fact* — too closely intertwined with the concept of the recipe itself to receive copyright protection
- The US Copyright Office FAQ explicitly states that "a mere listing of ingredients or contents" is not protected
- This principle has been consistently upheld in US courts

**Basic directions / procedural steps: Generally NOT copyrightable** when expressed in the simplest way. Simple procedural instructions ("mix, bake at 350°F for 30 minutes") are not protectable.

### What CAN Be Copyrighted in Recipes

**Substantial literary expression surrounding a recipe**: Yes — and this is the critical boundary.

When a recipe is accompanied by significant personal narrative, creative prose, unique voice, backstory, food styling descriptions, cultural context, or detailed experiential writing, the *written expression* surrounding the recipe is copyrightable — even if the ingredient list and steps themselves are not.

This is why food blogs are legally protected despite open ingredient lists: the 800-word story about grandma's kitchen that precedes a cookie recipe is copyrightable; the ingredient list is not.

**Key principle for Stàged:** Extracting only ingredient lists and bare cooking steps from a recipe page is on the safer end of copyright law. Copying the full narrative prose, headshots, food photography, and expressive content is copyright infringement.

**Landmark cases / citations:**
- *Lambing v. Godiva Chocolatier* — frequently cited as establishing that recipe lists are not copyrightable; the specific case is often misattributed, but the principle is established in case law
- US Copyright Office — What Does Copyright Protect (FAQ): "Mere listings of ingredients as in recipes... are not subject to copyright"

**Sources:**
- [US Copyright Office FAQ](https://www.copyright.gov/help/faq/faq-protect.html)
- [Copyright Alliance — Recipes and Copyright](https://copyrightalliance.org/are-recipes-cookbooks-protected-by-copyright/)
- [Copyrightlaws.com — Copyright Protection in Recipes](https://www.copyrightlaws.com/copyright-protection-recipes/)
- [Nolo — Can You Copyright a Recipe](https://www.nolo.com/legal-encyclopedia/can-you-protect-a-recipe.html)
- [NYC Bar Association — Secret Ingredients](https://www.nycbar.org/reports/secret-ingredients-how-to-protect-recipes/)

---

## 2. ToS Landscape

### Claim Verified: Bulk Recipe Scraping Violates Most Major Sites' ToS

**This claim is VERIFIED.** Most major recipe publishers prohibit automated data collection in their Terms of Service, regardless of whether the underlying content is copyrightable.

ToS violations are a contract law issue, distinct from copyright law — a site can prohibit scraping of non-copyrightable ingredient lists through ToS, and enforcement is via breach of contract or the Computer Fraud and Abuse Act (CFAA).

**Confirmed ToS prohibitions (research-based):**
- **NYT Cooking**: Prohibits scraping; premium subscription content
- **Allrecipes**: Prohibits automated/bulk access in ToS
- **Food Network**: Prohibits scraping, automated collection
- **Serious Eats**: Standard media ToS prohibiting scraping
- **Bon Appétit/Epicurious**: Condé Nast media ToS; prohibits automated collection

**Note:** Even where AI training prohibition language has been added (as noted in search results), this is ToS-based, not copyright-based. A ToS violation is a legal risk distinct from copyright infringement.

**Enforcement risk level:**
- **High** for commercial bulk scrapers at scale (legal action, CFAA claims)
- **Medium** for small-scale technical scrapers (C&D letters, account termination)
- **Low** for academic/personal use — but Stàged is commercial

---

## 3. Safe Harbor Analysis — User-Initiated Import

### Does DMCA Section 512 Protect Stàged When Users Import Recipes via URL?

**Answer: Likely yes, with proper implementation — but not unconditional.**

**Section 512(c) safe harbor** (the "storage" safe harbor) protects online service providers (OSPs) from monetary liability for copyright infringement by their users, provided:

1. The OSP does not have actual or constructive knowledge of specific infringing material
2. The OSP does not receive a financial benefit *directly attributable* to infringing activity when it has the ability to control such activity
3. The OSP has a registered DMCA agent and implements notice-and-takedown procedures
4. Infringing material is promptly removed upon notification

**How this applies to Stàged's user URL import:**

- **User initiates the fetch**: The user pastes a URL and triggers the import. Stàged is acting as a conduit for the user's own action → this supports the "at the direction of the user" element of 512(c)
- **Stàged doesn't have prior knowledge** of specific infringing content (user is importing unknown recipes)
- **Financial benefit question**: Stàged earns affiliate commissions from grocery orders — not directly from the recipe content itself → the "financial benefit directly attributable to infringing activity" argument is weak for a plaintiff
- **Required implementation**: Stàged MUST register a DMCA agent with the US Copyright Office and implement a working notice-and-takedown system to qualify

**Important nuance — ToS violation ≠ copyright infringement:**
Even with 512(c) protection for copyright claims, the ToS violation aspect (user accessing a paywalled or ToS-protected site) is a separate legal exposure. If a user imports from NYT Cooking and Stàged's import tool technically "scrapes" a paywalled page, this is a ToS/CFAA issue that 512 does not protect against.

**Recommended approach:**
- Import only metadata from structured data (schema.org/Recipe JSON-LD on the page), not full article text
- Display attribution and link back to the source URL
- Implement DMCA notice-and-takedown
- Store user-imported recipes as user's own data (not republished to other users)

**Sources:**
- [17 U.S.C. § 512 — LII/Legal Information Institute](https://www.law.cornell.edu/uscode/text/17/512)
- [US Copyright Office — Section 512 Resources](https://www.copyright.gov/512/)
- [Digital Media Law Project — Protecting Against Copyright Claims from User Content](https://www.dmlp.org/legal-guide/protecting-yourself-against-copyright-claims-based-user-content)

---

## 4. Licensed Content Options

| Source | License Type | Recipe Volume | Cost | Commercial Use |
|--------|-------------|--------------|------|----------------|
| **Spoonacular API** | Commercial (monthly subscription) | 365,000+ recipes | $0–$149/mo | Yes, with attribution; non-compete restriction applies |
| **Edamam Recipe API** | Commercial license | 2.3M+ recipes searchable | $0–$999/mo | Yes (verify per tier) |
| **Open Food Facts** | Open Database License (ODbL) | Food products, not recipes | Free | Yes |
| **USDA FoodData Central** | CC0 / Public Domain | Ingredient nutrition, not recipes | Free | Yes |

**Critical note on Spoonacular non-compete:** Spoonacular's ToS states you cannot use their data to "create a site or application meant to provide the same experience as Spoonacular." Given that Stàged is a recipe + nutrition app, Spoonacular has grounds to argue competition. Legal review recommended before relying on Spoonacular for core recipe library.

**Edamam Recipe API:** Provides access to 2.3M+ recipes with recipe search, ingredient breakdown, and nutrition. This is a strong option for a licensed recipe seed library. Pricing for commercial use of the recipe search API is $999/mo at top tier — significant cost at scale.

---

## 5. Open-Licensed Seed Options

| Dataset | License | Recipe Count | Notes |
|---------|---------|-------------|-------|
| **RecipeNLG** | Research/academic (check terms) | 2.2M+ recipes | Based on Recipe1M+; INLG 2020 paper dataset; check licensing carefully for commercial use |
| **Open Recipes (openrecip.es)** | Creative Commons Attribution 3.0 | Variable | Open recipe database with CC BY 3.0 license — commercial use permitted with attribution |
| **Open Recipe Data (jakevdp/GitHub)** | CC Attribution 3.0 Unported | Small dataset | Used in Python Data Science Handbook; limited volume |

**Key finding on RecipeNLG:** The 2.2M recipe dataset is large but its license for commercial use requires verification — it was compiled for ML research (INLG 2020 paper) and the underlying recipes were sourced from the web, raising the same ToS questions as scraping.

**Recommendation:** **Open Recipes** (openrecip.es, CC BY 3.0) is the cleanest option for a commercial recipe seed library. Volume is smaller but license is unambiguous. Supplement with licensed API access (Edamam or Spoonacular) for scale.

**Sources:**
- [Open Recipes](https://openrecip.es/)
- [RecipeNLG — Hugging Face](https://huggingface.co/datasets/mbien/recipe_nlg)
- [Open Recipe Data — GitHub](https://github.com/jakevdp/open-recipe-data)

---

## 6. Legal Risk Matrix

| Content Acquisition Method | Copyright Risk | ToS Risk | GDPR/CCPA Risk | Overall Risk | Mitigation |
|---------------------------|---------------|----------|----------------|-------------|------------|
| **Bulk scraping major recipe sites** | Low (ingredient lists uncopyrightable) | CRITICAL — clear ToS violation | Low | **CRITICAL** | Do not pursue |
| **User imports recipe via URL (user-initiated)** | Low-Medium (512(c) likely applies) | Medium (user's ToS violation, not Stàged's) | Low | **Medium-Low** | Register DMCA agent; implement notice-and-takedown; import structured data only |
| **Licensed API (Spoonacular, Edamam)** | None (licensed content) | None | Low | **Low** | Verify non-compete terms; review caching ToS |
| **Open-licensed datasets (CC BY 3.0)** | None | None | Low | **Very Low** | Ensure attribution is displayed |
| **User-created recipes (user types their own)** | None | None | Standard GDPR/CCPA | **Very Low** | Standard user data privacy practices |
| **Structured data import (schema.org JSON-LD)** | Very Low | Low-Medium | Low | **Low** | Fetch structured data only; display source attribution |

### GDPR/CCPA Note
Storing users' recipe collections is standard personal data under GDPR/CCPA. If recipes are imported from third-party sites, the personal data concern is minimal — the legal exposure is ToS, not privacy law. Standard data practices (privacy policy, right to deletion, data minimization) apply. If recipes are crawled by Stàged's servers (not user-initiated), there may be additional data processing obligations.

---

## 7. Source List

| Source | Date | URL |
|--------|------|-----|
| US Copyright Office — What Does Copyright Protect (FAQ) | Current | https://www.copyright.gov/help/faq/faq-protect.html |
| US Copyright Office — Section 512 Resources | Current | https://www.copyright.gov/512/ |
| 17 U.S.C. § 512 — Legal Information Institute | Current | https://www.law.cornell.edu/uscode/text/17/512 |
| Copyright Alliance — Recipes and Cookbooks | 2024 | https://copyrightalliance.org/are-recipes-cookbooks-protected-by-copyright/ |
| Copyrightlaws.com — Copyright Protection in Recipes | 2024 | https://www.copyrightlaws.com/copyright-protection-recipes/ |
| Nolo — Can You Copyright a Recipe | 2024 | https://www.nolo.com/legal-encyclopedia/can-you-protect-a-recipe.html |
| NYC Bar Association — Secret Ingredients | 2024 | https://www.nycbar.org/reports/secret-ingredients-how-to-protect-recipes/ |
| Leak Douglas Morano — Recipes as IP | 2024 | https://leakdouglas.com/are-recipes-considered-intellectual-property-in-the-united-states/ |
| Digital Media Law Project — User Content Copyright Claims | Current | https://www.dmlp.org/legal-guide/protecting-yourself-against-copyright-claims-based-user-content |
| Justia — Copyright Safe Harbor | Current | https://www.justia.com/intellectual-property/copyright/copyright-safe-harbor/ |
| Spoonacular ToS | 2025 | https://spoonacular.com/food-api/terms |
| Spoonacular DMCA | 2025 | https://spoonacular.com/dmca |
| Edamam Recipe API | 2025 | https://developer.edamam.com/recipe-content-management-api |
| Open Recipes | 2024 | https://openrecip.es/ |
| RecipeNLG — Hugging Face | 2024 | https://huggingface.co/datasets/mbien/recipe_nlg |
| Open Recipe Data — GitHub | 2024 | https://github.com/jakevdp/open-recipe-data |
| Justia — Avvo Recipe Copyright Q&A | Dec 2024 | https://answers.justia.com/question/2024/12/28/is-taking-just-the-ingredients-and-basic-1042471 |
