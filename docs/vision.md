# Product Vision — Stàged

**Generated:** 2026-03-06
**Agent:** product-owner
**Status:** Approved (Temper-hardened 2026-03-06)

---

## Vision Statement

**For** households and food-forward individuals who are exhausted by the cost, waste, and rigidity of meal kit subscriptions and fragmented recipe discovery,

**Who** want the convenience of structured meal planning without surrendering flexibility, sustainability, or their grocery budget,

**Stàged is** a free, mobile-first kitchen coordination platform,

**That** unifies recipe discovery, household meal planning, and one-tap local grocery fulfillment into a single, beautifully designed system,

**Unlike** HelloFresh (which locks you into pre-boxed kits with excessive packaging) or Samsung Food (which commoditizes recipe-to-cart but lacks eco-first positioning and multi-household event coordination),

**We** deliver the "mise en place" of a professional kitchen — every ingredient staged, every night planned, every order placed — with digital pre-portioning that eliminates physical packaging entirely, at the cost of your own groceries, not a box subscription.

---

## Product Principles

1. **Digital pre-portioning is the eco breakthrough.** Meal kits reduce food waste but ship excessive packaging. Stàged captures the food-waste-reduction benefit of pre-portioned recipes through digital planning — you buy exactly what you need, with zero packaging beyond your grocery bag. This is the correct eco claim: not "we're greener than meal kits" (they actually have lower CO2 overall), but "we eliminate the packaging while preserving the precision."

2. **The kitchen is the platform.** Stàged is infrastructure for how households eat — not a recipe app with extras. Integrations (Instacart IDP, nutrition APIs, smart pantry sensors) are first-class citizens, not bolt-ons.

3. **Free means earned, not borrowed.** Revenue comes from value-aligned partnerships (affiliate fulfillment via Instacart IDP, ingredient sponsors via Chicory) — never from dark patterns, data selling, or paywalled core features.

4. **Offline first, always.** A recipe you can't read in a grocery store aisle because of poor signal is a broken promise. Local-first data architecture (IndexedDB + Service Worker) is non-negotiable. Add-to-Home-Screen installation is a functional requirement, not a nice-to-have.

5. **The household is the unit of use.** Planning, lists, and events are inherently social/collaborative. Features that only serve individuals are lower priority than features that serve the household.

---

## Value Proposition Canvas

### Customer Jobs
- Plan weekly meals without mental overhead
- Coordinate what the household is eating and when
- Get groceries ordered without re-typing everything
- Discover recipes that match what's already in the fridge
- Host dinner parties / potlucks without overlap chaos
- Reduce food waste from forgotten produce and bulk overbuys
- Cook better food at home rather than ordering delivery

### Customer Pains
- Meal kit subscriptions are expensive ($10.99–$12.49/serving for HelloFresh), wasteful, and hard to cancel
- Great recipes are scattered across saved Instagram posts, YouTube tabs, and paywalled platforms
- Grocery lists have to be manually rebuilt every week from scratch
- Coordinating household meals requires multiple message threads
- No tool bridges "I want to cook this" to "I have these groceries delivered"
- Meal kits generate excessive physical packaging even though the pre-portioning concept is right
- Smart kitchen ambitions have no consumer app layer to hook into

### Customer Gains
- Same "kit" convenience at grocery store prices ($7–$10/serving for equivalent meals — a $3–$5/serving saving vs. meal kits)
- One place for all recipes, accessible offline
- Real-time collaborative lists across the household
- One-tap recipe → grocery cart conversion via Instacart IDP
- A dinner party tool that prevents two guests from both bringing pasta
- A fridge-clearance mode that rescues expiring food
- Digital pre-portioning: buy exactly what the recipe needs, no more, no less — packaging stays at the store

### Feature → Pain/Gain Map
| Feature | Pain Addressed | Gain Delivered |
|---------|----------------|----------------|
| Open Pantry Recipe Engine | Scattered, paywalled recipes | Unified offline-accessible library |
| Smart Substitutions | Recipes calling for missing/allergen items | Confident cooking with what you have |
| The Pass (shared lists, scheduling) | Household coordination chaos | Real-time sync across family |
| Potluck/Event Planner | Dinner party overlap disasters | "No Overlap" claim dashboard |
| Deliver Me This (Instacart IDP) | Manual cart re-entry | One-tap fulfillment |
| AI Fridge-Clearance | Food waste from forgotten produce | Recipe suggestions from expiring items |
| Zero-Waste Mode | Packaging-heavy recipes and shopping choices | Filtered recipes by environmental footprint |
| Nutritional Intelligence | Unknown macro counts when meal planning | Real-time nutrition data (USDA-sourced) |
| Virtual Stàge Events | No guided cooking community | Pay-per-class live chef sessions |

---

## Success Metrics

### North Star Metric
**Weekly Active Households** — households with ≥2 members who interact with a shared list or plan within a 7-day window. This measures the platform's core value: coordinated household cooking.

### Leading Indicators
- Recipe saves per session (discovery engagement)
- "Deliver Me This" tap-through rate (fulfillment activation)
- Shared list creation rate (household network effect activation)
- Add-to-Home-Screen install rate on iOS (offline data persistence proxy)
- Fridge-clearance sessions initiated per week

### Lagging Indicators
- Fulfillment affiliate revenue per active household (Instacart IDP: 5% of cart, ~$5.70/order)
- Featured ingredient click-through rate (programmatic placement performance, via Chicory Phase 2)
- Stàge event ticket revenue and repeat attendance rate
- 30-day / 90-day household retention

### Guardrail Metrics (must not degrade)
- Offline recipe access success rate (target: >99% for saved recipes)
- Time from recipe view to cart submission (target: <90 seconds)
- App load time in low-signal environments (target: <3s on 3G)

---

## Scope Boundaries

### IS
- A free PWA for household meal planning, recipe organization, and grocery fulfillment
- A collaborative tool for households and dinner party groups (2–10+ members)
- An affiliate-monetized platform (Instacart IDP commissions, ingredient placement via Chicory, Stàge event tickets)
- An offline-capable, mobile-first experience designed for kitchen and grocery store environments
- An open recipe engine with normalization, substitutions, and nutritional data (USDA FoodData Central)
- An eco-conscious product with Zero-Waste mode and waste-reduction features grounded in digital pre-portioning

### IS NOT
- A meal kit delivery service (we don't ship boxes or physical products)
- A social network or recipe-sharing platform (no public profiles, follower counts, or feeds)
- A restaurant or takeout app (Stàged is about cooking at home, not ordering out)
- A subscription product gating core features behind a paywall
- A B2B/restaurant platform (consumer-only in V1; Meez owns the pro segment)
- A smart home / IoT product (hardware hooks are Phase 3+, not V1)

### Scope Fences
- **Scraping legality:** Recipe aggregation must operate within ToS/robots.txt compliance — licensed partnerships or user-imported recipes (schema.org JSON-LD only) before any bulk scraping. DMCA agent must be registered before any import feature goes live.
- **Fulfillment integration complexity:** MVP uses Instacart IDP deep-link format; full cart API integration in Phase 2. Amazon Fresh removed from roadmap (no public API; requires direct Amazon BD). Kroger API targeted for Phase 2.
- **Live events infrastructure:** Stàge events require streaming, payment, and scheduling infrastructure — Phase 3 only. Pricing revised to $25–$45 consumer / $75–$150 corporate (not $5–$15, which is below cost).

---

## Assumptions & Validation Plan

| Assumption | Risk Level | Validation Method |
|------------|------------|-------------------|
| Users will switch from habit-based recipe saving (pins, screenshots) to an app | High | Onboarding funnel drop-off; "recipe import" usage rate |
| Households will add ≥2 members to shared plans (network effect) | High | Invite flow analytics; % of sessions with >1 active user |
| Fulfillment tap-through rates justify 5% Instacart IDP commission | High | A/B test placement; measure recipe → cart conversion (target 5%; conservative floor 2%) |
| Featured ingredient placement feels editorial, not intrusive | Medium | User surveys; engagement vs. churn correlation |
| Offline-first architecture covers real-world grocery store usage | Medium | Field testing in low-signal environments; A2HS adoption rate |
| Zero-Waste mode (digital pre-portioning positioning) is a meaningful differentiator vs. Samsung Food | Medium | User interviews; feature adoption rate post-launch; competitive response tracking |
| Potluck/event planning is a breakout feature | Low-Medium | Waitlist signal; beta group invite activation |
| Eco-conscious positioning attracts former meal kit subscribers | Medium | Post-onboarding survey: "Why did you try Stàged?" |
