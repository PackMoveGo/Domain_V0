# Configuration Module

## 📌 Using Environment Variables WITHOUT `VITE_` Prefix

### The Problem
Vite requires all client-side environment variables to have the `VITE_` prefix for security reasons. This can make code verbose:

```typescript
// ❌ Verbose - using VITE_ prefix everywhere
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
const devHttps = import.meta.env.VITE_DEV_HTTPS === 'true';
```

### The Solution
Use the `env.config.ts` module to access variables with clean names:

```typescript
// ✅ Clean - no VITE_ prefix needed
import { apiUrl, appName, devHttps } from '@config/env.config';
```

## 🚀 Usage Examples

### Basic Usage

```typescript
import { apiUrl, appName, apiTimeout } from '@config/env.config';

// Use clean variable names
console.log(`App: ${appName}`);
console.log(`API: ${apiUrl}`);
console.log(`Timeout: ${apiTimeout}ms`);
```

### Import All Config

```typescript
import config from '@config/env.config';

// Access via object
console.log(config.apiUrl);
console.log(config.appName);
console.log(config.devHttps);
```

### API Service Example

```typescript
import { apiUrl, apiTimeout, apiRetryAttempts } from '@config/env.config';
import axios from 'axios';

const api = axios.create({
  baseURL: apiUrl,
  timeout: apiTimeout,
});

// Configure retries
api.interceptors.response.use(
  response => response,
  error => {
    if (error.config._retry < apiRetryAttempts) {
      error.config._retry = (error.config._retry || 0) + 1;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Component Example

```typescript
import React from 'react';
import { appName, appVersion, enableDevTools } from '@config/env.config';

export function AppInfo() {
  return (
    <div>
      <h1>{appName}</h1>
      <p>Version: {appVersion}</p>
      {enableDevTools && <DevToolsPanel />}
    </div>
  );
}
```

## 📝 Available Config Variables

### API Configuration
- `apiUrl` - API base URL (default: `/api`)
- `apiTimeout` - Request timeout in milliseconds
- `apiRetryAttempts` - Number of retry attempts
- `apiRetryDelay` - Delay between retries
- `skipBackendCheck` - Skip backend health check
- `apiKeyFrontend` - Frontend API key
- `apiKeyEnabled` - Whether API key is required

### App Information
- `appName` - Application name
- `appVersion` - Application version
- `mode` - Build mode (development/production)
- `devMode` - Development mode setting

### Development Settings
- `devHttps` - Enable HTTPS in development
- `enableDevTools` - Enable development tools
- `reduceLogging` - Reduce console logging

### Cache Configuration
- `cacheEnabled` - Enable caching
- `cacheTtl` - Cache time-to-live
- `cacheMaxSize` - Maximum cache size

### Other
- `isSSR` - Server-side rendering flag
- `port` - Development server port

## 🔧 Configuration Files

### `.env.development.local` (Development)
```bash
# Must use VITE_ prefix (required by Vite)
VITE_API_URL=/api
VITE_APP_NAME=PackMoveGo
VITE_DEV_HTTPS=true
VITE_API_TIMEOUT=10000
```

### Import in Code
```typescript
// Clean import (no VITE_ prefix)
import { apiUrl, appName, devHttps, apiTimeout } from '@config/env.config';
```

## ⚠️ Important Notes

1. **Keep `VITE_` in `.env` files** - This is a Vite requirement and cannot be changed
2. **Use config module in code** - Import from `env.config.ts` for clean variable names
3. **Type Safety** - All config values are properly typed in TypeScript
4. **Default Values** - Config provides sensible defaults for all variables
5. **Development Logging** - Config logs values in development mode for debugging

## 🎯 Migration Guide

### Before (Using VITE_ everywhere)
```typescript
const apiUrl = import.meta.env.VITE_API_URL || '/api';
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
const isHttps = import.meta.env.VITE_DEV_HTTPS === 'true';
```

### After (Using config module)
```typescript
import { apiUrl, apiTimeout, devHttps } from '@config/env.config';

// Values are already parsed and have correct types
console.log(apiUrl);    // string
console.log(apiTimeout); // number
console.log(devHttps);  // boolean
```

## 🔍 Type Definitions

```typescript
interface AppConfig {
  // API Configuration
  apiUrl: string;
  apiTimeout: number;
  apiRetryAttempts: number;
  apiRetryDelay: number;
  skipBackendCheck: boolean;
  apiKeyFrontend: string;
  apiKeyEnabled: boolean;

  // App Information
  appName: string;
  appVersion: string;
  mode: string;
  devMode: string;
  
  // Development Settings
  devHttps: boolean;
  enableDevTools: boolean;
  reduceLogging: boolean;
  
  // Cache Configuration
  cacheEnabled: boolean;
  cacheTtl: number;
  cacheMaxSize: number;
  
  // SSR
  isSSR: boolean;
  
  // Port
  port: number;
}
```

## 🌟 Benefits

1. **Cleaner Code** - No `VITE_` prefix in imports
2. **Type Safety** - Proper TypeScript types
3. **Default Values** - Automatic fallbacks
4. **Centralized** - Single source of truth
5. **Easy to Mock** - For testing
6. **Better DX** - Autocomplete in IDE

