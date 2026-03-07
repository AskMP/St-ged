# Research Response 04 — PWA Offline-First Feasibility
**Source:** Claude (Sonnet 4.6) with live web research
**Date:** 2026-03-06
**Topic:** Service Worker reliability, IndexedDB limits, iOS Safari PWA gaps, offline sync patterns

---

## 1. iOS PWA Current State (2025–2026)

### What Works on iOS Safari (iOS 17+)
- **Service Worker fetch caching**: Reliable for offline page and asset delivery; this is the backbone of offline recipe access
- **Add to Home Screen (A2HS)**: Works reliably on iOS 17+; installed PWAs run in standalone mode (no browser chrome)
- **IndexedDB**: Supported and functional for structured data storage
- **Storage API**: Fully supported from Safari 17.0 — `StorageManager.estimate()` works, origins can request persistent storage
- **Cache API**: Functional for asset caching
- **WebRTC**: Supported in Safari (relevant for Stàge Events live streaming)
- **Safari 18.4 additions**: Declarative Web Push, Screen Wake Lock — both relevant for Stàged use cases

### What Still Doesn't Work Well on iOS (2025)
- **Background Sync API**: Not reliably supported on iOS; background sync for list updates when app is not in foreground is unreliable
- **Push Notifications**: Added to iOS 16.4+, but reliability issues persist — service worker listeners may not trigger after device restarts; users can become unexpectedly unsubscribed
- **Background execution**: iOS aggressively limits background tasks to conserve battery; general background processing is unreliable
- **Web Share Target API**: Limited support compared to Android

### EU Regulatory Note (Important for EU Expansion)
In February 2024, Apple removed PWA Home Screen support in the EU as part of iOS 17.4's DMA compliance. Following developer pushback, Apple reversed this decision and restored full PWA support in the EU before the 17.4 release. As of 2025–2026, EU PWA support is intact.

### iOS 17 vs iOS 14–16
iOS 17 brought meaningful improvements:
- Persistent storage request (Storage API) now supported
- Increased storage quotas (no longer the hard 50MB cap from earlier versions)
- Safari 17.0 brought significant PWA infrastructure improvements

---

## 2. Storage Limits Table

| Platform | Storage Type | Limit | Eviction Behavior |
|----------|-------------|-------|-------------------|
| iOS Safari 17+ (browser) | IndexedDB + Cache combined | Up to 80% of total disk space (overall quota for browser apps) | Best-effort by default; 7-day script-writable data eviction if no user interaction |
| iOS Safari 17+ (Home Screen PWA) | IndexedDB + Cache combined | Same quota as browser; persistent mode available | **No 7-day eviction** for Home Screen apps; persistent storage can be requested |
| Android Chrome | IndexedDB + Cache combined | Up to 60% of available disk | Browser evicts from least-recently-used origins when disk is full |
| iOS Safari pre-17 | Cache API | ~50MB hard cap (Cache API) | Aggressive eviction; 7-day expiration |

**Critical finding:** The 7-day data eviction policy on iOS does **not** apply to installed (Home Screen) PWAs. This is a key design implication: Stàged must prominently encourage A2HS installation on iOS to preserve offline data between grocery trips.

**Storage budget for recipe library:**
- A normalized recipe record (JSON): ~2–5KB without images; ~50–200KB with compressed thumbnail
- Text-only recipe library (10,000 recipes × 5KB): ~50MB — well within iOS 17+ limits
- With compressed images: plan for ~5–10MB per 100 recipes; 1,000 cached recipes with thumbnails ≈ 50–100MB
- iOS 17+ provides sufficient storage for a practical recipe library if users install the PWA

---

## 3. Recommended Architecture for Stàged

### Caching Strategy: Stale-While-Revalidate (SWR)
For a recipe app where content is frequently added/updated, **Stale-While-Revalidate** is the recommended caching strategy:
- Serve the cached version immediately (enabling offline access)
- Revalidate in the background when online
- Update the cache with fresh data
- Works well for recipe content that changes but where "stale" data is acceptable in the short term

Use **Cache-First** for: app shell, static assets, pre-downloaded recipe content
Use **Network-First** for: real-time list sync, fresh grocery price data, live event feeds

### Offline-First Sync Architecture
For shared household lists requiring real-time sync:
1. **Local-first writes**: All list mutations write to IndexedDB immediately
2. **Sync queue**: Pending changes accumulate in a service worker-managed queue
3. **Background sync attempt**: When connectivity returns, flush the queue to the server
4. **Conflict resolution**: Last-write-wins or timestamp-based merge for list items
5. **Reconnection fallback**: Since Background Sync is unreliable on iOS, implement foreground reconnection: when the app comes to foreground, detect network and flush queue

### Workbox (Recommended)
Google's **Workbox** library is the de facto standard for service worker management in 2025:
- Handles stale-while-revalidate, cache-first, network-first strategies declaratively
- Manages cache versioning and cleanup
- Provides a sync queue module for offline mutations
- Works with all major bundlers (Vite, webpack, Next.js)

---

## 4. Known Failure Modes

### Failure Mode 1: iOS Safari 7-Day Eviction (Non-Home-Screen Users)
Users who don't install the PWA to their home screen will have their offline recipe cache cleared if they don't open the app within 7 days. A grocery shopper who plans meals on Sunday and shops the following Saturday (6 days later) is safe. But a user who plans on the 1st and shops on the 10th loses their cache.
**Mitigation:** Aggressive A2HS install prompting; cache recipes the user marks as "saved" with persistent storage flag.

### Failure Mode 2: Push Notification Unreliability on iOS
Real-time household list update notifications are unreliable on iOS PWAs — service worker listeners may not fire after device restart.
**Mitigation:** Poll for list updates on app foreground events as a fallback; don't rely solely on push for critical coordination.

### Failure Mode 3: Cart Sync on Reconnect Race Condition
If two household members edit the same shopping list while offline (one at the store, one at home), conflicting writes will occur on reconnect.
**Mitigation:** Timestamp-based conflict resolution; show conflict indicator in UI; last-write-wins is acceptable for grocery list items.

### Failure Mode 4: Cache Corruption on Service Worker Update
If the service worker is updated while the user has cached recipes, old cache entries may conflict with new data schemas.
**Mitigation:** Version IndexedDB schemas; implement migration logic on SW activation; use Workbox's cache versioning.

### Failure Mode 5: iOS 17 Safari Caching Regressions
iOS 17 introduced new caching bugs for apps that worked in 16.6.1 — documented in Apple Developer Forums (thread #737827). These were primarily related to navigation caching.
**Mitigation:** Test extensively on iOS 17+ during development; monitor Apple developer forums for Safari regressions.

---

## 5. Stack Recommendations (2025–2026)

| Layer | Recommendation | Rationale |
|-------|---------------|-----------|
| Service Worker management | **Workbox 7+** | Industry standard; handles strategies, cache versioning, sync queues |
| Local storage (structured data) | **IndexedDB via Dexie.js** | Dexie adds a clean async API over raw IndexedDB; excellent TypeScript support |
| Offline sync | **Custom sync queue + Workbox BackgroundSyncPlugin** | Background Sync API fallback with foreground flush for iOS reliability |
| Real-time list sync (online) | **WebSocket with polling fallback** | WebSocket for low-latency household sync; HTTP polling when WS unavailable |
| PWA manifest | **Standard Web App Manifest** | Full support across iOS 17+ and Android Chrome |
| Performance | **Route-based code splitting + critical CSS inlining** | Target <3s on 3G; route splitting reduces initial bundle |
| WebRTC (live events) | **WebRTC API directly or via mediasoup/LiveKit** | Safari WebRTC support is solid; mediasoup or LiveKit for SFU infrastructure |

### Performance Target Validation
The <3s load on 3G target is achievable with:
- App shell architecture (static HTML + CSS loads instantly from cache)
- Lazy loading recipe images
- Service Worker precaching of critical routes
- Target: First Contentful Paint <1s from cache, <3s from network on 3G (Lighthouse target)

### WebRTC and Live Events
WebRTC is supported in Safari and does not require a native wrapper for PWA deployment. Using a WebRTC SFU (Selective Forwarding Unit) like **LiveKit** (open source) or **Daily.co** enables multi-participant live cooking events within a PWA context.

---

## 6. Source List

| Source | Date | URL |
|--------|------|-----|
| WebKit Blog — Updates to Storage Policy | 2023 | https://webkit.org/blog/14403/updates-to-storage-policy/ |
| MobileLoud — PWA on iOS Complete Guide 2026 | 2025 | https://www.mobiloud.com/blog/progressive-web-apps-ios |
| BrainHub — PWA on iOS Status 2025 | 2025 | https://brainhub.eu/library/pwa-on-ios |
| MagicBell — PWA iOS Limitations and Safari Support | 2025 | https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide |
| Apple Developer Forums — iOS 17 Safari PWA issues | 2023 | https://developer.apple.com/forums/thread/737827 |
| MDN — Storage quotas and eviction criteria | 2025 | https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria |
| web.dev — Storage for the web | 2024 | https://web.dev/articles/storage-for-the-web |
| RxDB — IndexedDB Max Storage Size | 2025 | https://rxdb.info/articles/indexeddb-max-storage-limit.html |
| WebKit Bug #178204 — IndexedDB on iOS | Ongoing | https://bugs.webkit.org/show_bug.cgi?id=178204 |
| Medium — PWAs on iOS in 2025 | 2025 | https://ravi6997.medium.com/pwas-on-ios-in-2025-why-your-web-app-might-beat-native-0b1c35acf845 |
| Vinova — Navigating Safari/iOS PWA Limitations | 2025 | https://vinova.sg/navigating-safari-ios-pwa-limitations/ |
| Scandiweb — iPhone iOS PWA Strategies | 2025 | https://scandiweb.com/blog/pwa-ios-strategies/ |
