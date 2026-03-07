# Prompt 06 - Monetization Benchmarks (Food/Recipe App)
**Date:** 2026-03-06  
**Scope:** Featured ingredient placement CPM/CPC, grocery affiliate economics, live culinary events economics.

## Method and Evidence Standard
- I separated `Confirmed` facts (directly in sources) from `Inference` (modeled assumptions).
- I prioritized first-party disclosures (investor filings, official fee pages, platform docs).
- Where data could not be verified from public/first-party materials, I label it `Unverifiable`.

---

## 1) Revenue Model Reality Check

### Stream A: Fulfillment commissions (Instacart/Amazon Fresh affiliate)
**Confirmed**
- Instacart reported 2024 GTV of **$33,461M** on **294.0M orders** and Q4'24 AOV of **$112**. [S2]
- Instacart reported 2025 GTV of **$37,224M** on **338.8M orders** and “average order values of approximately **$110**”. [S3]
- Amazon Associates lists **Amazon Fresh/Grocery commission at 1.00%** (US rate card). [S1]
- One public network listing shows Instacart affiliate payout of **$1.60 per activation** and **7-day cookie** (FlexOffers listing, not Instacart first-party payout table). [S12]

**Inference**
- AOV implied from full-year Instacart totals:
  - 2024: $33,461M / 294.0M = **$113.81**
  - 2025: $37,224M / 338.8M = **$109.87**
- Your 3-7% assumption implies **$3.30-$7.70 gross commission per converted $110 order**.
- This is materially above Amazon Fresh’s published 1% standard affiliate rate; 3-7% likely requires private/deeper partnership structures, not baseline affiliate terms.

**Confidence:** `Medium` (AOV high confidence; external-app commission capture low visibility)

---

### Stream B: Programmatic featured ingredient placement in recipes
**Confirmed**
- Instacart’s ad business is large and growing: **$1,065M Advertising & other revenue in 2025**; **9,000+ active brands advertising in Q4 2025**; mentions of **recipe ads** and in-store shoppable displays. [S3]
- Chicory case evidence for recipe-context CPG placement:
  - Organic spice campaign: **4.95x iROAS**. [S10]
  - Easter brunch co-branded campaign: **$486.2K attributable sales**, **9.8x ROAS**, **30% new/lapsed shopper purchasing households**. [S11]
  - Case studies page also highlights Bob’s Red Mill with **66% ATC rate** in a Hearst partnership summary. [S9]
- Food & Beverage paid-search benchmark CPC (agency dataset): **$0.72 median CPC** (2025 benchmark post). [S14]
- Taboola CPC explainer reports broad search CPC ranges around **$1-$2** (general, not food-specific). [S13]

**Inference**
- For editorial/native-style ingredient placements, practical pricing is often performance-linked (CPC/ROAS commitments) rather than pure display CPM.
- Reasonable working range for modeled effective CPM (`eCPM`) in contextual recipe placements: **$8-$25** (derived from CPC + CTR assumptions, not directly published as a single benchmark for this niche).

**Confidence:** `Medium-Low` (strong directional evidence, weak standardized public CPM benchmark for this exact format)

---

### Stream C: Stàge Events ($5-$15 ticket)
**Confirmed**
- Airbnb fee policy:
  - “For experience reservations, we typically charge a **20% service fee**.” [S6]
  - Host-facing Experiences page repeats “Airbnb automatically deducts a **20% service fee** from payout.” [S7]
- Eventbrite public fee benchmark (US): **3.7% + $1.79 per paid ticket** plus **2.9% payment processing per order** (unless organizer absorbs differently). [S8]
- Market price anchors for online cooking classes are often far above $5-$15:
  - Cozymeal examples commonly **$29-$49+ per person**. [S18]
  - Classpop examples commonly **~$33.99-$53.99** including fees. [S19]

**Inference**
- $5-$15 entry pricing is budget-tier versus current mainstream online cooking class marketplaces.
- To keep margin at those ticket prices, instructor compensation and production costs must be tightly controlled (or subsidized by sponsorships).

**Confidence:** `High` on platform fee benchmarks; `Medium` on profitability implications.

---

## 2) Break-Even Math (MAU needed for $1K/$10K/$100K MRR)

## Assumptions used for modeling
- Affiliate AOV baseline: **$110/order** (Instacart 2025 context). [S3]
- Featured-ingredient model uses ad impressions from recipe views:
  - `Impressions/MAU = recipe views per MAU * ad slots`
- Event model baseline:
  - Ticket = **$10**
  - Net after fees approximation (Airbnb/Eventbrite-like) = **$7.84**
  - Instructor payout = **$5.00** (50% of gross)
  - Contribution per attendee = **$2.84**

All conversion rates below are `Inference` (public app-specific conversion benchmarks are largely unavailable).

### A) Affiliate commissions MAU model
Formula:  
`Revenue per MAU = monthly attributed order conversion * AOV * commission rate`

- **Low case:** 1% conversion, 3% commission => `$0.033 / MAU / mo`
- **Base case:** 3% conversion, 5% commission => `$0.165 / MAU / mo`
- **High case:** 5% conversion, 7% commission => `$0.385 / MAU / mo`

| Target MRR | Low MAU | Base MAU | High MAU |
|---|---:|---:|---:|
| $1K | 30,303 | 6,061 | 2,597 |
| $10K | 303,030 | 60,606 | 25,974 |
| $100K | 3,030,303 | 606,061 | 259,740 |

### B) Featured ingredient placement MAU model
Formula:  
`Revenue per MAU = (impressions per MAU / 1000) * eCPM * fill rate`

- **Low case:** 6 impressions, $8 eCPM, 60% fill => `$0.0288 / MAU / mo`
- **Base case:** 8 impressions, $12 eCPM, 70% fill => `$0.0672 / MAU / mo`
- **High case:** 12 impressions, $25 eCPM, 85% fill => `$0.255 / MAU / mo`

| Target MRR | Low MAU | Base MAU | High MAU |
|---|---:|---:|---:|
| $1K | 34,722 | 14,881 | 3,922 |
| $10K | 347,222 | 148,810 | 39,216 |
| $100K | 3,472,222 | 1,488,095 | 392,157 |

### C) Live event MAU model
Contribution per attendee baseline: **$2.84**

Attendees needed:
- $1K => **352**
- $10K => **3,521**
- $100K => **35,211**

MAU needed by monthly paid-event conversion:

- **Low conversion:** 0.2%
- **Base conversion:** 0.5%
- **High conversion:** 2.0%

| Target MRR | Low MAU (0.2%) | Base MAU (0.5%) | High MAU (2.0%) |
|---|---:|---:|---:|
| $1K | 176,056 | 70,423 | 17,606 |
| $10K | 1,760,563 | 704,225 | 176,056 |
| $100K | 17,605,634 | 7,042,254 | 1,760,563 |

---

## 3) CPG Placement Landscape (2025)

**Confirmed channel signals**
- Instacart is a major retail-media buyer/seller channel with >$1B annual ad+other revenue and 9,000+ active brands in Q4. [S3]
- Instacart explicitly references **recipe ads** and omnichannel ad surfaces (including in-store shoppable displays). [S3]
- Chicory demonstrates recipe-context shoppable placements with measurable ROAS and attributed sales outcomes. [S10][S11]
- Named brands/partners visible in Chicory materials include Bob’s Red Mill (explicit case summary) and testimonial visuals such as General Mills/Primal Kitchen/Alaska Seafood. [S9]

**Unverifiable**
- Specific 2025 budget allocations for named brands like Kerrygold, Chosen Foods, Oatly in recipe-app placements were not found in public first-party disclosures.

**Confidence:** `Medium`

---

## 4) Comparable App Economics

### Publicly disclosed comps
- **BuzzFeed (includes Tasty brand in portfolio):**
  - 2024 revenue mix:
    - Advertising: **$94.4M**
    - Content: **$33.9M**
    - Commerce & other: **$61.7M**
    - Total: **$189.9M** (down 18% YoY)
  - Net loss from continuing operations: **$34.0M**. [S16]
  - Affiliate concentration risk disclosed: ~**30% of total revenue derived from Amazon** (primarily affiliate commerce transactions). [S16]
- This is important: large-scale ad + affiliate mix can still be margin-fragile without scale and diversified demand.

### Food app-specific disclosures
- **Whisk/Samsung Food, BigOven, Mealime, Yummly** app-level affiliate economics are mostly private.
- BigOven publicly exposes monetization surfaces (`Pro`, `Advertise`, `For Brands`) but not revenue figures. [S17]
- Segment-level revenue/profitability for Tasty alone is `Unverifiable` from public filings (reported at BuzzFeed consolidated level).

**Confidence:** `Medium` on public-company comp, `Low` on private app earnings precision.

---

## 5) Risk Flags (Fragile Assumptions)

1. **Commission-rate risk:** 3-7% grocery affiliate may not hold under standard affiliate programs; Amazon Fresh baseline is 1%. [S1]  
2. **Attribution risk:** last-click and cookie windows can materially reduce realized affiliate revenue versus modeled intent. (FlexOffers shows 7-day cookie in one Instacart listing). [S12]  
3. **Demand concentration risk:** affiliate-heavy models can over-rely on a few large partners; BuzzFeed explicitly flags Amazon concentration. [S16]  
4. **CPG budget cyclicality:** recipe-integrated spend is sensitive to CPG/retail-media budgets and macro demand; standardized public CPM data for this exact format is sparse. [S3][S10][S11]  
5. **Event margin risk at low ticket prices:** at $5-$15, platform fees plus instructor costs leave thin contribution unless attendance conversion is strong or sponsorship offsets costs. [S6][S8][S18][S19]  
6. **Data opacity risk:** many target comparables (Whisk/Mealime/BigOven/Yummly) do not publish affiliate ARPU or MAU-to-revenue funnels.

---

## Major Conclusions With Confidence

- **Conclusion A:** Grocery affiliate can work, but meaningful revenue likely needs at least **tens of thousands of MAU** unless conversion is unusually high.  
  **Confidence:** `Medium-High`

- **Conclusion B:** Featured ingredient placements are plausible and potentially attractive, but economics depend on securing CPG demand and measurable performance outcomes (ROAS/sales lift), not just impressions sold.  
  **Confidence:** `Medium`

- **Conclusion C:** Live events at $5-$15 are likely the hardest stream to scale efficiently without strong conversion, repeat attendance, and low instructor/platform cost load.  
  **Confidence:** `Medium-High`

- **Conclusion D:** “Free app, no subscription” is viable only with disciplined partner economics and scale; ad/affiliate models can remain unprofitable at sizable revenue without cost control and concentration risk management.  
  **Confidence:** `Medium` (supported by BuzzFeed public comp, but not recipe-app pure play)

---

## 6) Source List (dated, with trust level)

- **[S1] Amazon Associates Standard Commission Income Statement** (first-party, high)  
  https://affiliate-program.amazon.com/help/node/topic/GRXPHT8U84RAYDXZ  
  Accessed: 2026-03-06

- **[S2] Instacart Q4/FY2024 Shareholder Letter (PDF)** (first-party, high)  
  https://investors.instacart.com/static-files/27fac1c6-da32-40ca-8ef4-c8261b5ee12b  
  Accessed: 2026-03-06

- **[S3] Instacart Q4/FY2025 Shareholder Letter (PDF)** (first-party, high)  
  https://investors.instacart.com/static-files/8a93ec81-cbef-4c62-9817-9ed532089aa3  
  Accessed: 2026-03-06

- **[S4] Instacart Quarterly Results Index** (first-party, high)  
  https://investors.instacart.com/financials-filings/quarterly-results  
  Accessed: 2026-03-06

- **[S5] Instacart SEC Filings Index** (first-party, high)  
  https://investors.instacart.com/financials-filings/sec-filings  
  Accessed: 2026-03-06

- **[S6] Airbnb Service Fees (help article)** (first-party, high)  
  https://www.airbnb.ca/help/article/1857  
  Accessed: 2026-03-06

- **[S7] Airbnb Host Experiences page** (first-party, high)  
  https://www.airbnb.com/host/experiences  
  Accessed: 2026-03-06

- **[S8] Eventbrite Organizer Pricing** (first-party, high)  
  https://www.eventbrite.com/organizer/pricing/  
  Accessed: 2026-03-06

- **[S9] Chicory Case Studies page** (company case-study source, medium)  
  https://www.chicory.co/case-studies  
  Accessed: 2026-03-06

- **[S10] Chicory case study: Organic Spice Brand** (company case-study source, medium)  
  https://chicory.co/case-studies-library/organic-spice-brand-promotes-premium-spices-and-herbs  
  Accessed: 2026-03-06

- **[S11] Chicory case study: Easter Brunch Pear-ing** (company case-study source, medium)  
  https://chicory.co/case-studies-library/baking-up-the-perfect-easter-brunch  
  Accessed: 2026-03-06

- **[S12] FlexOffers Instacart Affiliate Program listing** (affiliate-network listing, medium-low)  
  https://www.flexoffers.com/affiliate-programs/instacart-affiliate-program/  
  Accessed: 2026-03-06

- **[S13] Taboola CPC explainer** (platform educational content, medium-low)  
  https://www.taboola.com/marketing-hub/cost-per-click/  
  Accessed: 2026-03-06

- **[S14] AgencyAnalytics Google Ads Benchmarks 2025** (vendor benchmark dataset, medium)  
  https://agencyanalytics.com/blog/google-ads-benchmarks  
  Accessed: 2026-03-06

- **[S15] BuzzFeed 10-K filing details page** (first-party investor portal, high)  
  https://investors.buzzfeed.com/sec-filings/sec-filing/10-k/0001828972-25-000073  
  Accessed: 2026-03-06

- **[S16] BuzzFeed 2024 10-K PDF** (first-party filing PDF, high)  
  https://investors.buzzfeed.com/static-files/14562bff-a582-4310-83c3-9e4562b85079  
  Accessed: 2026-03-06

- **[S17] BigOven homepage (monetization surfaces visible)** (first-party, medium)  
  https://www.bigoven.com/  
  Accessed: 2026-03-06

- **[S18] Cozymeal online cooking classes pricing examples** (first-party marketplace, medium)  
  https://www.cozymeal.com/online-cooking-classes  
  Accessed: 2026-03-06

- **[S19] Classpop online cooking classes pricing examples** (first-party marketplace, medium)  
  https://www.classpop.com/online/cooking-classes  
  Accessed: 2026-03-06

- **[S20] Goldbelly public homepage (no public take-rate disclosure located)** (first-party, medium)  
  https://www.goldbelly.com/  
  Accessed: 2026-03-06

---

## Explicit Unverifiable Items
- Public, app-specific realized Instacart affiliate commission rates for Whisk/BigOven/Yummly/Mealime.
- Public ARPU for private recipe apps specifically attributable to grocery affiliate links.
- Public 2025 line-item budget allocations from Kerrygold/Chosen Foods/Oatly specifically to recipe-integrated placements.
- Public Goldbelly platform take rate for culinary events/hosts.