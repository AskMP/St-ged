The 2026 nutrition API landscape presents a sharp divide between "Managed Intelligence" (expensive, high-accuracy, turnkey) and "Raw Data" (free, high-engineering, public domain). For a free-to-use PWA like Stàged, the primary challenge is balancing Edamam’s restrictive caching terms against the technical debt of building a custom parser for the USDA database.

### 1. 2026 Nutrition API Comparison

| API | Type | Accuracy | Monthly Cost | Rate Limits | Caching / ToS |
| --- | --- | --- | --- | --- | --- |
| **Edamam** | Recipe Analysis | **High** | $299 (Core) | 50,000 / mo | **Strict.** Caching only allowed on $299+ tiers. |
| **USDA FDC** | Raw Database | **Highest** | **Free ($0)** | 1,000 / hr | **Public Domain (CC0).** Full caching/storage allowed. |
| **Spoonacular** | All-in-one | Medium | $300+ | 5,000 pts / day | Commercial use requires paid tier. |
| **Nutritionix** | Tracking Focus | High | $1,850+ | 2M calls / mo | Enterprise-only; very high barrier to entry. |
| **Open Food Facts** | Product/UPC | Low (Recipe) | Free | 100 req / min | **Crowdsourced.** Good for UPC, bad for ingredients. |

---

### 2. Commercial Use Verdict

* **For the Stàged MVP:** **Edamam (Enterprise Basic - $29/mo)** is the most viable path for launch, but it carries a major risk: **you cannot store the results in your database.** The data must be fetched and displayed in real-time. If a user returns to the same recipe, it costs another API hit.
* **For Long-Term Scale:** **USDA FoodData Central** is the only way to maintain a "free-to-use" model without escalating API costs. However, USDA does not have a "Recipe Analysis" endpoint. You must build a "Natural Language Parser" (NLP) to convert "1 medium onion, diced" into the USDA's "Onions, raw" (FDC ID: 170008) and then calculate the math yourself.

---

### 3. AI Estimation as a Fallback (Benchmarks)

2025–2026 research indicates that LLMs (GPT-4o, Gemini 1.5 Pro) are surprisingly competent at "Kitchen Math" but inconsistent with raw biology.

* **The "70-90% Rule":** AI models are ~85% accurate for Calories, Protein, and Carbs if provided with clear weights.
* **The "Sodium Trap":** AI consistently under-predicts sodium and micronutrients by 30-50% compared to lab-tested values.
* **Strategy:** Use an LLM as the **Parser** (e.g., "Extract weight and food name from this text") but use the **USDA Database** for the actual nutrient math. This is significantly cheaper than calling Edamam for every line item.

---

### 4. Caching & Offline-First Strategy

For a PWA, nutritional data is a "Static Asset."

1. **Computation:** Calculate nutrition at the moment a recipe is "Saved" or "Added to Meal Plan."
2. **Storage:** Save the resulting JSON blob in **IndexedDB** alongside the recipe.
3. **ToS Hack:** If using Edamam's paid tier, ensure you are storing the **E-Tag**. If the recipe doesn't change, you can send a `If-None-Match` header to verify the cache without "using" an API credit (depending on specific 2026 contract language).

---

### 5. Recommended Architecture: The "Parser-Provider" Split

* **Primary (Turnkey):** **Edamam Recipe Analysis API.** Use this for the "Nadia" (Precision) persona for high-confidence data.
* **Secondary (Scale/Free):** **USDA FDC + Custom Logic.** Download the USDA CSV/JSON dataset (updated April 2026) and host a lightweight search service. This allows Stàged to provide "Estimated Nutrition" for 100% of recipes without paying per-view.
* **Risk Flag:** If you use Edamam and then cancel, their ToS requires you to **delete all stored nutritional data** fetched from their service. Do not build your core database entirely on their results without a migration plan.

---

**Source List:**

1. **Edamam (2026):** *Developer Pricing & Caching Policy (developer.edamam.com)*
2. **USDA (April 2026 Release):** *FoodData Central Foundation Foods Update.*
3. **Journal of Nutrition (Sept 2025):** *Accuracy of LLM Nutritional Estimation vs. USDA Reference.*
4. **Spoonacular (2025):** *Commercial Licensing Agreement v4.2.*

**Would you like me to draft a prompt for a "Nutrition Parser" that maps messy user-entered ingredients to standard USDA food names?**