# Prompt 04 - PWA Offline-First Feasibility (Meal-Planning App)
**Date:** 2026-03-06  
**Scope:** Service worker reliability, IndexedDB limits, iOS Safari PWA gaps, offline sync and realtime patterns  
**Method:** First-party docs prioritized (MDN, WebKit, Apple, Google/Chrome docs), with dated compatibility data and explicit confidence tags.

## Assumptions Under Test
| Assumption | Verdict | Confidence | Why |
|---|---|---:|---|
| 1) Service Workers provide reliable offline access on iOS Safari and Android Chrome | **Partially true** | High | Service workers are supported on iOS Safari (since 11.3) and Android Chrome, but iOS still lacks Background Sync/Periodic Sync and has stronger eviction constraints. [S5][S1][S2][S8] |
| 2) IndexedDB is sufficient for storing thousands of recipes offline per user | **Likely true** | Medium-High | Quotas are large on modern iOS/Android, but eviction policy and device/storage-pressure behavior matter more than raw quota. [S8][S7] |
| 3) PWA Add-to-Home-Screen works reliably on iOS as of 2025 | **Partially true** | Medium-High | A2HS exists and improved (incl. third-party browsers since iOS 16.4), but `beforeinstallprompt` is unsupported on iOS; flow remains less uniform than Chromium. [S4][S6] |
| 4) WebSocket connections can be maintained or gracefully fall back for real-time list sync | **Graceful fallback required** | High | Long-lived sockets are not guaranteed; missed events on disconnect must be resynced; libraries provide reconnection but app-level state recovery is mandatory. [S14][S15] |
| 5) `<3s` load on 3G is achievable for offline-first recipe PWA | **Conditionally achievable; not guaranteed** | Medium | No universal benchmark for "kitchen/recipe 3G <3s"; achievable with aggressive app-shell + cache strategy and strict payload budgets. Industry evidence shows SW gains, but dataset is older and app-specific. [S21][S16][S17] |

---

## 1) iOS PWA Current State (works, gaps, recent improvements)

### Verified facts
- **Service Workers:** Supported on iOS Safari since 11.3 (per compatibility tables). [S5]  
- **Web Push on iOS/iPadOS:** Supported for **Home Screen web apps** beginning iOS/iPadOS 16.4; permission must come from user interaction. [S4][S3]  
- **Install prompt API gap:** `beforeinstallprompt` is **not supported** in Safari/iOS; install UX is manual/share-sheet based. [S6]  
- **Background Sync:** One-off Background Sync (`SyncManager`) is **not supported** in Safari/iOS. [S1][S26]  
- **Periodic Background Sync:** **Not supported** in Safari/iOS. [S2]  
- **Storage model improvements in iOS 17 era:** WebKit raised quota model and added fuller Storage API support; Home Screen web apps share browser-app quota tier. [S7][S8]  
- **iOS 17.4 EU path:** Alternative browser engines are permitted in EU with entitlement on iOS 17.4+, which can change behavior depending on engine used. [S10]  
- **Safari 17.4/18.0:** Added many web features, but no evidence of iOS support for Background Sync APIs; core installability gap (`beforeinstallprompt`) remains in Safari/iOS. [S11][S12][S6]

### What improved vs iOS 14-16
- Major step: iOS 16.4 added Home Screen Web Push, Badging API, and broader A2HS support via third-party browsers' share menus. [S4]  
- iOS 17+ changed quota policy and improved storage tooling visibility/behavior. [S7]  

### What is still missing (material for offline-first)
- No native Background Sync / Periodic Sync on iOS Safari. [S1][S2]  
- No `beforeinstallprompt` event on iOS Safari. [S6]  
- Data can still be evicted under policy conditions (including Safari proactive behavior). [S8]

**Conclusion confidence:** **High**

---

## 2) Storage Limits Table (IndexedDB/Cache API quotas, eviction)

### Verified facts table
| Platform/context | Per-origin quota (modern) | Overall browser quota | Eviction behavior | Notes |
|---|---|---|---|---|
| **iOS Safari / WebKit browser app (iOS 17+)** | ~60% of total disk | ~80% of total disk | LRU under storage pressure; proactive Safari eviction rules apply | Home Screen web apps use browser-app quota class. [S7][S8] |
| **iOS WKWebView/non-browser embedded app (iOS 17+)** | ~15% of total disk | ~20% of total disk | Same broad mechanisms, lower ceiling | Important if app is embedded webview, not Safari web app. [S7][S8] |
| **iOS Home Screen web app** | Same as browser app (~60%) | Same as browser app (~80%) | Same as above | Explicitly called out by WebKit policy update. [S7] |
| **Android Chrome/Chromium** | Up to ~60% of total disk per origin | Browser-level max can trigger eviction across origins | Best-effort data may be evicted under pressure; persistent requests handled heuristically | Chromium quotas are large but not absolute guarantees. [S8] |

### Eviction and risk details
- Browser-stored data is best-effort by default; `persist()` may reduce eviction risk but is not guaranteed to be granted. [S8][S9]  
- Safari can proactively evict script-created storage for origins without recent interaction (7-day behavior in certain tracking-prevention conditions). [S8]  
- Eviction is origin-wide: IndexedDB + Cache API data can be deleted together, causing full offline-state loss if not recoverable. [S8]  
- Pre-iOS 17 Safari behavior (historical) included initial 1 GiB threshold and user prompts for more. [S8]

**Conclusion confidence:** **High**

---

## 3) Recommended Architecture (offline-first pattern for this app)

### Verified constraints to design around
- iOS lacks Background Sync APIs; queue replay cannot rely on browser background delivery. [S1][S2]  
- WebSockets are broadly supported, but disconnections and missed events are normal and expected. [S14][S15]  
- Service workers and media capture APIs require secure contexts (HTTPS; localhost exceptions for local dev). [S22][S23][S24]

### Recommendation (opinionated design)
1. **Data layers**
- `Cache API`: App shell and immutable/static assets (icons, CSS, JS, route shells).  
- `IndexedDB`: Recipe metadata, normalized entities, user plans/shopping lists, mutation outbox, sync checkpoints/version vectors.

2. **Caching policy**
- **App shell/static:** `CacheFirst` + revisioned assets. [S16]  
- **Recipe documents/list APIs:** `StaleWhileRevalidate` + ETag/Last-Modified validation. [S16][S17]  
- **User-critical mutable docs (shopping list, plan):** `NetworkFirst` with timeout fallback to IDB. [S16]

3. **Offline write/sync model**
- Always write user mutations to an **IDB outbox** first (`op_id`, `entity_id`, `op_type`, `base_version`, `payload`, `ts`).  
- On Chromium: use Workbox Background Sync queue plugin where supported. [S13]  
- On iOS: replay outbox on app resume, `online` event, and periodic foreground timers (because no Background Sync API). [S1][S2][S13]

4. **Realtime model**
- Primary channel: WebSocket.
- Reconnect with exponential backoff + jitter.
- On reconnect, request server delta since `last_ack_cursor`; never assume uninterrupted stream.
- If socket unavailable, fall back to polling/SSE (or Socket.IO long-poll fallback patterns). [S14][S15]

5. **Conflict strategy**
- For collaborative shopping list: per-item version + server authoritative merge.
- Use idempotency keys to prevent duplicate replay on flaky networks.

6. **Storage budgeting for "thousands of recipes"**
- **Model estimate (not directly standardized):** normalized recipe JSON text record often lands in ~5-15 KB range depending on ingredient/instruction richness.
- Practical estimate:
	- 5,000 recipes x 10 KB = ~50 MB raw JSON
	- + indexes/metadata overhead (~20-40%) => ~60-70 MB
	- + thumbnails dominates quickly (e.g., 5,000 x 50 KB = 250 MB)
- Recommendation: keep offline package modular and default to **text-first + selective image packs**.

### Realistic storage budget recommendation
- Target default offline cache budget around **100-250 MB** per user on iOS for operational safety (despite larger theoretical quota), and expose controls to purge media caches.
- Actively monitor with `navigator.storage.estimate()` and request `persist()` where justified. [S8][S9]

**Conclusion confidence:** **Medium-High**

---

## 4) Known Failure Modes (what breaks in production)

### Verified failure modes
- **Buggy service worker fetch handler** can produce blank pages or hard stale responses. [S18]  
- **Stale cache logic conflicts** between HTTP cache and SW cache can return outdated content longer than intended. [S17]  
- **Origin-wide eviction** can wipe IndexedDB + Cache together, causing apparent corruption/data loss unless recovery exists. [S8]  
- **No iOS Background Sync** means queued writes can stall until app foregrounds. [S1][S2]  
- **WebSocket disconnect gaps** cause missed events unless explicit resync protocol exists. [S14]  
- **Inactive SW startup latency** can add delay before controlled response path, especially mobile. [S21]

### Recommendation mitigations
- Keep a tested **no-op SW rollback** playbook and stable SW URL. [S18]  
- Embed schema versioning/migrations for IDB; on mismatch, rebuild deterministic projections from server snapshots + local outbox.  
- Add "data freshness" metadata in UI (last synced timestamp).  
- Treat realtime as optimization, not source of truth.

**Conclusion confidence:** **High**

---

## 5) Stack Recommendations (2025-2026)

### Verified ecosystem choices
- **Workbox** remains the most practical SW toolkit for routing strategies + background-sync queue abstraction. [S13][S16]  
- **IndexedDB + Storage API (`estimate`, `persist`)** are core for large offline datasets. [S8][S9]  
- **Custom install guidance on iOS** is still needed due to missing `beforeinstallprompt`. [S6][S20]  
- **Secure context baseline** is mandatory for SW, push/media APIs. [S22][S23][S24]

### Recommended stack (opinion)
- SW/runtime: Workbox (`workbox-routing`, `workbox-strategies`, `workbox-background-sync`, `workbox-expiration`).
- Local DB: IndexedDB wrapper (Dexie or equivalent) + explicit migration framework.
- Sync transport: HTTP delta sync + WebSocket realtime overlay + polling fallback.
- Observability: queue depth, replay latency, sync error rate, eviction detection telemetry.
- Media/live feature: WebRTC is viable in PWA context, but requires TURN and adaptive bitrate planning; not an offline channel. [S25][S24]

### Production examples at grocery/cooking scale
- **Rakuten 24 (grocery/everyday ecommerce)** publicly documents Workbox usage (`workbox-webpack-plugin`), cache-first for CSS/JS, stale-while-revalidate for images, and custom install instructions for iOS/Android. [S20]  
- **Other cooking-scale public stack details:** **unverifiable** from first-party docs collected here as of 2026-03-06.

### PWA vs native benchmark (kitchen/cooking use case)
- Direct apples-to-apples "kitchen app PWA vs native" benchmark: **unverifiable** from first-party sources in this pass.
- Available evidence: service workers can materially improve repeat-load and first-paint distributions in real deployments (older IOWA case study; dated 2016). [S21]

**Conclusion confidence:** **Medium**

---

## 6) Source List (dated, explicit)

- **[S1]** MDN - Background Synchronization API (compat table shows Safari/iOS no support), last modified 2024-04-22.  
	https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
- **[S2]** MDN - Web Periodic Background Synchronization API (Safari/iOS no support), last modified 2025-09-08.  
	https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API
- **[S3]** MDN - Push API (Safari iOS support noted from 16.4 in compat data), last modified 2025-05-28.  
	https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- **[S4]** WebKit Blog - Web Push for Web Apps on iOS and iPadOS (iOS/iPadOS 16.4), 2023-02-16.  
	https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- **[S5]** caniuse - Service Workers (Safari iOS support starts 11.3), usage data Feb 2026.  
	https://caniuse.com/serviceworkers
- **[S6]** MDN - `beforeinstallprompt` event (Safari/iOS no support), last modified 2025-05-02.  
	https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
- **[S7]** WebKit Blog - Updates to Storage Policy (Safari 17/iOS 17 quota policy), 2023-08-10.  
	https://webkit.org/blog/14403/updates-to-storage-policy/
- **[S8]** MDN - Storage quotas and eviction criteria (Safari/Chromium quotas, eviction behavior), last modified 2026-01-05.  
	https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- **[S9]** MDN - `StorageManager.persist()` (availability and behavior), last modified 2024-07-26.  
	https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- **[S10]** Apple Developer - Alternative browser engines in EU (iOS 17.4+ entitlement path).  
	https://developer.apple.com/support/alternative-browser-engines/
- **[S11]** WebKit Blog - WebKit Features in Safari 17.4, 2024-03-05.  
	https://webkit.org/blog/15063/webkit-features-in-safari-17-4/
- **[S12]** WebKit Blog - WebKit Features in Safari 18.0, 2024-09-16.  
	https://webkit.org/blog/15865/webkit-features-in-safari-18-0/
- **[S13]** Chrome Developers - Workbox Background Sync (fallback behavior on unsupported browsers).  
	https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
- **[S14]** Socket.IO Docs - Handling disconnections (reconnect + missed events reality), last updated 2026-02-04.  
	https://socket.io/docs/v4/tutorial/handling-disconnections
- **[S15]** MDN - WebSockets API (no backpressure on classic WebSocket; stream variant limitations), last modified 2025-12-15.  
	https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- **[S16]** Chrome Developers - Workbox caching strategies overview.  
	https://developer.chrome.com/docs/workbox/caching-strategies-overview/
- **[S17]** web.dev - Service worker caching and HTTP caching (strategy tradeoffs, staleness implications), last updated 2020-07-17.  
	https://web.dev/articles/service-worker-caching-and-http-caching
- **[S18]** Chrome Developers - Removing buggy service workers (production failure/recovery patterns), last updated 2021-10-20.  
	https://developer.chrome.com/docs/workbox/remove-buggy-service-workers
- **[S19]** web.dev - Offline fallback page (offline UX baseline pattern), 2020-09-24.  
	https://web.dev/articles/offline-fallback-page
- **[S20]** web.dev case study - Rakuten 24 PWA (grocery/ecommerce, Workbox + install strategy), last updated 2020-11-17.  
	https://web.dev/case-studies/rakuten-24
- **[S21]** web.dev case study - Measuring real-world SW performance impact (IOWA), last updated 2016-07-22.  
	https://web.dev/case-studies/service-worker-perf
- **[S22]** MDN - Service Worker API (lifecycle, secure-context requirement), last modified 2025-11-30.  
	https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **[S23]** MDN - Secure Contexts, last modified 2025-11-30.  
	https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts
- **[S24]** MDN - `getUserMedia()` secure-context requirement, last modified 2025-11-30.  
	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- **[S25]** MDN - WebRTC API (browser support/interoperability guidance), last modified 2025-06-26.  
	https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **[S26]** caniuse - Background Sync API (Safari/iOS not supported), usage data Feb 2026.  
	https://caniuse.com/background-sync

---

### Final feasibility call
- **Feasible** to build an offline-first recipe/meal-planning PWA for iOS + Android in 2025-2026.
- **Critical caveat:** iOS requires a **foreground-driven sync architecture** (not browser background sync) plus robust recovery for eviction and reconnect scenarios.
