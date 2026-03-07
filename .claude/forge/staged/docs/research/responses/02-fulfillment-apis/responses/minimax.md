# Research Response 02 — Fulfillment API Landscape

**Source:** MiniMax Researcher
**Date:** 2026-03-06
**Topic:** Instacart Connect, Amazon Fresh, Uber Eats — affiliate terms, API access, commission reality

---

## 1. API Existence Verification

### Instacart Connect vs. Instacart Developer Platform

**Finding: The brief conflates two distinct programs.**

The product brief references "Instacart Connect" as the API for affiliate integration. Research reveals:

- **Instacart Connect** — An enterprise API for retailer partners (e.g., Kroger, Costco) who want to add Instacart fulfillment to their own e-commerce sites. This is not the program third-party apps use.

- **Instacart Developer Platform (IDP)** — Launched March 27, 2024, this is the publicly available API for third-party apps, content platforms, and recipe websites. This is the correct program for Stàged.

**Source:** Instacart's official documentation and press release confirming the March 2024 launch with partners including The New York Times, WeightWatchers, and GE Appliances.

The IDP provides a **Recipe Page API** that enables:

- Creating shoppable recipe pages with ingredient lists
- Generating unique URLs that redirect to Instacart Marketplace
- Passing ingredient names, quantities, and units
- Affiliate tracking via Impact.com integration

### Amazon Fresh API

**Finding: No Amazon Fresh-specific developer API exists.**

The brief assumes "Amazon Fresh has a linkable API." Research confirms:

- Amazon does not offer a dedicated "Amazon Fresh API" for developers
- Amazon's **Product Advertising API 5.0** exists but is designed for affiliates to retrieve product information and create add-to-cart links—not for grocery-specific integrations
- Amazon Fresh is accessible through the broader Amazon.com platform but lacks specialized APIs for recipe-to-cart workflows

### Uber Eats / Postmates API

**Finding: Uber Eats API exists but focuses on restaurant ordering, not grocery.**

The brief assumes "Uber Eats / Postmates has a developer API for grocery." Research shows:

- Uber Eats **Marketplace APIs** exist and require written approval from Uber
- The API is designed for **Point-of-Sale (POS) integrations** and restaurant menu management
- Grocery delivery is not a primary use case; the API documentation makes no reference to grocery fulfillment
- Postmates was acquired by Uber in 2020 and the separate Postmates API has been sunset

---

## 2. Commission Reality

### Instacart Affiliate Commission Rates

**Finding: The 3-7% assumption is at the high end for new partners.**

Commission rates vary significantly across affiliate networks:

| Network | Commission Rate | Structure |
|---------|----------------|-----------|
| Impact (current program) | $10 per new customer OR ~5% | Flat or percentage |
| CJ Affiliate | 3% | Percentage |
| Mavely | 7% | Percentage |
| FlexOffers | $1.60 per sale | Flat |

The 3-7% range in the brief is **achievable but represents tier-2 or tier-3 rates** that typically require volume or prior relationships. New partners should expect:

- **Entry-level:** 3-5% or $2-5 per conversion
- **Established partners:** Up to 7% or $10 per new customer
- **High volume:** Custom negotiated rates

**Critical detail:** Instacart moved from its proprietary "Tastemakers" program to **Impact.com** in 2024. Partners must now apply through Impact to receive commission tracking and payments.

### Amazon Associates for Grocery

**Finding: Amazon offers up to 10% commission but grocery falls into general categories.**

Amazon Associates commission rates vary by category:

- Grocery (Amazon Fresh included): **Up to 10%** for specific subcategories
- Most grocery items: **1-4%** depending on volume tier
- Cookie duration: **24 hours** (significantly shorter than Instacart's 7-day window)

**Important:** Amazon discontinued the OneTag tracking system in September 2024, forcing affiliates to migrate to SiteStripe or API-based solutions. This demonstrates API deprecation risk.

---

## 3. Access Barriers

### Instacart Developer Platform Approval

**Finding: The IDP is publicly available but requires approval.**

Process:

1. **Apply** for API access via Instacart's developer portal
2. **Receive** API keys (development and production)
3. **Build** integration following documentation
4. **Submit** for review (triggered when creating a production API key)
5. **Receive** approval email

Timeline: Instacart states "Demo approval & production key: 1-2 business days" and "Build integration & demo submission: 19 days (average benchmark)."

Requirements:

- No explicit minimum user threshold documented
- Must comply with developer guidelines and messaging policies
- Must pass technical review for production access
- Geographic restrictions: Currently **US and Canada only**

### Affiliate Program Access

**Finding: Affiliate programs have lower barriers than API partnerships.**

- **Instacart via Impact:** Open application; requires US residency, 18+ age
- **Amazon Associates:** Open to anyone with a qualifying website
- **Walmart Affiliate Program:** One of the fastest approval processes ("sign up and get started within a day")

### Kroger Developer API

**Finding: Kroger offers a public Developer API.**

Kroger's API provides:

- Access to 300,000+ Kroger products and weekly deals
- Custom shopping list creation
- Order placement via API
- Store location and hours lookup

This is a viable alternative to Instacart for apps targeting Kroger shoppers.

---

## 4. Alternative Fulfillment Partners

### Primary Alternatives to Consider

| Partner | API Availability | Commission Potential | Notes |
|---------|-------------------|---------------------|-------|
| **Kroger** | Yes (public API) | Affiliate program exists | 2,700+ stores; Kroger+ partnership with Instacart |
| **Walmart** | Yes (affiliate API) | 3-12% (tiered) | 4,700+ stores; Walmart+ membership |
| **Shipt** (Target) | Limited/enterprise | Custom | Same-day delivery; Target-owned |
| **HelloFresh** | Yes (affiliate) | $10-25/new customer | Meal kit model, not grocery |
| **Thrive Market** | Yes (affiliate) | Varies | Membership-based grocery |

### Competitor Integration Examples

**New York Times Cooking + Instacart (June 2024)**

- Landmark partnership announced June 11, 2024
- Users can shop recipe ingredients directly via Instacart
- Integration allows recipe-by-recipe shopping

**Samsung Food (formerly Whisk) + Instacart (January 2025)**

- Samsung acquired Whisk in 2019 and rebranded to Samsung Food
- Partnership announced January 2025 for Samsung Bespoke refrigerators
- AI Vision Inside technology identifies items in fridge
- Links to Instacart for reordering

---

## 5. Technical Constraints

### Ingredient Matching

**Finding: Instacart uses name-based fuzzy matching, not UPC matching.**

From Instacart's documentation:

> "Each request must include an array of Ingredients objects that represent products. For each line item, specify at least a product name. Instacart uses the product names to find matching products to display to your user."

Limitations:

- No direct UPC passing in the recipe API
- Matching depends on Instacart's product catalog and algorithm
- Results vary by store and ingredient specificity
- User must select from matched products on the Instacart page

### URL and Link Constraints

- **Recipe page links expire** after 30 days by default (can extend to 365 days)
- Links require regeneration for long-term use
- Deep linking works via URL parameters, not direct app-intent schemes
- Universal Links (iOS) and App Links (Android) are supported

### Attribution Tracking

- **Impact.com** provides commission tracking
- Partners receive a unique partner ID
- URL parameters must be appended for attribution
- 7-day cookie window for Instacart (significantly better than Amazon's 24 hours)

---

## 6. Risk Flags

### API Deprecation and Changes

**Critical risk confirmed:**

- **Amazon OneTag deprecation (September 2024):** Amazon discontinued OneTag, forcing all affiliates to migrate to SiteStripe or API alternatives. This shows platforms will change or remove tracking mechanisms without notice.

- **Instacart program migration (2024):** The Tastemakers program was discontinued in favor of Impact.com, requiring all partners to re-enroll and update their tracking implementation.

### URL Scheme Instability

- Deep links can break if platforms change URL structures
- No guaranteed SLAs for URL scheme stability
- App-to-app linking depends on both platforms maintaining compatibility

### Commission Rate Changes

- Affiliate programs can change rates at any time (often with 30-day notice)
- Volume-based tiers may exclude small publishers
- Some programs have minimum payout thresholds ($50-100 typical)

### Partner Concentration Risk

**Monetization model risk:** If Stàged relies primarily on Instacart:

- Single-point-of-failure for revenue
- Partner can change terms, reduce rates, or terminate program
- No recourse if partner deprioritizes recipe-to-cart use case

### Geographic Limitations

- Instacart IDP: **US and Canada only**
- Amazon Fresh: Limited geographic availability
- Uber Eats grocery: Not available in all markets

---

## 7. Recommendations

### Verified Path Forward

1. **Instacart Developer Platform** — This is the viable, documented path for recipe-to-cart functionality. Apply for API access and build integration using the Recipe Page API.

2. **Affiliate program via Impact** — Apply for Instacart affiliate program through Impact.com to enable commission tracking on referred orders.

3. **Commission expectations** — Plan for 3-5% average commission initially; 7% is achievable with scale.

### Assumptions to Adjust

| Brief Assumption | Reality |
|------------------|---------|
| "Instacart Connect" | Use "Instacart Developer Platform" |
| 3-7% commission | Expect 3-5% initially; 7% with volume |
| Amazon Fresh API | Does not exist; use Amazon Associates (limited) |
| Uber Eats grocery API | Does not exist for this use case |
| Guaranteed API access | Requires application and review |

### Alternative Revenue Streams to Consider

- **Kroger API partnership** — More accessible than Instacart for grocery-specific integrations
- **HelloFresh/meal kit affiliate** — Higher flat commissions ($10-25) but different user experience
- **Walmart affiliate program** — Fast approval, established infrastructure

---

## 8. Source List

[1] Instacart. "The Instacart Developer Platform." March 27, 2024. https://www.instacart.com/company/updates/the-instacart-developer-platform-a-new-way-to-turn-inspiration-into-action

[2] PR Newswire. "Instacart to Power the Next Generation of Interactive Food Experiences." March 27, 2024.

[3] Instacart Docs. "Create recipe page." https://docs.instacart.com/developer_platform_api/api/products/create_recipe_page/

[4] Instacart Docs. "Recipe page overview." https://docs.instacart.com/developer_platform_api/guide/concepts/recipe/

[5] Amazon. "Product Advertising API 5.0 - Add to Cart form." https://webservices.amazon.com/paapi5/documentation/add-to-cart-form.html

[6] Uber Developers. "Uber Eats Marketplace APIs." https://developer.uber.com/docs/eats/introduction

[7] Instacart Docs. "Conversion tracking and affiliate payments." https://docs.instacart.com/developer_platform_api/guide/concepts/launch_activities/conversions_and_payments

[8] Walmart Affiliate Program. https://affiliates.walmart.com/

[9] Kroger Developer API. https://developer.kroger.com/

[10] NYT Company Press. "New York Times Cooking and Instacart Launch Innovative Shoppable Recipes Integration." June 11, 2024.

[11] Samsung Newsroom. "Samsung Joins forces With Instacart To Enhance Kitchen Experiences." January 2025.
