/**
 * Environment configuration utility
 * 
 * This file provides a centralized way to access environment variables
 * that are loaded via Vite's environment system
 */

// Access environment variables through Vite's process.env polyfill
export const NODE_ENV = import.meta.env.NODE_ENV || 'development';
export const HOST = import.meta.env.HOST || '';
export const PORT = import.meta.env.PORT || '5001';
export const SKIP_BACKEND_CHECK = import.meta.env.SKIP_BACKEND_CHECK || 'false';
export const API_URL = import.meta.env.API_URL || 'http://localhost:3000';
export const DEV_HTTPS = import.meta.env.DEV_HTTPS || 'false';

// JWT Configuration
export const JWT_SECRET = import.meta.env.JWT_SECRET || '';
export const JWT_EXPIRES_IN = import.meta.env.JWT_EXPIRES_IN || '3h';
export const JWT_REFRESH_EXPIRES_IN = import.meta.env.JWT_REFRESH_EXPIRES_IN || '7d';

// CORS Configuration
export const CORS_ORIGIN = import.meta.env.CORS_ORIGIN || '';
export const CORS_CREDENTIALS = import.meta.env.CORS_CREDENTIALS || 'true';

// Development/Production specific settings
export const REDUCE_LOGGING = import.meta.env.REDUCE_LOGGING || 'false';
export const ENABLE_DEV_TOOLS = import.meta.env.ENABLE_DEV_TOOLS || 'true';

// API Configuration
export const API_TIMEOUT = import.meta.env.API_TIMEOUT || '10000';
export const API_RETRY_ATTEMPTS = import.meta.env.API_RETRY_ATTEMPTS || '3';
export const API_RETRY_DELAY = import.meta.env.API_RETRY_DELAY || '1000';

// Cache Configuration
export const CACHE_ENABLED = import.meta.env.CACHE_ENABLED || 'true';
export const CACHE_TTL = import.meta.env.CACHE_TTL || '3600';
export const CACHE_MAX_SIZE = import.meta.env.CACHE_MAX_SIZE || '100';

// API Key Configuration
export const API_KEY_FRONTEND = import.meta.env.API_KEY_FRONTEND || '';

// Helper functions for common environment checks
export const isDevelopment = NODE_ENV === 'development';
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';

// API configuration helpers
export const getApiUrl = () => API_URL || (isProduction ? 'https://api.packmovego.com' : 'http://localhost:3000');
export const getApiTimeout = () => parseInt(API_TIMEOUT || '10000');
export const getApiRetryAttempts = () => parseInt(API_RETRY_ATTEMPTS || '3');
export const getApiRetryDelay = () => parseInt(API_RETRY_DELAY || '1000');

// Cache configuration helpers
export const isCacheEnabled = () => CACHE_ENABLED === 'true';
export const getCacheTTL = () => parseInt(CACHE_TTL || '3600');
export const getCacheMaxSize = () => parseInt(CACHE_MAX_SIZE || '100');

// JWT configuration helpers
export const getJwtSecret = () => JWT_SECRET || 'your-jwt-secret-key-here';
export const getJwtExpiresIn = () => JWT_EXPIRES_IN || '3h';
export const getJwtRefreshExpiresIn = () => JWT_REFRESH_EXPIRES_IN || '7d';

// CORS configuration helpers
export const getCorsOrigin = () => CORS_ORIGIN || (isProduction ? 'https://packmovego.com' : 'https://localhost:5001');
export const getCorsCredentials = () => CORS_CREDENTIALS === 'true';

// API Key configuration helpers
export const getFrontendApiKey = () => API_KEY_FRONTEND || '';

// Development tools configuration
export const shouldReduceLogging = () => REDUCE_LOGGING === 'true';
export const shouldEnableDevTools = () => ENABLE_DEV_TOOLS === 'true';

// Host configuration
export const getHost = () => HOST || (isProduction ? 'https://packmovego.com' : 'https://localhost:');

// Environment logging is now handled in Vite config (terminal only)
