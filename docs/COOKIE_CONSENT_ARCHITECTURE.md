# Cookie Consent Architecture

## Overview
The cookie consent system ensures users are asked for permission every 30 minutes and properly manages API access based on consent status.

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              COOKIE CONSENT SYSTEM                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────────────┐
│   User Visits   │───▶│   Layout.tsx     │───▶│  Cookie Banner Display Logic    │
│   Website       │    │   Component      │    │  (!hasMadeChoice || checkTimer) │
└─────────────────┘    └──────────────────┘    └─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COOKIE PREFERENCES CONTEXT                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  checkBannerTimer│  │  optIn()        │  │  optOut()                       │  │
│  │  - Checks 30min │  │  - Sets all     │  │  - Disables all                 │  │
│  │    localStorage │  │    cookies ON   │  │    cookies                      │  │
│  │  - Returns true │  │  - Sets timer   │  │  - Refreshes page               │  │
│  │    if > 30min   │  │  - Triggers API │  │  - Clears timer                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            COOKIE BANNER MODAL                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  Opt In Button  │  │  Dismiss Button │  │  Manage Preferences             │  │
│  │  - Calls optIn()│  │  - Sets 30min   │  │  - Navigates to full page      │  │
│  │  - Sets timer   │  │    timer        │  │  - Allows granular control      │  │
│  │  - Enables API  │  │  - Hides modal  │  │  - Updates preferences          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API ACCESS CONTROL                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  hasOptedIn     │  │  isApiBlocked   │  │  API Service Middleware          │  │
│  │  - All cookies  │  │  - Blocks API   │  │  - Checks consent before calls  │  │
│  │    enabled      │  │    calls        │  │  - Stores errors if no consent  │  │
│  │  - API enabled  │  │  - Shows errors │  │  - Triggers modals after opt-in │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘

## 30-Minute Timer Logic

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              30-MINUTE TIMER FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────┘

User Action                    │  Timer Status                    │  Banner Behavior
───────────────────────────────┼──────────────────────────────────┼─────────────────
First Visit                    │  No timer set                    │  Shows immediately
Opt In                         │  Sets timer to now + 30min       │  Hides for 30min
Dismiss                        │  Sets timer to now + 30min       │  Hides for 30min
After 30 minutes               │  Timer expired                   │  Shows again
Page refresh after 30min       │  Timer expired                   │  Shows again
Clear localStorage             │  Timer cleared                   │  Shows immediately

## Key Components

### 1. CookiePreferencesContext
- **Location**: `src/context/CookiePreferencesContext.tsx`
- **Purpose**: Central state management for cookie preferences
- **Key Functions**:
  - `checkBannerTimer()`: Returns true if 30+ minutes have passed
  - `optIn()`: Enables all cookies and sets 30-minute timer
  - `optOut()`: Disables all cookies and refreshes page
  - `updatePreferences()`: Updates specific cookie categories

### 2. Layout Component
- **Location**: `src/component/layout/Layout.tsx`
- **Purpose**: Controls when cookie banner is displayed
- **Logic**: `(!hasMadeChoice || checkBannerTimer()) && !isSSR`
- **Behavior**: Shows banner if user hasn't made choice OR 30 minutes have passed

### 3. Cookie Banner Modal
- **Location**: `src/pages/modal.cookieOptOut.tsx`
- **Purpose**: User interface for cookie consent
- **Modes**: Modal overlay or full page
- **Actions**: Opt In, Dismiss, Manage Preferences

### 4. API Service Middleware
- **Location**: `src/services/service.apiSW.ts`
- **Purpose**: Enforces consent before API calls
- **Behavior**: Blocks API calls until user opts in

## Storage Mechanism

```javascript
// localStorage key: 'packmovego-last-banner-time'
// Value: Timestamp when banner was last dismissed/opted-in
// Check: Date.now() - lastTime > 30 * 60 * 1000 (30 minutes)
```

## SSR Safety

- All timer checks are wrapped in `typeof window !== 'undefined'`
- SSR renders without cookie banner
- Client-side hydration enables timer functionality
- Consistent fallback values prevent hydration mismatches

## Compliance Features

- ✅ Asks for permission every 30 minutes
- ✅ Granular cookie category control
- ✅ Clear opt-in/opt-out mechanisms
- ✅ Privacy policy and terms links
- ✅ Persistent storage of preferences
- ✅ API blocking until consent given
- ✅ SSR-safe implementation
