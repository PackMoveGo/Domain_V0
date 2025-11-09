# API Architecture & Modal System Diagram

## System Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                    API Architecture Flow                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Page Load     │───▶│  API Service     │───▶│  Modal Display  │
│                 │    │  (service.apiSW) │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Detailed Flow

### 1. Page Service Initialization
```
┌─────────────────────────────────────────────────────────────────┐
│                    Page Service Pattern                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Page Load      │
│  (home/about/   │
│   contact)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ startPageTracking│
│ ('page-name')   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ checkHealth()   │
│                 │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Promise.allSettled│
│ (API calls)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Collect Failed  │
│ Endpoints       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ showApiFailure  │
│ Modal (if any)  │
└─────────────────┘
```

### 2. Page-Specific API Routes

#### Home Page (`service.homePageAPI.ts`)
```
┌─────────────────────────────────────────────────────────────────┐
│                        Home Page Routes                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ /v0/nav     │  │ /v0/services│  │/v0/auth/    │  │/v0/testimonials│
│             │  │             │  │status       │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
        │                │                │                │
        └────────────────┼────────────────┼────────────────┘
                         │                │
        ┌─────────────┐  │  ┌─────────────┐
        │/v0/recentMoves│  │  │/v0/recentMoves│
        │             │  │  │/total       │
        └─────────────┘  │  └─────────────┘
                         │
        ┌─────────────────┐
        │ If any fail:    │
        │ showApiFailure  │
        │ Modal with      │
        │ failed routes   │
        └─────────────────┘
```

#### About Page (`service.aboutPageAPI.ts`)
```
┌─────────────────────────────────────────────────────────────────┐
│                        About Page Routes                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ /v0/nav     │  │ /v0/about   │  │/v0/recentMoves│
│             │  │             │  │/total       │
└─────────────┘  └─────────────┘  └─────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌─────────────────┐
        │ If any fail:    │
        │ showApiFailure  │
        │ Modal with      │
        │ failed routes   │
        └─────────────────┘
```

#### Contact Page (`service.contactPageAPI.ts`)
```
┌─────────────────────────────────────────────────────────────────┐
│                       Contact Page Routes                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐
│ /v0/nav     │  │ /v0/contact │
│             │  │             │
└─────────────┘  └─────────────┘
        │                │
        └────────────────┘
                │
        ┌─────────────────┐
        │ If any fail:    │
        │ showApiFailure  │
        │ Modal with      │
        │ failed routes   │
        └─────────────────┘
```

### 3. Modal System Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    Modal System Flow                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ API Call Fails  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Collect Failed  │
│ Endpoints for   │
│ Current Page    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ showApiFailure  │
│ Modal           │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Modal Shows     │
│ Page-Specific   │
│ Failed Routes   │
└─────────────────┘
```

### 4. 503 Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                     503 Error Handling                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Health Check    │
│ Fails           │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Show Modal with │
│ /v0/health      │
│ endpoint        │
└─────────────────┘

┌─────────────────┐
│ Individual API  │
│ Call Fails      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Show Modal with │
│ specific failed │
│ endpoints for   │
│ current page    │
└─────────────────┘
```

## Future API Integration

### When API Works:
```
┌─────────────────┐
│ Health Check    │
│ Passes          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ API Calls       │
│ Succeed         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Data Loads      │
│ Normally        │
└─────────────────┘
```

### When API Fails:
```
┌─────────────────┐
│ Health Check    │
│ Fails OR        │
│ API Call Fails  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Show Modal with │
│ Page-Specific   │
│ Failed Routes   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Graceful        │
│ Degradation     │
└─────────────────┘
```

## Key Benefits

1. **Page-Specific Errors**: Modal only shows relevant API failures
2. **Consistent Architecture**: All pages follow same pattern
3. **Future-Ready**: Easy to add new pages following same pattern
4. **Clean Separation**: Each page manages its own API calls and errors
5. **Better UX**: Users see only relevant error information

## Implementation Notes

- Each page service calls `api.startPageTracking('page-name')` on load
- Health check is performed before making API calls
- Failed endpoints are collected page-specifically
- Modal only shows failed endpoints for the current page
- Architecture is consistent across all page services
