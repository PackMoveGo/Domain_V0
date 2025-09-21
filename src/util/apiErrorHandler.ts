/**
 * API Error Handler Utility
 * 
 * A reusable error handling system for API failures that can be used
 * throughout the application to trigger the 503 fallback modal.
 * 
 * Features:
 * - Centralized error handling
 * - Automatic modal triggering
 * - Consistent error reporting
 * - Easy to use in any component or hook
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ApiErrorDetails {
  endpoint: string;
  error: string;
  timestamp?: number;
  context?: string;
  is503Error?: boolean;
  failedEndpoints?: string[];
}

export interface ApiErrorHandlerOptions {
  showModal?: boolean;
  logError?: boolean;
  context?: string;
}

// =============================================================================
// ERROR TRACKING
// =============================================================================

/**
 * Tracks failed endpoints for 503 errors
 */
class ErrorTracker {
  private failedEndpoints: Set<string> = new Set();
  private is503Error: boolean = false;
  private modalShown: boolean = false;

  addFailedEndpoint(endpoint: string, is503: boolean = false): void {
    this.failedEndpoints.add(endpoint);
    if (is503) {
      this.is503Error = true;
    }
  }

  setModalShown(shown: boolean): void {
    this.modalShown = shown;
  }

  isModalShown(): boolean {
    return this.modalShown;
  }

  getFailedEndpoints(): string[] {
    return Array.from(this.failedEndpoints);
  }

  is503ErrorOccurred(): boolean {
    return this.is503Error;
  }

  clear(): void {
    this.failedEndpoints.clear();
    this.is503Error = false;
    this.modalShown = false;
  }

  hasFailures(): boolean {
    return this.failedEndpoints.size > 0;
  }
}

const errorTracker = new ErrorTracker();

// =============================================================================
// CORE ERROR HANDLER
// =============================================================================

/**
 * Handles API errors and triggers the fallback modal
 * Only shows modal if user has given cookie consent
 * 
 * @param error - The error that occurred
 * @param endpoint - The API endpoint that failed
 * @param options - Additional options for error handling
 */
export function handleApiError(
  error: unknown,
  endpoint: string,
  options: ApiErrorHandlerOptions = {}
): void {
  const {
    showModal = true,
    logError = true,
    context = 'API Call'
  } = options;

  // Extract error message
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  // Check if this is a 503 error or connection error
  const is503Error = errorMessage.includes('503') || 
    errorMessage.includes('Service Unavailable') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('ERR_CONNECTION_REFUSED') ||
    errorMessage.includes('ECONNREFUSED') ||
    (error as any)?.statusCode === 503 ||
    (error as any)?.is503Error === true;
  
  // Track the failed endpoint
  errorTracker.addFailedEndpoint(endpoint, is503Error);
  
  // Extract comprehensive error details if available
  const comprehensiveError = error as any;
  const allFailedEndpoints = comprehensiveError?.failedEndpoints || [];
  const allAttemptedEndpoints = comprehensiveError?.attemptedEndpoints || [];
  const primaryError = comprehensiveError?.primaryError;
  
  // Create error details with comprehensive information
  const errorDetails: ApiErrorDetails = {
    endpoint: allFailedEndpoints.length > 0 ? allFailedEndpoints.join(', ') : endpoint,
    error: allFailedEndpoints.length > 0 
      ? `Failed APIs: ${allFailedEndpoints.join(', ')}\nPrimary: ${allFailedEndpoints[0] || endpoint}\n\n${primaryError?.message || errorMessage}`
      : errorMessage,
    timestamp: Date.now(),
    context,
    is503Error,
    failedEndpoints: allFailedEndpoints.length > 0 ? allFailedEndpoints : errorTracker.getFailedEndpoints()
  };

  // Log error if requested
  if (logError) {
    console.error(`🔧 ${context} Error for ${endpoint}:`, error);
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Error details:', errorDetails);
      if (is503Error) {
        console.warn('⚠️ 503 Service Unavailable detected for:', endpoint);
      }
    }
  }

  // Check if user has given cookie consent before showing modal
  const hasConsent = checkCookieConsent();
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Cookie consent check result:', hasConsent);
  }
  
  // Show modal only if user has given cookie consent and modal hasn't been shown yet
  if (showModal && hasConsent && typeof window !== 'undefined' && !errorTracker.isModalShown()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 User has consent, triggering API failure modal for:', endpoint);
    }
    
    // Mark modal as shown to prevent multiple triggers
    errorTracker.setModalShown(true);
    
    // Set session storage flag
    sessionStorage.setItem('api-failed-after-consent', 'true');
    
    // Dispatch custom event with enhanced error details
    const event = new CustomEvent('api-failed-after-consent', {
      detail: errorDetails
    });
    
    window.dispatchEvent(event);
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 API failure event dispatched:', errorDetails);
    }
  } else if (showModal && hasConsent && errorTracker.isModalShown()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Modal already shown, skipping duplicate trigger for:', endpoint);
    }
  } else if (showModal && !hasConsent) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 User has not given consent yet, storing error for later:', endpoint);
    }
    
    // Store error details for when consent is given
    const errorKey = `api-error-${endpoint}-${Date.now()}`;
    sessionStorage.setItem(errorKey, JSON.stringify(errorDetails));
    
    // Store a flag that there are pending errors
    sessionStorage.setItem('pending-api-errors', 'true');
  } else if (showModal && typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Window not available, cannot show modal');
    }
  }
}

/**
 * Checks if cookie consent has been given
 * Uses the same logic as the existing hooks
 */
function checkCookieConsent(): boolean {
  try {
    // Check the same key that CookiePreferencesContext uses
    const savedPreferences = localStorage.getItem('packmovego-cookie-preferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      return parsed.hasMadeChoice === true && parsed.hasOptedOut === false;
    }
    return false;
  } catch (error) {
    console.warn('🔧 Error checking cookie consent:', error);
    return false;
  }
}

/**
 * Checks for pending API errors and triggers the modal if consent is now given
 * Call this when cookie consent is granted
 */
export function checkPendingApiErrors(): void {
  try {
    const hasPendingErrors = sessionStorage.getItem('pending-api-errors') === 'true';
    
    if (hasPendingErrors && checkCookieConsent()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 User now has consent, checking for pending API errors');
      }
      
      // Find all stored error keys
      const errorKeys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('api-error-')) {
          errorKeys.push(key);
        }
      }
      
      if (errorKeys.length > 0) {
        // Get the most recent error
        const latestErrorKey = errorKeys.sort().pop();
        if (latestErrorKey) {
          const errorData = sessionStorage.getItem(latestErrorKey);
          if (errorData) {
            const errorDetails = JSON.parse(errorData);
            if (process.env.NODE_ENV === 'development') {
              console.log('🔧 Found pending error, triggering modal:', errorDetails);
            }
            
            // Trigger the modal
            sessionStorage.setItem('api-failed-after-consent', 'true');
            window.dispatchEvent(new CustomEvent('api-failed-after-consent', {
              detail: errorDetails
            }));
            
            // Clean up stored errors
            errorKeys.forEach(key => sessionStorage.removeItem(key));
            sessionStorage.removeItem('pending-api-errors');
          }
        }
      }
    }
  } catch (error) {
    console.warn('🔧 Error checking pending API errors:', error);
  }
}

// =============================================================================
// WRAPPER FUNCTIONS FOR COMMON USE CASES
// =============================================================================

/**
 * Wraps an API call with automatic error handling
 * 
 * @param apiCall - The API function to call
 * @param endpoint - The endpoint name for error reporting
 * @param options - Error handling options
 * @returns Promise that resolves with the API result or rejects with error
 */
export async function withApiErrorHandling<T>(
  apiCall: () => Promise<T>,
  endpoint: string,
  options: ApiErrorHandlerOptions = {}
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    handleApiError(error, endpoint, options);
    throw error; // Re-throw so calling code can handle if needed
  }
}

/**
 * Wraps multiple API calls with error handling
 * 
 * @param apiCalls - Array of API calls with their endpoints
 * @param options - Error handling options
 * @returns Promise that resolves with all results or rejects on first error
 */
export async function withMultipleApiErrorHandling<T>(
  apiCalls: Array<{ call: () => Promise<T>; endpoint: string }>,
  options: ApiErrorHandlerOptions = {}
): Promise<T[]> {
  const results: T[] = [];
  
  for (const { call, endpoint } of apiCalls) {
    try {
      const result = await call();
      results.push(result);
    } catch (error) {
      handleApiError(error, endpoint, options);
      throw error;
    }
  }
  
  return results;
}

// =============================================================================
// HOOK UTILITIES
// =============================================================================

/**
 * Creates an error handler function for use in React hooks
 * 
 * @param endpoint - The endpoint name
 * @param options - Error handling options
 * @returns Function that can be used in catch blocks
 */
export function createApiErrorHandler(
  endpoint: string,
  options: ApiErrorHandlerOptions = {}
) {
  return (error: unknown) => {
    handleApiError(error, endpoint, options);
  };
}

// =============================================================================
// REACT HOOK FOR API ERROR HANDLING
// =============================================================================

import { useCallback } from 'react';

/**
 * React hook for API error handling
 * 
 * @param endpoint - The endpoint name
 * @param options - Error handling options
 * @returns Object with error handling functions
 */
export function useApiErrorHandler(
  endpoint: string,
  options: ApiErrorHandlerOptions = {}
) {
  const handleError = useCallback(
    (error: unknown) => {
      handleApiError(error, endpoint, options);
    },
    [endpoint, options]
  );

  const wrapApiCall = useCallback(
    <T>(apiCall: () => Promise<T>) => {
      return withApiErrorHandling(apiCall, endpoint, options);
    },
    [endpoint, options]
  );

  return {
    handleError,
    wrapApiCall
  };
}

// =============================================================================
// ERROR TRACKER UTILITIES
// =============================================================================

/**
 * Get all failed endpoints
 */
export function getFailedEndpoints(): string[] {
  return errorTracker.getFailedEndpoints();
}

/**
 * Check if any 503 errors occurred
 */
export function has503Errors(): boolean {
  return errorTracker.is503ErrorOccurred();
}

/**
 * Clear all error tracking
 */
export function clearErrorTracking(): void {
  errorTracker.clear();
}

/**
 * Reset modal shown flag (call when modal is closed)
 */
export function resetModalShownFlag(): void {
  errorTracker.setModalShown(false);
}

/**
 * Check if there are any tracked failures
 */
export function hasTrackedFailures(): boolean {
  return errorTracker.hasFailures();
}

/**
 * Get comprehensive error details for modal display
 */
export function getComprehensiveErrorDetails(): ApiErrorDetails | null {
  if (!errorTracker.hasFailures()) {
    return null;
  }

  return {
    endpoint: errorTracker.getFailedEndpoints()[0] || 'Unknown',
    error: errorTracker.is503ErrorOccurred() ? '503 Service Unavailable' : 'API Error',
    timestamp: Date.now(),
    context: 'Multiple API Failures',
    is503Error: errorTracker.is503ErrorOccurred(),
    failedEndpoints: errorTracker.getFailedEndpoints()
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('connection') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    );
  }
  return false;
}

/**
 * Checks if an error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('500') ||
      error.message.includes('501') ||
      error.message.includes('502') ||
      error.message.includes('503') ||
      error.message.includes('504') ||
      error.message.includes('505')
    );
  }
  return false;
}

/**
 * Gets a user-friendly error message
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (isServerError(error)) {
    return 'Server is temporarily unavailable. Please try again later.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  handleApiError,
  withApiErrorHandling,
  withMultipleApiErrorHandling,
  createApiErrorHandler,
  useApiErrorHandler,
  checkPendingApiErrors,
  isNetworkError,
  isServerError,
  getFriendlyErrorMessage,
  getFailedEndpoints,
  has503Errors,
  clearErrorTracking,
  resetModalShownFlag,
  hasTrackedFailures,
  getComprehensiveErrorDetails
};