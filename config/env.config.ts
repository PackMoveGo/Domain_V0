/**
 * Environment Configuration
 * 
 * This module provides a clean interface to access environment variables
 * without needing to use the VITE_ prefix throughout the codebase.
 * 
 * Note: Vite requires the VITE_ prefix for security reasons (to prevent
 * accidentally exposing server-side secrets to the browser). This file
 * abstracts that requirement away from the rest of the application.
 */

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

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, fallback: string = ''): string {
  return import.meta.env[key] || fallback;
}

/**
 * Get boolean environment variable
 */
function getBoolEnv(key: string, fallback: boolean = false): boolean {
  const value = getEnv(key);
  if (value === '') return fallback;
  return value === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, fallback: number = 0): number {
  const value = getEnv(key);
  if (value === '') return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get API key with security checks
 */
function getApiKey(): string {
  const key = getEnv('VITE_API_KEY_FRONTEND');
  
  // Security check: Ensure key is not accidentally logged
  if (key && import.meta.env.MODE === 'development') {
    console.log('🔑 [ENV-CONFIG] API key loaded (length:', key.length + ')');
  }
  
  return key;
}

/**
 * Load and export application configuration
 * 
 * This provides a clean interface without VITE_ prefixes
 */
export const config: AppConfig = {
  // API Configuration
  apiUrl: getEnv('VITE_API_URL', '/api'),
  apiTimeout: getNumberEnv('VITE_API_TIMEOUT', 10000),
  apiRetryAttempts: getNumberEnv('VITE_API_RETRY_ATTEMPTS', 3),
  apiRetryDelay: getNumberEnv('VITE_API_RETRY_DELAY', 1000),
  skipBackendCheck: getBoolEnv('VITE_SKIP_BACKEND_CHECK', false),
  apiKeyFrontend: getApiKey(),
  apiKeyEnabled: getBoolEnv('VITE_API_KEY_ENABLED', false),

  // App Information
  appName: getEnv('VITE_APP_NAME', 'PackMoveGo'),
  appVersion: getEnv('VITE_APP_VERSION', '0.1.0'),
  mode: getEnv('VITE_MODE', import.meta.env.MODE || 'development'),
  devMode: getEnv('VITE_DEV_MODE', import.meta.env.MODE || 'development'),
  
  // Development Settings
  devHttps: getBoolEnv('VITE_DEV_HTTPS', false),
  enableDevTools: getBoolEnv('VITE_ENABLE_DEV_TOOLS', false),
  reduceLogging: getBoolEnv('VITE_REDUCE_LOGGING', false),
  
  // Cache Configuration
  cacheEnabled: getBoolEnv('VITE_CACHE_ENABLED', true),
  cacheTtl: getNumberEnv('VITE_CACHE_TTL', 3600),
  cacheMaxSize: getNumberEnv('VITE_CACHE_MAX_SIZE', 100),
  
  // SSR
  isSSR: getBoolEnv('VITE_IS_SSR', false),
  
  // Port
  port: getNumberEnv('VITE_PORT', 5001),
};

/**
 * Ensure API URL has proper protocol (unless it's a relative path)
 */
if (config.apiUrl && !config.apiUrl.startsWith('/') && !/^https?:\/\//i.test(config.apiUrl)) {
  config.apiUrl = `http://${config.apiUrl}`;
}

/**
 * Log configuration in development
 */
if (config.mode === 'development' && !config.reduceLogging) {
  console.log('🔧 [ENV-CONFIG] Application Configuration Loaded:');
  console.log('   • API URL:', config.apiUrl);
  console.log('   • Mode:', config.mode);
  console.log('   • HTTPS:', config.devHttps);
  console.log('   • Backend Check:', config.skipBackendCheck ? 'disabled' : 'enabled');
}

/**
 * Export individual values for convenience
 */
export const {
  apiUrl,
  apiTimeout,
  apiRetryAttempts,
  apiRetryDelay,
  skipBackendCheck,
  apiKeyFrontend,
  apiKeyEnabled,
  appName,
  appVersion,
  mode,
  devMode,
  devHttps,
  enableDevTools,
  reduceLogging,
  cacheEnabled,
  cacheTtl,
  cacheMaxSize,
  isSSR,
  port,
} = config;

export default config;

