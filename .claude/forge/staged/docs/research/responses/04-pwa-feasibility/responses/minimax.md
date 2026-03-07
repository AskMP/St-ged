# Research Response 04 — PWA Offline-First Feasibility

**Source:** MiniMax Researcher
**Date:** 2026-03-06
**Topic:** Service Worker reliability, IndexedDB limits, iOS Safari PWA gaps, offline sync patterns

---

## 1. iOS PWA Current State (2025-2026)

### Service Worker Support

Service Workers are supported in iOS Safari starting from iOS 11.3 (2018), with significant improvements in subsequent versions. As of iOS 18.x and Safari 18.x (2025), the following capabilities are available:

| Capability | iOS Safari Status | Android Chrome Status | Notes |
|-----------|-------------------|----------------------|-------|
| Service Worker Registration | ✅ Supported | ✅ Supported | Full lifecycle support |
| Offline Caching (Fetch) | ✅ Supported | ✅ Supported | Cache API fully functional |
| Push Notifications | ✅ iOS 16.4+ (Home Screen PWAs only) | ✅ Supported | Requires VAPID subscription |
| Background Sync | ❌ NOT Supported | ✅ Supported | Major limitation for Stàged |
| Periodic Background Sync | ❌ NOT Supported | ❌ NOT Supported | Limited browser support globally |
| Cache API | ✅ Supported | ✅ Supported | Full read/write/delete |
| Web Push (Declarative) | ✅ Safari 18.4+ (macOS), iOS pending | ✅ Supported | New in 2025, different from Web Push |

**Critical Finding**: Background Sync is **not supported** on iOS Safari. This is the most significant limitation for Stàged's shared list synchronization feature. The Background Sync API allows the browser to automatically retry failed requests when connectivity returns—without it, you must implement manual synchronization logic.

### What Works on iOS PWAs (2025)

- **Offline App Shell**: Cached HTML/CSS/JS loads without network
- **IndexedDB Storage**: Persistent local database works reliably
- **Add to Home Screen**: Manual installation produces standalone app icon
- **Web Push Notifications**: iOS 16.4+ supports push for Home Screen PWAs (not regular Safari)
- **Camera/Microphone Access**: getUserMedia API works in PWA context
- **Geolocation**: Full API support
- **Orientation/Lock**: Screen orientation API supported

### What's Improved in iOS 17/18

| Feature | iOS 16.x | iOS 17.x | iOS 18.x | Notes |
|---------|----------|-----------|----------|-------|
| Web Push | Partial | Improved | Declarative Push added | 18.4 introduced declarative push (macOS), iOS pending |
| Offline Storage | ~50MB default | Unchanged | Unchanged | Storage quota remains limited |
| PWA Installation | Manual only | Manual only | Manual only | No automatic install prompt |
| Push Opt-in Rates | Low | Low | Improving | Still significantly below native |
| Service Worker Reliability | Moderate | Improved | Stable | Fewer random terminations |

### What Still Missing on iOS

- **No Background Sync**: Must implement custom queue-and-retry logic
- **No Periodic Background Sync**: Cannot schedule automatic data refresh
- **No App Store Presence**: PWAs cannot be distributed via App Store
- **Limited Push Notification Features**: No action buttons, no categorization
- **No NFC Access**: Cannot read recipe tags via NFC
- **Limited File System Access**: File System Access API not supported
- **No AR/VR Support**: WebXR not available
- **Splash Screen Customization**: Limited control over launch screen

---

## 2. Storage Limits: IndexedDB iOS vs Android

### Storage Quota Overview

| Browser/Platform | Initial Quota | Maximum Quota | Eviction Policy | Notes |
|------------------|---------------|---------------|-----------------|-------|
| **iOS Safari (PWA)** | ~50 MB | ~200 MB - 1 GB | No automatic eviction | Storage persists for Home Screen PWAs |
| **iOS Safari (Regular)** | ~50 MB | ~200 MB | May purge under storage pressure | Less reliable persistence |
| **Android Chrome** | ~1/3 of free space | Up to several GB | LRU eviction | More generous, varies by device |
| **Desktop Safari** | Unlimited (prompt user) | User-controlled | No automatic eviction | Mac storage preferences |
| **Desktop Chrome** | ~1/3 of free space | Up to several GB | LRU eviction | Dynamic based on disk space |

### iOS Safari Storage Details

**Key Findings for Stàged**:

1. **Initial Allocation**: iOS Safari allocates approximately 50 MB for IndexedDB storage initially
2. **Automatic Expansion**: Storage can expand up to 200 MB without user interaction
3. **Beyond 200 MB**: Requires explicit user permission prompt
4. **PWA Persistence**: When a PWA is added to Home Screen, storage is generally more persistent than regular Safari browsing
5. **No Guaranteed Persistence**: Apple does not guarantee data will survive device restarts or OS updates (though empirically it usually does)

### Storage Calculation for Recipes

| Recipe Complexity | JSON Size (Uncompressed) | Compressed Size | Recipes per 100MB |
|-------------------|--------------------------|-----------------|-------------------|
| Simple (title, ingredients, steps) | 2-5 KB | 1-2 KB | 20,000 - 50,000 |
| Medium (with tags, notes, nutrition) | 5-15 KB | 3-8 KB | 6,500 - 20,000 |
| Complex (with images as base64, variations) | 50-200 KB | 20-80 KB | 500 - 5,000 |
| With Image URLs (external) | 3-10 KB | 2-5 KB | 20,000 - 50,000 |

**Recommendation**: Store recipes with external image URLs rather than inline images. This dramatically increases storage capacity. A 100 MB IndexedDB limit comfortably stores 10,000-20,000 recipe records with metadata.

---

## 3. Recommended Architecture: Offline-First Pattern for Stàged

### Architecture Overview

For Stàged's requirements (offline recipe access, shared list sync, pantry persistence), the recommended architecture combines:

```
┌─────────────────────────────────────────────────────────┐
│                    Client (PWA)                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │ App Shell   │  │ IndexedDB   │  │ Sync Queue   │   │
│  │ (Cache API) │  │ (Dexie.js)  │  │ (Mutation)   │   │
│  └─────────────┘  └─────────────┘  └──────────────┘   │
│         │                │                 │          │
│         └────────────────┼─────────────────┘          │
│                          ▼                             │
│              ┌─────────────────────┐                  │
│              │   Service Worker    │                  │
│              │  (Workbox-managed) │                  │
│              └─────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │  Recipes │    │  Lists   │    │  Pantry  │
   │   API    │    │  Sync    │    │   Sync   │
   └──────────┘    └──────────┘    └──────────┘
```

### Recommended Caching Strategies by Content Type

| Content Type | Strategy | Rationale |
|--------------|----------|-----------|
| App Shell (HTML, CSS, JS) | **Cache First** | Never changes without deployment; instant load |
| Static Images/Icons | **Cache First** | Rarely change; optimize for speed |
| Recipe JSON Data | **Stale-While-Revalidate** | Users expect fresh data but cached is acceptable |
| Shared Lists (Real-time) | **Network First with Cache Fallback** | Freshness critical; offline must work |
| User Preferences | **Cache Only** | Local only, never hits network |
| API Polling | **Network First** | Always try fresh, fallback to cache |

### Offline Queue Architecture (Critical for iOS)

Since Background Sync is unavailable on iOS, implement a custom queue:

```javascript
class OfflineQueue {
  constructor() {
    this.db = new Dexie('StagedQueue');
    this.db.version(1).stores({ pending: '++id, type, payload, timestamp' });
  }
  
  async enqueue(type, payload) {
    await this.db.pending.add({ type, payload, timestamp: Date.now() });
    await this.processQueue();
  }
  
  async processQueue() {
    const items = await this.db.pending.toArray();
    for (const item of items) {
      try {
        await this.syncItem(item);
        await this.db.pending.delete(item.id);
      } catch (error) {
        if (error.status === 409) {
          await this.handleConflict(item);
        }
        break;
      }
    }
  }
}
```

---

## 4. Known Failure Modes: Production Offline-First PWAs

### Cache-Related Failures

| Failure Mode | Description | Frequency | Mitigation |
|--------------|-------------|-----------|------------|
| **Stale Cache Serving** | User sees old recipe data after update | Common | Version cache keys, implement cache expiration |
| **Cache Corruption** | IndexedDB data becomes unreadable | Rare | Implement data validation, backup strategy |
| **Service Worker Update Failure** | New SW installs but fails to activate | Uncommon | Add update listeners, force reload prompt |
| **Race Conditions** | Cache fetch races with network request | Occasional | Use Workbox's built-in strategies |

### Storage Failures

| Failure Mode | Description | Frequency | Mitigation |
|--------------|-------------|-----------|------------|
| **Quota Exceeded** | IndexedDB throws quota error | Occasional | Monitor usage, implement cleanup UI |
| **Storage Inaccessible** | Private browsing or storage cleared | On privacy clear | Graceful degradation, re-download prompt |
| **Data Migration Failure** | Schema upgrade loses data | Rare | Version upgrade handling, backup |

### Network/Sync Failures

| Failure Mode | Description | Frequency | Mitigation |
|--------------|-------------|-----------|------------|
| **Silent Sync Failure** | Background sync fails silently | Common (iOS) | Implement explicit sync status UI |
| **Partial Sync** | Some items sync, others fail | Occasional | Queue processing with individual error handling |
| **Conflict Data Loss** | Concurrent edits cause data loss | Rare | Conflict resolution UI, timestamp ordering |
| **WebSocket Disconnection** | Real-time sync drops | Frequent on mobile | Exponential backoff reconnection |

---

## 5. Stack Recommendations: Frameworks & Libraries (2025-2026)

### Recommended Technology Stack

| Layer | Recommendation | Alternative | Notes |
|-------|---------------|-------------|-------|
| **Framework** | React 18+ or Vue 3+ | Svelte, Solid | Large ecosystem, PWA plugins available |
| **PWA Plugin** | vite-plugin-pwa (Vite) | Workbox CLI, angular-service-worker | Best DX, automatic updates |
| **Local Database** | Dexie.js (IndexedDB wrapper) | idb, localForage | Excellent TypeScript support, query API |
| **State Management** | Zustand or Jotai | Redux Toolkit | Lightweight, works offline |
| **Sync Logic** | Custom + Yjs (CRDT) | Automerge, RxDB | For shared list conflict resolution |
| **HTTP Client** | TanStack Query | SWR, RTK Query | Built-in caching, offline support |
| **UI Components** | Material Web or Tailwind | Custom | PWA-ready components available |

### Workbox Integration

Workbox remains the industry standard for Service Worker management in 2025:

- **Usage**: 54% of mobile sites with service workers use Workbox
- **Benefits**: Pre-built strategies, cache expiration, background sync helpers
- **Maintenance**: Actively maintained by Google Chrome Chrome team
- **Integration**: Built into Vite, Webpack, Angular CLI, Create React App

---

## 6. WebSocket & Real-Time Sync Considerations

### WebSocket Viability for Shared Lists

**Finding**: WebSocket connections are viable but require careful fallback implementation.

| Aspect | Assessment |
|--------|------------|
| **Basic Connection** | ✅ Works on iOS Safari and Android Chrome |
| **Offline Reconnection** | ⚠️ Requires custom implementation |
| **Background Connection** | ❌ iOS terminates background connections |
| **Battery Impact** | Moderate - careful with ping intervals |

### Recommended Approach: Hybrid WebSocket + Polling

For grocery store → home scenario:

1. **When Online**: Use WebSocket for real-time list updates
2. **When Offline**: Queue changes in IndexedDB
3. **On Reconnect**: Flush queue, then poll for missed updates
4. **Fallback**: Polling every 30-60 seconds if WebSocket fails

### WebRTC for Stàged Events (Live Streaming)

**Finding**: WebRTC is technically viable in PWA context but with significant limitations.

| Aspect | iOS Safari | Android Chrome | Desktop |
|--------|------------|---------------|---------|
| **getUserMedia** | ✅ Supported | ✅ Supported | ✅ Supported |
| **RTCPeerConnection** | ✅ Supported | ✅ Supported | ✅ Supported |
| **DataChannel** | ⚠️ Limited | ✅ Full | ✅ Full |
| **Screen Sharing** | ❌ Not supported | ✅ Supported | ✅ Supported |
| **Simulcast** | ⚠️ Limited | ✅ Supported | ✅ Supported |

**Recommendation**: For Stàged Events live streaming:

- **Viable**: 1:1 video calls, small group streams
- **Native Required**: Large-scale live events, screen sharing, advanced controls
- **Alternative**: Use a dedicated streaming service (Mux, Daily.co, LiveKit) with PWA-compatible WebRTC SDK

---

## 7. Performance: <3s Load on 3G Target

### Achievability Assessment

**Finding**: <3 second load on 3G is achievable with offline-first architecture.

| Metric | Target | PWA Achievable |
|--------|--------|----------------|
| **First Contentful Paint (FCP)** | < 3s on 3G | ✅ With cached app shell |
| **Time to Interactive (TTI)** | < 3s on 3G | ✅ With cached JS |
| **Largest Contentful Paint (LCP)** | < 3s on 3G | ⚠️ Depends on images |

### Requirements for 3G Performance

| Technique | Implementation |
|-----------|----------------|
| **App Shell Caching** | Cache-first for HTML/CSS/JS bundle |
| **Code Splitting** | Load route chunks on demand |
| **Image Optimization** | WebP, responsive images, lazy loading |
| **Service Worker Precache** | Precach critical assets on install |
| **Font Subsetting** | Only load required glyphs |
| **Budget**: JS < 100KB initial, CSS < 50KB | Minify, tree-shake |

---

## 8. HTTPS Requirements for PWA Deployment

### HTTPS Mandates

**Finding**: HTTPS is required for all PWA features.

| Feature | HTTPS Required |
|---------|---------------|
| Service Workers | ✅ Mandatory |
| IndexedDB | ⚠️ Recommended (required for some features) |
| Web Push Notifications | ✅ Mandatory |
| WebSocket | ✅ Mandatory |
| Geolocation | ✅ Mandatory |
| GetUserMedia (camera/mic) | ✅ Mandatory |
| Payment Request API | ✅ Mandatory |

### SSL Certificate Requirements

| Certificate Type | PWA Compatible | Notes |
|-----------------|---------------|-------|
| **Let's Encrypt** | ✅ Yes | Free, auto-renewal available |
| **DigiCert** | ✅ Yes | Commercial, premium support |
| **GoDaddy Standard** | ✅ Yes | Basic validation |
| **Self-Signed** | ❌ No | Will not work for Service Workers |
| **HTTP** | ❌ No | Service Workers blocked |

### Deployment Checklist

- [ ] SSL certificate from trusted CA (Let's Encrypt recommended for cost)
- [ ] Redirect HTTP → HTTPS (server-level)
- [ ] HSTS header enabled (HTTP Strict Transport Security)
- [ ] Valid certificate chain (no errors in browser)
- [ ] Certificate covers all subdomains if using API
- [ ] Consider certificate renewal automation (Let's Encrypt = 90 days)

---

## 9. Claims Verification Summary

| Claim | Assessment | Confidence |
|-------|------------|------------|
| **Service Workers provide reliable offline access** | ✅ Viable but with iOS limitations | High |
| **IndexedDB sufficient for thousands of recipes** | ✅ Yes, ~10K-50K recipes in 100MB | High |
| **PWA "Add to Home Screen" works on iOS** | ⚠️ Works but manual process only | Medium |
| **WebSocket + fallback for list sync** | ✅ Requires custom queue implementation | High |
| **<3s load on 3G achievable** | ✅ With proper caching architecture | High |

---

## 10. Source List

1. **MDN Web Docs - Storage API**: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria (2024-2025)
2. **MDN Web Docs - IndexedDB**: https://developer.mozilla.org/en-US/docs/web/api/indexeddb_api (2024)
3. **Chrome Developers - Workbox**: https://developer.chrome.com/docs/workbox/caching-strategies-overview (2025)
4. **WebKit Blog - Safari 18.4**: https://webkit.org/blog/16574/webkit-features-in-safari-18-4/ (March 2025)
5. **WebKit Blog - Declarative Web Push**: https://webkit.org/blog/16535/meet-declarative-web-push (March 2025)
6. **web.dev - Storage for the Web**: https://web.dev/articles/storage-for-the-web (2024-2025)
7. **RxDB - IndexedDB Max Storage Limit**: https://rxdb.info/articles/indexeddb-max-storage-limit.html (2026)
8. **Brainhub - PWA on iOS 2025**: https://brainhub.eu/library/pwa-on-ios (June 2025)
9. **MobiLoud - PWA on iOS Guide 2026**: https://www.mobiloud.com/blog/progressive-web-apps-ios (February 2026)
10. **Vite PWA Plugin**: https://vite-pwa.dev/ (2024-2025)
