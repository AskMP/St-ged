# ChatGPT Research Response — Fulfillment API Landscape
Research date: March 6, 2026

## API existence verification

| Program | What the brief assumes | What current public docs support | Confidence |
| --- | --- | --- | --- |
| Instacart Connect | A startup-friendly affiliate/cart API for recipe apps | Not accurate. Instacart Connect is the retailer-partner API stack for branded e-commerce experiences. Instacart's own docs tell app developers building shoppable recipes or lists to use the Instacart Developer Platform instead. | High |
| Instacart Developer Platform (IDP) | Not mentioned distinctly in the brief | This is the correct public path for meal-planning, nutrition, cooking, and publisher apps. Instacart says developers can build end-to-end user journeys for meal planning, shoppable recipes, and personalized nutrition. | High |
| Instacart affiliate commission | 3-7% is a realistic baseline | Instacart's IDP FAQ says approved developer partners receive `5%` of total cart value for completed orders within a 7-day window, with terms varying by partner. | High |
| Amazon Fresh API | Public recipe-to-cart affiliate API exists | I did not find a public Amazon Fresh-specific developer API or cart-prefill program for third-party recipe apps. Amazon Associates exists, but that is not the same thing as a Fresh cart-construction API. | Medium |
| Uber Eats / Postmates grocery API | Public grocery-ordering API exists for third-party consumer apps | Public Uber Eats developer docs center on Marketplace APIs for merchants and restaurants. I did not find a public recipe-to-grocery-cart API for third-party consumer meal-planning apps. | Medium |

## Commission reality

1. Instacart
   - Best documented rate found: `5%` of total cart value through IDP for completed orders within a `7-day` window.
   - Important caveat: Instacart also says terms may vary by partner, and general affiliate terms are not identical to the developer-platform deal.
   - Exclusions: alcohol, restaurants, prescriptions, and gift cards are excluded from the IDP commission FAQ.

2. Amazon Fresh
   - No public commission structure specific to Fresh cart integrations was verified in this pass.
   - Amazon Associates can monetize product referrals, but I did not verify a Fresh-specific grocery workflow that matches the brief's assumptions.

3. Uber Eats / Postmates
   - No public grocery-affiliate rate for recipe/meal-planning apps was verified.

4. Competitor evidence
   - Samsung Food claims delivery integrations across `23 retailers in 4 regions`.
   - AnyList supports online shopping through Instacart, Walmart, Kroger, Safeway, Albertsons, Amazon Fresh, H-E-B, and Shipt.
   - Mealime supports delivery handoff through Kroger, Walmart, Amazon Fresh, and Instacart.
   - None of those public sources disclose their commission terms.

## Access barriers

1. Instacart IDP is application-based
   - Instacart says developers apply through the IDP site.
   - After integration is completed and approved, the developer receives an invitation to Instacart's Impact program for commissions.
   - Instacart does not publicly disclose a minimum user threshold in the docs I reviewed.

2. General affiliate review is faster than product integration approval
   - Instacart's general affiliate FAQ says application review typically takes `1-2 business days`.
   - That should not be confused with end-to-end approval for an IDP product integration.

3. Geography and channel constraints exist
   - Instacart's affiliate FAQ requires owned traffic channels and family-friendly content, and the program is aimed at U.S. and Canada usage.
   - Amazon Fresh and Uber Eats public consumer APIs were not verified, so the real barrier there may be program nonexistence rather than a long approval queue.

## Alternative paths

1. Instacart IDP is the clearest documented path for a new recipe app.
2. Walmart, Kroger, Shipt, and Amazon Fresh appear in competitor shopping flows, but I did not find equally transparent public developer docs or commission schedules for startup integrations.
3. A practical MVP path is a partner-approved handoff model rather than a promise of full cart prefill across multiple grocers.
4. If Staged wants multi-retailer coverage quickly, the most realistic benchmark is not a direct API everywhere. It is the pattern used by AnyList and Mealime: a patchwork of retailer-specific handoffs and supported shopping flows.

## Risk flags

1. The brief names the wrong Instacart product. `Instacart Connect` is not the startup recipe-app integration being described.
2. The `3-7%` commission assumption should be replaced with `5% where documented for IDP`, plus a note that terms vary and other partners are opaque.
3. Deep-link monetization is fragile. If a partner changes URL structure, attribution parameters, login flow, or product matching logic, conversion and tracking can break immediately.
4. Grocery matching is still messy even with a partner. Real carts depend on SKU availability, quantity normalization, substitutions, and regional inventory.
5. Amazon Fresh and Uber Eats are not validated pillars for the MVP monetization model based on the public evidence I found.
6. Competitor integrations prove the category exists, but not that new entrants get equal economics or access.

## Source list

1. Instacart Connect docs, accessed March 6, 2026. URL: https://docs.instacart.com/connect/
2. Instacart company/developer overview, accessed March 6, 2026. Citation used for IDP positioning around meal planning and shoppable recipes.
3. Instacart Affiliate and Developer Platform FAQ, accessed March 6, 2026. URL: https://www.instacart.com/company/affiliate
4. Uber Eats developer docs, accessed March 6, 2026. URL: https://developer.uber.com/docs/eats
5. AnyList, "Features," accessed March 6, 2026. URL: https://www.anylist.com/features
6. AnyList blog, "Introducing Online Shopping," January 2022. URL: https://blog.anylist.com/2022/01/introducing-online-shopping/
7. Mealime support, "Getting Started Guide," accessed March 6, 2026. URL: https://support.mealime.com/article/151-getting-started-guide
8. Samsung Food App Store listing, accessed March 6, 2026. Citation used for retailer-integration count and member count.
