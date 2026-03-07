# Research Prompt 02 — Fulfillment API Landscape
**Platform:** ChatGPT (primary) | Grok (current API/partner program news) | Gemini, Claude, BigPickle, Raptor Mini, MiniMax (cross-check)
**Topic:** Instacart Connect, Amazon Fresh, Uber Eats — affiliate terms, API access, commission reality

---

## Project Context

Stàged's core monetization model depends on fulfillment affiliate revenue: when a user converts a recipe ingredient list to a grocery delivery order (via Instacart, Amazon Fresh, or Uber Eats/Postmates), Stàged earns a 3–7% commission. The MVP uses a deep-link approach (constructing a URL that opens the partner app pre-populated); Phase 2 upgrades to a full API integration (Instacart Connect).

The product brief assumes: (1) Instacart Connect offers affiliate/referral commission, (2) commission rates are 3–7%, (3) Amazon Fresh has a linkable API, (4) Uber Eats Postmates has a developer API for grocery. All four assumptions need stress-testing.

---

## Claims to Verify

1. "Instacart Connect" — does this API exist as described? What does it actually offer vs. what the brief assumes?
2. "3–7% affiliate commission" from grocery fulfillment partners — is this realistic for a new product without volume?
3. Amazon Fresh affiliate/API access — is there a developer integration path for recipe-to-cart?
4. Uber Eats / Postmates API — does a grocery ordering API exist, or is this consumer-facing only?
5. Are there competitor products (Samsung Food/Whisk) that have successfully integrated Instacart — and on what terms?

---

## Research Questions

1. What is the current state of the Instacart Connect API program — who is it available to, what does it require to access, and what are the integration capabilities (cart pre-fill, affiliate attribution, commission structure)?
2. What affiliate commission rates do Instacart, Amazon Fresh, and similar services offer to third-party recipe/meal planning apps, if any?
3. Are there published case studies or developer documentation showing recipe-to-cart deep linking for Instacart or Amazon Fresh without a full API partnership?
4. What is the application/approval process for Instacart Connect — minimum user threshold, review timeline, geographic restrictions?
5. Does the Amazon Associates / Amazon Fresh program support grocery cart affiliate links from third-party apps?
6. What does the Uber Eats developer API actually cover — restaurant ordering only, or grocery as well?
7. Are there alternative fulfillment affiliate programs (Kroger, Walmart+, Shipt) that might be more accessible to a new app than Instacart Connect?
8. What are the technical constraints of grocery deep-linking — URL format, item matching by UPC vs. name, quantity passing?
9. Has Instacart Connect been granted to consumer recipe apps — which ones? What was their scale at time of approval?
10. What risks exist in the affiliate/deep-link model if a partner changes their URL scheme or blocks referral tracking?

---

## Output Format

1. **API existence verification** — what each API/program actually offers vs. what the brief assumes
2. **Commission reality** — sourced data on actual affiliate rates in the recipe-to-grocery segment
3. **Access barriers** — what it actually takes to get approved for each partner program
4. **Alternative paths** — fulfillment partners not in the brief worth considering
5. **Risk flags** — dependencies that could break the monetization model
6. **Source list** — developer docs, blog posts, news articles, partner program pages

---

## Research Standards

- Prefer primary sources first: official docs, earnings releases, API docs, legal text, platform policies, and first-party pricing pages.
- Separate sourced facts from inference. If you calculate or extrapolate a number, label it clearly as an inference.
- Include exact dates for time-sensitive claims and use current data where available.
- For every material claim, provide a URL or a formal citation.
- If a claim cannot be verified from credible public sources, say that explicitly instead of filling the gap with plausible language.
- If sources conflict, show the range and explain why the estimates may differ.
- Do not repeat assumptions from the brief unless they were independently verified in this research pass.
