# ChatGPT Research Response — Recipe Content Legality
Research date: March 6, 2026

## Copyright law summary

1. Ingredient lists are generally not protected by copyright.
   - The U.S. Copyright Office states that a mere listing of ingredients is not protected.

2. Simple directions are also generally not protected.
   - Circular 33 says a simple set of directions is uncopyrightable.

3. Expressive recipe content can be protected.
   - Headnotes, storytelling, commentary, photos, layout, and more literary method text may be protected expression even when the underlying dish or process is not.

4. Copyright does not cover the underlying cooking method, system, or resulting dish.
   - 17 U.S.C. 102(b) and Circular 33 both make that boundary clear.

Bottom line:
- `Ingredients + bare procedure` is the safest zone.
- `Publisher prose, photos, formatting, and full-page presentation` is the danger zone.

## ToS landscape

1. New York Times Cooking
   - The site's robots.txt explicitly frames content as personal, non-commercial use and prohibits automated scraping, data mining, AI/LLM uses, cached datasets, and commercial use without written permission.
   - This is one of the clearest anti-scraping positions in the source set.

2. Bon Appetit, Serious Eats, Allrecipes
   - Their robots files and crawler controls show clear anti-bot and AI-crawler restrictions.
   - Even where the legal language is less explicit than NYT's, the operator intent is obvious: large-scale automated extraction is unwanted.

3. Food Network
   - Direct access was restricted during this pass, which is itself a signal that automated collection is not a friendly workflow.

4. Practical interpretation
   - Robots.txt is not the full legal story by itself, but it is strong evidence of operator intent and usually aligns with broader ToS restrictions.
   - A product brief that talks about "scrape and normalize countless recipes" is taking real legal and partnership risk.

## Safe harbor analysis

1. User-initiated import is safer than bulk scraping, but it is not zero-risk.
2. DMCA Section 512 can help only if the platform actually qualifies:
   - designated DMCA agent
   - repeat-infringer policy
   - expeditious takedown process
   - no red-flag knowledge or direct infringement encouragement
3. Section 512 is not a blanket shield against:
   - breach-of-contract or ToS theories
   - trademark / unfair-competition claims
   - product designs that effectively automate mass copying through user accounts
4. Safer import posture
   - user pastes or types content for a personal library
   - the platform avoids public redistribution of full publisher pages
   - the platform stores normalized ingredients and minimal process text where possible
   - takedown workflows and provenance records exist from day one

## Licensed content options

1. Edamam Recipe Search API
   - Provides a licensed recipe database and recipe-search surface.
   - Viable as a commercial seed source if current contract terms and pricing work.

2. Spoonacular
   - Offers a large recipe and food API surface.
   - Commercial use is possible on paid plans, but the public pricing page's `1-hour` caching limit is a serious product constraint.

3. Direct publisher / creator licensing
   - For premium editorial content, this is the safest route.
   - NYT's own robots file points commercial inquiries toward NYT Licensing.

Verdict:
- Licensed APIs and creator partnerships are the safest scalable path for MVP content.
- Bulk web scraping is not.

## Open-licensed seed options

1. The Recipes Project API
   - Public recipe data under `CC BY-SA 4.0`.
   - Useful as a legal seed dataset if attribution and share-alike obligations fit the product.

2. First-party and user-authored recipes
   - Not glamorous, but the cleanest legal content base for launch.

3. Caution on "open" datasets
   - Many publicly downloadable food datasets are for nutrition or packaged-food metadata, not a clean commercial recipe library.
   - Provenance review matters before importing anything at scale.

## Legal risk matrix

| Content acquisition model | Risk level | Why | Mitigation |
| --- | --- | --- | --- |
| Bulk scraping and republishing publisher recipes | High | Strong ToS friction, possible copyright issues around expressive text/photos, partnership risk | Do not use for MVP |
| User pastes a URL, platform fetches and stores full content server-side | Medium-high | Safer than bulk scraping, but still raises ToS, caching, and redistribution risk | Limit copied expression, preserve provenance, implement DMCA process |
| User manually pastes recipe text for private storage | Medium-low | Lower platform involvement and stronger personal-use framing | Private-library defaults, takedown path, provenance logging |
| Licensed commercial API / publisher partnership | Low | Rights are negotiated up front | Confirm caching, display, and derivative-use rights in contract |
| Open-licensed seed recipes plus first-party content | Low | Clearer rights if license obligations are honored | Track attribution and share-alike duties |

## Source list

1. U.S. Copyright Office FAQ, "What does copyright protect?" accessed March 6, 2026. URL: https://www.copyright.gov/help/faq/faq-protect.html
2. U.S. Copyright Office, Circular 33, accessed March 6, 2026. URL: https://www.copyright.gov/circs/circ33.pdf
3. Cornell Legal Information Institute, 17 U.S.C. 102, accessed March 6, 2026. URL: https://www.law.cornell.edu/uscode/text/17/102
4. Cornell Legal Information Institute, 17 U.S.C. 512, accessed March 6, 2026. URL: https://www.law.cornell.edu/uscode/text/17/512
5. New York Times Cooking robots.txt, accessed March 6, 2026. URL: https://cooking.nytimes.com/robots.txt
6. Allrecipes robots.txt, accessed March 6, 2026. URL: https://www.allrecipes.com/robots.txt
7. Serious Eats robots.txt, accessed March 6, 2026. URL: https://www.seriouseats.com/robots.txt
8. Bon Appetit robots.txt, accessed March 6, 2026. URL: https://www.bonappetit.com/robots.txt
9. New York Times Cooking subscription / FAQ page, accessed March 6, 2026. URL: https://www.nytimes.com/subscription/cooking.html
10. Edamam Recipe Search API docs, accessed March 6, 2026. URL: https://developer.edamam.com/edamam-docs-recipe-api
11. Spoonacular pricing page, accessed March 6, 2026. URL: https://spoonacular.com/food-api/pricing
12. The Recipes Project API, accessed March 6, 2026. URL: https://github.com/alan-turing-institute/the-recipes-project-api
