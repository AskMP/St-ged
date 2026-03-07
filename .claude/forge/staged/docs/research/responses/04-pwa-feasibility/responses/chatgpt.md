# ChatGPT Research Response — PWA Offline-First Feasibility
Research date: March 6, 2026

## iOS PWA current state

1. Offline access for saved content
   - Supported. Service workers, Cache Storage, and IndexedDB are available in modern iOS Safari and Home Screen web apps.
   - Verdict: Staged can deliver reliable offline recipe access on iOS and Android if the app shell and saved content are cached correctly.

2. Installability
   - Supported, but still uneven.
   - MDN documents that iOS 16.4 and later allow installation from Safari, Chrome, Edge, Firefox, and Orion via the Share menu. Safari does not support `beforeinstallprompt`, so install UX is still less programmable than Chromium.

3. Push notifications
   - Supported for Home Screen web apps on iPhone and iPad since iOS/iPadOS 16.4, per WebKit.

4. Background sync
   - This remains the weak point.
   - MDN and current browser support data do not support assuming reliable Safari support for the Background Synchronization API.
   - Verdict: do not architect around background sync on iOS.

5. Real-time sync
   - Foreground real-time sync is feasible with WebSockets or similar, but background persistence is not guaranteed on iOS. The app must queue mutations locally and flush on reconnect or foreground resume.

## Storage limits table

| Platform / browser family | Practical local-store story | Eviction behavior | Confidence |
| --- | --- | --- | --- |
| Chromium browsers | MDN says browsers based on Chromium can store up to about `60%` of total disk size per origin. | Best-effort storage can still be evicted under storage pressure unless persistent storage is granted. | High |
| Safari / WebKit browser apps on iOS 17+ and macOS 14+ | MDN says browser apps can store up to about `60%` of total disk per origin, with an overall cap around `80%` across all browser-app origins. | WebKit can proactively delete script-created storage for origins that are not interacted with for `7 days`. | High |
| WebKit embedded web views / non-browser web content | MDN says roughly `15%` of total disk per origin, with a lower overall cap. | More constrained than full browser apps; not the right baseline for an offline-first consumer PWA promise. | High |

Notes:
- IndexedDB is not the bottleneck for recipe text. A normalized recipe record is usually small enough that even thousands of recipes fit easily inside modern quotas.
- The real iOS risk is eviction and lifecycle behavior, not raw capacity.

## Recommended architecture

1. App shell
   - Precache the shell, route scaffolding, fonts, and small critical assets.
   - Keep the shell aggressively small so first load over slow mobile networks stays under the `<3s` goal.

2. Data layer
   - Store recipes, grocery lists, pantry data, and mutation queue state in IndexedDB.
   - Cache images separately and lazily; do not bundle recipe images into the critical offline payload.

3. Sync model
   - Use local-first writes.
   - Queue mutations offline.
   - Flush on `online`, app foreground, or explicit user action.
   - Use WebSocket while the app is foregrounded, but treat it as an optimization, not the system of record.

4. Cache strategy
   - App shell: `cache-first` with versioning.
   - Recipe JSON and list state: `stale-while-revalidate` or local-first merge, depending on conflict model.
   - Highly volatile endpoints: `network-first` with resilient fallback.

5. Conflict strategy
   - Household grocery lists need deterministic conflict handling. Timestamp-only merge logic is not enough once multiple users edit quantities and notes offline.

## Known failure modes

1. Safari storage eviction after inactivity.
2. Service-worker update bugs that leave users on an old shell while API schemas move forward.
3. Cache bloat from images or unbounded response caching.
4. WebSocket reconnect storms after the device regains connectivity.
5. Orphaned offline mutations that never flush because the app depended on background sync that never fired.
6. IndexedDB schema migrations that fail mid-upgrade and strand users on a broken local store.

## Stack recommendations

1. Workbox for service-worker lifecycle, precaching, routing, and retry patterns.
2. IndexedDB as the primary offline store.
3. A local mutation queue plus explicit reconnect handling instead of Safari-dependent background sync.
4. WebSocket for foreground collaboration; fall back to polling or server-driven refresh when the socket drops.
5. WebRTC is viable for live streaming in a PWA because the API is broadly supported, but use a native wrapper only if you need native-only audio/video controls, deep OS integration, or background behavior beyond what browsers allow.
6. Treat `99%+ offline reliability` as plausible for active users, not as a browser-guaranteed SLA on iOS.

## Source list

1. MDN, "Storage quotas and eviction criteria," accessed March 6, 2026. URL: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
2. MDN, "Background Synchronization API," accessed March 6, 2026. URL: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
3. MDN, "Making PWAs installable," accessed March 6, 2026. URL: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
4. WebKit Blog, "Web Push for Web Apps on iOS and iPadOS," February 16, 2023. URL: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
5. MDN, "IndexedDB API," accessed March 6, 2026. URL: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
6. MDN, "WebSocket," accessed March 6, 2026. URL: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
7. MDN, "WebRTC API," accessed March 6, 2026. URL: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
8. Chrome for Developers, "Workbox," accessed March 6, 2026. URL: https://developer.chrome.com/docs/workbox
9. Chrome for Developers, "workbox-background-sync," accessed March 6, 2026. URL: https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
10. Can I use, browser support data for Background Sync and related PWA features, accessed March 6, 2026. Citation used as compatibility cross-check.
