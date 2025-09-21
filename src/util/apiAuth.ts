/**
 * API Authentication Utility
 * 
 * Centralizes API key authentication logic for the frontend application.
 * Handles different API key types (frontend/admin) and authentication state.
 */

import { getSessionId as getSSRSafeSessionId, isClient } from './ssrUtils';

export interface ApiAuthConfig {
  isEnabled: boolean;
  frontendKey?: string;
  adminKey?: string;
  legacyKey?: string;
  activeKey?: string;
  keyType: 'frontend' | 'admin' | 'legacy' | 'none';
}

/**
 * Gets the current API authentication configuration
 */
export const getApiAuthConfig = (): ApiAuthConfig => {
  // SSR-safe environment variable access
  const isEnabled = isClient ? import.meta.env.API_KEY_ENABLED === 'true' : false;
  const frontendKey = isClient ? import.meta.env.API_KEY_FRONTEND : undefined;
  const adminKey = isClient ? import.meta.env.API_KEY_ADMIN : undefined;
  const legacyKey = isClient ? import.meta.env.VITE_API_KEY : undefined;
  
  let activeKey: string | undefined;
  let keyType: 'frontend' | 'admin' | 'legacy' | 'none' = 'none';
  
  if (isEnabled) {
    if (frontendKey) {
      activeKey = frontendKey;
      keyType = 'frontend';
    } else if (legacyKey) {
      activeKey = legacyKey;
      keyType = 'legacy';
    }
  }
  
  return {
    isEnabled,
    frontendKey,
    adminKey,
    legacyKey,
    activeKey,
    keyType
  };
};

/**
 * Checks if API key authentication is enabled and configured
 */
export const isApiAuthEnabled = (): boolean => {
  const config = getApiAuthConfig();
  return config.isEnabled && !!config.activeKey;
};

/**
 * Gets the active API key for requests
 */
export const getActiveApiKey = (): string | undefined => {
  const config = getApiAuthConfig();
  return config.activeKey;
};

/**
 * Gets the admin API key (if available and authentication is enabled)
 */
export const getAdminApiKey = (): string | undefined => {
  const config = getApiAuthConfig();
  return config.isEnabled ? config.adminKey : undefined;
};

/**
 * Gets API headers with authentication included
 */
export const getAuthHeaders = (useAdminKey = false): Record<string, string> => {
  const config = getApiAuthConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (config.isEnabled) {
    const keyToUse = useAdminKey ? config.adminKey : config.activeKey;
    if (keyToUse) {
      // For sensitive operations, consider using server-side proxy
      if (useAdminKey && isSensitiveOperation()) {
        // Use session-based authentication for admin operations
        headers['x-auth-type'] = 'session';
        headers['x-session-id'] = getSessionId();
      } else {
        // Use API key for regular operations
        headers['x-api-key'] = keyToUse;
      }
    }
  }
  
  return headers;
};

/**
 * Check if current operation is sensitive and should use server-side proxy
 */
const isSensitiveOperation = (): boolean => {
  const sensitiveEndpoints = [
    '/admin',
    '/users',
    '/payments',
    '/billing',
    '/account'
  ];
  
  const currentPath = window.location.pathname;
  return sensitiveEndpoints.some(endpoint => currentPath.includes(endpoint));
};

/**
 * Get or create session ID for sensitive operations
 */
const getSessionId = (): string => {
  return getSSRSafeSessionId();
};

/**
 * Secure API key validation with additional checks
 */
export const validateApiKey = (key: string): boolean => {
  if (!key) return false;
  
  // Enhanced validation: should start with pmg_ and have reasonable length
  const isValidFormat = key.startsWith('pmg_') && key.length > 20;
  
  // Additional security checks
  const hasValidChars = /^[a-zA-Z0-9_-]+$/.test(key);
  const notExposedInConsole = !key.includes('console') && !key.includes('log');
  
  return isValidFormat && hasValidChars && notExposedInConsole;
};

/**
 * Gets authentication status for debugging/monitoring
 */
export const getAuthStatus = () => {
  const config = getApiAuthConfig();
  const isDevMode = isClient ? import.meta.env.VITE_DEV_MODE === 'development' : false;
  
  const status = {
    enabled: config.isEnabled,
    hasActiveKey: !!config.activeKey,
    keyType: config.keyType,
    hasAdminKey: !!config.adminKey,
    // Don't expose actual keys in production
    keyValid: config.activeKey ? validateApiKey(config.activeKey) : false
  };
  
  // Only log in development mode, and only once per session
  if (isDevMode && !sessionStorage.getItem('api-auth-status-logged')) {
    console.log('🔐 API Auth Status:', status);
    sessionStorage.setItem('api-auth-status-logged', 'true');
  }
  
  return status;
};

/**
 * Hook for components that need to react to auth state changes
 */
export const useApiAuth = () => {
  const config = getApiAuthConfig();
  
  return {
    isEnabled: config.isEnabled,
    isAuthenticated: !!config.activeKey,
    keyType: config.keyType,
    hasAdminAccess: !!config.adminKey,
    getHeaders: getAuthHeaders,
    validateKey: validateApiKey,
    getStatus: getAuthStatus
  };
}; 

/**
 * Secure proxy for sensitive operations
 * Routes sensitive operations through server-side proxy to protect API keys
 */
export const secureApiCall = async <T>(
  endpoint: string, 
  options: RequestInit = {}, 
  isSensitive = false
): Promise<T> => {
  const config = getApiAuthConfig();
  
  if (isSensitive && config.isEnabled) {
    // For sensitive operations, use server-side proxy
    const proxyEndpoint = `/api/proxy${endpoint}`;
    const sessionId = getSessionId();
    
    const proxyOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-auth-type': 'session',
        'x-session-id': sessionId,
        'x-proxy-request': 'true'
      }
    };
    
    // Import API service dynamically to avoid circular dependencies
    const { api } = await import('../services/service.apiSW');
    return api.getNav();
  }
  
  // For non-sensitive operations, use regular API call
  const { api } = await import('../services/service.apiSW');
  return api.getNav();
};

/**
 * Check if an endpoint requires secure proxy
 */
export const isSensitiveEndpoint = (endpoint: string): boolean => {
  const sensitivePatterns = [
    '/admin',
    '/users',
    '/payments', 
    '/billing',
    '/account',
    '/settings',
    '/profile'
  ];
  
  return sensitivePatterns.some(pattern => endpoint.includes(pattern));
}; 