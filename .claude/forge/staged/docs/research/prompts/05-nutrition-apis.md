# Research Prompt 05 — Nutrition Data APIs
**Platform:** GitHub Copilot (primary) | ChatGPT | Claude, BigPickle, Raptor Mini, MiniMax, Grok (cross-check)
**Topic:** Edamam vs. USDA FoodData Central — accuracy, cost, rate limits, commercial ToS

---

## Project Context

Stàged displays per-recipe nutritional information (macros: protein, carbs, fat; calories per serving). The business brief identifies two candidates: Edamam API and USDA FoodData Central. Nutritional Intelligence is an MVP feature. Data must be accurate enough to support: (a) training-block macro planning (Nadia persona, precision user), (b) general family nutrition awareness (Linda persona), and (c) potentially macro target tracking in Phase 3.

The product is free-to-use with affiliate monetization — the nutrition data tier needs to be either free/cheap at scale or priced in a way that doesn't require per-user charging.

---

## Claims to Verify

1. Edamam API provides accurate recipe nutritional analysis from ingredient lists
2. USDA FoodData Central is free and usable for commercial products
3. These are the best two options for recipe-level nutritional data in 2025–2026
4. AI-based nutritional estimation is a viable fallback when API data is missing

---

## Research Questions

1. What are Edamam's current pricing tiers for the Recipe Analysis API — free tier limits, commercial tier costs, rate limits per month?
2. What is Edamam's accuracy rate for recipe nutritional analysis vs. lab-tested values? Are there published comparisons?
3. What are USDA FoodData Central's API terms for commercial use — is it free to use commercially without attribution requirements or usage caps?
4. How does USDA FoodData Central handle multi-ingredient recipe analysis vs. single-ingredient lookup? Is there a recipe analysis endpoint?
5. What are the main alternatives to Edamam and USDA in 2025: Open Food Facts API, Nutritionix, Spoonacular, Cronometer API — how do they compare on accuracy, price, and rate limits?
6. How accurate is LLM-based (GPT-4o, Claude) nutritional estimation for recipes compared to API-sourced data — are there benchmarks?
7. What are the data freshness/accuracy issues with USDA FoodData Central — how often is it updated, and how well does it cover packaged/branded foods vs. whole ingredients?
8. What are the ToS restrictions on Edamam data — can nutritional data be stored in a database, displayed to end users, cached per recipe?
9. What is Spoonacular's pricing and accuracy profile in 2025 — is it a viable alternative to Edamam?
10. For a PWA with offline-first architecture, can nutritional data be pre-computed and cached, or does it require a fresh API call per recipe view?

---

## Output Format

1. **API comparison table** — Edamam, USDA, Spoonacular, Nutritionix, Open Food Facts: accuracy, price, rate limits, ToS
2. **Commercial use verdict** — which APIs are viable for a free consumer product at scale
3. **AI estimation assessment** — accuracy vs. cost trade-off for using LLM as fallback
4. **Caching strategy** — can nutrition data be stored per recipe to reduce API calls
5. **Recommended approach** — primary API + fallback recommendation with rationale
6. **Source list** — API documentation pages, published accuracy studies, pricing pages, dated

---

## Research Standards

- Prefer primary sources first: official docs, earnings releases, API docs, legal text, platform policies, and first-party pricing pages.
- Separate sourced facts from inference. If you calculate or extrapolate a number, label it clearly as an inference.
- Include exact dates for time-sensitive claims and use current data where available.
- For every material claim, provide a URL or a formal citation.
- If a claim cannot be verified from credible public sources, say that explicitly instead of filling the gap with plausible language.
- If sources conflict, show the range and explain why the estimates may differ.
- Do not repeat assumptions from the brief unless they were independently verified in this research pass.
