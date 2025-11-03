/**
 * Error Utilities for Consistent 503 Error Handling
 * 
 * This module provides utilities to ensure all API errors are properly
 * handled with consistent 503 status codes and error messages.
 */

// =============================================================================
// ERROR DETECTION UTILITIES
// =============================================================================

/**
 * Checks if an error is a connection/network error that should be treated as 503
 */
export function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('err_connection_refused') ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('econnreset')
  );
}

/**
 * Checks if an error is a 503 Service Unavailable error
 */
export function is503Error(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes('503') ||
    errorMessage.includes('service unavailable') ||
    errorMessage.includes('temporarily unavailable') ||
    (error as any)?.statusCode === 503 ||
    (error as any)?.is503Error === true ||
    isConnectionError(error)
  );
}

/**
 * Checks if an error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes('500') ||
    errorMessage.includes('501') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504') ||
    errorMessage.includes('505')
  );
}

// =============================================================================
// ERROR CREATION UTILITIES
// =============================================================================

/**
 * Creates a standardized 503 error with proper properties
 */
export function create503Error(endpoint: string, originalError?: unknown): Error {
  const error = new Error(`503 Service Unavailable: ${endpoint}`);
  (error as any).statusCode = 503;
  (error as any).is503Error = true;
  
  if (originalError) {
    (error as any).originalError = originalError;
    (error as any).originalMessage = originalError instanceof Error ? originalError.message : String(originalError);
  }
  
  return error;
}

/**
 * Creates a standardized connection error with 503 status
 */
export function createConnectionError(endpoint: string, originalError?: unknown): Error {
  const error = new Error(`503 Service Unavailable: Connection failed for ${endpoint}`);
  (error as any).statusCode = 503;
  (error as any).is503Error = true;
  (error as any).isConnectionError = true;
  
  if (originalError) {
    (error as any).originalError = originalError;
    (error as any).originalMessage = originalError instanceof Error ? originalError.message : String(originalError);
  }
  
  return error;
}

// =============================================================================
// ERROR NORMALIZATION
// =============================================================================

/**
 * Normalizes any error to a proper 503 error if it's a connection issue
 */
export function normalizeTo503Error(error: unknown, endpoint: string): Error {
  // If it's already a 503 error, return as-is
  if (is503Error(error)) {
    return error as Error;
  }
  
  // If it's a connection error, convert to 503
  if (isConnectionError(error)) {
    return createConnectionError(endpoint, error);
  }
  
  // If it's a server error, convert to 503
  if (isServerError(error)) {
    return create503Error(endpoint, error);
  }
  
  // For other errors, wrap in 503 if they seem API-related
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    if (
      errorMessage.includes('api') ||
      errorMessage.includes('request') ||
      errorMessage.includes('response') ||
      errorMessage.includes('http')
    ) {
      return create503Error(endpoint, error);
    }
  }
  
  // Return original error if it doesn't need conversion
  return error as Error;
}

// =============================================================================
// ERROR LOGGING UTILITIES
// =============================================================================

/**
 * Logs an error with appropriate context for 503 errors
 */
export function log503Error(error: Error, endpoint: string, context: string = 'API Service'): void {
  const isConnection = (error as any)?.isConnectionError;
  const errorType = isConnection ? 'Connection' : '503 Service Unavailable';
  
  console.error(`❌ [${context}] ${errorType} for ${endpoint}:`, error.message);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`🔧 [${context}] Error details:`, {
      endpoint,
      statusCode: (error as any)?.statusCode,
      is503Error: (error as any)?.is503Error,
      isConnectionError: (error as any)?.isConnectionError,
      originalError: (error as any)?.originalError,
      originalMessage: (error as any)?.originalMessage
    });
  }
}

// =============================================================================
// ERROR HANDLING WRAPPER
// =============================================================================

/**
 * Wraps an API call with automatic 503 error handling
 */
export async function with503ErrorHandling<T>(
  apiCall: () => Promise<T>,
  endpoint: string,
  context: string = 'API Service'
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    // Normalize the error to 503 if appropriate
    const normalizedError = normalizeTo503Error(error, endpoint);
    
    // Log the error
    log503Error(normalizedError, endpoint, context);
    
    // Re-throw the normalized error
    throw normalizedError;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  isConnectionError,
  is503Error,
  isServerError,
  create503Error,
  createConnectionError,
  normalizeTo503Error,
  log503Error,
  with503ErrorHandling
};
