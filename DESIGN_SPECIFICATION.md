# 🎨 EstateRadar — Complete UI/UX Design Specification & Master Blueprint

> **For UI/UX Designers, Figma Engineers, and AI Design Generators (v0.dev, Lovable, Claude Artifacts, Galileo AI, Relume).**  
> *This document contains every layout, color token, typography scale, component state, user flow, and ready-to-copy prompt required to design or re-skin the EstateRadar enterprise mobile application.*

---

## 1. 📋 Product Overview & Brand Identity

* **Product Name**: **EstateRadar** (`com.estateradar.tracker`)
* **Core Value Proposition**: Enterprise B2B SaaS mobile workforce and on-site property survey verification platform with real-time GNSS telemetry and tamper-proof evidence stamping.
* **Target Platforms**: Mobile First (Android 15 edge-to-edge, Material 3 compliant, iOS viewport adaptable, Progressive Web App responsive).
* **Target Personas**:
  1. **Agency Manager**: Oversees field agents, live radar map, shift attendance, join requests, property dossiers, and security audit logs.
  2. **Field Surveyor (Employee)**: Mobile field agent who clocks in, moves through territory, opens camera, takes photos watermarked with real GPS & timestamp, and submits verified property listings.
* **Design Language**: Modern Dark-Mode Default, Material Design 3 tokens, glassmorphism accents, high-contrast readable typography, and tactile 48px+ touch targets.

---

## 2. 🎨 Design System & Visual Tokens

### 2.1 Color Palette

#### Dark Mode (Primary Default)
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `--bg-base` | `#0B0E14` | Deep obsidian slate application background |
| `--bg-surface` | `#121620` | Primary card and navigation bar background |
| `--bg-surface-elevated`| `#1A202C` | Modals, popovers, and elevated pill buttons |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Standard card and section dividing border |
| `--border-strong` | `rgba(255, 255, 255, 0.18)` | Active input, focused tab, and highlight border |
| `--accent-emerald` | `#10B981` | Brand primary: Clocked-in, GPS active, verified badge |
| `--accent-emerald-subtle`| `rgba(16, 185, 129, 0.14)`| Background for active chips, pills, and active nav tab |
| `--accent-blue` | `#3B82F6` | Secondary brand: Surveys, informational banners, maps |
| `--accent-amber` | `#F59E0B` | Warning: Pending join requests, GPS locating, alerts |
| `--accent-red` | `#EF4444` | Critical: Clock out, decline request, boundary alert |
| `--text-primary` | `#FFFFFF` | Headlines, primary card titles (100% white) |
| `--text-secondary` | `#94A3B8` | Body copy, descriptions, form field labels |
| `--text-muted` | `#64748B` | Timestamps, icons in inactive state, helper notes |

#### Light Mode (High-Contrast Theme)
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `--bg-base` | `#F8FAFC` | Clean slate white background |
| `--bg-surface` | `#FFFFFF` | Pure white cards and navigation bar |
| `--bg-surface-elevated`| `#F1F5F9` | Elevated containers and secondary buttons |
| `--border-subtle` | `#E2E8F0` | Subtle card dividers |
| `--border-strong` | `#CBD5E1` | Input outlines and strong card borders |
| `--accent-emerald` | `#059669` | High-contrast emerald green for readable actions |
| `--text-primary` | `#0F172A` | Deep charcoal primary text (WCAG AAA compliant) |
| `--text-secondary` | `#334155` | Secondary text |
| `--text-muted` | `#64748B` | Inactive icons and timestamps |

### 2.2 Typography Hierarchy (Inter / Roboto)

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Header** | 22px - 24px | 800 (ExtraBold)| 1.2 | -0.02em | Login brand, main screen headlines |
| **Headline Medium**| 18px - 20px | 700 (Bold) | 1.25 | -0.01em | Modal titles, card section headers |
| **Title Small** | 15px - 16px | 600 (SemiBold)| 1.3 | 0em | Property prices, surveyor names |
| **Body Standard** | 13px - 14px | 400 (Regular) | 1.45 | 0em | Form inputs, descriptions, notes |
| **Body Compact** | 11px - 12px | 500 (Medium) | 1.4 | +0.01em | Telemetry coordinates, timestamps |
| **Micro Label** | 9px - 10px | 700 (Bold) | 1.0 | +0.05em | Badges, status pills (UPPERCASE) |

### 2.3 Radii & Touch Targets
* **Touch Target**: Minimum `44px × 44px` (recommended `48px × 48px` for primary actions).
* **Border Radii**:
  * Chips & Pills: `9999px` (Full capsule)
  * Inputs & Sub-cards: `8px` - `10px`
  * Standard Cards: `14px` - `16px`
  * Bottom Navigation & Modals: `20px` - `24px`

---

## 3. 📱 Detailed Screen-by-Screen Architecture

### Screen 1: Segmented Authentication & Onboarding
* **Purpose**: Clear, non-confusing gateway separating Agency Managers from Field Employees.
* **Header**:
  * Glowing shield radar logo + **EstateRadar** wordmark.
  * Tagline: *"Enterprise Field Verification & Survey Suite"*.
* **Segmented Role Switcher**:
  * Two equal-width tabs: `[ 🏢 Agency Manager ]` vs `[ 👷 Field Employee ]`.
  * Active pill indicator with subtle emerald glow.
* **Manager Registration & Login Panel**:
  * Switch between *"Register Agency"* and *"Sign In as Manager"*.
  * Fields: Agency Name (e.g. `Prime Realty`), Manager Full Name, Work Email, Master Password.
  * Clear explanatory banner: *"Registering generates your agency workspace and private 6-letter Agency Code."*
  * Big CTA: `[ 🏢 Register Agency & Launch Workspace ]` (Full width, 48px height, emerald gradient).
* **Employee Request-to-Join & Sign-In Panel**:
  * Switch between *"Request to Join Agency"* and *"Employee Sign In"*.
  * Fields:
    1. **Agency Code** (e.g., `PRIME` or `METRO`) with helper: *"Ask your manager for your 6-character code"*.
    2. **Employee Full Name**
    3. **Username** (e.g., `john_surveyor`)
    4. **Access Password**
  * Notice Card: *"Once submitted, your Agency Manager must approve your request before you can access the field tracker."*
  * Big CTA: `[ 📨 Submit Join Request to Agency ]`.
* **Footer Actions**:
  * High-contrast *"Forgot Password?"* text link (opens clean email reset dialog).
  * Dark / Light mode toggle icon button at top right.

---

## Screen 2: Manager Radar Dashboard (Tab 1: Radar)
* **Purpose**: Real-time fleet tracking map and immediate situation awareness.
* **Top AppBar**:
  * Left: Radar icon + Agency Name (e.g. `Prime Realty`) + `[ 🏢 Manager ]` pill.
  * Right:
    * Agency Code chip: `Code: PRIME` (tapping copies code to clipboard with visual toast).
    * Glowing Update Badge (shows ONLY if a newer release exists).
    * Settings Gear button (opens Agency Profile & Sign Out).
* **Main Viewport**:
  * Full-bleed interactive OpenStreetMap (dark mode styled tiles, zero API key requirement).
  * Custom Leaflet pins for surveyors:
    * Green glowing pin = On Duty & moving.
    * Amber pulsing pin = On Duty & stationary.
    * Gray pin = Off Duty / Standby.
* **Floating Bottom Telemetry HUD Card**:
  * Displays active surveyor count (e.g., `3 Active on Duty • 2 Idle`).
  * Tap any surveyor pin to reveal bottom drawer:
    * Surveyor avatar, name, current speed (`km/h`), device battery percentage, and live latitude/longitude.
    * Button: `[ 🔍 Focus Surveyor ]` and `[ 📜 View Today's Path ]`.

---

## Screen 3: Manager Team Roster & Join Approvals (Tab 2: Team)
* **Purpose**: Manage field staff, review requests to join, and add employees.
* **Section A: ⚠️ Pending Join Requests (High Priority)**:
  * Visible prominently at the top with amber badge count: `Pending Requests (1)`.
  * Request Card:
    * Left: Applicant avatar circle + Name (`John Doe`) + `@john_surveyor`.
    * Subtitle: *"Requested to join via code PRIME • 10m ago"*.
    * Action Row:
      * `[ ✓ Accept & Add to Roster ]` (Solid emerald green button).
      * `[ ✕ Decline ]` (Subtle red outlined button).
* **Section B: Active Field Staff Directory**:
  * Header with `[ + Add Staff Manually ]` modal button.
  * Staff Card:
    * Status indicator: `● Clocked In (2h 15m)` (emerald) vs `○ Standby` (slate).
    * Name, username, today's properties logged count (`3 surveys`).
    * Battery indicator pill (`🔋 84%`), Velocity pill (`🚗 24 km/h`).
    * Quick actions: Call phone, view GPS coordinates, remove staff.

---

## Screen 4: Manager Property Survey Dossier (Tab 3: Surveys)
* **Purpose**: Review verified property listings submitted by field agents with tamper-proof evidence.
* **Header**:
  * Total verified count (e.g., `12 Verified Property Surveys`).
  * Filter chips: `All`, `Residential`, `Commercial`, `Plots`, `Agricultural`.
* **Property Dossier Cards**:
  * Top Half: High-resolution on-site photo taken via mobile camera.
    * Floating Verified Badge: `✓ GPS Timestamped`.
  * Bottom Half:
    * Big Price / Demand: `$350,000` or `₨ 2.5 Crore`.
    * Property Address: `Plot 42, Sector F-7, Blue Area`.
    * Specs Grid: Type (`Commercial Plaza`), Size (`10 Marla / 250 Sq Yd`).
    * Surveyor Badge: `Logged by @john_surveyor at 02:45 PM`.
    * Embedded GNSS Coordinates: `33.6844° N, 73.0479° E (±3.2m accuracy)`.
    * Owner Contact details (if recorded).
* **Tap-to-Expand Full Screen Modal**:
  * Displays full-resolution watermarked image with zoom capability.
  * Direct map pin preview showing exact coordinates where the photo was snapped.

---

## Screen 5: Manager Security & Audit Feed (Tab 4: Alerts)
* **Purpose**: Enterprise security, anti-spoofing verification, and workforce audit trail.
* **System Health HUD Grid (Top Row)**:
  * 3 Cards side-by-side:
    1. `GNSS Stream`: `🟢 Active (5s interval)`
    2. `Anti-Spoofing`: `🛡️ Mock GPS Filter Active`
    3. `Tenant Boundary`: `🔒 Multi-tenant Isolated`
* **Verified Normal State (When no alerts)**:
  * Emerald Shield Banner: *"All Agency Operations Normal • Zero security anomalies detected."*
  * Monitored Events List:
    * 🕒 Surveyor Shift Clock-Ins & Clock-Outs
    * 📸 On-Site Property Survey Submissions with Watermarked GPS
    * 📍 Geofence Crossings & Rapid Velocity Shifts
    * 👥 New Staff Member Join Requests & Agency Approvals
* **Audit Event Card (When active alerts exist)**:
  * Left color accent stripe: Red (Critical), Amber (Warning), Green (Success), Blue (Info).
  * Header: Event title (`Geofence Boundary Crossed`), timestamp (`14:23:05`), severity pill.
  * Description: Detailed log of surveyor, location, and reason.

---

## Screen 6: Employee Field Work Dashboard (Employee Tab 1: Shift & GPS)
* **Purpose**: Simple, high-efficiency cockpit for the field agent.
* **Top Header**:
  * Company Name (`Prime Realty`) + `Code: PRIME`.
  * Theme toggle button + Sign Out button (`🚪 Sign Out`).
* **Employee Identity Banner**:
  * Avatar circle with initials (`JD`), Name (`John Doe`), Username (`@john_surveyor`).
  * Status capsule: `● On Shift` (green) or `○ Off Duty` (slate).
* **Shift Attendance Card (Center Stage)**:
  * Title: `Shift Active — GPS Streaming` vs `Standby • Shift Inactive`.
  * Live elapsed duration timer: `3h 42m on duty`.
  * Subtext: *"Encrypted coordinates are streaming to your manager."* (Active) vs *"GPS tracking paused. Your coordinates are strictly private while off duty."* (Inactive).
  * Giant Toggle Button:
    * Off Duty: `[ ▶ Start Shift (Clock In) ]` (Solid emerald green, 52px height).
    * On Duty: `[ ⏹ End Shift (Clock Out) ]` (Solid crimson red, 52px height).
* **Quick Action Hero Card**:
  * `[ 📷 + Register Property Survey ]`
  * Large camera icon + *"Open camera, capture photo & stamp GPS coordinates"*.
  * Disabled with lock icon if surveyor has not clocked in yet.
* **Telemetry & Device Health Row**:
  * 3 Metrics boxes: `Surveys Logged Today (4)`, `Current Speed (0 km/h)`, `Battery (88%)`.
* **Live GPS Snapshot Card**:
  * Current street / location address.
  * Latitude, Longitude, and GNSS accuracy radius (`±3.8 meters`).
* **Recent Surveys Mini-List**:
  * Preview of the last 3 properties submitted today with photo thumbnails and time stamps.

---

## Screen 7: Employee Survey Camera & GPS Watermarking Modal
* **Purpose**: Capture authentic on-site evidence with real hardware camera and zero dummy data.
* **Hardware Camera Capture Box**:
  * Big dashed box with camera icon: `[ 📷 Open Camera & Take Photo ]`.
  * Triggers real device hardware camera (`<input type="file" accept="image/*" capture="environment">`).
  * Once snapped, displays instant preview canvas with live stamp:
    * Stamped Text: `EstateRadar Verified • 33.6844° N, 73.0479° E • 13-Oct-2026 03:30 PM • Surveyor: @john_surveyor`.
  * Includes `[ 🔄 Retake Photo ]` button.
* **Form Inputs (All Clean & Blank — Zero Pre-filled Fake Data)**:
  1. **Demand Price / Rent**: e.g., `$280,000` (Number input with currency symbol).
  2. **Property Location / Address**: e.g., `House 12, Street 4, Sector G-11`.
  3. **Property Classification**: Selector pills (`Residential`, `Commercial`, `Plot`, `Agricultural`, `Industrial`).
  4. **Land Area / Covered Size**: e.g., `5 Marla` or `2,400 Sq Ft`.
  5. **Owner / Representative Name**: e.g., `Mr. Tariq`.
  6. **Owner Contact Number**: e.g., `+92 300 1234567`.
  7. **Condition & Site Notes**: Textarea for notes.
* **Submit Action**:
  * Primary Button: `[ 🚀 Submit Verified Survey to Manager ]` (Emerald green).

---

## Screen 8: Seamless In-App Auto-Updater Modal
* **Purpose**: Smooth, zero-redirect in-app update experience.
* **Behavior**:
  * Never redirects to GitHub, Chrome, or external webpages.
* **Header**:
  * Pill: `Direct In-App Update` or `Latest Version Installed`.
  * Title: `EstateRadar v1.0.3`.
* **State A: Up to Date (`isAvailable === false`)**:
  * Green Checkmark Card: *"Your app is up to date. You are running the newest release (v1.0.3). All telemetry pipelines are active."*
  * Button: `[ ✓ You are up to date (v1.0.3) ]`.
* **State B: Update Available (`isAvailable === true`, `!isComplete`)**:
  * Safety Banner: *"It is safe to close while the app updates. The update downloads directly inside the app without interrupting your GPS tracking."*
  * Release notes bullet list.
  * Button: `[ ⚡ Update to v1.0.3 Directly ]`.
* **State C: Download Complete (`isComplete === true`)**:
  * Progress Bar: 100% Complete Emerald Green.
  * Headline: *"Update Ready to Apply!"*
  * Notice: *"The update is downloaded and ready. Tap Reopen App below to reload the app with the latest version."*
  * Big Action Button: `[ 🔄 Reopen App to Apply Update ]` (Calls `window.location.reload()` to instantly apply).

---

## Screen 9: Material 3 Bottom Navigation Bars
* **Manager Bottom Nav (4 Tabs)**:
  * `🗺️ Radar` | `👥 Team` | `📋 Surveys` | `⚡ Alerts`
  * Active state: Emerald capsule pill behind icon + bold green label.
  * Height: `64px + safe-area-inset-bottom`.
* **Employee Bottom Nav (2 Tabs)**:
  * `🧭 Shift & GPS` | `🏠 My Surveys`
  * Active state: Emerald capsule pill behind icon + bold green label.
  * Height: `64px + safe-area-inset-bottom`.

---

## 4. 🤖 AI Design Generation Prompt Pack

*Copy and paste any of the following prompts into **v0.dev**, **Figma AI**, **Lovable**, or **Claude 3.7 Artifacts** to generate instant pixel-perfect designs.*

### Prompt 1: Mobile Manager Console (Radar & Team Roster)
```text
Design a high-end enterprise dark-mode mobile application screen for "EstateRadar", a real estate workforce and survey tracking app.
Theme: Deep obsidian background (#0B0E14), surface slate cards (#121620), emerald green primary accents (#10B981), crisp white typography. Material Design 3 and Android 15 compliant.
Header: Top native app bar with Agency Name ("Prime Realty"), role pill ("🏢 Agency Manager"), Agency Code chip ("Code: PRIME" with copy button), and a settings gear.
Main Viewport:
1. Top half: Interactive dark-mode map showing live field surveyors with pulsing green GPS pins, speedometer badges (e.g. "24 km/h"), and battery levels.
2. Bottom half: "Pending Join Requests" review card with applicant avatar, name ("John Doe @john_surveyor"), and two buttons: green "✓ Accept & Add to Roster" and outlined red "✕ Decline".
3. Bottom Navigation Bar: 4 tabs with Material 3 active pill indicators: "Radar" (active), "Team (1)", "Surveys", "Alerts".
Create a stunning, polished, tactile mobile interface with glassmorphism borders and clean spacing.
```

### Prompt 2: Mobile Field Surveyor Cockpit (Clock-In & Survey)
```text
Design a modern dark-mode mobile application screen for an on-site field surveyor in the "EstateRadar" platform.
Theme: Clean dark mode (#0B0E14), slate surface (#121620), emerald green accents (#10B981), crimson red clock-out button (#EF4444).
Header: Agency Name ("Prime Realty"), Agency Code ("Code: PRIME"), theme toggle, and Sign Out button.
Content:
1. Employee Profile Card: Avatar initials circle ("JD"), Name ("John Doe"), Username ("@john_surveyor"), and green "● On Shift" badge.
2. Shift Attendance Hero Card: Large title "Shift Active — GPS Streaming", live duration timer "3h 42m on duty", and a full-width red button "⏹ End Shift (Clock Out)".
3. Quick Action Hero: Card with camera icon and "+ Register Property Survey" button.
4. Telemetry Metrics Row: 3 metric cards showing "4 Surveys Today", "0 km/h Current Speed", "🔋 88% Battery".
5. Live Location Card: Street address with latitude/longitude coordinates (33.6844° N, 73.0479° E) and accuracy radius "±3.8m".
6. Bottom Nav Bar: 2 tabs: "🧭 Shift & GPS" (active) and "🏠 My Surveys (4)".
```

### Prompt 3: Property Survey Registration & Camera Stamping Modal
```text
Design a mobile modal sheet for registering a verified property survey in "EstateRadar".
Theme: Dark mode (#121620) with emerald green action buttons (#10B981).
Components:
1. Camera Capture Box: Prominent camera viewport showing a photo of a modern house with an overlaid cryptographic GPS watermark stamp at the bottom: "EstateRadar Verified • 33.6844° N, 73.0479° E • 13-Oct-2026 03:30 PM • Surveyor: @john_surveyor". Includes a "📷 Retake Photo" button.
2. Clean Form Fields:
   - Demand Price (e.g. "$350,000")
   - Street Address (e.g. "Plot 42, Blue Area Sector F-7")
   - Property Type selector chips (Residential, Commercial, Plot, Agricultural)
   - Land Area (e.g. "10 Marla / 250 Sq Yd")
   - Owner Contact Name and Phone Number
   - Condition notes textarea
3. Bottom Button: Full-width vibrant green "🚀 Submit Verified Survey to Manager".
```

### Prompt 4: In-App Seamless Auto-Updater Modal
```text
Design a bottom sheet modal for an in-app software update in "EstateRadar".
Theme: Dark obsidian theme (#131722), emerald green accents (#10B981), white typography.
Components:
1. Header: Pill badge "Direct In-App Update" and title "EstateRadar v1.0.3".
2. Safety Card: Green shield icon with headline "Auto-updating inside the app" and subtext "No external websites or repository pages. The update installs directly on your device."
3. Progress Bar: 100% complete emerald green progress bar with status "✅ 100% Downloaded — Ready to Reopen".
4. What's New List: Clean bulleted list with checkmarks detailing new features.
5. Primary Action Button: Large full-width emerald green button "🔄 Reopen App to Apply Update".
6. Secondary Button: "Close & Continue in App".
```
