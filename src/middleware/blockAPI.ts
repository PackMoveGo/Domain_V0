/**
 * API Blocking Middleware
 * 
 * This middleware checks cookie consent before allowing API calls.
 * It integrates with the CookiePreferencesContext to determine if API calls should be blocked.
 */

import { useCookiePreferences } from '../context/CookiePreferencesContext';

// Middleware function type
export type ApiMiddleware<T = any> = (
  apiCall: () => Promise<T>,
  endpoint: string,
  options?: {
    allowWithoutConsent?: boolean;
    fallbackData?: T;
  }
) => Promise<T>;

/**
 * Hook that returns API blocking middleware
 * This middleware checks if API calls should be blocked based on cookie consent
 */
export const useApiBlockingMiddleware = (): ApiMiddleware => {
  const { isApiBlocked, hasConsent } = useCookiePreferences();

  return async <T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    options?: {
      allowWithoutConsent?: boolean;
      fallbackData?: T;
    }
  ): Promise<T> => {
    // Check if API is blocked
    if (isApiBlocked && !options?.allowWithoutConsent) {
      console.warn(`🚫 API call blocked due to no cookie consent: ${endpoint}`);
      
      // Return fallback data if provided
      if (options?.fallbackData !== undefined) {
        return options.fallbackData;
      }
      
      // Throw error indicating API is blocked
      throw new Error(`API blocked: No cookie consent for ${endpoint}`);
    }

    // If not blocked or explicitly allowed, proceed with API call
    try {
      return await apiCall();
    } catch (error) {
      console.error(`❌ API call failed for ${endpoint}:`, error);
      throw error;
    }
  };
};

/**
 * Static function to check if API calls should be blocked
 * This can be used in contexts where hooks are not available
 */
export const shouldBlockApiCall = (isApiBlocked: boolean, allowWithoutConsent?: boolean): boolean => {
  return isApiBlocked && !allowWithoutConsent;
};

/**
 * Wrapper function that blocks API calls based on cookie consent
 * This is a non-hook version for use in service classes
 */
export const withApiBlocking = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string,
  isApiBlocked: boolean,
  options?: {
    allowWithoutConsent?: boolean;
    fallbackData?: T;
  }
): Promise<T> => {
  // Check if API is blocked
  if (shouldBlockApiCall(isApiBlocked, options?.allowWithoutConsent)) {
    console.warn(`🚫 API call blocked due to no cookie consent: ${endpoint}`);
    
    // Return fallback data if provided
    if (options?.fallbackData !== undefined) {
      return options.fallbackData;
    }
    
    // Throw error indicating API is blocked
    throw new Error(`API blocked: No cookie consent for ${endpoint}`);
  }

  // If not blocked or explicitly allowed, proceed with API call
  try {
    return await apiCall();
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export default {
  useApiBlockingMiddleware,
  shouldBlockApiCall,
  withApiBlocking
};
