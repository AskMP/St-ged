# Research Prompt 07 — Recipe Content Legality
**Platform:** Claude (primary — legal reasoning and nuanced analysis) | ChatGPT | Gemini, BigPickle, Grok, Raptor Mini, MiniMax (cross-check)
**Topic:** Recipe scraping ToS, copyright law for recipes, licensed partnership models, user-import legal risk

---

## Project Context

Stàged needs a recipe library to function. The business brief originally mentioned "AI-Aggregated Library: Scrape and normalize countless recipes" but the product scope fence explicitly moved away from bulk scraping due to ToS and legal risk. The MVP launches with: (a) curated, licensed recipe partnerships, and (b) user-imported recipes (user pastes a URL or text). Phase 2+ may revisit structured data aggregation.

This research needs to map the actual legal landscape clearly: what's permissible, what's risky, and what models other recipe apps have used successfully.

---

## Claims to Verify

1. Bulk recipe scraping violates most major recipe sites' ToS
2. Recipe ingredients lists are not copyrightable (common claim in food/tech circles)
3. User-imported recipes (where the user pastes a URL) creates no liability for the platform
4. Licensed recipe partnerships are the safe path — but are they accessible to a new product?

---

## Research Questions

1. What is the current US copyright status of recipes — are ingredient lists, quantities, and method steps copyrightable? What landmark cases (Lambing v. Godiva, etc.) define the boundaries?
2. What do the robots.txt and ToS of major recipe sources say about scraping — NYT Cooking, Bon Appétit, AllRecipes, Food Network, Serious Eats specifically?
3. Are there court cases or DMCA actions against recipe aggregators or scrapers in the 2015–2025 period?
4. What is the legal status of "recipe import via URL" where the user initiates the fetch — does DMCA safe harbor (Section 512) apply to the platform?
5. How do existing recipe aggregators (Yummly before Yahoo acquisition, Whisk, Paprika's URL import) handle the ToS/copyright question — what legal structures do they use?
6. What licensed recipe content partnerships are available for a new consumer app — are there recipe content licensing marketplaces or APIs (Edamam Recipe API, Spoonacular's licensed recipe database)?
7. What does Spoonacular's recipe database license actually permit — commercial use, modification, display, redistribution?
8. Are there open-licensed recipe datasets (Creative Commons, open source) that could seed a recipe library legally?
9. What is the risk profile of a "user clips a recipe from the web and saves it to their personal library" feature — is this fair use, private copying, or a ToS violation for the platform?
10. What GDPR/CCPA implications exist for storing users' recipe collections — particularly if those recipes are scraped from third-party sites?
11. Has Instacart or any grocery partner imposed content restrictions on affiliated recipe apps (e.g., no scraping of competitor content)?

---

## Output Format

1. **Copyright law summary** — what is and isn't protected in recipe content
2. **ToS landscape** — what major recipe sources prohibit and at what enforcement risk level
3. **Safe harbor analysis** — user-initiated import: does Section 512 protect the platform?
4. **Licensed content options** — available APIs/databases with commercial licensing, costs, content volume
5. **Open-licensed seed options** — free datasets to bootstrap the library
6. **Legal risk matrix** — each content acquisition approach ranked by risk level and mitigation
7. **Source list** — court cases, law review articles, ToS pages, API license agreements, dated

---

## Research Standards

- Prefer primary sources first: official docs, earnings releases, API docs, legal text, platform policies, and first-party pricing pages.
- Separate sourced facts from inference. If you calculate or extrapolate a number, label it clearly as an inference.
- Include exact dates for time-sensitive claims and use current data where available.
- For every material claim, provide a URL or a formal citation.
- If a claim cannot be verified from credible public sources, say that explicitly instead of filling the gap with plausible language.
- If sources conflict, show the range and explain why the estimates may differ.
- Do not repeat assumptions from the brief unless they were independently verified in this research pass.
