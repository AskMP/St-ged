# Persona: Marco — The Budget Gourmand

**Generated:** 2026-03-06
**Agent:** ux-researcher

---

## Identity

| | |
|--|--|
| **Name** | Marco Delgado |
| **Age** | 34 |
| **Location** | Phoenix, AZ |
| **Household** | Lives with partner; both frugal by choice, not necessity |
| **Occupation** | HVAC technician |
| **Income** | ~$72K ($130K household) |
| **Tech Comfort** | Moderate — uses apps pragmatically, not enthusiastically |
| **Food Identity** | "I will spend 4 hours making something that costs $6 in ingredients and it will be incredible." |

---

## Goals

- Cook restaurant-quality food at home without spending restaurant money
- Plan meals around weekly grocery store sales and seasonal produce
- Never pay full price for a protein — always buy on sale and freeze
- Understand his actual food cost per serving, not just a vague sense of "it was cheap"
- Cook impressive dishes for his partner and occasional guests without breaking $15/head

---

## Frustrations

- Recipe apps show no ingredient costs — he has to look up everything separately
- Sale items at the grocery store don't map to any recipe he has loaded
- Can't easily find recipes filtered by "cheap protein" or "uses affordable cuts" (beef chuck, chicken thighs, dried beans)
- No app accounts for pantry staples he already owns when estimating a dish's cost
- When he buys in bulk (10 lbs of dried lentils), there's no tool to help him plan around that investment

---

## Jobs to Be Done (JTBDs)

1. **Cost JTBD:** When I'm planning this week's meals, I want to see estimated ingredient cost per serving so I can stay under my target without guessing.
2. **Sale JTBD:** When chicken thighs are on sale for $1.49/lb, I want to quickly find the best recipes for that ingredient so I can build the week around the deal.
3. **Pantry JTBD:** When I've already got dried beans, rice, and canned tomatoes, I want recipes that use those staples as a base and only require a small fresh ingredient spend.
4. **Cut JTBD:** When I search for beef recipes, I want to filter by affordable cuts (chuck, short rib, shank) rather than getting filet mignon suggestions.

---

## Empathy Map

### SAYS
- "Chicken thighs are always better than chicken breasts anyway, and they're half the price"
- "I can make a better bolognese than most restaurants for $4 a bowl"
- "Nobody needs to spend $50 on groceries for one dinner"
- "I want to know exactly what I'm spending, not approximately"

### THINKS
- *Every expensive ingredient has a cheaper substitute that tastes just as good with the right technique*
- *Why don't apps just tell me what things cost?*
- *If I had a tool that helped me plan around the weekly sale, I'd use it every week without fail*

### DOES
- Checks the grocery store weekly circular before deciding what to cook
- Buys proteins on sale and freezes in meal-sized portions
- Calculates dish costs manually in his head (and is usually accurate within $0.50)
- Watches ChefSteps and Serious Eats for technique; skips glossy food media

### FEELS
- Genuinely proud of cooking great food within tight constraints — it's a skill he's cultivated
- Frustrated that no consumer tool respects this use case
- Competitive with himself to find the most impressive meal at the lowest cost
- Dismissive of meal kits — he sees them as objectively poor value

### SAYS/DOES CONTRADICTIONS
- Says he doesn't care about presentation — but photographs dishes he's proud of
- Says he shops intuitively — but actually has a systematic sale-driven weekly routine he hasn't formalized
- Says cost tracking is a priority — but does it manually with no record-keeping

---

## Journey Map

### Weekly Sale-Driven Planning
1. **Trigger:** Wednesday grocery circular comes out. Chuck roast: $3.99/lb.
2. **Research:** Opens browser, searches "best chuck roast recipes." Gets 30 results, no cost data.
3. **Selection:** Picks a braise. Mentally calculates cost: ~$4.50/serving with pantry staples. That works.
4. **Shopping:** Buys 4 lbs. Also buys whatever else he needs. Eyeballs pantry against the list.
5. **Execution:** Nails it. Costs $4.20/serving. Makes a mental note of the win. Nowhere to log it.

**Pain peaks:** Search (no "budget cut" filter), no in-app cost data, no logging of wins and cost history

---

## Scenarios

**Scenario A — Sale Trigger:**
Marco opens Stàged on Wednesday. Taps "Sale Planning" → enters "chuck roast" as the featured ingredient. Gets 12 recipes using chuck roast, sorted by cost-per-serving (lowest first). Top result: red wine braised short ribs, $3.80/serving. He taps it. The system calculates cost assuming he already has the pantry staples he's logged. He saves the recipe and adds the 3 missing fresh ingredients to the list.

**Scenario B — Cheap Cuts Filter:**
Marco is in the mood for a beef dish. Filters recipe library by "affordable cuts" → sees options organized around chuck, flank, shank, oxtail. Gets 8 results. Picks braised oxtail. Tags it as "$4.10/serving — Sunday showstopper."

---

## Accessibility Considerations
- Often cooks long braises on weekends → offline access to multi-step recipes during 4-hour cook time
- Mentally tracks cost in his head → cost-per-serving must be displayed early in recipe view, not buried
- Moderate tech comfort → feature discovery must be intuitive; won't dig for buried functionality

---

## Feature Relevance Map

| Feature | Relevance | Why |
|---------|-----------|-----|
| Cost-per-serving display | Critical | His entire planning paradigm — currently done manually |
| Affordable cut / ingredient tier filtering | Critical | "Give me chuck, not filet" — core search behavior |
| Open Pantry (pantry-aware cost calc) | High | Deduct owned staples from cost estimate |
| AI Fridge-Clearance (pantry-first) | High | Builds meals around what he has vs. new spend |
| Smart Substitutions (budget) | High | Cheaper ingredient swaps with technique notes |
| Zero-Waste Mode | High | Bulk buying requires waste prevention planning |
| Meal Scheduling | Medium | Plans week around the circular, not arbitrary nights |
| Nutritional Intelligence | Low-Medium | Awareness but not a driver |
| The Pass | Medium | Partner coordination on shopping trips |
| Deliver Me This | Low | Prefers in-person shopping; knows his store's layout |
| Stàge Events | Medium | Would pay for a live butchery or braising technique class |
