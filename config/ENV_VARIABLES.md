# Environment Variables Documentation

This document explains all environment variables used in the PackMoveGo frontend application.

## Overview

The frontend uses Vite, which requires all client-accessible environment variables to be prefixed with `VITE_`. Vite automatically loads `.env` files and exposes `VITE_` prefixed variables to `import.meta.env` in the browser.

## File Structure

- `.env.development.local` - Development environment variables (not committed to Git)
- `.env.production.local` - Production environment variables (not committed to Git)
- `.env.example` - Example template for environment variables

## Frontend Variables (VITE_ prefix)

All frontend variables must use the `VITE_` prefix to be accessible in the browser via `import.meta.env`.

### API Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_URL` | string | `https://localhost:3000` | Base URL for the API server |
| `VITE_SKIP_BACKEND_CHECK` | boolean | `false` | Skip backend health checks (for development) |
| `VITE_API_TIMEOUT` | number | `10000` | API request timeout in milliseconds |
| `VITE_API_RETRY_ATTEMPTS` | number | `3` | Number of retry attempts for failed API calls |
| `VITE_API_RETRY_DELAY` | number | `1000` | Delay between retry attempts in milliseconds |
| `VITE_API_KEY_FRONTEND` | string | - | API key for frontend authentication |
| `VITE_API_KEY_ENABLED` | boolean | `false` | Enable/disable API key authentication |

### Application Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_APP_NAME` | string | `PackMoveGo` | Application name |
| `VITE_APP_VERSION` | string | `0.1.0` | Application version |
| `VITE_DEV_MODE` | string | `development` | Development mode (`development` or `production`) |
| `VITE_MODE` | string | `development` | Build mode (usually same as `VITE_DEV_MODE`) |
| `VITE_DEV_HTTPS` | boolean | `false` | Enable HTTPS for local development |
| `VITE_IS_SSR` | boolean | `false` | Enable Server-Side Rendering |

### Cache Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_CACHE_ENABLED` | boolean | `true` | Enable API response caching |
| `VITE_CACHE_TTL` | number | `3600` | Cache time-to-live in seconds |
| `VITE_CACHE_MAX_SIZE` | number | `100` | Maximum number of cached items |

### Development Tools

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_ENABLE_DEV_TOOLS` | boolean | `true` | Enable development tools and console commands |
| `VITE_REDUCE_LOGGING` | boolean | `false` | Reduce console logging in development |

## Standard Variables

| Variable | Type | Description |
|----------|------|-------------|
| `NODE_ENV` | string | Node.js environment (`development` or `production`) - Standard Node.js variable, not prefixed |

## Backend-Only Variables

The following variables should **NOT** be in frontend `.env` files. They are backend-only and should be configured in the backend server's environment:

- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `JWT_REFRESH_EXPIRES_IN` - JWT refresh token expiration
- `CORS_ORIGIN` - CORS allowed origins
- `CORS_CREDENTIALS` - CORS credentials setting
- `SIGNIN_HOST` - Sign-in page host URL
- `HOST` - Server host (not needed in frontend)
- `PORT` - Server port (not needed in frontend, Vite uses its own port)

## Usage in Code

### Reading Environment Variables

```typescript
// In client-side code (browser)
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.VITE_DEV_MODE === 'development';

// In vite.config.ts (build-time)
import { loadEnv } from 'vite';
const env = loadEnv(mode, __dirname, '');
const apiUrl = env.VITE_API_URL;
```

### Type Safety

For TypeScript, you can extend the `ImportMetaEnv` interface:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEV_MODE: string;
  // ... other variables
}
```

## Development Setup

1. Copy `.env.example` to `.env.development.local`
2. Update values as needed for your local development
3. Restart the dev server for changes to take effect

## Production Setup

1. Copy `.env.example` to `.env.production.local`
2. Update all values for production:
   - Set `VITE_API_URL` to your production API URL
   - Set `VITE_DEV_MODE=production`
   - Set `VITE_REDUCE_LOGGING=true`
   - Set `VITE_ENABLE_DEV_TOOLS=false`
   - Update `VITE_API_KEY_FRONTEND` with production API key
3. Build the application: `npm run build`

## Security Notes

- **Never commit `.env*.local` files to Git** - They contain sensitive information
- **Use strong API keys in production** - Generate secure random keys using `openssl rand -hex 32`
- **Don't expose backend secrets** - JWT secrets, database credentials, etc. should only be in backend `.env` files
- **Review `.env.example`** - Ensure it doesn't contain any real secrets
- **Never hardcode API keys in source code** - Always use environment variables
- **Mask API keys in logs** - Never log full API keys, only show prefix and length
- **Use different keys for dev/prod** - Never reuse production keys in development
- **Rotate keys regularly** - Change API keys periodically for security

## Troubleshooting

### Variables not accessible in browser

- Ensure the variable has the `VITE_` prefix
- Restart the dev server after adding new variables
- Check that the variable is in the correct `.env` file (`.env.development.local` for dev, `.env.production.local` for prod)

### Variables undefined

- Check spelling and prefix (`VITE_`)
- Verify the variable is in the correct `.env` file
- Ensure the dev server was restarted after changes
- Check browser console for errors

