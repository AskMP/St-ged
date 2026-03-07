# Prompt 02 - Fulfillment API Landscape (as of 2026-03-06)

## 1. API existence verification (assumed vs actual)

### Assumption test summary

| Assumption | Verdict | Evidence | Confidence |
|---|---|---|---|
| 1) Instacart Connect exists and supports affiliate/referral commissions | **Partly true** | Instacart has **two** relevant programs: **Connect APIs** (retailer-focused fulfillment stack) and **IDP** (developer API for recipe/list/cart-link experiences). Commission language appears under affiliate/developer partner programs, not as a generic "Connect commission API" guarantee. [1][2][3] | **High** |
| 2) Grocery fulfillment affiliate rates of 3-7% are realistic for a new product | **Not generally confirmed** | Public first-party Instacart payout examples are **CPA and variable rev-share** (not a universal % floor/ceiling). Walmart publishes **1-4%** and "up to 4%." Amazon publishes "up to 10%" but category detail is account/rate-card dependent. [3][4][5][6][7] | **Medium** |
| 3) Amazon Fresh has a practical recipe-to-cart API/deep-link path | **Unverified as public API** | No public Amazon Developer surface in fetched first-party docs exposes an Amazon Fresh-specific recipe/cart API. Amazon affiliate tooling supports tagged links and product data APIs, but no confirmed public "Fresh recipe-to-cart" flow in available public docs. [5][7][8][9] | **Medium** |
| 4) Uber Eats/Postmates has usable grocery developer APIs | **Partly true / constrained** | Uber Eats Marketplace APIs are real but targeted to merchant/POS/store-menu-order operations and may require written approval, NDA, and partner manager. No evidence in fetched official docs of broad public "affiliate grocery cart" API. [10][11][12] | **High** |
| 5) Competitors like Samsung Food/Whisk have integrated Instacart, on what terms | **True for Samsung partnership; mixed for Whisk evidence** | Samsung announced a multi-year Instacart integration using Instacart product-matching API (US rollout notes). Whisk docs show support via Instacart/Kroger integrations (third-party docs, not Instacart contract terms). [13][14] | **High (Samsung) / Medium (Whisk terms)** |

---

### Current state of Instacart Connect vs IDP

**Confirmed facts**
- **Instacart Connect APIs** exist and are explicitly for **retailer partners**, including Fulfillment, Post-checkout, Transactions, etc. [1]
- **Instacart Developer Platform (IDP)** exists for app developers (recipe/meal planning/shoppable flows). [2]
- IDP request/approval flow is explicitly documented: request access + dev key (~1 week), integration/demo (program benchmark ~19 days), demo approval + production key (1-2 business days). [15]
- IDP recipe flow returns Instacart-hosted product/recipe links that include attribution parameters in sample output (e.g., `aff_id`, `offer_id`, `affiliate_platform=idp_partner`). [16]
- Instacart public affiliate page states three tracks (Affiliate, Influencer, Developer), with explicit payout language. [3]

**Likely/inferred (not contract-guaranteed)**
- For a startup meal-planning app, **IDP** is the practical entry path; **Connect** is usually for retailers needing deeper fulfillment stack ownership.
- "Commissions" are negotiated/programmatic and not fixed globally for all developers.

---

### Amazon Fresh practical API/deep-link status

**Confirmed facts**
- Amazon Associates allows tagged "Special Links," with strict formatting/compliance requirements for commission attribution. [6][7]
- Amazon PA-API docs still exist but indicate deprecation/migration to Creators API; operations are product discovery/info oriented (GetItems/SearchItems/etc.), not an explicit public checkout/cart orchestration API in shown docs. [9]
- Amazon Developer Services public catalog does not expose a clear Amazon Fresh partner API surface in the fetched docs. [8]

**Unverifiable**
- A public, self-serve Amazon Fresh-specific "recipe-to-cart" API for third-party startups was **not verifiable** from accessible first-party docs in this pass.
- Public, category-specific Associates rate card values for "Fresh/grocery" were **not verifiable** without authenticated rate-card access. [17]

---

### Uber Eats/Postmates API scope

**Confirmed facts**
- Uber Eats Marketplace APIs exist and center on integration config, menu/store/order/promotions/reporting. [10]
- Uber explicitly flags that access may require written approval and updated scope policies. [10][12]
- Getting-started prerequisites include NDA, API licensing agreement, and partner manager approval. [11]

**Likely/inferred**
- These APIs are built for merchant operations (restaurant/store systems), not lightweight affiliate "recipe-to-grocery-cart" consumer apps.

**Unverifiable**
- Distinct modern Postmates grocery API availability was not independently verified in first-party docs; Uber surfaces Eats APIs under Uber Developers.

---

## 2. Commission reality (sourced numbers/ranges)

### Published numbers found (first-party)

| Program | Published payout language | Notes | Confidence |
|---|---|---|---|
| Instacart Affiliate | "Earn up to a **$10 CPA** … for every new customer order" | CPA model for affiliate track, variable by terms. [3] | High |
| Instacart Influencer | "Earn up to **15%** on qualifying purchases" | Exclusions/conditions apply; may vary. [3] | High |
| Instacart Developer track | "Earn commissions … terms vary depending on user base and engagement" | No public standard % schedule posted. [3] | High |
| Walmart Affiliate | "Earn up to **4%**"; benefits page says "**1-4%**" | Explicit first-party range. [4][5] | High |
| Amazon Associates | Marketing page says "Earn up to **10%**" | Realized rate depends on category/rate card; detailed schedule not publicly retrievable here. [6][17] | Medium |

### Conclusion on "3-7% realistic"
- **Confirmed:** Some programs are below/above 3-7 depending on model (Walmart 1-4%; Instacart Influencer up to 15%; Instacart affiliate can be CPA; Amazon says up to 10%). [3][4][5][6]
- **Therefore:** A blanket 3-7% assumption is **too simplistic**. For new products, payout may be CPA, variable rev-share, or lower % depending on approval tier/program type.
- **Confidence:** **Medium** (because several programs require approved account views for exact live rate cards).

---

## 3. Access barriers (what it really takes)

### Instacart
**Confirmed**
- Application + API key workflow; explicit timeline benchmarks. [15]
- Terms allow Instacart to set API limits, require minimum functionality, suspend/terminate access, and modify/discontinue API features. [18]
- US/Canada operational footprint and language/location headers in docs imply NA-first scope. [2][15][16]

**Implication**
- Access is feasible for startups but not "instant no-review"; there is a program gate and integration review.

### Amazon
**Confirmed**
- Associates requires approved site/app and strict special-link compliance; non-compliance can void commissions. [6][7]
- Program terms can be modified, and services can be changed/discontinued. [6]
- Commission appendix/rate card appears behind account flow in this research pass. [17]

**Implication**
- Deep-link monetization is possible, but attribution reliability is policy-sensitive.

### Uber Eats
**Confirmed**
- May require written approval; prerequisites include legal agreements and partner manager involvement. [10][11][12]

**Implication**
- Not a frictionless "public affiliate grocery API" path for small apps.

---

## 4. Alternative paths (viable partners)

### Viable now (higher practicality)
1. **Instacart IDP** for recipe/list/cart-link journeys with hosted marketplace checkout. [2][16]
2. **Kroger public APIs** (including Cart API + product/location APIs) for direct grocery integration. [19]
3. **Walmart Affiliate** for immediate monetized linking while deeper APIs are evaluated. [4][5]

### Complementary logistics path
4. **DoorDash Drive API** for delivery orchestration (create/manage deliveries), noting production access is currently limited per docs. [20]

### Competitor/precedent evidence
- Instacart lists launch partners including NYT Cooking, WeightWatchers, GE and additional meal-planning/nutrition apps. [14]
- Samsung announced multi-year Instacart integration (US-focused launch notes) via Instacart product-matching API. [13]
- Whisk docs indicate retailer support via Instacart/Kroger integration rails. [21]

### Probable scale thresholds (inferred)
- Accepted partners include both large brands and smaller specialized apps, suggesting acceptance is not only enterprise-scale, but stronger use-case quality + integration quality likely matter more than raw size.

---

## 5. Risk flags (model fragility)

1. **Attribution fragility risk (High):** commission depends on proper tagged-link formatting, approved channels, and policy compliance; violations can disqualify earnings. [7]
2. **API-change risk (High):** Instacart and Amazon both reserve broad rights to modify/discontinue APIs/terms; Uber also warns APIs evolve with scope policy changes. [6][10][18]
3. **Program-gate risk (High):** Uber and Instacart include approval/review steps; timelines are not fully in developer control. [11][15]
4. **Commission opacity risk (Medium):** key rate cards may be account-specific or not fully public; public marketing "up to X%" is not guaranteed realized take-rate. [6][17]
5. **Geography/surface risk (Medium):** integrations can be region-limited (e.g., Samsung/Instacart US-serviced areas note). [13]
6. **Dependency concentration risk (Medium-High):** if one provider changes URL schema, attribution rules, or API scopes, downstream meal-planning monetization can break quickly. [6][7][18]

---

## 6. Source list (date + URL)

1. Instacart Connect APIs (last updated Jan 5, 2026): https://docs.instacart.com/connect/
2. Instacart Developer Platform Introduction (last updated Oct 23, 2025): https://docs.instacart.com/developer_platform_api/
3. Instacart Affiliate Programs page: https://www.instacart.com/company/affiliate
4. Walmart Affiliates FAQ (©2026): https://affiliates.walmart.com/page/faqs
5. Walmart Affiliates Benefits (©2026): https://affiliates.walmart.com/page/benefits
6. Amazon Associates homepage (©1996-2025): https://affiliate-program.amazon.com/
7. Amazon Associates Program Policies (updated Nov 27, 2025): https://affiliate-program.amazon.com/help/operating/policies
8. Amazon Developer Services (©2010-2026): https://developer.amazon.com/
9. Amazon Product Advertising API docs (notes deprecation by Apr 30, 2026): https://webservices.amazon.com/paapi5/documentation/
10. Uber Eats Marketplace APIs overview: https://developer.uber.com/docs/eats
11. Uber Eats Getting Started guide: https://developer.uber.com/docs/eats/guides/getting-started
12. Uber Eats FAQ: https://developer.uber.com/docs/eats/faq
13. Samsung Newsroom press release (Jan 2, 2025): https://news.samsung.com/global/samsung-joins-forces-with-instacart-to-enhance-kitchen-experiences-through-hallmark-innovation
14. Instacart IDP launch update (Mar 27, 2024): https://www.instacart.com/company/updates/the-instacart-developer-platform-a-new-way-to-turn-inspiration-into-action/
15. Instacart IDP Get Started / integration flow (last updated Nov 3, 2025): https://docs.instacart.com/developer_platform_api/get_started/overview
16. Instacart tutorial: Create a recipe page (last updated Nov 3, 2025): https://docs.instacart.com/developer_platform_api/guide/tutorials/create_a_recipe_page
17. Amazon operating schedule endpoint redirecting to authenticated rate card flow: https://affiliate-program.amazon.com/help/operating/schedule
18. Instacart Developer Platform Terms & Conditions (last updated Nov 4, 2025): https://docs.instacart.com/developer_platform_api/guide/terms_and_policies/developer_terms
19. Kroger Developers (public APIs incl. Cart API): https://developer.kroger.com/
20. DoorDash Drive API getting started (production access limited notice): https://developer.doordash.com/en-US/docs/drive/tutorials/get_started/
21. Whisk Integrated Retailers doc: https://docs.whisk.com/resources/supported-retailers

---

## Major conclusion confidence snapshot

- Instacart API landscape (Connect vs IDP) and partner/commission mechanics: **High**
- Uber Eats API scope and approval friction: **High**
- Commission benchmarking across providers for new startup assumptions: **Medium**
- Amazon Fresh recipe-to-cart public API availability: **Medium (negative evidence; unverifiable positive path)**
