# Research Response 02 — Fulfillment API Landscape
**Source:** Claude (Sonnet 4.6) with live web research
**Date:** 2026-03-06
**Topic:** Instacart Connect, Amazon Fresh, Uber Eats — affiliate terms, API access, commission reality

---

## 1. API Existence Verification

### Instacart Developer Platform (IDP)
**Status: EXISTS — but branded differently than "Instacart Connect"**

Instacart launched the **Instacart Developer Platform (IDP)** on March 27, 2024. This is a publicly available API program, not limited to enterprise partners. The platform allows developers to:
- Build recipe-to-cart experiences (shoppable recipes)
- Pre-populate Instacart carts from their own apps
- Earn affiliate commissions for orders originating from their integration
- Track conversions through the Impact platform

Note: "Instacart Connect" is a separate, older API product (docs at `docs.instacart.com/connect/`) — this is distinct from the IDP and appears to be the enterprise/retailer-facing product, not the developer affiliate product. The brief's assumption conflates these two different offerings.

**IDP Partner Examples (confirmed):** Biocoach, DinnerTime, Eatlove, eMeals, Foodsmart, Innit, Intent, Jow, Jupiter, Maple, North Fork, Relish, Smart Commerce — all confirmed by Instacart's own announcement materials.

Sources:
- [Instacart Developer Platform announcement](https://www.instacart.com/company/updates/the-instacart-developer-platform-a-new-way-to-turn-inspiration-into-action)
- [Digital Commerce 360 — Instacart API launch](https://www.digitalcommerce360.com/2024/03/27/instacart-api-idp-developer-platform/)
- [Instacart IDP Documentation](https://docs.instacart.com/developer_platform_api/)
- [Instacart Connect API (separate product)](https://docs.instacart.com/connect/)

### Amazon Fresh
**Status: NO public API for recipe-to-cart integration**

Amazon Fresh does not have publicly documented API endpoints for third-party grocery cart integration. AWS re:Post community confirms this: Amazon Fresh/Whole Foods APIs are not publicly accessible and require proprietary onboarding.

Amazon's **Product Advertising API (PA-API)** exists for Amazon Associates affiliates, but it covers general Amazon products — not Amazon Fresh grocery integration. Critically: **PA-API is being deprecated on April 30, 2026**, with migration to the Creators API recommended.

**Conclusion:** The brief's assumption that "Amazon Fresh has a linkable API" is **not accurate** as of 2025–2026. Deep linking to Amazon Fresh would rely on URL construction heuristics, not an official integration, and is not affiliate-commission-eligible.

Sources:
- [AWS re:Post — Amazon Fresh API question](https://repost.aws/questions/QUAWoPILDhS_6j458Ih6zAzQ/is-there-an-api-for-amazon-fresh-or-whole-foods)
- [Amazon Associates Central](https://affiliate-program.amazon.com/creatorsapi)
- [Amazon SP-API Docs](https://developer-docs.amazon.com/sp-api/docs/app-integrations)

### Uber Eats / Postmates
**Status: Insufficient public documentation for grocery-specific affiliate integration**

No credible public documentation was found confirming a grocery ordering affiliate API for Uber Eats that would suit a recipe app context. Uber Eats has developer tools, but these appear oriented toward restaurant ordering, not grocery. Uber Eats does offer grocery delivery through partnerships (e.g., Instacart), but not an independent affiliate track for recipe apps.

**Conclusion:** The brief's assumption about Uber Eats/Postmates having a grocery developer API for recipe apps is **unverified and likely inaccurate** for the use case described.

---

## 2. Commission Reality

### Instacart Affiliate Commission (Confirmed)
- **Standard rate: 5% of total cart value** for orders completed within a 7-day attribution window
- The commission applies to the entire cart — not just the items added via the recipe link
- Alternative structure: up to **$10 CPA** (cost per acquisition) for new customer orders
- General affiliate range across sources: **2–9%** depending on arrangement

**What 5% means in practice:**
- Instacart's average order value (AOV) in 2024: **$112–$116**
- 5% of $114 AOV = **~$5.70 per converted order**
- This is meaningful but requires significant order volume for sustainability

**Key qualification:** Commission rates may be negotiable for high-volume IDP partners. The 5% figure is the publicly documented baseline rate.

Sources:
- [Instacart Affiliate Program page](https://www.instacart.com/company/affiliate)
- [Instacart Docs — Conversions and Payments](https://docs.instacart.com/developer_platform_api/guide/concepts/launch_activities/conversions_and_payments/)
- [Instacart affiliate breakdown — GetLasso](https://getlasso.co/affiliate/instacart/)
- [WP Tasty — Instacart Affiliate Program](https://www.wptasty.com/instacart-affiliate-program)

### Amazon Fresh Affiliate Commission
**Status: Not viable for grocery affiliate model**
Amazon Fresh commissions via Amazon Associates are either non-existent for grocery or sub-1% for general grocery category. The Amazon Associates program does not prominently feature grocery affiliate commissions as a revenue model. **Not verifiable as a comparable commission opportunity.**

---

## 3. Access Barriers

### Instacart Developer Platform
- **Application:** Via Instacart's developer portal at `docs.instacart.com/developer_platform_api/`
- **Affiliate enrollment:** Through **Impact** (the affiliate network Instacart uses); requires a live integration
- **Approval process:** No publicly documented minimum user threshold — the program appears open to developers who build a functioning integration
- **Geographic restrictions:** US-focused; Instacart operates in US and Canada
- **Technical requirement:** Must build an actual IDP integration (not just a referral link)

This means a solo developer or small team can access IDP; the MVP deep-link approach should still be built with IDP integration as an upgrade path.

### Amazon Fresh
- Requires direct business relationship with Amazon — no self-serve API path
- No publicly documented approval timeline or requirements for third parties

---

## 4. Alternative Paths (Not in Brief)

| Partner | Program Type | Notes |
|---------|-------------|-------|
| **Kroger** | Affiliate/API | Kroger has expanded Instacart integration; no independent affiliate program found for recipe apps |
| **Walmart+ / Walmart Grocery** | Affiliate via Impact | Walmart affiliate program exists; grocery-specific terms require verification |
| **Shipt (Target)** | Delivery service | Target-owned; no public recipe-to-cart affiliate program found |
| **Mealime** | Competitor example | Mealime has confirmed integrations with Kroger, Walmart, Amazon Fresh, and Instacart — proving the multi-partner model is achievable |
| **Chicory** | B2B shoppable recipe platform | Monetizes recipe content via CPG placements + retailer integrations; potential white-label partner for Stàged |

---

## 5. Risk Flags

### Risk 1: Commission fragility — HIGH
The entire affiliate revenue model rests on Instacart maintaining the IDP affiliate program at 5%. Instacart could:
- Reduce commission rates at any time (no contractual protection at API level)
- Require minimum volume thresholds to maintain partnership status
- Discontinue the affiliate program as business conditions change

### Risk 2: Amazon Fresh integration doesn't exist as assumed — HIGH
The brief assumes Amazon Fresh parity with Instacart. This is incorrect. Amazon Fresh has no public API. Deep-link heuristics to Amazon Fresh are informal and fragile — URL structure changes would break them immediately.

### Risk 3: 7-day attribution window — MEDIUM
Instacart's affiliate pays for orders within 7 days of a click. If users browse recipes but shop later (common behavior), conversion credit is lost.

### Risk 4: Deep-link URL stability — MEDIUM
MVP depends on constructing Instacart URLs. Instacart has changed its URL structure before. The IDP integration provides stable, official deep links; the informal deep-link approach does not.

### Risk 5: PA-API deprecation affects Amazon affiliate path — MEDIUM
Amazon PA-API deprecates April 30, 2026. Any Amazon affiliate link built on PA-API needs migration to Creators API before that date.

---

## 6. Source List

| Source | Date | URL |
|--------|------|-----|
| Instacart Developer Platform announcement | March 2024 | https://www.instacart.com/company/updates/the-instacart-developer-platform-a-new-way-to-turn-inspiration-into-action |
| PR Newswire — Instacart Developer Platform | March 2024 | https://www.prnewswire.com/news-releases/instacart-to-power-the-next-generation-of-interactive-food-experiences-with-introduction-of-the-instacart-developer-platform-302100628.html |
| Digital Commerce 360 — Instacart API | March 2024 | https://www.digitalcommerce360.com/2024/03/27/instacart-api-idp-developer-platform/ |
| Instacart Developer Platform Docs | 2024–2025 | https://docs.instacart.com/developer_platform_api/ |
| Instacart Connect Docs (enterprise) | 2024–2025 | https://docs.instacart.com/connect/ |
| Instacart Affiliate — Conversions & Payments | 2024–2025 | https://docs.instacart.com/developer_platform_api/guide/concepts/launch_activities/conversions_and_payments/ |
| Instacart Affiliate Program page | 2025 | https://www.instacart.com/company/affiliate |
| WP Tasty — Instacart Affiliate | 2024 | https://www.wptasty.com/instacart-affiliate-program |
| AWS re:Post — Amazon Fresh API | 2023–2024 | https://repost.aws/questions/QUAWoPILDhS_6j458Ih6zAzQ/is-there-an-api-for-amazon-fresh-or-whole-foods |
| Amazon SP-API Docs | 2025 | https://developer-docs.amazon.com/sp-api/docs/app-integrations |
| Instacart Q4 FY24 results / AOV | Feb 2025 | https://progressivegrocer.com/how-did-instacart-fare-q4-fy24 |
| Business of Apps — Instacart Statistics | 2026 | https://www.businessofapps.com/data/instacart-statistics/ |
