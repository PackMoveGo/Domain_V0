/**
 * Environment Configuration
 * 
 * This module provides a clean interface to access environment variables.
 * Variables are loaded from .env files without VITE_ prefix.
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
  devMode: string;
  
  // Development Settings
  devHttps: boolean;
  enableDevTools: boolean;
  reduceLogging: boolean;
  
  // Cache Configuration
  cacheEnabled: boolean;
  cacheTtl: number;
  cacheMaxSize: number;
  
  // Security (Frontend exposed - server-only values should not be exposed)
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // Stripe (Frontend exposed publishable key only)
  stripePublishableKey: string;
  
  // Twilio (Frontend should not expose these - use backend API)
  twilioAccountSid: string;
  twilioAuthToken: string;
  
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
  const key=getEnv('API_KEY_FRONTEND');
  
  // Security check: Ensure key is not accidentally logged
  if(key && import.meta.env.MODE==='development'){
    console.log('🔑 [ENV-CONFIG] API key loaded (length:', key.length+')');
  }
  
  return key;
}

/**
 * Load and export application configuration
 */
export const config: AppConfig={
  // API Configuration
  apiUrl: getEnv('API_URL', '/api'),
  apiTimeout: getNumberEnv('API_TIMEOUT', 10000),
  apiRetryAttempts: getNumberEnv('API_RETRY_ATTEMPTS', 3),
  apiRetryDelay: getNumberEnv('API_RETRY_DELAY', 1000),
  skipBackendCheck: getBoolEnv('SKIP_BACKEND_CHECK', false),
  apiKeyFrontend: getApiKey(),
  apiKeyEnabled: getBoolEnv('API_KEY_ENABLED', false),

  // App Information
  appName: getEnv('APP_NAME', 'PackMoveGo'),
  appVersion: getEnv('APP_VERSION', '0.1.0'),
  devMode: getEnv('DEV_MODE', import.meta.env.MODE || 'development'),
  
  // Development Settings
  devHttps: getBoolEnv('DEV_HTTPS', false),
  enableDevTools: getBoolEnv('ENABLE_DEV_TOOLS', (import.meta.env.MODE || 'development') === 'development'),
  reduceLogging: getBoolEnv('REDUCE_LOGGING', false),
  
  // Cache Configuration
  cacheEnabled: getBoolEnv('CACHE_ENABLED', true),
  cacheTtl: getNumberEnv('CACHE_TTL', 3600),
  cacheMaxSize: getNumberEnv('CACHE_MAX_SIZE', 100),
  
  // Security (Frontend should NOT expose JWT_SECRET - kept for backward compatibility)
  jwtSecret: getEnv('JWT_SECRET', ''),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '24h'),
  
  // Stripe (Only publishable key should be exposed to frontend)
  stripePublishableKey: getEnv('STRIPE_PUBLISHABLE_KEY', ''),
  
  // Twilio (Should NOT be exposed to frontend - use backend API instead)
  twilioAccountSid: getEnv('TWILIO_ACCOUNT_SID', ''),
  twilioAuthToken: getEnv('TWILIO_AUTH_TOKEN', ''),
  
  // SSR
  isSSR: getBoolEnv('IS_SSR', false),
  
  // Port
  port: getNumberEnv('PORT', 5050),
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
if(config.devMode==='development' && !config.reduceLogging){
  console.log('🔧 [ENV-CONFIG] Application Configuration Loaded:');
  console.log('   • API URL:', config.apiUrl);
  console.log('   • Dev Mode:', config.devMode);
  console.log('   • HTTPS:', config.devHttps);
  console.log('   • Backend Check:', config.skipBackendCheck ? 'disabled' : 'enabled');
  console.log('   • Port:', config.port);
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
  devMode,
  devHttps,
  enableDevTools,
  reduceLogging,
  cacheEnabled,
  cacheTtl,
  cacheMaxSize,
  jwtSecret,
  jwtExpiresIn,
  stripePublishableKey,
  twilioAccountSid,
  twilioAuthToken,
  isSSR,
  port,
}=config;

export default config;

