## 1) Copyright law summary

**Scope note:** U.S. law (jurisdiction-dependent outside the U.S.).

- **Legal fact:** `17 U.S.C. §102(b)` excludes protection for ideas, procedures, processes, systems, and methods of operation.
- **Legal fact:** U.S. Copyright Office FAQ states a **mere listing of ingredients** is not protected; protection may exist when there is **substantial literary expression** (e.g., explanatory prose) or in a compilation.
- **Legal fact:** Copyright can protect expressive elements around recipes (e.g., headnotes, narrative text, photos, layout), even when underlying cooking method is unprotected.
- **Interpretation:** Reusing normalized ingredient data and non-expressive method abstractions is materially lower-risk than reproducing verbatim publisher prose/photos.
- **Interpretation:** Product design should treat recipe pages as mixed-content IP (functional + expressive), not "all free" or "all prohibited."

**Major conclusion confidence:** **High** (for U.S. framework).  
**Uncertainty label:** Jurisdiction-dependent outside the U.S.

---

## 2) ToS landscape (NYT Cooking, Bon Appetit, AllRecipes, Food Network, Serious Eats)

| Publisher | Evidence (facts) | Interpretation | Confidence |
|---|---|---|---|
| NYT Cooking | `robots.txt` states personal/non-commercial framing and says automated scraping/data mining and AI/LLM uses are prohibited without written permission; includes licensing contact (`nytlicensing.com`). | Strong anti-scraping/anti-AI posture; commercial ingestion without permission is high contract risk. | High |
| Bon Appetit (Conde Nast) | `robots.txt` disallows multiple AI/user agents; Conde Nast User Agreement prohibits bots/scraping/crawling/mining and AI training/grounding uses without consent. | Automated extraction for aggregation is high ToS risk. | High |
| AllRecipes (People Inc.) | Site footer links to People Inc. Terms; People Inc. Terms prohibit manual/automated scraping/harvesting and prohibit using data to train AI systems; `robots.txt` disallows multiple AI agents and bot access patterns. | Large-scale acquisition from AllRecipes without license is high ToS risk. | High |
| Food Network (WBD/Discovery) | `robots.txt` blocks major AI bots (`GPTBot`, `ClaudeBot`, etc.); footer links to Discovery Visitor Agreement; agreement emphasizes personal/non-commercial use and prohibits unauthorized reproduction/framing. | Explicit anti-scrape language is less direct than Conde Nast/People Inc., but bot restrictions + rights language still create meaningful contract risk. | Medium |
| Serious Eats (People Inc.) | Site footer links to People Inc. Terms; People Inc. Terms prohibit scraping/harvesting and AI training use; `robots.txt` disallows multiple AI agents. | Same risk profile as other People Inc. properties for automated extraction. | High |

- **Legal fact:** Robots directives are technical access rules and evidence of operator intent.
- **Interpretation:** Robots alone are not the full legal basis, but in practice they align with ToS enforcement posture and increase litigation/partnership risk when ignored.
- **Uncertainty:** Food Network property-level applicability of every WBD clause can vary by service context; treat as **jurisdiction- and forum-dependent**.

**Major conclusion confidence:** **High** (overall anti-automation trend), **Medium** (Food Network clause specificity).

---

## 3) Safe harbor analysis for user-initiated URL import (DMCA 512)

- **Legal fact:** `17 U.S.C. §512(c)` can limit monetary liability for storage of material at user direction if conditions are met.
- **Legal fact:** Key conditions include designated DMCA agent, repeat-infringer policy, expeditious takedown, and compliance with notice/counter-notice process.
- **Legal fact:** Section 512 safe harbors are copyright-liability limits, not blanket immunity for all claims.
- **Interpretation:** A workflow where **user initiates URL import for private storage** is stronger for §512 positioning than platform-initiated bulk scraping/public republication.
- **Interpretation:** Section 512 does **not** eliminate exposure to contract/ToS claims, unfair competition theories, or non-copyright claims.

**Operational controls (interpretive best practice):**
- Publish DMCA policy and register designated agent.
- Maintain repeat-infringer policy and audit logs.
- Restrict public redistribution of full third-party recipe pages.
- Prefer storing normalized fields and source attribution links where feasible.

**Major conclusion confidence:** **Medium-High** (statutory mechanics clear; case outcomes are fact-specific).  
**Uncertainty label:** Court application is jurisdiction- and fact-dependent.

---

## 4) Licensed content options (Edamam, Spoonacular, others)

- **Edamam**
	- **Legal fact:** Edamam docs say web recipes are sourced from the web and Edamam does not hold copyrights to those web recipes; API returns source URL and offers separately discussed fully licensed recipes.
	- **Legal fact:** Edamam licensing page markets professional third-party licensed recipe offerings and contact-based licensing.
	- **Interpretation:** Viable for commercial launch if contract explicitly covers your storage/display/derivative needs.
- **Spoonacular**
	- **Legal fact:** Terms provide subscription license; require source credit; restrict storage/caching (stated max 1-hour cache unless written permission); prohibit resale/competing clone use.
	- **Interpretation:** Legally cleaner than scraping, but product architecture must fit retention/caching constraints.
- **Others**
	- **Legal fact:** NYT robots includes a licensing contact path (`nytlicensing.com/contact`), indicating direct licensing route exists.
	- **Unverifiable:** Public, machine-readable contract terms for many publisher-direct recipe feeds are often not fully accessible without sales process/NDA.
	- **Interpretation:** Publisher-direct or aggregator licensing can reduce infringement/ToS risk but requires bespoke rights negotiation.

**Major conclusion confidence:** **High** (Edamam/Spoonacular), **Low-Medium** (other vendor options without public terms).

---

## 5) Open-licensed seed options

- **Wikibooks Cookbook**
	- **Legal fact:** Content indicates text available under `CC BY-SA` (as shown on page footer/license notice).
	- **Interpretation:** Usable as seed content if attribution + share-alike obligations are operationally supported.
- **Open Food Facts (adjacent seed, not recipe corpus)**
	- **Legal fact:** Database licensed under `ODbL`; contents under `DbCL`; images under `CC BY-SA` with third-party-rights caveats.
	- **Interpretation:** Strong for ingredient/product metadata enrichment, not a complete recipe corpus.
- **OpenRecipes legacy mirrors**
	- **Unverifiable:** Source endpoint returned inaccessible/forbidden and licensing provenance could not be independently confirmed in this pass.
	- **Interpretation:** Do not rely without provenance and license-chain verification.

**Major conclusion confidence:** **Medium** (for Wikibooks/Open Food Facts), **Low** (legacy open recipe dumps).

---

## 6) Legal risk matrix (acquisition approach vs risk/mitigation)

| Acquisition approach | Primary legal exposure | Risk | Mitigation |
|---|---|---|---|
| Bulk scraping publisher sites + republishing full recipes/photos | ToS breach, copyright (expressive text/images), platform enforcement | **High** | Avoid for MVP; replace with licenses or user-owned content |
| Server-side URL fetch + store full third-party recipe content | Copyright + ToS/caching constraints | **Medium-High** | User-direction gating, DMCA program, minimize stored expressive text, preserve source attribution, remove on notice |
| User manual paste/import to private library | Copyright claims possible but better user-direction posture | **Medium** | Private-by-default, no public redistribution, rapid takedown/counter-notice flow |
| Licensed API (Edamam/Spoonacular) | Contract compliance risk | **Low-Medium** | Contract review for caching/display/derivatives; automated compliance checks |
| Direct publisher licensing | Contract scope/royalty obligations | **Low** | Negotiate explicit rights (storage, indexing, transforms, sublicensing) |
| Open-licensed seed corpus (CC/ODbL) | Attribution/share-alike and third-party rights hygiene | **Low-Medium** | License ledger, attribution pipeline, derivative-work policy, provenance audits |
| First-party editorial + user-original submissions | UGC infringement + moderation | **Low** | Strong UGC terms, repeat-infringer policy, DMCA handling, moderation tooling |

**Major conclusion confidence:** **Medium-High** (risk ordering), **Medium** (exact exposure varies by implementation and forum).

---

## 7) Source list with dates and URLs

All accessed on **March 6, 2026**.

1. U.S. Code `17 U.S.C. §102` - https://www.law.cornell.edu/uscode/text/17/102  
2. U.S. Code `17 U.S.C. §512` - https://www.law.cornell.edu/uscode/text/17/512  
3. U.S. Copyright Office FAQ ("What Does Copyright Protect?") - https://www.copyright.gov/help/faq/faq-protect.html  
4. U.S. Copyright Office Section 512 resources - https://www.copyright.gov/512/  
5. NYT Cooking robots - https://cooking.nytimes.com/robots.txt  
6. Bon Appetit robots - https://www.bonappetit.com/robots.txt  
7. Conde Nast User Agreement - https://www.condenast.com/user-agreement  
8. AllRecipes robots - https://www.allrecipes.com/robots.txt  
9. AllRecipes homepage (footer legal links) - https://www.allrecipes.com/  
10. People Inc. Terms of Service - https://www.people.inc/brands-termsofservice  
11. Food Network robots - https://www.foodnetwork.com/robots.txt  
12. Food Network homepage (footer legal links) - https://www.foodnetwork.com/  
13. Discovery/WBD Visitor Agreement - https://www.wbd.com/discovery-visitor-agreement/  
14. Serious Eats robots - https://www.seriouseats.com/robots.txt  
15. Serious Eats homepage (footer legal links) - https://www.seriouseats.com/  
16. Edamam Recipe API docs - https://developer.edamam.com/edamam-docs-recipe-api  
17. Edamam data licensing - https://www.edamam.com/data-licensing/  
18. Spoonacular API terms - https://spoonacular.com/food-api/terms  
19. Spoonacular API pricing/FAQ - https://spoonacular.com/food-api/pricing  
20. Wikibooks Cookbook TOC (license footer) - https://en.wikibooks.org/wiki/Cookbook:Table_of_Contents  
21. Open Food Facts terms/licenses - https://world.openfoodfacts.org/terms-of-use  
22. OpenRecipes S3 endpoint (access blocked) - https://openrecipes.s3.amazonaws.com/ (**Unverifiable** for licensing in this pass)
