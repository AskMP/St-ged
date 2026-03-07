# Persona Summary & User Stories — Stàged

**Generated:** 2026-03-06
**Agent:** ux-researcher
**Personas:** 14

---

## Persona Summary Table

| # | Name | Archetype | Age | Household | North Star Feature | Core Pain |
|---|------|-----------|-----|-----------|-------------------|-----------|
| 1 | Maya Chen | Eco-Anxious Planner | 31 | 2-person | Zero-Waste Mode | Kit guilt + scattered recipe saves |
| 2 | Darius Okafor | Household Conductor | 42 | Family of 4 | The Pass + Deliver Me This | Two-list chaos, 5pm panic |
| 3 | Priya Nair | Dinner Party Architect | 36 | Solo (hosts) | Potluck Planner + Scaling | Potluck overlaps, manual scaling math |
| 4 | Sam Reyes | Fridge Forager | 27 | 3-person shared | AI Fridge-Clearance | Fridge → delivery failure loop |
| 5 | Felix Dumont | Culinary Student | 22 | Student housing | Technique search + Scaling | Pro tools out of reach; research fragmented |
| 6 | Jordan Park | First Apartment Cook | 23 | Solo (first apt) | Skill-level filter + Pantry onboarding | Confidence gap; TikTok ≠ real instruction |
| 7 | Claire Osei | Parent Teacher | 44 | Family of 5 | Age-tagged steps + Time filter | Can't involve kids meaningfully in limited time |
| 8 | Marco Delgado | Budget Gourmand | 34 | 2-person | Cost-per-serving + Cheap cut filter | No app shows what food costs |
| 9 | Rowan Kelley | Veggie for Omnis | 29 | 3-person shared | Omni-approval filter + Protein display | "Is this enough?" skepticism before every meal |
| 10 | Brett Walsh | Carnivore for Vegans | 38 | 2-person | Vegan adaptation + Ingredient explainer | Unfamiliar pantry; same 3 vegan meals on rotation |
| 11 | Alex & Riley | New Couple | 26/28 | 2-person | Shared recipe queue + Parallel prep | Decision fatigue kills Wednesday night before it starts |
| 12 | Linda Nguyen | Large Family Budget | 46 | 6-8 person | Month-view planner + Bulk utilization | Bulk waste; no system for 4-week horizon |
| 13 | Nadia Patel | Meal Prep Workaholic | 33 | Solo | Batch prep mode + Macro targets | 55-min planning before cooking even starts |
| 14 | Marcus & The House | Greek/Shared Household | 19–23 | 6-10 person | Cost split + Cook rotation + Scaling | One person carries all coordination; Venmo chaos |

---

## Feature → Primary Persona Map

| Feature | Primary Persona(s) | Secondary |
|---------|-------------------|-----------|
| Open Pantry Recipe Engine | Maya, Felix | All |
| Smart Substitutions | Maya, Brett, Jordan | Rowan, Sam, Claire |
| Zero-Waste Mode | Maya, Rowan | Sam, Marco, Linda |
| AI Fridge-Clearance | Sam, Maya | Marco, Linda, Nadia |
| The Pass (shared lists) | Darius, Alex & Riley | Maya, Linda, Brett |
| Meal Scheduling (week view) | Darius, Nadia | Claire, Maya |
| Month-view planning | Linda | Nadia |
| Deliver Me This | Darius, Priya, Nadia | Maya, Brett |
| Potluck/Event Planner | Priya | Darius, Claire |
| Recipe Scaling | Priya, Felix | Darius, Linda |
| Nutritional Intelligence | Nadia, Maya | Felix, Marco, Rowan, Linda |
| Cost-per-serving display | Marco, Linda, Nadia | Jordan, Rowan |
| Cheap cut / ingredient tier filter | Marco | — |
| Skill-level filter + beginner recipes | Jordan | Claire |
| Pantry setup onboarding | Jordan | Brett |
| In-step contextual coaching | Jordan, Brett | Felix |
| Age-tagged step roles | Claire | — |
| Time filter (under X min) | Claire, Nadia | Darius |
| Batch prep mode + cook sequencing | Nadia | Linda |
| Reheats-well recipe filter | Nadia | Sam |
| Macro target tracking | Nadia | Maya, Felix |
| Omni-approved filter | Rowan | — |
| Vegan adaptation mode | Brett | Rowan |
| Ingredient explainers | Brett, Jordan | Felix |
| Parallel prep task splitting | Alex & Riley | Felix, Claire |
| Shared recipe voting queue | Alex & Riley | — |
| Technique-based search | Felix | — |
| Bulk utilization tracking | Linda | Marco, Nadia |
| Stàge Events (live chef) | Priya | Felix, Alex & Riley, Jordan |

---

## Feature Gaps Identified by Persona Expansion

The 9 new personas reveal feature needs NOT present in the original business brief:

| Gap Feature | Surfaced By | Priority Signal |
|-------------|-------------|-----------------|
| Skill-level filtering (beginner mode) | Jordan | High — entry-level onboarding is critical for new cook retention |
| Pantry setup onboarding flow | Jordan | High — starter pantry = foundation for all other features |
| Age-appropriate step tagging | Claire | Medium-High — parent+child cooking is a large underserved niche |
| In-step contextual ingredient explainers | Brett, Jordan | High — bridges knowledge gap for unfamiliar pantry/techniques |
| Cost-per-serving display | Marco, Linda, Nadia | High — explicitly missing from competitive set; high retention driver |
| Cheap cut / ingredient tier filtering | Marco | Medium — high loyalty from cost-driven cooks |
| Batch prep mode (cook sequencing) | Nadia | High — meal prep is a massive use case; Sunday batch ≠ weekly plan |
| Reheats-well recipe filter | Nadia | Medium — functional differentiator for batch cookers |
| Month-view meal planning | Linda | Medium-High — weekly planning is insufficient for large families |
| Bulk utilization / pantry-first planning | Linda, Marco | High — aligns with Zero-Waste mission |
| Omni-approved community recipe rating | Rowan | Medium — community-sourced trust signal |
| Vegan adaptation mode ("Make This Vegan") | Brett | Medium-High — large mixed-diet household use case |
| Macro target tracking (training blocks) | Nadia | Medium — high-value for health-performance users |
| Parallel prep task splitting (two-cook mode) | Alex & Riley | Medium — differentiated for couples |
| Shared recipe voting queue | Alex & Riley | Medium — pre-planning ritual UX |
| Technique-based recipe search | Felix | Medium — professional/student segment |

---

## Prioritized User Stories (Full Expanded Set)

### Tier 1: Core Promise (MVP-Critical)

**Recipe Discovery & Organization**
- As Maya, I want to save recipes from any URL into a unified library so that I stop losing recipes in screenshot archives.
- As Sam, I want to search recipes by ingredients I have so that I can cook without a grocery run.
- As Priya, I want to scale a recipe from 4 to 14 servings so that ingredient quantities update automatically.
- As Jordan, I want recipes filtered by skill level so that I'm never handed something I'll fail at.
- As Felix, I want to search recipes by cooking technique so that I can practice specific skills deliberately.

**Household Coordination**
- As Darius, I want a shared grocery list my wife sees in real-time so that we stop maintaining two separate lists.
- As Darius, I want to assign recipes to specific nights so that I'm not making decisions at 5pm.
- As Alex & Riley, I want to vote on recipes together and save them to a shared queue so that Wednesday is already decided by Sunday.
- As Linda, I want to plan 4 weeks of meals at once so that I can generate one consolidated bulk shopping list.

**Fulfillment**
- As Darius, I want to convert my week's ingredients to an Instacart order in one tap so that I don't retype everything.
- As Nadia, I want one merged grocery list from 5 batch recipes so that Sunday shopping is one trip, not five lists.

**Eco & Waste**
- As Maya, I want to filter recipes by Zero-Waste mode so that I know which use bulk-available ingredients.
- As Sam, I want to see which of my pantry items are expiring soon so that I cook them before they go bad.
- As Linda, I want bulk purchases tracked against my meal plan so that nothing expires unused.

---

### Tier 2: Differentiation (Phase 2)

**Substitutions & Dietary**
- As Maya, I want one-tap dairy-free substitutions so that my partner can eat the same meal.
- As Brett, I want a "Make This Vegan" adaptation so that I can cook my partner's diet confidently.
- As Rowan, I want recipes tagged as "omni-approved" so that I don't have to pre-defend my vegetarian meals.
- As Claire, I want recipe steps tagged by age-appropriate role so that each child has a real task, not just "stir this."

**Nutrition & Cost**
- As Nadia, I want to set macro targets and see whether my prep plan achieves them before I cook.
- As Marco, I want cost-per-serving displayed for every recipe so that I know if a dish fits my target before I cook it.
- As Linda, I want to see my monthly meal plan's estimated cost before I shop so that I stay on budget.

**Event Planning**
- As Priya, I want to create a potluck event where guests claim dish categories so that nothing overlaps.
- As Claire, I want to filter recipes by "under 45 minutes" so that weeknight cooking windows are respected.

**Learning**
- As Brett, I want contextual ingredient explainers (tap to learn) so that I understand why vegan ingredients work.
- As Jordan, I want in-step coaching for unfamiliar techniques so that I don't have to text my parent for help.

---

### Tier 3: Breakout Features (Phase 3)

**AI & Intelligence**
- As Sam, I want AI Fridge-Clearance that takes what I have and suggests makeable recipes so that I skip the delivery app.
- As Maya, I want proactive expiration alerts matched to recipes so that I act before produce goes bad.
- As Nadia, I want a Sunday cook-sequencing plan (parallel task scheduling) so that I finish 5 prep dishes in 2.5 hours.

**Live Events**
- As Priya, I want to book live chef cooking sessions so that I learn technique interactively, not just watch video.
- As Felix, I want to attend professional-level Stàge sessions for culinary development.
- As Alex & Riley, I want to book a live cooking session together as a date night activity.

**Scale & Advanced**
- As Linda, I want a bulk utilization dashboard so that I can see which purchased items still need to be used this month.
- As Felix, I want to log recipe variations and personal notes so that I build a searchable professional archive.
- As Alex & Riley, I want a parallel-prep recipe view split into two simultaneous task tracks.

---

## Evidence Catalog (Business Brief + Persona Derivation)

| Claim | Source | Type |
|-------|--------|------|
| 14.5M+ tons of meal kit packaging waste annually | Business brief | Market data (needs external citation) |
| Meal kit cost: $10–$15/serving vs. grocery $4–$7 | Business brief | Market data (needs external citation) |
| HelloFresh, Blue Apron dominant in kit segment | Business brief | Competitive observation |
| Paprika/AnyList: good UX, no delivery integration | Business brief | Competitive analysis |
| Samsung Food/Whisk: no eco branding, no potluck | Business brief | Competitive gap |
| Instacart Connect: recipe-to-cart API exists | Business brief | Integration proof of concept |
| Meez: professional recipe costing gold standard | Business brief | B2B benchmark |
| Edamam API / USDA FoodData Central | Business brief | Technical resource |
| Skill-level filtering absent from competitive set | Persona derivation (Jordan) | UX gap |
| Cost-per-serving absent from all major apps | Persona derivation (Marco, Linda, Nadia) | Feature gap |
| Age-appropriate cooking step tagging absent | Persona derivation (Claire) | Feature gap |
| Month-view planning absent from consumer apps | Persona derivation (Linda) | Feature gap |
| Batch prep sequencing absent from consumer apps | Persona derivation (Nadia) | Feature gap |
| Mixed-diet household use case underserved | Persona derivation (Brett, Rowan) | Segment gap |
| Cost-splitting / per-person grocery accountability absent | Persona derivation (Marcus/The House) | Feature gap |
| Cook rotation scheduling absent from all apps | Persona derivation (Marcus/The House) | Feature gap |
| Many-member household (6-10) support absent | Persona derivation (Marcus/The House) | Scale gap |
| Recipe voting for group consensus absent | Persona derivation (Marcus/The House, Alex & Riley) | Feature gap |

*Note: Market data figures require external citation before investor or partner use.*
