As of early 2026, the PWA landscape on iOS has reached a "mature but constrained" state. While Apple has expanded hardware access (Screen Wake Lock, Push), the core **Background Sync API** remains the primary "missing link" for a seamless offline-first experience on Safari.

### 1. iOS PWA Current State (Safari 18.4 / iOS 19)

The "iOS Gap" has narrowed, but architectural workarounds are still required for real-time coordination.

* **Service Worker Reliability:** High for caching and push notifications. However, **Background Sync, Background Fetch, and Periodic Background Sync are still unsupported.** Code only runs when the PWA is in the foreground or briefly when a push notification is received.
* **Installability:** "Add to Home Screen" is stable. In 2026, iOS supports the `manifest.json` `id` field, making updates to icons and app names more reliable without losing user data.
* **Push Notifications:** Fully supported since iOS 16.4. **Declarative Web Push** (Safari 18.4) simplified the implementation, though users *must* add the app to the Home Screen before they can subscribe.
* **Screen Wake Lock:** Now supported (Safari 18.4). This is a "killer feature" for Stàged, allowing users to keep the screen on while following a recipe without touching the device with messy hands.

---

### 2. Storage Limits & Eviction Behavior

The "50MB limit" is a legacy myth for installed PWAs. Modern WebKit is much more generous but aggressive about "inactive" data.

| Platform | IndexedDB Quota (per origin) | Eviction Policy | Persistent Storage |
| --- | --- | --- | --- |
| **iOS Safari (Tab)** | ~20% of Disk Space | **7-day "inactive" purge** (if not used) | No (Best-effort only) |
| **iOS PWA (Home Screen)** | **Up to 60% of Disk Space** | Protected from 7-day purge | **Yes** (via `navigator.storage.persist()`) |
| **Android Chrome** | Up to 60% of Disk Space | Least Recently Used (LRU) | Yes |

> **Note:** For Stàged, a typical recipe (JSON + metadata) is **~5KB–15KB**. Storing 1,000 recipes takes <15MB. The limit is not the total storage, but the **Cache API** for high-res food images, which can easily hit GBs.

---

### 3. Recommended Architecture: "The Hybrid Sync"

Since the **Background Sync API** is missing on iOS, Stàged cannot rely on the browser to "wake up" and sync a grocery list while the phone is in a pocket.

* **Pattern:** **Foreground Queue + Optimistic UI.**
1. User checks an item offline: Update **IndexedDB** immediately (Optimistic UI).
2. Add the mutation to a **Sync Queue** in IndexedDB.
3. On `visibilitychange` (app foregrounded) or `online` event: Flush the queue via a standard `fetch()` or WebSocket.


* **Caching Strategy:** **Stale-While-Revalidate (SWR).**
* Load the recipe from the cache immediately (<1s).
* Fetch updates from the network in the background.
* Notify the user with a "Recipe Updated" toast if changes are found.



---

### 4. Known Failure Modes

* **The "EU Toggle" Risk:** Apple briefly attempted to disable PWAs in the EU in 2024. While they reversed this, they maintain the right to restrict "Advanced Web APIs" to WebKit-based PWAs.
* **Sync Stall:** If a user closes the app immediately after checking a box (before the network request finishes), that checkmark remains "local only" until the next time they open the app. Stàged should show a "Pending Sync" icon.
* **Manifest Caching:** iOS is notoriously aggressive about caching the `manifest.json`. Changing the `start_url` or theme color often requires a manual service worker update trigger.

---

### 5. 2026 Stack Recommendations

* **Framework:** **Vite + `vite-plugin-pwa**`. It handles the heavy lifting of Workbox configuration and manifest generation.
* **Database:** **RxDB** or **Dexie.js**. These provide high-level wrappers for IndexedDB with built-in conflict resolution and sync protocols (essential for household list sharing).
* **Live Events:** **WebRTC** is viable for "Live Chef" features in a PWA, but you must enforce **H.264** as the primary codec for iOS compatibility.

---

### 6. Source List

1. **WebKit Blog (2024-2026):** *New Webkit Features in Safari 17/18/26.*
2. **MDN Web Docs:** *Storage Quotas and Eviction Criteria (Updated Jan 2026).*
3. **MobiLoud (2026):** *The Complete Guide to PWAs on iOS.*
4. **RxDB Documentation:** *Offline-First Sync Patterns for Web Applications.*
5. **Caniuse.com:** *Background Sync API Support Tables.*

**Would you like me to draft the Service Worker "Stale-While-Revalidate" logic specifically for your Recipe API endpoints?**