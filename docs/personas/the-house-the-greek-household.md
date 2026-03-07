# Persona: The House — Greek/Shared Household Meal Coordination

**Generated:** 2026-03-06
**Agent:** ux-researcher

---

## Identity

| | |
|--|--|
| **Household Name** | "The House" — a 6-person college rental / Greek chapter house |
| **Primary User** | Marcus Webb, 21, self-appointed "house cook" / social chair |
| **Other Members** | 5 roommates, ages 19–23; rotating cast of guests |
| **Location** | Athens, GA (college town) |
| **Occupation** | Undergrad (Marcus: Econ junior); others: various |
| **Income** | Marcus: $0 (depends on parents + part-time); house food budget: $400–$600/mo pooled |
| **Tech Comfort** | Very high — all native app users, Discord-first coordination |
| **Food Identity** | "We eat together most nights. Nobody wants to coordinate it but someone has to." |

---

## Goals

- Feed 6+ people consistently without one person shouldering all the planning and cost
- Distribute grocery costs fairly across housemates (avoid the "I always pay more" argument)
- Cook large batches that stretch over multiple meals (one cook, feeds everyone twice)
- Plan around a shared house food budget rather than individual grocery runs
- Make "house dinner" a social ritual — not just logistics

---

## Frustrations

- Nobody agrees on what to eat until 7pm when everyone's already starving
- One person (Marcus) always ends up buying groceries and chasing reimbursements on Venmo
- Dietary restrictions across 6 people: one vegetarian, one lactose intolerant, one "I don't eat fish" — coordinating this is chaotic
- No tool accounts for cooking-for-8 as a default — everything defaults to 2 or 4 servings
- Whoever makes dinner gets praised; whoever planned it gets nothing — coordination labor is invisible

---

## Jobs to Be Done (JTBDs)

1. **Coordination JTBD:** When it's "house dinner" night, I want everyone to weigh in on the meal before 5pm so we're not deciding when we're already hungry.
2. **Cost JTBD:** When we buy groceries for the house, I want the cost split clearly so that nobody feels like they're subsidizing everyone else.
3. **Scale JTBD:** When I'm cooking for 6–10 people on a Tuesday night, I want the recipe to already be scaled to that headcount — not the default 4 servings I have to manually triple.
4. **Rotation JTBD:** When one person always ends up cooking, I want a cook rotation system so the load is shared and nobody burns out.

---

## Empathy Map

### SAYS
- "Someone just pick something, I don't care"
- "Who's buying groceries this week? It's not my turn"
- "I cooked last Tuesday. Can someone else do it?"
- "Jake doesn't eat fish, Tyler's vegetarian — we've been over this"

### THINKS (Marcus)
- *I like cooking but I'm carrying the coordination load for everyone*
- *If we just had a plan at the start of the week, none of this would be a problem*
- *Someone's going to complain about the cost split again*

### THINKS (Other Housemates)
- *I'll just eat whatever someone makes — I don't want to be the one to plan it*
- *Marcus always buys more expensive stuff — I feel bad but also I don't want to say anything*

### DOES
- Sends a "what should we eat tonight" message to the house Discord at 6pm
- Marcus buys groceries, screenshots the receipt, posts it in Discord, waits for Venmo
- House dinner happens 3-4x/week but is never planned more than 2 hours in advance
- Whoever cooked gets praised but the planning coordination is invisible and unsustainable

### FEELS
- Marcus: capable and proud as the house cook; increasingly resentful of being the default planner
- Other housemates: grateful but passive; happy for someone else to organize it
- Collectively: bonded around shared meals but frustrated by the administrative overhead

### SAYS/DOES CONTRADICTIONS
- Says "someone just decide" — but everyone defers to Marcus anyway, which he resents
- Says the cost split is fair — but the person who plans always ends up slightly over-contributing
- Says they want to share the cooking — but the cook rotation breaks down after 2 weeks every time

---

## Journey Map

### House Dinner Night (Tuesday, Recurring)
1. **Trigger:** 5:30pm. 6 people in the house. Nobody has thought about dinner.
2. **Discord:** Marcus posts "what are we eating." Gets 4 "idk" responses and 1 "not fish."
3. **Decision:** Marcus picks — pasta, because it scales and he knows how to make it.
4. **Grocery:** Marcus goes to the store. Spends $38. Gets the ingredients. Also buys snacks.
5. **Cooking:** Makes pasta for 8. Takes 40 minutes. Everyone shows up.
6. **Venmo:** Posts the receipt minus snacks ($31). Chases 3 people for $5.17. Gets paid back by Thursday.
7. **Repeat:** Same thing next week. Marcus is starting to resent it.

**Pain peaks:** Decision (6-person consensus at the worst time), grocery accountability (Venmo chase), cook rotation decay (nobody else picks it up)

---

## Scenarios

**Scenario A — Shared House Voting + Budget Split:**
Monday morning, Marcus opens Stàged and creates "House Dinner — Tuesday." Shares a link to the house Discord. By noon, 5 people have voted on 3 recipe options. Chili wins. Marcus taps "Scale to 8 servings." Ingredients auto-adjust. He taps "Split grocery cost" — each housemate gets a $6.20 Venmo request auto-generated from the ingredient list. He shops. Nobody chases anyone.

**Scenario B — Cook Rotation:**
Marcus sets up a 6-person cook rotation in Stàged. Each Tuesday, the assigned cook gets a notification: "Your turn this week — here are 3 recipes that fit the house's restrictions." The house sees who's on deck. Marcus cooks 1 in 6 Tuesdays instead of every Tuesday.

**Scenario C — Dietary Restriction Baseline:**
House dietary profile saved: Tyler (vegetarian), Jake (no fish), Priya (lactose intolerant). Every recipe search for "house dinner" automatically filters to dishes compatible with all three. Marcus never has to remember who can't eat what.

---

## Accessibility Considerations
- 6+ simultaneous users from the same household → shared household model must support many-member groups, not just 2-4
- College budget → cost-per-serving display and cost-splitting features are directly tied to retention
- Discord-native users → sharing links that work without requiring app download is critical (guest-add mode)
- Loud, communal environment → recipe steps must be glanceable; nobody's reading carefully while other people are talking

---

## Feature Relevance Map

| Feature | Relevance | Why |
|---------|-----------|-----|
| Recipe Scaling (8-10 default) | Critical | Every house dinner is large-batch by definition |
| The Pass (shared lists, many-member) | Critical | One list for 6 people replaces Discord chaos |
| Cost split / per-person grocery tracking | Critical | Venmo chasing is their #1 friction point |
| Shared recipe voting | High | Democratic decision-making resolves "someone just pick" |
| Cook rotation scheduling | High | Distributes coordination labor; prevents Marcus burnout |
| Dietary filtering (household profile) | High | Tyler/Jake/Priya restrictions must be saved, not memorized |
| Meal Scheduling | High | Setting "House Tuesday" as a recurring event |
| Deliver Me This | Medium | Instacart for large orders when nobody wants to go to the store |
| AI Fridge-Clearance | Medium | Large shared pantry has unpredictable contents |
| Nutritional Intelligence | Low | Not a driver for this group |
| Zero-Waste Mode | Low | Not top of mind; budget is the primary eco-analog |
| Potluck Planner | High | Chapter events, tailgates, game-day parties |
| Stàge Events | Low | Not a use case for this group |
| Batch Prep Mode | Medium | Large batches for multiple meals |
