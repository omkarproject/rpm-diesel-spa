# RPM DIESEL SPA - PROJECT KNOWLEDGE BASE

> **System Overview:**
> RPM Diesel SPA is an enterprise-grade Single Page Application (SPA) suite for fleet diesel monitoring, driver diesel fuel advance requests, petrol pump fuel dispensing verification, mileage calculations, monthly due reconciliation, and financial ledger auditing for RPM Logistics.

---

## 1. Project Overview

The project is structured as a multi-portal fleet management and fuel accounting SaaS operating on a client-serverless architecture:
1. **Admin / Incharge Monitoring Portal (`index.html` + `script.js`):**
   - Central operations console for fleet managers.
   - Real-time dashboard with KPIs, ApexCharts visual trends, and consumption analytics.
   - Diesel & Urea entry ledgers with filtering, pagination, sorting, search, and Excel/PDF report generation.
   - Real-time Driver Requests management (pending, review, approval, rejection, direct fill).
   - Master log archives with automated cleanup timers.
   - Mileage & monthly due calculation engine (comparing expected fuel consumption vs. actual fuel filled).
   - Fleet masters CRUD (Vehicles, Drivers, Employees, Vendors, Locations, Diesel Rate).
   - In-app Support Center with WebRTC voice calls, screen sharing, and live signaling.
   - System Administration: User accounts, role-based access control (RBAC), feature toggles, maintenance mode toggles, and system-wide broadcast banners/modals.
   - Redundant backup engines (Client-side, Telegram bot, Google Drive, PHP cron, Python script).

2. **Driver Request Portal (`files/driver_request.html`):**
   - High-speed, responsive, mobile-first web app tailored for drivers on 2G/3G networks.
   - Enables drivers to submit live diesel advance requests with current odometer reading, trip locations, requested amount/litres, and camera capture of odometer.
   - Displays real-time approval status badges, vehicle monthly due summaries, WhatsApp status sharing, and station guidance.

3. **Fuel Station / Dispensing Portal (`files/diesel_filled.html`):**
   - Mobile and tablet-optimized portal for petrol pump attendants and dispensing stations.
   - Attendants see approved driver requests in real time.
   - Enables attendants to input actual filled amount/litres, capture dispenser receipt/meter photos, and mark requests as "Filled".
   - Automatically synchronizes with the main diesel ledger and resolves pending driver requests.

---

## 2. Architecture & Technology Stack

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend Architecture** | Vanilla HTML5 / ES6+ JavaScript / Tailwind CSS (CDN & inlined) | Monolithic SPA without heavy compile-time framework overhead |
| **Component/Style System** | Tailwind CSS v3 + FontAwesome 6.4 + Custom Glassmorphism CSS | High-contrast, responsive UI supporting light/dark themes and low-spec hardware modes |
| **Backend / BaaS** | Firebase Realtime Database (RTDB) | Serverless real-time data sync, WebSocket events, and live signaling |
| **Charts & Visuals** | ApexCharts | Real-time interactive fuel consumption trends, KPI visualizers, and expense breakdown |
| **Exports & Reporting** | `xlsx-js-style` (SheetJS) & `jsPDF` / `jspdf-autotable` | Styled multi-column Excel spreadsheets and formal PDF ledger audit reports |
| **Voice / Screen Share** | WebRTC (RTCPeerConnection) + STUN (`stun:stun.l.google.com:19302`) | Peer-to-peer audio calls and screen sharing between admins and operators |
| **Push & Alerts** | Web Notifications API, Service Worker (`sw.js`), Audio Chime synthesizers | Real-time desktop/mobile alerts on new requests and status updates |
| **Native Integration** | Android WebView Bridge (`window.AndroidBridge`) | Bi-directional session handshake with Android wrapper application |
| **Cloud Automation** | Google Apps Script (`script.google.com`) | 24/7 autonomous cloud scheduler for Telegram and Google Drive database backups |
| **Server Scripts** | PHP (`cron_backup.php`), Python (`auto_backup.py`), Shell (`run_backup.bat`) | Daily automated off-site backups for cPanel hosting and local drives |

---

## 3. Directory & File Structure

```
rpm-diesel-spa/
├── assets/
│   ├── images/
│   │   ├── default_avatar.png        # Default user profile avatar
│   │   └── logo.png                  # RPM brand logo asset
│   └── logo=Favicon=note.png         # Legacy / branding design reference
├── backup/
│   ├── auto_backup.py                # Python standalone backup script (urllib + json dump)
│   ├── backup_log.txt                # Local execution logs of auto-backup routines
│   ├── cron_backup.php               # PHP daily backup script for Linux/cPanel cron
│   ├── database_backup.json          # Complete raw snapshot of Firebase Realtime Database
│   ├── google_apps_script_auto_backup.js # 24/7 cloud scheduler for Telegram & Google Drive
│   └── run_backup.bat                # Windows batch launcher for Python backup
├── files/
│   ├── diesel_filled.html            # Fuel station dispensing operator portal
│   ├── driver_request.html           # Driver diesel advance request mobile portal
│   └── index_clean.html              # Standalone experimental React 18 / Recharts dashboard
├── broadcast.js                      # System-wide announcement banner & modal event listener
├── index.html                        # Main Admin / Incharge SPA application entry point
├── PROJECT_KNOWLEDGE.md              # Project technical knowledge base (this document)
├── CHANGE_LOGIC.md                   # Safe coding patterns, conventions & impact guide
├── script.js                         # Core monolithic SPA application controller (~26.8k LOC)
├── style.css                         # Custom UI styles, theme utilities & glassmorphic classes
├── sw.js                             # Service Worker for offline handling & background notifications
└── temp_check.js                     # Tailwind config snippet reference
```

---

## 4. Key Modules & Functional Responsibilities (`script.js`)

`script.js` is partitioned into distinct numbered architectural domains:

1. **Global State & Cache Management (Sec 1, Lines 94–259):**
   - High-performance `localStorage` hydration layer (`loadCache`, `saveCache`) for instant paint before network synchronization.
   - Cache keys: `rpm_cache_entries`, `rpm_cache_urea_entries`, `rpm_cache_driver_requests`, `rpm_cache_locations`, `rpm_cache_vehicle_types`, `rpm_cache_vendors`, `rpm_cache_drivers`, `rpm_cache_employees`, `rpm_cache_notes`, `rpm_cache_tasks`, `rpm_cache_refills`.
   - Dynamic credentials cipher: Multi-layer XOR decryption (`_secDecrypt`) protects Firebase API keys.

2. **System Alerts & Notifications (Sec 2, Lines 386–430):**
   - Toast notification engine (`toast.ok`, `toast.err`, `toast.info`, `toast.warn`).
   - Sound synthesis alerts using Web Audio API (`AudioContext`) for incoming requests.

3. **Visitor Telegram Tracking (Sec 3, Lines 431–531):**
   - Automated visitor logging to a dedicated Telegram channel with IP, GeoJS coordinates, device type, OS, and Google Maps direct pin.

4. **User Access, RBAC & Router Controller (Sec 4, Lines 532–1566):**
   - Session storage handling (`localStorage` + `sessionStorage` synchronization).
   - Single-device login enforcement: Real-time listener on `users/{userKey}/lastLogoutAt` logs out stale sessions.
   - Role-Based Access Control: `superadmin`, `admin`, `user`, `watcher`, `vendor`.
   - Feature flags verification (`FEATURE_MAP` checking against user custom features).
   - SPA View Router (`switchSection`): Dynamically switches between `dashboard`, `diesel-management`, `reports`, `driver-requests`, `driver-requests-log`, `vehicles`, `drivers`, `employees`, `notes`, `settings`, `support-center`, `km-range-calc`, `erp-portal`, `user-list`.

5. **Realtime Firebase Listeners & View Dispatchers (Sec 7, Lines 1783–2240):**
   - Binds `entriesRef.on('value')`, `driverRequestsRef.on('value')`, `locationsRef.on('value')`, `vendorsRef.on('value')`, etc.
   - Synchronizes changes directly to memory lists and triggers targeted UI re-renders without full page reloads.

6. **Dashboard KPI Visuals & Analytics (Sec 8 & 9, Lines 2241–3423):**
   - Computes aggregated stats: Total Diesel Filled, Total Amount, Average Mileage, Today's Consumption, Pending Requests count.
   - ApexCharts chart renderers: Consumption trend curves, vendor spending breakdown, vehicle-type efficiency comparisons.

7. **Ledger Data Tables & Debounced Search (Sec 10, Lines 3424–3793):**
   - Renders entries table with multi-criteria filtering (date ranges, vehicle number, vendor, locations, amount bounds).
   - Optimized DOM updates with pagination, inline quick edits, and photo preview icons.

8. **Data Entry & Clipboard Parsing (Sec 11, Lines 3794–5376):**
   - Manual entry submission for Diesel & Urea.
   - Intelligent clipboard parser: Paste raw SMS/WhatsApp driver texts (e.g. vehicle number, KM, pump name, amount) and automatically auto-fill form inputs.

9. **Configuration Master Tables CRUD (Sec 13 & 14, Lines 5845–6444):**
   - Real-time CRUD operations for Fleet Vehicles (types, registration, mileage thresholds), Drivers, Logistics Employees, Petrol Pump Vendors, and Warehouse/Hub Locations.

10. **Reports & Audit Exports (Sec 17, Lines 7007–8816):**
    - Time-period ledger audits (Daily, Weekly, Monthly, Custom Range).
    - Multi-sheet formatted Excel generation using `xlsx-js-style`.
    - Print-ready PDF report generation using `jsPDF` + `AutoTable`.

11. **Diesel Calculator & Monthly Due Engine (Sec 20, Lines 13724–15536 & 18550–19100):**
    - High-precision mathematical engine reconciling odometer KM run with standard vehicle mileage to determine accurate fuel dues.
    - Factors in cross-month trip rollovers, arrival KM, and custom row exclusion logic.

12. **Driver Request Lifecycle & Direct Fill (Lines 19100–24000):**
    - Real-time countdown timers, auto-approve interval processing (normal, revert, UPI).
    - Incharge review modal, status transitions (`pending` -> `approved` -> `filled` / `rejected`).
    - Direct Fill mechanism connecting approved driver requests directly to ledger entries with linked response numbers.

13. **WebRTC In-App Support Calls & Screen Share (Sec 13, Lines 18465–18550):**
    - Peer-to-peer WebRTC voice communication between admin and field users with Firebase RTDB signaling under `support_chats`.

14. **System Maintenance & Dynamic Branding (Lines 26300–26731):**
    - Maintenance mode controls (`fullWeb`, `driverRequest`, `dieselFilled`).
    - Dynamic white-label branding engine (`settings/branding`) distributing app titles, logos, and favicons across all 3 portals without rebuilds.

---

## 5. Database Schema & Data Models (Firebase RTDB)

The database schema is flat and document-oriented under the root `https://rpm-diesel-default-rtdb.firebaseio.com/`.

### 5.1 Root Nodes Overview

| Node Path | Type | Description |
| :--- | :--- | :--- |
| `/entries` | Object map | Main historical diesel and urea ledger records |
| `/driverRequests` | Object map | Driver advance diesel requests (pending, approved, filled, rejected) |
| `/entryPhotos` | Object map | Decoupled high-resolution receipt/odometer Base64 images for entries |
| `/driverRequestPhotos` | Object map | Decoupled high-resolution odometer/receipt Base64 images for driver requests |
| `/users` | Object map | Authorized operator and admin user profiles, hashed passwords, session tokens |
| `/config` | Object | System configuration masters (vehicles, vendors, drivers, email lists, etc.) |
| `/locations` | Object map | Operating hub locations and diesel rate presets |
| `/dieselRate` | Number | Current default diesel rate per litre (e.g., `98.00`) |
| `/autoApproveTimerConfig` | Object | Auto-approval countdown durations (`normalMins`, `revertMins`, `upiMins`) |
| `/broadcasts/active` | Object map | Currently broadcasting system announcements |
| `/maintenanceMode` | Object | Feature flags for maintenance lockouts (`fullWeb`, `driverRequest`, `dieselFilled`) |
| `/settings/branding` | Object | White-label branding configs (`all`, `admin`, `driver`, `station`) |
| `/support_chats` | Object map | Support chat messages, unread flags, and WebRTC signaling exchange |
| `/user_notes/{userKey}` | Object map | Private notes created by specific logged-in users |
| `/tasks` | Object map | Incharge operational checklist and tasks |
| `/refills` | Object map | Bulk fuel stock refill logs for internal yard pumps |
| `/appConfig` | Object | Cloud auto-backup preferences (Telegram, Google Drive, compression) |

### 5.2 Key Model Schemas

#### Entry Model (`/entries/{responseNumber}`)
```json
{
  "responseNumber": "87158",
  "date": "08-09-2026",
  "vehicleNo": "MH 04 KF 1234",
  "vehicleType": "32 FT MULTI",
  "vendor": "INDIAN OIL BHIWANDI",
  "driver": "Ramesh Kumar",
  "fromLocation": "BHIWANDI HUB",
  "lastLocation": "GHOTI",
  "currentKm": "142850",
  "litres": "180.50",
  "dieselAmount": "17689",
  "rate": "98.00",
  "mileage": "3.5",
  "note": "Trip to Nashik route",
  "isUrea": false,
  "hasReceiptPhoto": true,
  "hasKmPhoto": true,
  "location": {
    "lat": 19.3355397,
    "lng": 73.1032172
  },
  "timestamp": 1788591795906
}
```

#### Driver Request Model (`/driverRequests/{requestKey}`)
```json
{
  "key": "-P0kMAXsHsm3gPUNm1TZ",
  "date": "05-09-2026",
  "time": "04:39 PM",
  "vehicleNo": "MH 04 JU 7822",
  "driverName": "Suresh Yadav",
  "driverMobile": "9876543210",
  "fromLocation": "GHOTI",
  "toLocation": "BAJAJ",
  "vendor": "HPCL PUMP",
  "currentKm": 111796,
  "dieselAmount": "1500",
  "litres": "15.3",
  "status": "pending", // pending | approved | filled | rejected
  "hasKmPhoto": true,
  "autoApproveMins": 15,
  "submittedAt": 1788591000000,
  "approvedAt": 1788591400000,
  "filledAt": 1788591795906,
  "linkedResponseNumber": "87159",
  "note": ""
}
```

#### User Profile Model (`/users/{userKey}`)
```json
{
  "fullName": "Anant Kumar Yadav",
  "email": "anantyadav8924@gmail.com",
  "mobile": "8371838314",
  "password": "...",
  "role": "admin", // superadmin | admin | user | watcher | vendor
  "assignedVendor": "", // Used for vendor role scoping
  "status": "active", // active | blocked
  "activeSessionToken": "1785400227329_d0wv22c",
  "lastLogoutAt": 1785939160646,
  "createdAt": "2026-06-23T06:15:46.577Z",
  "profilePic": "data:image/jpeg;base64,..."
}
```

---

## 6. Authentication & Authorization Flow

1. **Credentials & Storage:**
   - User submits email/mobile and password on the Login Overlay modal.
   - Validation against the Firebase `/users` collection.
   - On successful match, a session token is minted (`createNewUserSession`):
     - `localStorage` & `sessionStorage` populated with `rpm_logged_in=1`, `rpm_user_key`, `rpm_user_role`, `rpm_session_token`, `rpm_login_time`.
     - Android WebView bridge notified via `window.AndroidBridge.setLoginSession('1', isAdmin, role)`.

2. **Single-Device Enforcement:**
   - Active listener on `/users/{userKey}/lastLogoutAt`.
   - If another device calls logout or initiates a new global session, `lastLogoutAt > loginTime + 3000` evaluates to true, instantly terminating the current device session via `forceReauth()`.

3. **Role-Based Access Control (RBAC):**
   - **`superadmin` / `admin`:** Full access to all panels, settings, master CRUD, user management, and ledger modifications.
   - **`user`:** Access to dashboard, diesel management, manual entry, and calculators. Restricted from settings and user accounts.
   - **`watcher`:** Read-only access restricted strictly to `reports`, `driver-requests`, and `notes`.
   - **`vendor`:** Data scoped exclusively to their assigned petrol pump (`assignedVendor`). Auto-filtered in reports and dashboard. Cannot view other vendors' financial numbers.

---

## 7. Third-Party Integrations & External APIs

1. **Firebase Realtime Database:**
   - Primary data persistence and real-time state synchronization via WebSocket protocol.
2. **Telegram Bot API:**
   - Visitor tracking notifications: `https://api.telegram.org/bot<token>/sendMessage`
   - Cloud database backup deliveries: `https://api.telegram.org/bot<token>/sendDocument`
3. **Google Apps Script & Google Drive API:**
   - Autonomous background backup processing hosted at `script.google.com`.
4. **GeoJS IP API:**
   - `https://get.geojs.io/v1/ip/geo.json` for visitor IP address, ISP, and geo-coordinates resolution.
5. **Google Maps API (URL scheme):**
   - `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` for instant driver geolocation inspection.
6. **WhatsApp Click-to-Chat:**
   - Pre-formatted WhatsApp deep links (`https://api.whatsapp.com/send?phone=...`) for dispatching request approvals and driver diesel slips.
7. **ApexCharts CDN:**
   - Client-side chart generation and responsive rendering.
8. **SheetJS (`xlsx-js-style`) CDN:**
   - Client-side workbook and spreadsheet generation with cell borders and header fills.
9. **jsPDF / AutoTable CDN:**
   - Client-side vector PDF document compilation and table styling.
10. **Google STUN Server (`stun:stun.l.google.com:19302`):**
    - NAT traversal for WebRTC audio calls and screen sharing.

---

## 8. Critical Business Logic & Calculations

### 8.1 Monthly Due Calculation
The core business equation reconciling vehicle fuel advances:
$$\text{Total KM Run} = \text{Current KM} - \text{Month Start 1st KM}$$
$$\text{Expected Fuel Litres} = \frac{\text{Total KM Run}}{\text{Vehicle Standard Mileage}}$$
$$\text{Expected Fuel Cost (₹)} = \text{Expected Fuel Litres} \times \text{Current Diesel Rate}$$
$$\text{Monthly Due Amount (₹)} = \text{Expected Fuel Cost} - \text{Month Actual Filled Amount}$$

- **Positive Due:** Vehicle ran more kilometers than the fuel provided for; payment or fuel advance is due.
- **Negative Due (Excess):** Driver was issued more fuel than mileage accounted for; excess fuel balance is carried over.

### 8.2 Cross-Month Rollover & Arrival KM
When a long-distance truck refuels near the end of the month (e.g. 29th/30th), its arrival KM might be logged in the following month. The calculator incorporates the arrival KM of the next month to prevent false negative due calculations for the closing month.

### 8.3 Auto-Approve Timer Lifecycle
- Driver requests contain an expiration countdown timer.
- Based on `autoApproveTimerConfig` (normal, revert, UPI), the incharge has a defined grace period to inspect and modify amounts.
- If not rejected or manually edited before timer expiration, the request transitions automatically to `approved` state to prevent truck delays at pumps.

---

## 9. Known Limitations & Technical Debt

1. **Monolithic Single-File Architectures:**
   - `script.js` exceeds 26,700 lines of code. There is no build-time module bundler (Vite, Webpack, ES modules). All functions share the global window namespace.
   - Any syntax error, missing bracket, or unhandled exception in `script.js` will stop execution of the entire application.
2. **Payload Size & Base64 Image Storage:**
   - Historically, photos were embedded directly inside the `entries` and `driverRequests` objects as Base64 strings, ballooning database exports past 32 MB.
   - Although `entryPhotos` and `driverRequestPhotos` were introduced to decouple images, legacy records still contain inline strings. Backups and exports require careful shallow-fetch and string length filtering to prevent browser memory exhaustion.
3. **Direct DOM Manipulation & Global Mutability:**
   - UI elements are managed by injecting template strings via `.innerHTML` and referencing global variables (`historyEntries`, `dashFilters`, `dieselRate`).
   - Re-rendering tables frequently destroys and re-creates DOM nodes, which requires explicit debouncing and scroll-position restoration.
4. **Offline Sync & Race Conditions:**
   - `localStorage` caching accelerates the initial screen paint, but simultaneous multi-tab edits or conflicting offline modifications can overwrite data if not synchronized carefully using Firebase transactional operations (`ref.transaction`).
