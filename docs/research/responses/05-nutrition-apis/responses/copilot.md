## 1. API comparison table (Edamam, USDA, Spoonacular, Nutritionix, Open Food Facts)

| API | Recipe-level capability | Accuracy evidence | Price (2025-2026 public pages) | Rate limits / quotas | Commercial ToS & caching constraints |
|---|---|---|---|---|---|
| **Edamam Nutrition Analysis API** | Yes: full recipe nutrition from ingredient lists (`/api/nutrition-details`) with NLP parsing. [S1][S2] | **Unverifiable** for lab-validated % accuracy on public docs. Edamam states quality gating (e.g., 555 “low quality” error) and accuracy intent, but no published lab-comparison rate on first-party pages. [S3][S4] | Enterprise Basic Multilingual: **$29/mo**; Enterprise Core Multilingual: **$299/mo**; Enterprise Unlimited: custom. [S2] | Basic: **2,500 full recipes/month**, **50 recipe submissions/min**. Core: **50,000/month**, **150/min**. [S2] | Free version is non-commercial. Basic plan comparison table marks commercial use = no; Core/Unlimited = yes. [S2][S4] Strong storage limits: “data cannot be stored unless explicitly permitted”; Basic: no caching; Core: only protein/net carbs/fat/kcal caching while subscription active; cancellation requires returning/deleting nutritional info. [S2][S3][S4] |
| **USDA FoodData Central (FDC)** | No dedicated recipe-analysis endpoint; food search/details endpoints only. Recipe totals must be computed app-side by aggregating ingredient foods. [S5][S6][S7] | High-confidence ingredient data provenance by data type; no single “recipe accuracy %” published. Update cadence explicit by data source. [S8][S9] | **Free** (public domain, CC0). [S5] | Default **1,000 requests/hour/IP**; API key required. [S5] | Public domain/CC0; no permission needed. USDA requests citation attribution as best practice. [S5] |
| **Spoonacular Food API** | Yes: recipe nutrition endpoints (`Analyze Recipe`, `Nutrition by ID`, etc.). [S10] | First-party disclaimer says nutrition is automatically calculated and may contain errors; users should show disclaimers. Independent published benchmark vs lab values not found in first-party docs reviewed. [S11][S12] | Free: **$0**, 50 points/day. Paid: Cook $29/mo, Culinarian $79/mo, Chef $149/mo (+ overage pricing by point). [S12] | Free: **1 req/s**, 2 concurrent, 50 points/day; paid tiers increase RPS and daily points. [S12] | Commercial allowed by subscription, but strict data controls: no scraping/copying/storage beyond permitted cache; cache max **1 hour** with permission; must delete all obtained data if access ends. Source attribution required. [S11][S12] |
| **Nutritionix API** | NLP and food analysis endpoints available. [S13] | First-party claims “dietitian verified” and >92% UPC match; independent recipe-level lab accuracy rate not provided on pages reviewed. [S14][S15] | Public pricing page: Free business trial (up to 2 MAU), Starter **$499/mo**, MVP **$999/mo**, Unicorn starts **$1850/mo**; billed annually. [S15] | Public page emphasizes MAU-based plans; no clear request-per-second cap published on reviewed pricing/docs pages. [S13][S15] | Attribution required on most tiers. Caching shown as disallowed on lower tiers, allowed on MVP/Unicorn. [S15] |
| **Open Food Facts (OFF)** | Primarily product database, not dedicated recipe-analysis API. [S16] | OFF explicitly states data is user-contributed and there are **no assurances** of accuracy/completeness/reliability. [S16] | Free/open data (ODbL + DbCL; images CC BY-SA). [S16][S17] | Public limits: **100 req/min** product reads, **10 req/min** search, **2 req/min** facet queries. [S16] | Commercial reuse possible under open-data licenses, but attribution/compliance obligations apply; local caching is supported and documented, with ODbL obligations and share-back expectations. [S17][S18] |

## 2. Commercial use verdict (which APIs viable for free consumer product at scale)

### Verified facts
- **USDA FDC is the clearest commercial-safe free backbone** for ingredient-level nutrition: CC0/public domain, explicit API limits, stable government dataset governance. [S5][S8][S9]
- **Edamam is not “free-commercial”** on public terms: free usage is non-commercial; commercial plans are paid and include strict storage/reuse constraints. [S2][S4]
- **Spoonacular has workable commercial plans but restrictive data retention** (1-hour cache and delete-on-termination language), which is hard for offline-first persistent nutrition features. [S11][S12]
- **Nutritionix is commercial and feature-rich but comparatively expensive and plan-gated**, with annual billing and MAU constraints. [S15]
- **Open Food Facts is free and commercially reusable under ODbL-family terms**, but quality variability and product-centric scope make it weaker as a sole recipe-analysis source. [S16][S17]

### Assumption test
- **Assumption 1 (Edamam accurate recipe analysis):** **Partially supported** for functionality, **unverifiable** for published lab-validated accuracy rate.
- **Assumption 2 (USDA free + commercial usable):** **Supported**.
- **Assumption 3 (best two options are Edamam + USDA):** **Conditionally supported**:
  - For recipe NLP + commercial production: USDA + Edamam paid plan is plausible.
  - For strictly free-at-scale: USDA + OFF (or USDA-only) is more defensible.
- **Assumption 4 (AI fallback viable):** **Supported only as bounded fallback**, not primary truth source.

### Confidence
- **USDA as free/commercial core:** **High**
- **Edamam free-commercial infeasibility:** **High**
- **“Best two” claim (context-dependent):** **Medium**

## 3. AI estimation assessment (accuracy vs cost trade-off for LLM fallback)

### Verified facts
- Meal-photo nutrient estimation with ChatGPT-4 showed strong food identification precision (93%) but poor nutrient agreement for many nutrients: poor agreement for **10/16 nutrients**, >10% difference for **13/16**, often underestimation. [S19]
- Direct carbohydrate-counting comparison (dietitians vs ChatGPT/Gemini/Claude) in T1D meals:
  - Dietitians MAE: **13 ± 10 g**
  - ChatGPT: **20 ± 18 g**
  - Claude: **23 ± 21 g**
  - Gemini: **28 ± 26 g**
  - Large overestimation (>=+20 g): dietitians 3%, ChatGPT 13%, Claude 17%, Gemini 38%. [S20]
- Broader LLM nutrition Q&A studies show model variability and moderate/inconsistent accuracy depending on prompt and domain. [S21]
- Domain-specialized food LLMs can outperform general-purpose LLMs on recipe nutrient estimation tasks in research settings. [S22]

### Interpretation (recommendation)
- Use LLMs only for **fallback estimates with explicit uncertainty labels**, not as authoritative nutrition.
- Prefer deterministic API/db computation (USDA-based) whenever possible.
- Cost side is provider/model/token dependent and not standardized in cited studies, so exact cost-benefit is **unverifiable** here.

### Confidence
- **LLM as fallback only:** **High**
- **Exact cost-efficiency ranking of GPT-4o vs Claude for this use case:** **Low (pricing not established in cited sources)**

## 4. Caching strategy (can nutrition data be stored per recipe to reduce API calls)

### Verified facts by provider
- **Edamam:** storage restricted unless explicitly allowed by plan; Basic no caching; Core limited nutrient caching only; attribution required; cancellation implies removing nutrition data. [S2][S3][S4]
- **USDA:** CC0/public-domain data allows local storage, precomputation, and offline use (subject to your infrastructure). [S5]
- **Spoonacular:** cache max 1 hour for user-requested data; must refresh after 1 hour; must delete all data when API use ends/suspended. [S11][S12]
- **Nutritionix:** caching entitlement depends on tier (shown as disallowed on lower plans, allowed on higher). [S15]
- **Open Food Facts:** local caching is explicitly documented/encouraged for heavy use, with ODbL compliance obligations. [S18][S17]

### Practical offline-first answer
- **Yes, precompute and persist nutrition per recipe** is feasible with USDA (and OFF with license compliance).
- **No, persistent long-term cache is generally incompatible** with Spoonacular and many Edamam lower-tier terms unless you negotiate proper data licensing.

### Confidence
- **USDA/OFF cache feasibility:** **High**
- **Edamam/Spoonacular persistent cache constraints:** **High**

## 5. Recommended approach (primary API + fallback with rationale)

### Recommendation
1. **Primary computation layer: USDA FDC**
   - Build deterministic ingredient parser + canonical ingredient mapping to FDC IDs.
   - Compute recipe totals/serving nutrition in your backend.
   - Persist per-recipe snapshots for offline-first PWA.
2. **Coverage booster: Open Food Facts (optional)**
   - Use for branded/packaged gaps where USDA misses entries.
   - Keep strict data-quality flags and provenance labels.
3. **NLP convenience (optional paid upgrade): Edamam Core or custom enterprise**
   - Only if you need robust ingredient-line NLP and can accept ToS/data-retention constraints.
4. **AI fallback policy**
   - Use LLM only when deterministic lookup fails.
   - Label output as estimate, require user confirmation, and store confidence/provenance.

### Why this stack
- Maximizes legal simplicity and cacheability for a free consumer app.
- Minimizes recurring API cost and quota fragility.
- Keeps LLM risk bounded to non-authoritative fallback.

### Confidence
- **Recommended architecture for free consumer PWA:** **High**

## 6. Source list (API docs, published studies, pricing pages, dated)

- **[S1]** Edamam Nutrition Analysis API docs: https://developer.edamam.com/edamam-docs-nutrition-api (accessed 2026-03-06, first-party)
- **[S2]** Edamam Nutrition Analysis API pricing/comparison: https://developer.edamam.com/edamam-nutrition-api (accessed 2026-03-06, first-party)
- **[S3]** Edamam API Terms of Use: https://www.edamam.com/terms/api/ (accessed 2026-03-06, first-party)
- **[S4]** Edamam API FAQ: https://developer.edamam.com/api/faq (accessed 2026-03-06, first-party)
- **[S5]** USDA FoodData Central API Guide (rate limits, licensing): https://fdc.nal.usda.gov/api-guide (accessed 2026-03-06, first-party)
- **[S6]** USDA FDC OpenAPI HTML (endpoint scope): https://fdc.nal.usda.gov/api-spec/fdc_api.html (accessed 2026-03-06, first-party)
- **[S7]** USDA FDC JSON OpenAPI spec: https://api.nal.usda.gov/fdc/v1/json-spec?api_key=DEMO_KEY (accessed 2026-03-06, first-party)
- **[S8]** USDA data documentation (data types, update frequency): https://fdc.nal.usda.gov/data-documentation (accessed 2026-03-06, first-party)
- **[S9]** USDA dataset downloads/release history: https://fdc.nal.usda.gov/download-datasets (accessed 2026-03-06, first-party)
- **[S10]** Spoonacular API docs (nutrition/recipe endpoints): https://spoonacular.com/food-api/docs (accessed 2026-03-06, first-party)
- **[S11]** Spoonacular Terms: https://spoonacular.com/food-api/terms (accessed 2026-03-06, first-party)
- **[S12]** Spoonacular pricing + quota FAQ: https://spoonacular.com/food-api/pricing (accessed 2026-03-06, first-party)
- **[S13]** Nutritionix developer docs v2: https://developer.nutritionix.com/docs/v2 (accessed 2026-03-06, first-party)
- **[S14]** Nutritionix API overview page: https://www.nutritionix.com/api (accessed 2026-03-06, first-party)
- **[S15]** Nutritionix business/API pricing page: https://www.nutritionix.com/api (same page section, accessed 2026-03-06, first-party)
- **[S16]** Open Food Facts API introduction + limits + data quality disclaimer: https://openfoodfacts.github.io/openfoodfacts-server/api/ (accessed 2026-03-06, first-party)
- **[S17]** Open Food Facts licensing compliance tutorial: https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/license-be-on-the-legal-side/ (accessed 2026-03-06, first-party)
- **[S18]** Open Food Facts local caching tutorial: https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/creating-a-local-cache-of-open-food-facts-data/ (accessed 2026-03-06, first-party)
- **[S19]** O’Hara et al., *An Evaluation of ChatGPT for Nutrient Content Estimation from Meal Photographs* (Nutrients, 2025): https://pubmed.ncbi.nlm.nih.gov/40004936/ (accessed 2026-03-06, peer-reviewed)
- **[S20]** Goncalves et al., *Chat, Gemini and Claude at the dinner table* (Diabetes Res Clin Pract, 2026): https://pubmed.ncbi.nlm.nih.gov/41314475/ (accessed 2026-03-06, peer-reviewed)
- **[S21]** Solomon & Laye, *Sports nutrition knowledge of LLM chatbots* (PLOS ONE, 2025): https://pubmed.ncbi.nlm.nih.gov/40512755/ (accessed 2026-03-06, peer-reviewed)
- **[S22]** Gjorgjevikj et al., *Large language models in food and nutrition science: FoodyLLM* (Curr Res Food Sci, 2026): https://pubmed.ncbi.nlm.nih.gov/41737890/ (accessed 2026-03-06, peer-reviewed)