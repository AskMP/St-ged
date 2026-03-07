# ChatGPT Research Response — Nutrition Data APIs
Research date: March 6, 2026

## API comparison table

| API / source | Recipe-level nutrition analysis | Price / access | Rate limits / usage limits | Commercial / caching notes | Verdict |
| --- | --- | --- | --- | --- | --- |
| Edamam Nutrition Analysis API | Yes. Official docs support real-time analysis from ingredient text and describe recipe-specific processing adjustments. | Public pricing was not clearly exposed in the currently accessible docs I reviewed. Treat pricing as opaque until confirmed with Edamam sales or current plan docs. | Not clearly documented in the source set I reviewed. | Docs discuss ETag-based reprocessing, but public storage/display permissions were not fully transparent in this pass. | Strong off-the-shelf analysis option, but business viability depends on contract terms and pricing that were not transparent enough publicly. |
| USDA FoodData Central | No turnkey recipe-analysis endpoint. Strong ingredient and branded-food lookup data. | Free with a `data.gov` API key. | Default limit `1,000 requests/hour/IP`. | USDA says FoodData Central data is public domain under `CC0 1.0`. This is the cleanest commercial-rights posture in the set. | Best low-cost source of truth for ingredients, but you must build your own recipe parser / aggregator. |
| Spoonacular | Yes. Broad recipe and food API surface. | Public plans shown at `$0`, `$29`, `$79`, `$149`, and enterprise. | Quota depends on plan; free tier returns `402` when exhausted. | Public pricing page says user-requested data may be cached for only `1 hour` before refresh. That is a major constraint for offline-first apps. | Fastest MVP option with transparent pricing, but caching terms conflict with durable offline storage. |
| Nutritionix | Yes for food/nutrition workflows, but access is now sales-led. | No public free tier now; trial/commercial access goes through sales contact. | Not publicly detailed in the docs reviewed. | Commercial access exists, but the open/self-serve posture is weaker than USDA or Spoonacular. | Enterprise-style option, not ideal for a low-cost consumer MVP. |
| Open Food Facts | No turnkey recipe analysis. Strong complementary ingredient / packaged-food dataset. | Free and open. Full dumps available nightly. | API exists, but the project warns against heavy scraping because dumps are available. | Data and database are open, but the licensing stack is more complex than USDA because it mixes ODbL, database-content terms, and image licensing. | Good adjunct dataset, not a complete recipe-analysis engine. |

## Commercial use verdict

1. Best low-cost commercial foundation: `USDA FoodData Central`
   - Cleanest licensing position in this pass.
   - Best fit if Staged is willing to build parsing, unit normalization, and serving-size logic.

2. Best off-the-shelf recipe-analysis option: `Edamam`
   - Most direct match to "paste ingredients, get recipe macros."
   - Biggest risk is pricing and storage/display rights opacity in public materials.

3. Fastest prototyping option with transparent pricing: `Spoonacular`
   - Easy to evaluate and integrate.
   - Hard mismatch with offline-first caching because of the `1-hour` storage limit.

4. Adjunct data sources: `Open Food Facts` and `Nutritionix`
   - Open Food Facts helps with packaged-food enrichment.
   - Nutritionix looks more enterprise/sales-oriented than startup-self-serve.

## AI estimation assessment

1. I did not find a strong, current benchmark showing that LLM-only nutrition estimation is reliable enough to replace a structured nutrition database for recipe macros.
2. The safer use of AI is upstream of the nutrition engine:
   - ingredient parsing
   - unit normalization suggestions
   - ambiguity detection
   - flagging when a human or API retry is needed
3. Recommendation: do not use an LLM as the primary source of calories/macros for user-facing nutrition claims unless you generate your own validation data and monitor error bounds.

## Caching strategy

1. USDA-based pipeline
   - Safest for offline-first.
   - Normalize ingredient lines, resolve foods once, compute recipe nutrition, and store the computed result per canonical recipe.

2. Edamam
   - Public docs indicate a reprocessing model via ETag.
   - Before shipping long-term offline caches, confirm contractual storage/display rights in the live agreement.

3. Spoonacular
   - Public pricing terms are the blocker. A `1-hour` cache window is fundamentally misaligned with durable offline recipe storage.

4. Practical recommendation
   - Pre-compute nutrition when a recipe is first saved or imported.
   - Cache the computed nutrition locally.
   - Refresh only when the ingredient list changes or a canonical source mapping is improved.

## Recommended approach

1. Primary production path
   - Use `USDA FoodData Central` as the source-of-truth ingredient database.
   - Build a recipe-analysis pipeline on top of it.

2. Fastest MVP fallback
   - Use `Edamam` for imported recipes that need immediate analysis, but only after confirming current pricing and storage rights.

3. Avoid as a primary layer
   - Do not anchor the MVP on `Spoonacular` if offline durability is a core product promise.
   - Do not anchor user-facing nutrition claims on LLM estimation alone.

## Source list

1. Edamam, "Nutrition Analysis API Documentation," accessed March 6, 2026. URL: https://developer.edamam.com/edamam-docs-nutrition-api
2. Edamam website, accessed March 6, 2026. URL: https://www.edamam.com/
3. USDA FoodData Central, "API Guide," accessed March 6, 2026. URL: https://fdc.nal.usda.gov/api-guide/
4. USDA FoodData Central homepage, accessed March 6, 2026. URL: https://fdc.nal.usda.gov/
5. Spoonacular, "Food API Pricing," accessed March 6, 2026. URL: https://spoonacular.com/food-api/pricing
6. Nutritionix Developer, accessed March 6, 2026. URL: https://developer.nutritionix.com/
7. Open Food Facts, "Data," accessed March 6, 2026. URL: https://world.openfoodfacts.org/data
