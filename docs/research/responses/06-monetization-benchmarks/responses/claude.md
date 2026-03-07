# Research Response 06 — Monetization Benchmarks
**Source:** Claude (Sonnet 4.6) with live web research
**Date:** 2026-03-06
**Topic:** Featured ingredient placement CPM/CPC, recipe affiliate revenue reality, food app monetization benchmarks

---

## 1. Revenue Model Reality Check

### Stream 1: Fulfillment Affiliate Commissions

**Assumed rate:** 3–7%
**Verified rate:** 5% of total cart value (Instacart IDP affiliate program, confirmed via Instacart Docs and affiliate program pages)

**Supporting math:**
- Instacart AOV (Average Order Value) in 2024: **$112–$116** (Instacart Q4 FY24 earnings; Business of Apps 2026 data)
- 5% of $114 = **~$5.70 per converted order**
- Commission includes the full cart — items beyond the recipe ingredients also count
- 7-day attribution window: orders must complete within 7 days of the referral click

**Reality assessment:** The 3–7% range in the brief is directionally accurate. The bottom of the range (3%) may reflect general affiliate rates from content sites; the 5% confirmed IDP rate for developer partners sits at the midpoint. Rates above 7% would require direct negotiation with Instacart for high-volume partners — not available at MVP.

**Key unknown:** Amazon Fresh does not have a public affiliate program for grocery integration. This effectively removes it as a commission source unless a direct business relationship is established.

**Sources:** [Instacart Docs — Conversions and Payments](https://docs.instacart.com/developer_platform_api/guide/concepts/launch_activities/conversions_and_payments/), [Instacart Q4 FY24](https://progressivegrocer.com/how-did-instacart-fare-q4-fy24), [Business of Apps — Instacart Statistics](https://www.businessofapps.com/data/instacart-statistics/)

---

### Stream 2: Featured Ingredient / Programmatic Product Placement

**Assumed format:** "Featured Ingredients" placed contextually in recipes (editorial-style, non-banner)
**Finding:** This is a real, established format — and there are established B2B platforms that do exactly this

**Companies already operating this model:**
- **Chicory** (chicory.co): Specializes in CPG brand placement within recipe content; shoppable recipe ads; CPM-based pricing
- **SideChef**: Runs "In-Recipe Campaigns" for CPG brands; sponsored ingredients set as default in retailer checkout
- **AdAdapted**: Focuses on add-to-list advertising for CPG brands in grocery apps
- **Gourmet Ads**: Food/recipe-specific programmatic advertising network

**CPM/CPC benchmarks:**
- Shoppable in-recipe media drives **2–5x higher engagement rates** than standard display ads
- Up to **3x higher conversion rates** compared to standard digital display
- Exact CPM rates were not publicly disclosed by Chicory or SideChef in search results
- Food/recipe contextual CPMs typically range from $8–$25 CPM (industry inference based on premium contextual advertising benchmarks — **this is inference, not sourced**)
- For comparison: standard display ads in food/recipe content average $2–$5 CPM; in-recipe shoppable placement commands a significant premium

**CPG brands actively investing:** Goya (confirmed SideChef case study), plus major food brands (Kerrygold, Chosen Foods, Oatly-type brands) are the natural candidates but no public spend data was found for named brands in recipe apps specifically.

**Implication for Stàged:** Featured ingredient placement is a viable format with proof-of-concept from Chicory and SideChef. The challenge is that CPG brands typically work through established platforms (Chicory, SideChef) rather than bespoke deals with individual apps. Stàged's path to this revenue likely involves either:
1. White-labeling a platform like Chicory (they offer B2B integration)
2. Building direct CPG relationships once user scale is demonstrated
3. Joining a programmatic food ad network (Gourmet Ads)

**Sources:** [SideChef — Shoppable Recipe Ads](https://www.sidechef.com/business/food-advertising/shoppable-recipe-ads), [SideChef — In-Recipe Campaigns](https://www.sidechef.com/business/food-advertising/in-recipe-campaigns-for-cpg-brands), [Chicory — CPG Brands](https://chicory.co/blog-feed/how-cpg-brands-can-use-chicorys-shoppable-recipe-solution), [AdAdapted](https://www.adadapted.com/blog/3-clever-ways-brands-are-using-recipes-to-inspire-and-drive-sales)

---

### Stream 3: Stàge Events (Live Cooking Sessions at $5–$15 entry)

**Assumed price:** $5–$15/ticket
**Finding:** The $5–$15 range is at the low end of market pricing — potentially unsustainable

**Live online cooking class pricing benchmarks (2024–2025):**
- Virtual cooking classes: **$75/person** minimum for virtual team/group events (The Table Less Traveled, Taste Buds Kitchen)
- Consumer-facing online cooking classes (Classpop): Various prices, but branded chef classes typically $35–$100/person
- General cooking class average: **$45/hour** (Thumbtack 2024 survey)
- MasterClass culinary content: Subscription model (~$180/year) rather than per-class

**Online cooking class market:**
- Global market: **$0.37 billion in 2024**, projected $0.864 billion by 2034 (CAGR 9.21%)
- North America: 42.3% market share; projected 11.8% CAGR through 2034

**Reality assessment:** $5–$15 per ticket positions Stàge Events at the extremely low end of market pricing. At $10/ticket:
- 100 attendees = $1,000/event — before instructor cost
- Instructor cost for a professional chef: typically $200–$500/hour minimum for a quality experience
- Contribution margin per event could be negative at low scale

The viable model may need price points of $25–$45/person for consumer-facing events, or $75–$150/person for premium or corporate-sponsored events. Alternatively, a recurring "subscription" model for access to multiple events (MasterClass-style) may be more sustainable than per-event ticketing.

**Sources:** [Thumbtack — Cooking Classes Cost 2024](https://www.thumbtack.com/p/cooking-classes-cost), [The Table Less Traveled](https://www.thetablelesstraveled.com/virtual-corporate-cooking-classes), [Exactitude Consultancy — Online Cooking Class Market](https://exactitudeconsultancy.com/reports/36008/online-cooking-class-market)

---

### Stream 4: Free App Without Subscription

**Claim:** A free, ad-supported food app can reach sustainability without a subscription
**Finding:** Mixed evidence; the trend in 2025 is toward hybrid models

**Market data:**
- Free-to-download apps held **73.6% of recipe app usage** — users strongly prefer free access
- Recipe app market: $5.80 billion (2024) → $6.41 billion (2025) at 10.52% CAGR
- Individual personalized recipe app revenue range: $50,000–$150,000/year (broad industry range, inference-heavy)
- Yummly (acquired by Whiplash, previously Whiplash/Yummly acquired by Meredith Corp): No public revenue figures found post-Yahoo acquisition
- Tasty (BuzzFeed): Profitable via branded content + affiliate; not a subscription model — but backed by BuzzFeed's media infrastructure

**Trend note:** RevenueCat's 2025 app monetization report shows a shift toward hybrid models (subscriptions + in-app ads for non-subscribers). Pure ad-supported models are increasingly difficult without significant scale (millions of MAU).

**Sources:** [Cognitive Market Research — Recipe Apps Market 2025](https://www.cognitivemarketresearch.com/recipe-apps-market-report), [Electroiq — Recipe App Statistics 2025](https://electroiq.com/stats/recipe-app-statistics/), [RevenueCat — 2025 Monetization Trends](https://www.revenuecat.com/blog/growth/2025-app-monetization-trends/)

---

## 2. Break-Even Math (Inferred)

*Note: All figures below are calculations based on sourced data points. They are inferences, not published benchmarks.*

### Stream 1: Affiliate (Instacart 5%, $114 AOV)
- Revenue per converted order: **$5.70**
- Target conversion rate from recipe view to grocery order: **~5–10%** (industry inference for recipe apps; no published benchmark found)
- Required orders for $1K/mo MRR: **~175 orders/month**
- Required active users at 5% conversion: **~3,500 MAU** to hit $1K/mo
- Required active users at 5% conversion: **~35,000 MAU** to hit $10K/mo
- Required active users at 5% conversion: **~350,000 MAU** to hit $100K/mo

### Stream 2: CPG Placement (Inference Only)
- Assuming $15 CPM for in-recipe placements (mid-range editorial contextual)
- Required impressions for $1K/mo: ~67,000
- Required impressions for $10K/mo: ~667,000
- At 3 recipe views/visit, 1 placement/recipe: need ~220K monthly recipe views for $10K/mo
- This requires roughly **75,000+ MAU** at average engagement

### Stream 3: Events
- At $25/ticket (revised realistic price), 40-person event: **$1,000 gross/event**
- After instructor cost ($300): **$700 net/event**
- Required events for $10K/mo: **~14 events/month** (operationally intensive)
- More sustainable: 1–2 premium events/month at $75/person, 50 attendees = $3,750–$7,500/event

---

## 3. CPG Placement Landscape

| Platform | Model | Accessible to New Apps? |
|---------|-------|------------------------|
| **Chicory** | B2B — integrates with publisher sites and apps; CPG brands run shoppable recipe campaigns through Chicory's network | Yes, via partnership |
| **SideChef** | In-recipe sponsorship; brands pay for default ingredient placement in the SideChef ecosystem | SideChef controls its own ecosystem — not a network for third parties |
| **AdAdapted** | Add-to-list CPG ads in grocery apps | Primarily targets grocery apps, not recipe apps |
| **Gourmet Ads** | Programmatic food/CPG network; publisher integration for recipe/food sites | Yes, publisher signup available |

**Recommendation:** Chicory is the most accessible path for Stàged to access CPG featured ingredient budgets. Chicory offers publisher integrations that could power Stàged's "Featured Ingredients" model without building direct CPG relationships.

---

## 4. Comparable App Economics

| App | Revenue Model | Known Economics |
|-----|--------------|----------------|
| **Tasty (BuzzFeed)** | Affiliate + branded content | No public figures; BuzzFeed reported declining revenue overall before bankruptcy filing (2023) |
| **Yummly** | Affiliate + Instacart integration | No public revenue post-acquisition; effectively inactive as of 2024 |
| **Mealime** | Free + $2.99/mo premium | No public revenue; small independent team |
| **SideChef** | CPG placement + freemium | No public revenue; raised $18M (SoftBank) in 2021 |
| **BigOven** | Ads + $2.99/mo premium | No public revenue figures |

**Honest finding:** No public ARPU data was found for recipe/food apps with affiliate monetization. The sector is dominated by private companies that don't disclose financials.

---

## 5. Risk Flags

| Risk | Severity | Description |
|------|----------|-------------|
| Affiliate commission rate cuts | High | Instacart can reduce rates at any time; no contractual protection at indie developer scale |
| Low recipe-to-order conversion | High | 5–10% conversion is unverified; actual conversion may be 1–3%, dramatically changing break-even math |
| Event pricing too low | High | $5–$15 events likely unprofitable at small scale; needs repricing |
| CPG placement takes time | Medium | CPG brands require audience proof before spending; this revenue stream won't exist at MVP |
| Amazon Fresh non-participation | Medium | Removes a significant portion of the assumed fulfillment partner base |
| Scale required for sustainability | High | All three revenue streams require 10,000s–100,000s of MAU before meaningful revenue; long runway needed |

---

## 6. Source List

| Source | Date | URL |
|--------|------|-----|
| Instacart Docs — Conversions and Payments | 2024–2025 | https://docs.instacart.com/developer_platform_api/guide/concepts/launch_activities/conversions_and_payments/ |
| Progressive Grocer — Instacart Q4 FY24 | Feb 2025 | https://progressivegrocer.com/how-did-instacart-fare-q4-fy24 |
| Business of Apps — Instacart Statistics 2026 | 2025 | https://www.businessofapps.com/data/instacart-statistics/ |
| SideChef — Shoppable Recipe Ads | 2025 | https://www.sidechef.com/business/food-advertising/shoppable-recipe-ads |
| SideChef — In-Recipe Campaigns | 2025 | https://www.sidechef.com/business/food-advertising/in-recipe-campaigns-for-cpg-brands |
| SideChef — Food Marketing 2026 | 2025 | https://www.sidechef.com/business/food-advertising/food-marketing-playbook-2026 |
| Chicory — CPG Brands and Recipes | 2025 | https://chicory.co/blog-feed/how-cpg-brands-can-use-chicorys-shoppable-recipe-solution |
| Chicory — Why Recipes for CPG | 2025 | https://chicory.co/blog-feed/why-recipes-are-the-perfect-strategy-for-cpg-advertising |
| AdAdapted — Recipes Drive Sales | 2024 | https://www.adadapted.com/blog/3-clever-ways-brands-are-using-recipes-to-inspire-and-drive-sales |
| Gourmet Ads — CPG Advertising | 2025 | https://www.gourmetads.com/articles/cpg-advertising/ |
| Thumbtack — Cooking Classes Cost 2024 | 2024 | https://www.thumbtack.com/p/cooking-classes-cost |
| Exactitude Consultancy — Online Cooking Class Market | 2024 | https://exactitudeconsultancy.com/reports/36008/online-cooking-class-market |
| Cognitive Market Research — Recipe Apps 2025 | 2025 | https://www.cognitivemarketresearch.com/recipe-apps-market-report |
| Electroiq — Recipe App Statistics 2025 | 2025 | https://electroiq.com/stats/recipe-app-statistics/ |
| RevenueCat — 2025 App Monetization Trends | 2025 | https://www.revenuecat.com/blog/growth/2025-app-monetization-trends/ |
| Straits Research — Recipe Apps Market | 2025 | https://straitsresearch.com/report/recipe-apps-market |
