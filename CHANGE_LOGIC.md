# RPM DIESEL SPA - CHANGE LOGIC & ENGINEERING GUIDELINES

> **Purpose:**
> This document governs all future code modifications, refactorings, and feature additions across the RPM Diesel SPA repository. Because the codebase features monolithic JavaScript files, global state variables, and real-time Firebase subscriptions without a build compiler, strict adherence to these rules is mandatory to guarantee zero regression and 100% stability.

---

## 1. Coding Patterns in the Project

### 1.1 Vanilla ES6+ with Direct DOM Manipulation
- There is no React/Vue/Angular build step in the main portal. The application uses native JavaScript `document.getElementById()`, `querySelector()`, and template literals.
- **Pattern:**
  ```javascript
  const container = document.getElementById('target-id');
  if (container) {
    container.innerHTML = `<div class="...">...</div>`;
  }
  ```
- **Rule:** Always guard DOM queries with null checks before invoking methods or assigning properties (`if (el) el.textContent = ...`).

### 1.2 Two-Tier Fast Cache Hydration
- Initial view loads must be instantaneous, even on cold reloads or slow 2G/3G connections.
- **Pattern:**
  ```javascript
  // 1. Instant hydration from localStorage
  let historyEntries = loadCache('rpm_cache_entries', []);
  
  // 2. Background live network subscription
  entriesRef.on('value', snapshot => {
    const data = snapshot.val() || {};
    historyEntries = Object.values(data);
    saveCache('rpm_cache_entries', historyEntries);
    renderLedgerTable();
  });
  ```
- **Rule:** Any change to the structure of cached objects (`entries`, `locations`, `vehicles`, etc.) must either maintain backward compatibility with stale cache data or update the cache key / version.

### 1.3 Decoupled Photo Storage (Large Payload Guard)
- Heavy Base64 image payloads (receipts, odometer photos) are decoupled into dedicated Firebase nodes (`entryPhotos`, `driverRequestPhotos`).
- **Pattern:**
  - Small metadata (e.g. `hasReceiptPhoto: true`, `hasKmPhoto: true`) is stored directly on the primary entry record.
  - Actual image data is fetched on-demand only when a user opens the preview modal (`db.ref('entryPhotos').child(recordId).once('value')`).
- **Rule:** Never save raw Base64 image data directly into the root `/entries` or `/driverRequests` records. Always route image writes to `/entryPhotos` or `/driverRequestPhotos`.

### 1.4 Global Window Namespace Exposure
- HTML event handlers frequently use inline triggers (e.g., `onclick="openReceiptModal('${id}')"`).
- **Rule:** Functions referenced in dynamically generated HTML string templates MUST be attached explicitly to `window`:
  ```javascript
  window.openReceiptModal = openReceiptModal;
  ```

### 1.5 XOR Obfuscation for Runtime Secrets
- Credentials and private tokens use an XOR cipher decoded at startup (`_secDecrypt()`) with secret key `RPM_DIESEL_SPA_2026_SECURE_KEY_88391`.
- **Rule:** Do not store plain text API keys in commit history. Use the project cipher function when updating credentials.

---

## 2. Naming Conventions

| Category | Convention | Examples |
| :--- | :--- | :--- |
| **Global State Arrays** | `camelCase` ending in `List` | `historyEntries`, `locationsList`, `vendorsList`, `driversList` |
| **Lookup Maps** | `camelCase` ending in `Map` | `vehicleKeysMap`, `vendorKeysMap`, `driverKeysMap` |
| **Firebase References** | `camelCase` ending in `Ref` | `entriesRef`, `locationsRef`, `dieselRateRef`, `tasksRef` |
| **Cache Keys** | Snake case prefixed with `rpm_cache_` | `rpm_cache_entries`, `rpm_cache_locations`, `rpm_cache_drivers` |
| **Auth Keys** | Snake case prefixed with `rpm_` | `rpm_logged_in`, `rpm_user_role`, `rpm_assigned_vendor` |
| **DOM Section IDs** | Kebab case prefixed with `sec-` | `sec-dashboard`, `sec-diesel-management`, `sec-reports` |
| **Render Functions** | `camelCase` prefixed with `render` | `renderDashboardStats()`, `renderLedgerTable()`, `renderVehiclesGrid()` |
| **Modal Triggers** | `camelCase` with `open*` or `close*` | `openReceiptModal()`, `closeReceiptModal()`, `openDueBreakdownModal()` |

---

## 3. Reusable Components & Shared Services

1. **System Toasts (`toast` object):**
   - Methods: `toast.ok(msg)`, `toast.err(msg)`, `toast.info(msg)`, `toast.warn(msg)`
   - Never use raw browser `alert()` in operational flows; use `toast` instead.

2. **Unified Excel Export (`unifiedExportToExcel`):**
   - Signature: `unifiedExportToExcel(entries, headers, filename, mapFn)`
   - Generates styled corporate workbooks using `XLSX.utils.book_new()` with consistent navy headers and alternating light blue zebra stripes.

3. **Multi-Image Zoom/Pan Gallery:**
   - Functions: `openReceiptModalGallery()`, `zoomInReceiptImage()`, `zoomOutReceiptImage()`, `rotateReceiptImage()`, `resetReceiptImage()`.
   - Used across both ledger entries and driver request proof inspections.

4. **Web Audio Sound Synthesizers:**
   - Synthesizes notification chimes dynamically without external audio asset downloads, ensuring audio alerts play even on locked mobile browsers.

5. **App Branding Engine (`applyAppBrandingToPage`):**
   - Dynamically sets document title, favicon link, header logo, and CSS background content without hardcoded paths.

---

## 4. Module Dependencies & Data Flow

```
Firebase Realtime Database (Single Source of Truth)
   │
   ├──► /entries ──────────────► historyEntries[]
   │                                  ├──► Dashboard KPIs & ApexCharts
   │                                  ├──► Ledger Data Table (Search/Filter)
   │                                  ├──► Reports Audit & Excel/PDF Export
   │                                  └──► Diesel Due Calculator Engine
   │
   ├──► /driverRequests ───────► driverRequestsList[]
   │                                  ├──► Pending Requests Badge & Chime Alerts
   │                                  ├──► Auto-Approve Timer Engine (10s interval)
   │                                  ├──► Incharge Review & Edit Modal
   │                                  └──► Direct Fill -> Promotes to /entries
   │
   ├──► /config & /locations ──► Dropdown Hydration (Locations, Vendors, Vehicles, Drivers)
   │
   ├──► /users ────────────────► Session Validator & Real-time Logout Watcher
   │
   └──► /broadcasts & /settings ► Global Broadcast Banners & White-Label Branding
```

---

## 5. High-Risk Areas (Side Effect Warning Zones)

Modifying any of the following areas requires extreme caution:

### 5.1 Ledger Filtering & Global State Mutation
- **Location:** Lines 3424–3793 (`renderLedgerTable`, `applyDashboardFilters`, `dashFilters`).
- **Risk:** `historyEntries` is a shared global array. Modifying an entry in-place without copying can corrupt filter states across the dashboard, reports, and calculators simultaneously.
- **Rule:** Never mutate items in `historyEntries` directly during filter evaluation. Always work with filtered arrays (`const filtered = historyEntries.filter(...)`).

### 5.2 Direct Fill Driver Request Pipeline
- **Location:** Lines 22800–23100 (`directFillDriverRequest`, `saveDieselFillReceipt`).
- **Risk:** This flow simultaneously executes writes across 3 distinct nodes:
  1. Creates a new record in `/entries/{newRespNum}`.
  2. Stores image data in `/entryPhotos/{newRespNum}`.
  3. Updates `/driverRequests/{reqKey}` with status `filled` and `linkedResponseNumber`.
- **Rule:** If any promise fails or writes are reordered, records become orphaned (e.g. driver request marked filled with no corresponding entry in diesel records, or images lost). Always use `Promise.all()` or transactional updates.

### 5.3 Diesel Due Calculation Engine
- **Location:** Lines 13724–15536 & 18550–19100 (`calculateVehicleMonthlyDueAmount`, `calculateVehicleLastMonthDueAmount`).
- **Risk:** Odometer numbers must be parsed as floating point or integers strictly. String concatenation (e.g., `"111796" + 500`) corrupts vehicle mileage and generates massive erroneous due amounts.
- **Rule:** Always enforce `Number(val) || 0` on odometer readings, fuel rates, and amounts.

### 5.4 Cross-Portal Branding & Maintenance Mode
- **Location:** `broadcast.js`, `settings/branding`, and `maintenanceMode`.
- **Risk:** Modifications to branding or maintenance keys affect ALL THREE portals (`index.html`, `driver_request.html`, `diesel_filled.html`).
- **Rule:** Verify payload structures (`branding.all`, `branding.admin`, `branding.driver`, `branding.station`) before writing updates.

---

## 6. Pre-Implementation Checklist for Every Feature

Before writing code for any new feature or bugfix, complete the following analysis:

1. **Impact Identification:**
   - Which portals are affected? (`admin`, `driver`, `station`, or all three?)
   - Does this change alter the Firebase schema? If yes, will old records without the new fields cause `TypeError: undefined` crashes?
   - Does this change require invalidating `localStorage` cache keys (`loadCache` / `saveCache`)?

2. **File Scope Definition:**
   - Enumerate all exact files that will be modified.
   - Confirm whether styling requires CSS rules in `style.css` or Tailwind utility classes.

3. **Style & Pattern Preservation:**
   - Use existing naming conventions (`camelCase`, `*List`, `*Ref`).
   - Use existing toast alerts (`toast.ok`, `toast.err`).
   - Expose handler functions to `window` if invoked by HTML string templates.

4. **Zero-Regression Commitment:**
   - Ensure existing table rendering, pagination, search debouncing, and Excel exports continue to function normally.
   - Run syntax and lint checks on modified files before submitting.

---

## 7. Operational Workflow for Future Requests

When the user requests a change:
1. **Understand & Diagnose:** Inspect existing implementation in `script.js`, `index.html`, or child portals.
2. **Identify Related Files:** Detail all files, database paths, and DOM IDs affected.
3. **Formulate the Safest Approach:** Choose minimal, targeted modifications that preserve existing architecture and prevent breaking changes.
4. **Implement & Verify:** Apply code edits carefully, verify syntax, and confirm zero side effects on existing workflows.
