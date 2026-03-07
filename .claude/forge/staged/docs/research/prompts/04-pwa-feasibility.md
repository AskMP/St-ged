# Research Prompt 04 — PWA Offline-First Feasibility
**Platform:** ChatGPT (primary) | GitHub Copilot (implementation specifics) | Claude, BigPickle, Raptor Mini, MiniMax, Grok (cross-check)
**Topic:** Service Worker reliability, IndexedDB limits, iOS Safari PWA gaps, offline sync patterns

---

## Project Context

Stàged is built as an offline-first PWA — recipes must be accessible in grocery store aisles without signal, shared lists must sync on reconnect, and pantry data must persist locally. The product promises <3s load on 3G and 99%+ offline access reliability for saved recipes. Core technical stack assumptions: Service Worker + IndexedDB for local storage, WebSocket or polling fallback for real-time list sync, PWA manifest for installability.

The product has a specific iOS concern: iOS Safari's Service Worker and PWA support has historically lagged Chrome. This needs a current (2025–2026) assessment.

---

## Claims to Verify

1. Service Workers provide reliable offline access to saved recipes on both iOS Safari and Android Chrome
2. IndexedDB is sufficient for storing thousands of recipes offline per user
3. PWA "Add to Home Screen" works reliably on iOS as of 2025
4. WebSocket connections can be maintained or gracefully fall back for real-time list sync
5. <3s load on 3G is achievable for a recipe PWA with offline-first architecture

---

## Research Questions

1. What is the current state of Service Worker support on iOS Safari (2025)? Specifically: background sync, push notifications, and offline fetch caching reliability?
2. What are the practical IndexedDB storage limits per origin on iOS Safari vs. Android Chrome — and when does the browser evict cached data?
3. Has Apple's iOS 17/18 improved PWA capabilities meaningfully compared to iOS 14–16? What is still missing?
4. What are the known failure modes of offline-first recipe apps — when does the offline cache become stale or corrupt?
5. How do production PWAs handle WebSocket reconnection and queue-flushing when a user returns from offline (grocery store) to online (home)?
6. What is the realistic storage budget for an offline recipe library: what does a normalized recipe record weigh (JSON), how many can be stored before hitting iOS limits?
7. What service worker caching strategy is recommended for an app where recipes are frequently added/updated (stale-while-revalidate, cache-first, network-first)?
8. Are there production examples of offline-first PWAs at grocery/cooking scale — what stack do they use?
9. What are the performance benchmarks for PWA vs. native app in kitchen/cooking use cases — are there user studies on preference?
10. What tools/frameworks (Workbox, etc.) are recommended for building offline-first PWA with complex sync requirements in 2025–2026?
11. Is WebRTC viable for the Stàge Events live streaming feature within a PWA context, or does it require a native wrapper?
12. What are the HTTPS/SSL requirements and gotchas for PWA deployment that could affect launch?

---

## Output Format

1. **iOS PWA current state** — what works, what doesn't, what's improved recently
2. **Storage limits table** — iOS vs. Android IndexedDB limits, eviction behavior
3. **Recommended architecture** — offline-first pattern that best fits Stàged's requirements
4. **Known failure modes** — what breaks in production offline-first PWAs
5. **Stack recommendations** — frameworks, libraries, patterns for 2025
6. **Source list** — MDN docs, caniuse, WebKit blog, GitHub issues, dated

---

## Research Standards

- Prefer primary sources first: official docs, earnings releases, API docs, legal text, platform policies, and first-party pricing pages.
- Separate sourced facts from inference. If you calculate or extrapolate a number, label it clearly as an inference.
- Include exact dates for time-sensitive claims and use current data where available.
- For every material claim, provide a URL or a formal citation.
- If a claim cannot be verified from credible public sources, say that explicitly instead of filling the gap with plausible language.
- If sources conflict, show the range and explain why the estimates may differ.
- Do not repeat assumptions from the brief unless they were independently verified in this research pass.
