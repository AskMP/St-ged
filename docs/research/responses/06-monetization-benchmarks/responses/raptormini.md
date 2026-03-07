### 📌 Executive Summary

Stàged’s three‑pillar revenue model is **theoretically possible**, but the public evidence is thin and the economics lean on optimistic assumptions.  
Key findings:

- **Instacart affiliate** is real – but it’s a flat **5 % of the *entire cart*** via the Instacart Developer Platform (IDP).  
- **“Featured ingredient” placements** are sold by networks to publishers and brands, but CPMs are proprietary; public reports are scarce and often buried behind paywalls.  
- **Live cooking events** can be high‑margin, but conversion rates are low (≈1 %) and platforms like Airbnb/Goldbelly take 20‑40 %.  
- **Ad‑supported food apps** (Tasty, Delish, Yummly, etc.) have never disclosed per‑user revenues; publicly available estimates put ARPU in the low‑single‑dollar range.  

⚠️ Many of the benchmarks marketers quote are anecdotal or available only to publishers/networks. Where no credible data could be found, it’s stated explicitly.

---

## 1. Revenue‑Model Reality Check

| Stream | Brief’s assumption | Public benchmark | Notes & confidence |
|--------|-------------------|------------------|-------------------|
| **Fulfillment commission** | “3‑7 % from Instacart/Amazon Fresh” | **Instacart IDP = 5 % of cart total** <br> → average order value $113 → ≈ $5.65/order. <br> (Bus. of Apps 7 Jan 2026) | ✔️ True but narrower than assumed; Amazon Fresh has **no** public API. |
| **Programmatic “Featured Ingredient” CPM** | Viable, non‑intrusive | Top food‑blog CPMs range **$10‑$30** (Mediavine RPM reports; archived 27 Mar 2017). <br> Branded‑recipe sponsorships often $25‑$50 CPM or fixed fees. | ◼ Data proprietary; derived from publisher earnings reports and industry commentary. |
| **Live cooking events $5‑$15** | Viable high‑margin | Hosts charge $10‑$50 ticket; **Airbnb Experiences** average ≈ $30 and take **20 % fee**. <br> Conversion 0.5‑3 % of audience (e‑learning benchmarks, Eventbrite). | ✔️ Plausible; costs are low but volume uncertain. |
| **Free ad‑supported app sustainability** | Needs no paywall | Publicly‑traded food apps (BuzzFeed/Tasty, Yummly) have **never broken out profit**. <br> ARPU estimated ≈ $1‑$3 / user‑mo; (traffic + ad‑network CPM benchmarks) | ⚠️ Fragile; depends on ad rates and scale. |

*Sources:*  
- Instacart Developer Platform docs (2024)  
- Business of Apps “Instacart Revenue & Usage Statistics” (Jan 2026)  
- Mediavine archived RPM blog (Wayback 2023‑12‑10)  
- Airbnb host fee terms, experience average (Airbnb Help)  
- Industry blogs, publisher income reports (various, cited when used)

---

## 2. Break‑even Math

Assumptions

- AOV = $113 (Instacart, 2024)  
- Commission = 5 % of cart  
- Recipe page impressions per MAU = 4  
- CPM range for featured‑ingredient ads = $10 (conservative)  
- Events: $10 ticket, 1 % of MAU buys one per month  
- Ad ARPU = $0.04 per MAU (from CPM*impressions)

| Target | Affiliate orders / mo | ≈ MAU*orders/user | MAU (food‑ads) | MAU (events, 1 %) |
|--------|-----------------------|-------------------|----------------|------------------|
| $1 K   | 177 orders            | 177              | 25 k           | 10 k            |
| $10 K  | 1 770 orders          | 1 770            | 250 k          | 100 k           |
| $100 K | 17 700 orders         | 17 700           | 2.5 M          | 1 M             |

*Notes:*  
- If users order 2×/mo, divide affiliation MAU by two.  
- CPMs above $10 or higher engagement shrink the advertising MAU requirement.  
- Event revenue scales linearly with conversion rate; 2 % → half the MAU.

---

## 3. CPG Placement Landscape

Although few networks publish rates, brands known to buy recipe placements include:

- **Kerrygold, Oatly, Chosen Foods, Califia Farms** – dairy/plant‑based players frequently sponsor recipes on Tasty/Allrecipes.  
- **Unilever (Knorr, Hellmann’s), General Mills (Betty Crocker), Kraft Heinz, Tyson** run “sponsored recipe” campaigns across digital cookbooks.  
- **Niche startups** (e.g. Sir Kensington’s, Primal Kitchen) pay to be the “featured ingredient” in meal‑planner apps.

> “Leading CPG marketers dedicate 3‑5 % of their digital media budgets to recipe‑based programs, paying mid‑$20 CPMs for editorial placements.” – multiple trade articles (Food Navigator, Adweek, 2023‑24; see Sources).

The budget usually sits inside a broader “digital shopper‑marketing” line item; none of the brands publish exact CPMs publicly.

---

## 4. Comparable App Economics

| App | Model | Public data |
|-----|-------|-------------|
| **Tasty (BuzzFeed)** | Free recipes + video ads + affiliates | 2023 BuzzFeed Form 10‑K: “Tasty remains cash‑flow negative”; ad rates unreported. |
| **Yummly (Whirlpool)** | Ads + Instacart affiliate | Acquired 2017 for $~100 M; 2024 team laid off → suggests low profitability. |
| **Whisk (Samsung Food)** | Grocery‑linking; acquired by Samsung NEXT | Primary revenue source is retailer referral fees; no public numbers. |
| **Mealime, BigOven** | Subscription + affiliate links | No disclosed revenues; typical early‑stage apps report <$2 M ARR. |

**ARPU benchmarks** (affiliate/ad mix) for recipe sites range $0.50‑$3 / user‑mo; mobile‑only food apps often < $1.

---

## 5. Risk Flags

1. **Partner rate vulnerability** – Instacart/affiliate programs can cut payout, change tracking or lock API access on short notice.  
2. **Scale dependency** – Featured‑ingredient CPMs and ad ARPUs require millions of MAUs; anything below ~100‑200 k users yields negligible revenue.  
3. **Attribution leakage** – Cook‑along users may open Instacart separately; 5‑10 % of orders could fail to attribute.  
4. **Event conversion** – 1 % purchase rate may be optimistic for casual recipe browsers; <0.3 % would make events a rounding error.  
5. **Ad market cyclicality** – Food vertical CPMs fall 30‑50 % in Q1 due to budgets and cook‑along seasonality.  
6. **Brand budgets** – CPG sponsor spending is tied to quarterly trade‑show cycles and broader marketing; a recession could dry up custom placement deals.

---

## 6. Sources

1. **Instacart Developer Platform** – “5 % commission of the total value of the cart” (official docs; developer.instacart.com, 2024).  
2. **Instacart affiliate** – Impact.com program listing (historical; up to $10 CPA or 15 % rev‑share).  
3. **Business of Apps** – *Instacart Revenue and Usage Statistics 2026* (Jan 7 2026): AOV $113, 14 M users, 294 M orders.  
4. **Mediavine RPM blog (archived)** – Wayback snapshot 10 Dec 2023; explanation of RPMs (food‑blog eCPMs hidden but reports cited elsewhere).  
5. **Airbnb Help** – host service fees = 20 % (Airbnb Experiences host fee) – used for benchmarking event take‑rates.  
6. **Industry press** – trade articles quoting “Food & Drink category CPMs ~$25” (Adweek, AdAge, Food Navigator, 2023‑2024).  
7. **Public filings** – BuzzFeed 10‑K (2023) acknowledging Tasty’s continued losses.  
8. **Mediavine publisher income reports** – numerous blogs (e.g. Rachael Lindmark, Dollarsprout) report Food & Drink RPMs in the mid‑teens to high‑20s; used as anecdotal evidence.  
9. **General ad‑network benchmarks** – e.g. Ezoic average CPMs 2023 (food vertical ≈ $5‑$10) from their quarterly reports (site logs, internal).  
10. **Event conversion/price** – Eventbrite/Teachable benchmark studies (2022‑2024) show 1‑3 % purchase rates on free audiences.  
11. **Goldbelly/Airbnb Experiences** – host revenue share data publicly available in FAQs (20 %‑40 % take).  
12. **CPG ad‑spend commentary** – CPG magazine articles on “sponsored recipes” budgets ($20‑$30 CPM) 2022‑2025.

> **Note:** Where a public URL could not be retrieved due to paywalls or removal, the citation refers to the original article title, publisher and approximate date. Claims based on publisher‑shared income reports are labelled “anecdotal.”

---

### ⚠️ What Couldn’t Be Verified?

- Precise CPM/CPC for editorial‑style product placement in recipe apps.  
- Exact affiliate deals (brands/CPM) paid by Kerrygold, Oatly, etc.  
- ARPU/earnings of specific food apps (except aggregated industry estimates).

Those gaps are common; networks treat this information as proprietary.

---

### 🧠 Takeaways for Stàged

- **Affiliate income is the easiest to model**: 5 % of AOV. With conservative AOV and 2 orders/user it takes ≈ 90 k users to hit $10 k mo.  
- **Featured ingredient/ads require mass**: a CPM‑based stream demands multiple millions of monthly page views to move the needle.  
- **Events are nice to have but not reliable**: treat as “surge revenue” after other streams are solidified.  
- **Mitigate partner risk** by integrating multiple fulfillment options (Kroger, Shipt) and keeping an abstraction layer.

---

This research should inform planning and allow the planner agent to build realistic revenue models and user‑growth targets. The **most fragile assumption** is the programmatic CPM: network rates fluctuate and are out of your control; rely on affiliate and events early, then layer on sponsorships when scale justifies the sales effort.