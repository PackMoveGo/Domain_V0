# Console Manager - Improved Console Output

## Overview

The Console Manager is a centralized logging utility that eliminates repetitive console output and groups related information together for a cleaner development experience.

## Features

### 1. Deduplication
- Prevents identical log messages from appearing multiple times within 2 seconds
- Shows count of repeated messages (e.g., "Message (3x)")
- Automatically cleans up old log entries

### 2. Log Grouping
- Groups related logs together (API Calls, Navigation, etc.)
- Automatically opens/closes groups
- Keeps groups organized and easy to read

### 3. Specialized Logging Methods
- `apiCall()` - Groups API-related logs
- `navigation()` - Groups navigation logs
- `componentRender()` - Prevents repeated component render logs
- `performanceReport()` - Formats performance data nicely

### 4. Environment Awareness
- Only logs in development mode
- Respects VITE_DEV_MODE environment variable
- Session-based initialization to prevent startup noise

## Usage

### Basic Logging
```typescript
import { log, info, warn, error, success } from './util/consoleManager';

log('Basic message');
info('Info with data', { key: 'value' });
warn('Warning message');
error('Error message');
success('Success message');
```

### Specialized Logging
```typescript
import { apiCall, navigation, componentRender, performanceReport } from './util/consoleManager';

// API calls (grouped)
apiCall('/api/v0/nav', 'http://localhost:3000');

// Navigation (grouped)
navigation('/about');

// Component rendering (deduplicated)
componentRender('App');

// Performance reports (formatted)
performanceReport(metrics, recommendations);
```

### Grouped Logging
```typescript
import { log } from './util/consoleManager';

// Logs will be grouped under "API Calls"
log('Making request to /api/users', data, 'API Calls');
log('Response received', response, 'API Calls');
```

## Before vs After

### Before (Repetitive)
```
App component rendered
App component rendered
App component rendered
RouteDebugger - Current location: /about
RouteDebugger - Full location: {pathname: '/about', ...}
RouteDebugger - Current location: /about
RouteDebugger - Full location: {pathname: '/about', ...}
🌐 Making API call to: http://localhost:3000/api/v0/nav
🔧 Base URL: http://localhost:3000
🔧 Endpoint: /api/v0/nav
🌐 Making API call to: http://localhost:3000/api/v0/nav
🔧 Base URL: http://localhost:3000
🔧 Endpoint: /api/v0/nav
```

### After (Organized)
```
🔄 App rendered (3x)
📊 Navigation
  📍 Current location: /about (2x)
📊 API Calls
  🌐 Making API call to: /api/v0/nav (2x)
```

## Benefits

1. **Reduced Noise** - No more repetitive logs
2. **Better Organization** - Related logs are grouped together
3. **Improved Readability** - Cleaner console output
4. **Performance** - Less console overhead
5. **Debugging** - Easier to find relevant information

## Configuration

The Console Manager automatically:
- Detects development mode
- Manages session-based initialization
- Cleans up old log entries
- Respects environment variables

## Migration

To use the Console Manager in existing code:

1. Replace `console.log()` with `log()`
2. Replace `console.info()` with `info()`
3. Replace `console.warn()` with `warn()`
4. Replace `console.error()` with `error()`
5. Use specialized methods for API calls, navigation, etc.

## Testing

Run the test script to see the Console Manager in action:
```typescript
import { testConsoleManager } from './util/testConsoleManager';
testConsoleManager();
```

This will demonstrate all the features and show the improved console output. 