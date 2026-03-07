# Feature Scope — Stàged

**Generated:** 2026-03-06
**Agent:** strategist
**Status:** Approved (Temper-hardened 2026-03-06)
**Personas:** 14 | **Input:** Approved vision + 14 personas + business brief + temper synthesis

---

## MoSCoW Feature Categorization

### Must Have — MVP (Break Core Promise If Cut)

For each: Primary Persona → JTBD → What breaks if cut.

---

#### F01 — Open Pantry Recipe Engine
**Primary:** Maya, Jordan, Felix | **Secondary:** All 13
**JTBD:** Unified, searchable recipe library to replace fragmented saves (screenshots, tabs, bookmarks)
**If cut:** The product is nothing. No recipe library = no planning, no lists, no fulfillment.
**Scope:**
- Save recipes from any URL (import via share sheet or link paste)
- Import uses schema.org/Recipe JSON-LD structured data only (not full-article scraping — legal requirement)
- Curated library of normalized, searchable recipes (licensed + user-imported; no bulk scraping at launch per scope fence)
- Search by: ingredient, cuisine, meal type, dietary filter
- Offline access for saved recipes (Service Worker / IndexedDB)
- Recipe detail: ingredients, steps, servings, estimated time, nutritional summary
- Screen Wake Lock active in step-by-step cooking view (prevents screen timeout while cooking)

---

#### F02 — Offline-First PWA Architecture
**Primary:** All | **Secondary:** —
**JTBD:** Recipe access in low-signal grocery store aisles; core product principle #4
**If cut:** The entire "anti-kit" premise collapses — if it doesn't work in the aisle, it's just another web app
**Scope:**
- Service Worker with **foreground-initiated sync queue** (Background Sync API not used — not supported on iOS)
- IndexedDB (via Dexie.js) for saved recipes, lists, pantry data, and offline mutation queue
- Sync pattern: local-first writes → queue mutations in IndexedDB → flush on `online` event or `visibilitychange` (app foregrounded)
- WebSocket for real-time sync when connected; HTTP polling fallback when WebSocket unavailable
- Graceful degradation: cached data available when offline; sync on reconnect
- **Add-to-Home-Screen (A2HS) install prompt is a functional requirement**: iOS users without A2HS face 7-day cache eviction — A2HS eliminates this. Prompt shown in onboarding with clear benefit framing.
- Persistent storage requested via `navigator.storage.persist()` on A2HS install
- App manifest (standard Web App Manifest) for cross-platform installability
- Load time target: <3s on 3G (Lighthouse target: FCP <1s from cache, <3s from network)
- Caching strategy: Stale-While-Revalidate (recipes), Cache-First (app shell + static assets), Network-First (live grocery lists)
- Stack: Workbox 7+ for service worker management; Vite + vite-plugin-pwa for build

---

#### F03 — The Pass: Shared Grocery Lists
**Primary:** Darius, Alex & Riley, Linda, Marcus/The House | **Secondary:** Maya, Brett
**JTBD:** Real-time shared list that multiple household members can edit simultaneously — the "two-list problem" solution
**If cut:** Darius never activates (his #1 pain). Household network effect never fires. Stàged becomes a solo recipe app.
**Scope:**
- Create a household (invite by email/link; join by shared link — no account required for guest-add)
- Household member cap: 10+ (supports Greek house / large shared households, not just 2-4)
- Shared grocery list with real-time sync (WebSocket or polling fallback)
- Add items manually or from recipes
- Check off items while shopping (offline-compatible via local optimistic update)
- List automatically deduplicates items added from multiple recipes
- Guest-add mode: non-registered member can add to list via shared link
- Conflict resolution: last-write-wins with timestamp; conflict badge shown if simultaneous offline edits

---

#### F04 — Meal Scheduling (Weekly Calendar View)
**Primary:** Darius, Nadia, Claire | **Secondary:** Maya, Linda
**JTBD:** Assign recipes to specific nights; eliminate 5pm "what are we eating" decision fatigue
**If cut:** Planning feature evaporates. Stàged is discovery only, not coordination. Nadia can't batch prep. Darius's use case collapses.
**Scope:**
- 7-day calendar view for the current week
- Drag-and-drop recipe assignment to nights
- Each assigned recipe auto-adds its ingredients to the shared grocery list
- View: Recipe title, cook time, servings count per night
- Copy week to next week (reduces Sunday re-planning overhead)

---

#### F05 — Deliver Me This (Fulfillment)
**Primary:** Darius, Priya, Nadia | **Secondary:** Maya, Brett
**JTBD:** Convert week's ingredient list to a grocery delivery order without retyping
**If cut:** Core monetization (affiliate commissions) goes to zero. The "Anti-Kit" promise is unfulfilled — you still have to do everything manually.
**MVP scope (deep-link):**
- "Send to Instacart" — construct Instacart IDP deep-link URL from ingredient list → open in Instacart app/web
- Affiliate enrollment: via Impact.com (Instacart IDP program); commission: **5% of total cart** within 7-day attribution window (~$5.70/order at $114 AOV)
- **Smart Bundling:** surface "Complete This Meal" upsells (complementary ingredients) to increase cart AOV and commission per order
- Display attribution link per partner (required for Instacart IDP program compliance)
- Amazon Fresh: **removed from MVP** — no public API; requires direct Amazon BD relationship
- Uber Eats: **removed** — restaurant-only API; no grocery affiliate track
**Phase 2 addition:**
- Instacart IDP full cart API (replace deep-link with pre-populated cart via official API)
- Kroger developer API (developer.kroger.com — public API; viable Phase 2 addition)
**Revenue:** Instacart IDP affiliate: 5% commission on completed orders. CPA alternative: $10/new Instacart customer.

---

#### F06 — Smart Substitutions
**Primary:** Maya, Brett, Claire, Rowan | **Secondary:** Sam, Jordan
**JTBD:** Swap a recipe ingredient for a compatible alternative (dietary, availability, or preference)
**If cut:** Maya's dairy-free partner can't eat the same meal. Brett can't adapt omni recipes for his vegan partner. Claire can't handle her pescatarian teen. The "flexibility of local shopping" promise breaks.
**Scope:**
- Per-ingredient substitution suggestions (curated + AI-assisted)
- Substitution categories: dairy-free, gluten-free, vegan, nut-free, "I'm out of this"
- Substitution modifies ingredient list and shopping list
- Dietary substitution profiles saved to household preferences
- Quantity preservation: substitution quantity scales correctly with original

---

#### F07 — Nutritional Intelligence
**Primary:** Nadia, Maya, Felix | **Secondary:** Rowan, Linda, Marco
**JTBD:** View macros and calorie count per recipe serving; informed meal planning without a separate tracker
**If cut:** Nadia's training-block macro planning is impossible. The "smart" in "smart kitchen" is hollow.
**Scope:**
- Per-recipe: calories, protein, carbs, fat per serving
- **Data source architecture:**
  - Primary: **USDA FoodData Central** (self-hosted dataset; CC0 public domain; free; no usage caps)
  - Parser: LLM-as-parser maps ingredient text (e.g., "2 cups flour") to USDA FDC IDs; USDA provides nutritional math
  - User-submitted recipes: **Edamam Nutrition Analysis API** (pay per new recipe analyzed, not per view)
  - Supplement: Open Food Facts for packaged/branded ingredient enrichment (free, open license)
  - Fallback: LLM estimation (labeled "estimated") where USDA lookup fails; not used as primary source
  - **Do not use Spoonacular** as primary: 1-hour cache limit incompatible with offline-first architecture
- Nutrition computed once at recipe-save time; cached in IndexedDB; never re-called on recipe view
- Displayed on recipe detail page (above-the-fold)
- Macro totals for a full week's scheduled meals (simple aggregate view)

---

#### F08 — Zero-Waste Mode
**Primary:** Maya | **Secondary:** Rowan, Sam, Marco, Linda
**JTBD:** Filter recipe library by minimal-packaging ingredients; align cooking choices with eco values
**If cut:** The core brand differentiator evaporates. Product principle #1 is un-implemented. Maya's identity alignment — her main reason to choose Stàged over Samsung Food — is gone.
**Positioning note (temper-corrected):** Stàged's eco claim is **digital pre-portioning eliminates packaging while preserving the food-waste-reduction benefit of structured recipes** — not "we're greener than meal kits overall" (meal kits actually have lower CO2 due to reduced food waste). The Zero-Waste Mode operationalizes buying exactly what the recipe needs, nothing more.
**Scope:**
- Recipe-level "Zero-Waste Score" badge (ingredients available bulk or with low packaging)
- Filter: "Show Zero-Waste only" / "Zero-Waste preferred"
- Ingredient-level bulk availability tagging (initially user-contributed; later partner data)
- Integration hook for local store bulk sections (Phase 2 enhancement)

---

#### F09 — Recipe Scaling
**Primary:** Priya, Felix, Linda | **Secondary:** Darius, Jordan
**JTBD:** Rescale a recipe from its base serving count to any target count; quantities update automatically
**If cut:** Priya can't host dinner parties (manual math errors documented in her journey). Felix can't run pop-up service. Linda can't cook for 8.
**Scope:**
- Serving count adjuster on every recipe (tap +/- or enter number)
- All ingredient quantities recalculate proportionally
- Non-linear scaling flags: spice ratios, leavening agents, cooking times — displayed as advisory notes
- Scaled ingredient list syncs to shopping list at scaled quantities

---

#### F10 — Dietary & Preference Filtering
**Primary:** Rowan, Brett, Claire, Jordan | **Secondary:** Maya, Sam
**JTBD:** Filter recipe library by dietary requirements so every search result is immediately usable
**If cut:** Rowan can't find vegetarian-for-omnis recipes. Brett can't find vegan recipes. Claire can't find pescatarian-safe options for her teen. Jordan gets overwhelmed by results that require advanced skill.
**Scope:**
- Filter by: vegetarian, vegan, gluten-free, dairy-free, nut-free, pescatarian, halal, kosher
- Household dietary profile saved (applied as default filter; can override per search)
- Skill-level filter: Beginner / Intermediate / Advanced
- Time filter: Under 30 min / Under 45 min / Under 60 min / Any
- Combined filters supported

---

### Should Have — Phase 2 (High Differentiation, Not MVP-Blocking)

---

#### F11 — AI Fridge-Clearance
**Primary:** Sam | **Secondary:** Maya, Marco, Linda
**JTBD:** Enter what's currently in the fridge → get real, makeable recipe suggestions → avoid delivery and waste
**Why Phase 2:** Requires ML/AI integration and reliable pantry data model (built in MVP). High value but technically dependent on F10 pantry foundation.
**Scope:**
- Pantry inventory input: manual text entry + barcode scan (Phase 2)
- Expiration date tracking per pantry item
- "What can I make?" — AI matches pantry contents to recipe library, returns top 3-5 matches
- Expiration alert: 2 days before item expires → surface recipe suggestions
- Missing ingredient delta: "You're 1 ingredient away from this recipe — add it to your list"

---

#### F12 — Cost-Per-Serving Display
**Primary:** Marco, Linda, Nadia | **Secondary:** Jordan, Rowan
**JTBD:** See estimated ingredient cost per serving before committing to a recipe; plan around budget
**Why Phase 2:** Requires ingredient price data integration (grocery partner APIs or crowd-sourced pricing). High value and a gap in every competitor — but technically complex and data-dependent.
**Scope:**
- Per-recipe estimated cost per serving (based on current local average prices)
- Budget target per week: set a target, see if plan hits or misses
- Pantry-aware cost: deduct cost of ingredients already owned
- "Affordable cuts" filter: surface recipes featuring budget-friendly proteins (chuck, thigh, dried beans)
- Sale-item quick search: "I have [ingredient] on sale, what can I make?"

---

#### F13 — Potluck & Event Planner
**Primary:** Priya | **Secondary:** Darius, Claire
**JTBD:** Create a shareable event, let guests claim dish categories, prevent overlaps
**Why Phase 2:** Core for one persona; lower priority than household coordination (F03). Requires guest-facing zero-login UX.
**Scope:**
- Create event (name, date, guest count, dietary summary)
- Define contribution slots: Appetizer, Main, Side x2, Dessert, Drinks (customizable)
- Shareable link → guest opens, sees unclaimed slots, claims one (no account required)
- Real-time slot claim → slot locks for other guests
- Host dashboard: claimed vs. unclaimed at a glance
- Dietary restrictions captured on claim form → host sees aggregate summary

---

#### F14 — Batch Prep Mode
**Primary:** Nadia | **Secondary:** Linda, Sam
**JTBD:** Plan a Sunday batch-cook session across multiple recipes; get a parallelized cook sequence
**Why Phase 2:** Technically straightforward but UX-complex; requires scheduling logic for parallel task ordering.
**Scope:**
- "Prep Mode" — select 2-5 recipes to batch cook
- Combined ingredient list across all selected recipes (deduplicated)
- Cook sequencing: system generates a parallel task order (start long-cook items first, prep quick items in parallel)
- "Reheats well" tag on recipes (curated + community-flagged)
- Portioning view: how many containers of each recipe; per-container macro summary

---

#### F15 — Dietary Adaptation Mode ("Make This [X]")
**Primary:** Brett, Rowan | **Secondary:** Maya, Claire
**JTBD:** One-tap adaptation of any recipe to a target dietary profile (vegan, vegetarian, dairy-free, gluten-free)
**Why Phase 2:** Requires curated substitution logic beyond F06's per-ingredient swaps; whole-recipe transformation is complex.
**Scope:**
- "Make This Vegan" / "Make This Vegetarian" / "Make This Dairy-Free" buttons on recipe detail
- System applies known substitution rules across all applicable ingredients simultaneously
- Explanatory notes per substitution: why it works, what changes in flavor/texture
- Adaptation saved as a variant; original recipe preserved
- User can accept, modify, or reject individual substitutions

---

#### F16 — In-Step Contextual Coaching
**Primary:** Jordan, Brett | **Secondary:** Felix, Claire
**JTBD:** Tap any technique word in a recipe step and get an inline explanation of what it means and why
**Why Phase 2:** Content creation effort is high; requires recipe annotation layer.
**Scope:**
- Technique glossary linked from recipe steps (tap-to-reveal inline)
- Covers ~200 common techniques: sauté, deglaze, fold, julienne, bloom, beurre blanc, etc.
- Ingredient explainers for unfamiliar items (nutritional yeast, aquafaba, mirin, etc.)
- "Why this works" note per technique — short, practical, no lecture
- Displayed inline without navigating away from the recipe

---

#### F27 — Grocery Cost Splitting
**Primary:** Marcus/The House | **Secondary:** Linda, Priya (event groceries)
**JTBD:** Automatically split a shared grocery bill across household members and generate per-person payment requests
**Why Phase 2:** The House persona's #1 friction point after coordination; low-effort extension of the shared list model already in F03.
**Scope:**
- Per-grocery-run cost entry (total receipt amount)
- Auto-split evenly across active household members, or custom split weights
- Payment request generation: Venmo deeplink / Zelle / manual reminder per member
- Cost history: running per-person total for the month
- Optional: itemize per recipe (which night's ingredients cost what)

---

#### F28 — Cook Rotation Scheduling
**Primary:** Marcus/The House | **Secondary:** Darius, Claire
**JTBD:** Distribute cooking duties across household members on a rotating schedule; prevent one person from carrying all coordination labor
**Why Phase 2:** Directly addresses Marcus burnout; structurally simple; high retention value for shared-household segment.
**Scope:**
- Set up rotation: add members, set rotation frequency (weekly / bi-weekly)
- Assigned cook gets a notification on their day: "Your turn — here are 3 recipes that fit your house's restrictions"
- Rotation visible to all household members (no ambiguity about who's on)
- Skip / swap: member can swap their slot with another (requires the other to accept)
- Cook history: who cooked what and when

---

#### F17 — Pantry Setup Onboarding + Starter Pantry
**Primary:** Jordan | **Secondary:** Brett, Sam
**JTBD:** Guide a first-time cook through building a functional pantry from scratch; avoid recipe failure from missing staples
**Why Phase 2:** Onboarding experience polish; not blocking core recipe use but critical for Jordan's retention.
**Scope:**
- First-launch onboarding flow: skill level, household size, dietary restrictions
- Starter Pantry checklist: ~60 essential ingredients that unlock 80%+ of the library (~$60-80 spend)
- Per-ingredient explanation: "Why you need this and what it's used for"
- Pantry inventory auto-populated from onboarding checklist
- "Recipes you can make right now" surface immediately after pantry setup

---

### Could Have — Phase 3 (Breakout Features, Infrastructure-Heavy)

---

#### F18 — Virtual Stàge Events (Live Chef Sessions)
**Primary:** Priya | **Secondary:** Felix, Alex & Riley, Jordan (beginner tier)
**JTBD:** Book and attend a live, interactive cooking class with a professional chef
**Why Phase 3:** Requires live streaming infrastructure (WebRTC/LiveKit), payment processing, scheduling system, chef partner program.
**Revenue:** Ticket sales — **revised pricing: $25–$45 consumer / $75–$150 corporate** (research confirmed $5–$15 is below instructor cost floor). Instructor cost: $200–$500/session. Net margin at $35/ticket, 40 attendees: ~$1,100/event after instructor.
**Scope:**
- Event discovery: browse upcoming sessions by cuisine, technique, skill level
- Booking: calendar + payment ($25–$45 consumer / $75–$150 corporate)
- Live session: WebRTC video stream (LiveKit SFU) + chat + recipe sync (attendee's Stàged recipe view stays in sync with chef)
- Replay access: recording available to attendees post-session
- B2B path: corporate team-building booking flow at premium rates

---

#### F19 — Month-View Meal Planning
**Primary:** Linda | **Secondary:** Nadia
**JTBD:** Plan 4 weeks of meals at once; generate one consolidated bulk shopping list
**Why Phase 3:** Complex calendar UX; bulk shopping list deduplication at month scale is technically significant.
**Scope:**
- 28-day calendar planning view
- Bulk shopping list: consolidated ingredient quantities across 4 weeks
- Bulk store optimization: flag items better purchased in bulk quantity
- Delegation: assign specific meals to specific household members

---

#### F20 — Parallel Prep Task Splitting (Two-Cook Mode)
**Primary:** Alex & Riley | **Secondary:** Claire
**JTBD:** Recipe splits into two parallel task tracks so two cooks have simultaneous meaningful work
**Why Phase 3:** Requires recipe authoring layer to tag steps by parallel track — significant content effort.
**Scope:**
- Recipes tagged with parallel step tracks (Track A / Track B)
- Two-device sync: each cook sees their own track, synced to shared recipe state
- Progress indicators show each cook's completion relative to other

---

#### F21 — Shared Recipe Voting Queue
**Primary:** Alex & Riley, Marcus/The House | **Secondary:** Priya (event planning)
**JTBD:** Household members browse and vote on recipes; consensus picks land in the shared week queue
**Why Phase 3:** Polished social/collaborative UX; lower urgency than core household coordination.
**Scope:**
- Swipe-to-vote interface: heart/skip per recipe
- Configurable consensus threshold: 2-person (both must heart) or majority vote (for 6+ households)
- Queue auto-populates the week's schedule (pending final assignment)
- "Veto" flag: any member can hard-veto a recipe (dietary or preference) before it lands

---

#### F22 — Macro Target Tracking
**Primary:** Nadia | **Secondary:** Maya (light), Felix
**JTBD:** Set weekly macro targets; see whether the current plan achieves them
**Why Phase 3:** Extends nutritional intelligence (F07); requires goal-setting UI and plan-aggregate math.
**Scope:**
- Set targets: protein, carbs, fat, calories per day
- Plan macro summary: daily and weekly aggregate vs. target
- Deviation alert: if plan misses target by >15%, prompt adjustment
- Portion size adjustment: modify serving count → macro totals update live

---

#### F23 — Bulk Utilization Tracking
**Primary:** Linda, Marco | **Secondary:** Nadia
**JTBD:** Track bulk purchases against the meal plan; surface utilization gaps before items expire
**Why Phase 3:** Requires pantry × plan cross-reference logic; month-view dependency (F19).
**Scope:**
- Bulk item tracking: quantity purchased, quantity used in plan, projected remaining at end of planning period
- Alert: "10 lbs lentils purchased — only 4 lbs used in current plan. 6 lbs unplanned."
- Suggest additional recipes to absorb the surplus

---

#### F24 — Technique-Based Recipe Search
**Primary:** Felix | **Secondary:** Priya, Jordan
**JTBD:** Search recipes by cooking technique to practice deliberately; build skill through targeted repetition
**Why Phase 3:** Requires recipe metadata tagging at technique level — significant content/curation effort.
**Scope:**
- Technique taxonomy: ~80 core techniques tagged across library
- Filter by technique: "Show me all recipes that use: spherification / emulsification / maillard"
- Technique skill tree: "You've cooked 3 emulsification recipes" — gamified progression

---

#### F25 — Age-Appropriate Step Tagging
**Primary:** Claire | **Secondary:** Jordan (beginner scaffolding adjacent)
**JTBD:** Recipe steps tagged by minimum age/skill appropriateness; parent assigns each child a role
**Why Phase 3:** Requires recipe authoring layer; content-heavy; niche but high-loyalty.
**Scope:**
- Steps tagged: [Ages 5+] / [Ages 8+] / [Ages 12+] / [Adult only]
- "Cook Together Mode": parent selects household members; app assigns age-appropriate steps to each
- Child-facing view: simple language, their steps only, big touch targets

---

#### F26 — Smart Kitchen Sensor Hooks (DIY Hardware)
**Primary:** Founder vision | **Secondary:** Felix, Marco
**JTBD:** Accept pantry inventory data from RP2040/ESP32-based load-cell sensors; auto-update pantry without manual entry
**Why Phase 3:** Hardware dependency; requires partner hardware ecosystem or DIY SDK.
**Scope:**
- Webhook/API endpoint for IoT sensor data (grain level, weight, container ID)
- Auto-update pantry inventory on sensor reading
- SDK/documentation for DIY hardware builders

---

### Won't Have (V1 — Explicit Exclusions)

| Feature | Reason |
|---------|--------|
| Full streaming infrastructure (self-hosted) | Use 3rd-party WebRTC provider (LiveKit) for Stàge events; don't build custom streaming |
| Social profiles / follower feeds | Out of scope per vision — not a social network |
| Restaurant / takeout ordering | Out of scope — Stàged is about cooking at home |
| B2B / restaurant tools | Consumer-only V1; Meez owns pro segment |
| Recipe scraping at scale | Scope fence: ToS/robots.txt risk; launch with licensed content + user imports (JSON-LD only) |
| Subscription paywall for core features | Product principle #3: free means earned, not borrowed |
| Physical product sales | Not a commerce platform |
| Amazon Fresh integration | No public API; requires direct Amazon BD relationship |
| Uber Eats grocery integration | Restaurant-only API; no grocery affiliate track |
| Background Sync API reliance | Not supported on iOS; foreground-flush sync queue used instead |
| Third-party calorie tracking app sync (MyFitnessPal) | Phase 3+ if demanded; macro display (F07) covers the need natively |

---

## RICE Scoring (Ambiguous Priority Items)

Scoring: Reach (1-10) × Impact (1-3) × Confidence (%) ÷ Effort (weeks)

| Feature | Reach | Impact | Conf | Effort | RICE | Decision |
|---------|-------|--------|------|--------|------|----------|
| F11 AI Fridge-Clearance | 8 | 3 | 60% | 6w | 24.0 | Should Have (Phase 2) |
| F12 Cost-per-serving | 7 | 3 | 70% | 5w | 29.4 | Should Have (Phase 2) |
| F13 Potluck Planner | 5 | 3 | 80% | 4w | 30.0 | Should Have (Phase 2) |
| F14 Batch Prep Mode | 4 | 3 | 75% | 3w | 30.0 | Should Have (Phase 2) |
| F15 Dietary Adaptation | 6 | 2 | 65% | 4w | 19.5 | Should Have (Phase 2) |
| F16 In-Step Coaching | 5 | 2 | 80% | 5w | 16.0 | Should Have (Phase 2) |
| F17 Pantry Onboarding | 4 | 3 | 85% | 2w | 51.0 | **Promote to MVP consideration** |
| F27 Grocery Cost Split | 5 | 3 | 85% | 2w | 63.8 | Should Have (Phase 2) |
| F28 Cook Rotation | 4 | 2 | 80% | 2w | 32.0 | Should Have (Phase 2) |
| F18 Stàge Events | 6 | 3 | 50% | 12w | 7.5 | Phase 3 confirmed |
| F21 Recipe Voting Queue | 5 | 2 | 70% | 3w | 23.3 | Phase 3 confirmed |
| F24 Technique Search | 3 | 2 | 60% | 6w | 6.0 | Phase 3 confirmed |

**RICE Note on F17 (Pantry Onboarding):** Scored 51.0 — highest of ambiguous group. Low effort, high confidence, disproportionate retention impact for Jordan persona. **Recommend promoting to MVP scope.**

---

## Feature Validation (Must Haves)

Every Must Have must satisfy: primary persona → JTBD → core promise break if cut.

| Feature | Primary Persona Pain | JTBD Addressed | Core Promise Break If Cut |
|---------|---------------------|----------------|--------------------------|
| F01 Recipe Engine | Maya's 847-screenshot archive | Unified library | No library → no product |
| F02 Offline PWA | All — grocery aisle signal | Works anywhere | Fails in grocery store → promise broken |
| F03 The Pass | Darius's two-list problem | Household coordination | Solo app only; no network effect |
| F04 Meal Scheduling | Darius's 5pm panic | Pre-planned week | Discovery only; not coordination |
| F05 Deliver Me This | Nadia's 45-second cart | Recipe → grocery order | Monetization at zero; anti-kit promise fails |
| F06 Smart Substitutions | Maya's dairy-free partner | Dietary flexibility | Rigid recipes; flexibility promise breaks |
| F07 Nutritional Intelligence | Nadia's macro tracking | Informed planning | "Smart kitchen" claim is empty |
| F08 Zero-Waste Mode | Maya's eco identity | Digital pre-portioning alignment | Brand differentiator gone; Samsung Food parity only |
| F09 Recipe Scaling | Priya's 4→14 dinner party | Accurate scaling | Large household and party personas blocked |
| F10 Dietary Filtering | Rowan's omni audience | Usable search results | Every search requires manual vetting |

All 10 Must Haves validated. No orphaned Must Have without a persona pain and JTBD.

---

## Critical User Flow Maps

### Flow 1: New User → First Meal Planned → Grocery List
```
Open app (PWA install prompt)
  → A2HS prompt: "Add to Home Screen for offline access" (functional requirement, iOS)
  → Onboarding: skill level / household size / dietary restrictions
  → Starter Pantry checklist (F17)
  → "Recipes you can make now" surface
  → Browse / Search recipe library (F01)
  → Save recipe to "This Week" (F04 calendar)
  → Repeat for 3-5 nights
  → Grocery list auto-generated (F03)
  → Invite household member to list (F03 guest-add)
  → "Deliver Me This" → Instacart IDP (F05)
```
**Target time:** First grocery list generated in <10 minutes

### Flow 2: Shared Household Coordination (Darius)
```
Darius assigns 5 recipes to the week (F04)
  → Grocery list auto-built (F03)
  → Shares household link with wife
  → Wife adds 3 items from her perspective (F03 real-time via WebSocket)
  → Monday: Darius taps "Deliver Me This" (F05)
  → Instacart IDP deep-link opens with full ingredient list
  → Order placed; Stàged earns 5% affiliate commission
```
**Pain eliminated:** Two-list problem, manual cart re-entry, duplicate purchases

### Flow 3: Dinner Party (Priya)
```
Priya selects main dish recipe (F01)
  → Scales 4 → 14 servings (F09)
  → Scaled ingredient list added to event shopping list
  → Creates potluck event (F13) with 5 contribution slots
  → Shares event link (no guest login required)
  → Guests claim slots in real-time
  → Priya taps "Deliver Me This" for her main course ingredients (F05)
```
**Pain eliminated:** Potluck overlaps, manual scaling errors, dual shopping lists

### Flow 4: Fridge Forager (Sam)
```
Sam opens Fridge-Clearance (F11)
  → Taps pantry items nearing expiration (alerted 2 days prior)
  → Enters 2 additional items from fridge
  → Gets 4 recipe suggestions (all ingredients available)
  → Picks one; opens recipe in offline mode (F02)
  → Screen Wake Lock activates: screen stays on while cooking
  → Cooks from it; no delivery app opened
```
**Pain eliminated:** Fridge→delivery failure loop; food waste

### Flow 5: Monetization (Featured Ingredient Placement)
```
Recipe: Chocolate Chip Cookies
  → Ingredient: Butter
  → [Featured] "Chef recommends Kerrygold for best flavor" (via Chicory Phase 2)
  → Tap: add Kerrygold specifically to shopping list
  → "Complete This Cookie Night" bundle: vanilla, flour, chocolate chips suggested
  → "Deliver Me This" routes full bundle to Instacart (affiliate)
```
**Revenue:** Featured ingredient CPC (Chicory) + fulfillment affiliate commission (Instacart IDP 5%) + Smart Bundle increases AOV → higher commission per order

---

## Phased Roadmap

### MVP (Phase 1) — "The Anti-Kit"
**Goal:** Prove core loop: discover → plan → fulfill. Acquire eco-conscious and household-coordinator early adopters.
**Timeline signal:** ~12-16 weeks

| Feature | Code |
|---------|------|
| Open Pantry Recipe Engine | F01 |
| Offline-First PWA (foreground sync, A2HS required) | F02 |
| The Pass: Shared Lists | F03 |
| Meal Scheduling (weekly) | F04 |
| Deliver Me This (Instacart IDP deep-link) | F05 |
| Smart Substitutions | F06 |
| Nutritional Intelligence (USDA + LLM parser) | F07 |
| Zero-Waste Mode | F08 |
| Recipe Scaling | F09 |
| Dietary & Preference Filtering | F10 |
| Pantry Setup Onboarding (RICE promoted) | F17 |

**Monetization in MVP:** Instacart IDP affiliate (5% commission) + featured ingredient placement (editorial format; Chicory integration Phase 2)
**Legal prerequisite:** Register DMCA agent before any recipe import feature goes live.

---

### Phase 2 — "The Full Kitchen"
**Goal:** Differentiate with AI, social coordination, budget intelligence, and full cart API. Activate Sam, Marco, Nadia, Priya.
**Timeline signal:** ~8-12 weeks post-MVP

| Feature | Code | Key Persona |
|---------|------|-------------|
| AI Fridge-Clearance | F11 | Sam |
| Cost-Per-Serving Display | F12 | Marco, Nadia |
| Potluck & Event Planner | F13 | Priya |
| Batch Prep Mode | F14 | Nadia |
| Dietary Adaptation Mode | F15 | Brett, Rowan |
| In-Step Contextual Coaching | F16 | Jordan, Brett |
| Grocery Cost Splitting | F27 | Marcus/The House |
| Cook Rotation Scheduling | F28 | Marcus/The House |
| Instacart IDP full cart API (replace deep-link) | F05+ | Darius, Nadia |
| Kroger developer API (developer.kroger.com) | F05+ | All |
| Chicory CPG placement integration | Monetization | All |

**Monetization additions:** Full Instacart IDP cart API (higher engagement, same commission structure), Kroger affiliate, Chicory CPG placements (requires 10K+ MAU to attract brand spend)

---

### Phase 3 — "The Stàge"
**Goal:** Premium engagement, community, and creator economy. Activate Priya (events), Felix (technique), Alex & Riley (couples).
**Timeline signal:** ~12-16 weeks post-Phase 2

| Feature | Code | Key Persona |
|---------|------|-------------|
| Virtual Stàge Events ($25–$45 consumer / $75–$150 corp) | F18 | Priya, Felix, Alex & Riley |
| Month-View Planning | F19 | Linda |
| Parallel Prep (Two-Cook Mode) | F20 | Alex & Riley |
| Shared Recipe Voting Queue | F21 | Alex & Riley, Marcus/The House |
| Macro Target Tracking | F22 | Nadia |
| Bulk Utilization Tracking | F23 | Linda, Marco |
| Technique-Based Search | F24 | Felix |
| Age-Appropriate Step Tagging | F25 | Claire |
| Smart Kitchen Sensor Hooks | F26 | Founder vision |

**Monetization additions:** Stàge event ticket revenue (revised: $25–$45 consumer, $75–$150 corporate), hardware affiliate links

---

## Risk Assessment

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| Recipe scraping ToS violations | High | High | Launch with licensed partners + user imports (JSON-LD only); DMCA agent required pre-launch |
| Instacart IDP affiliate approval delayed | High | Medium | Apply early; confirm eligibility before launch; deep-link still works without approval |
| Low recipe-to-order conversion (real rate may be 1–3%, not 5–10%) | High | Medium | Conservative financial model; stress-test at 2% conversion |
| AI Fridge-Clearance accuracy disappointment | Medium | High | Set expectation: "suggestions based on your pantry" not "guaranteed match"; human-curated fallback |
| Household invite activation failure (second user never joins) | High | Medium | Guest-add mode (no account required); frictionless invite UX; in-app reminder |
| Featured ingredient placement perceived as intrusive ads | Medium | Medium | Editorial framing ("Chef recommends"); user can hide; only 1 placement per recipe |
| Cost-per-serving data staleness (prices change) | Medium | High | Display as "estimated" with data freshness date; crowd-sourced correction |
| iOS A2HS install ignored → 7-day cache eviction wipes offline data | Medium | High | Aggressive A2HS prompting with clear benefit framing; product requirement, not optional |
| Potluck guest zero-login link abuse | Low | Low | Rate limit; host moderation controls |
| Stàge event profitability at consumer pricing | Medium | Medium | Revised pricing ($25–$45) makes unit economics work; corporate events ($75–$150) are high-margin |
| Zero-Waste Mode bulk availability data gaps | Medium | High | Launch with user-contributed bulk tags; partner with bulk grocery stores Phase 2 |
| Jow (European competitor) expanding to US with Instacart integration | Medium | Medium | Monitor quarterly; Stàged's eco + event gaps remain unaddressed by Jow |
| Zestyplan competing on eco-positioning | Medium | Low-Medium | First-mover advantage; execute quickly; Samsung Food's latency on eco features buys time |
| Samsung Food adding eco-mode (copycat risk) | High | Medium | Positioning + brand identity must be established before Samsung responds; window is 12–18 months |
| Edamam ToS: stored nutrition data must be deleted if contract canceled | Medium | Low | USDA FDC self-hosted dataset removes dependency; Edamam used only for user-submitted recipe analysis (pay per new recipe, not per view) |
