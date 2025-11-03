/**
 * SSR-safe utility functions to prevent hydration mismatches
 * These functions ensure consistent behavior between server and client rendering
 */

/**
 * Check if code is running on the client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if code is running on the server side
 */
export const isServer = typeof window === 'undefined';

/**
 * Get current timestamp (SSR-safe)
 * Returns 0 on server, actual timestamp on client
 */
export const getCurrentTimestamp = (): number => {
  return isClient ? Date.now() : 0;
};

/**
 * Get current date (SSR-safe)
 * Returns a fixed date on server, actual date on client
 */
export const getCurrentDate = (): Date => {
  return isClient ? new Date() : new Date('2024-01-01T00:00:00.000Z');
};

/**
 * Get current date as ISO string (SSR-safe)
 * Returns a fixed ISO string on server, actual ISO string on client
 */
export const getCurrentDateISO = (): string => {
  return isClient ? new Date().toISOString() : '2024-01-01T00:00:00.000Z';
};

/**
 * Generate a random number (SSR-safe)
 * Returns a fixed value on server, random value on client
 */
export const getRandomNumber = (min: number = 0, max: number = 1): number => {
  return isClient ? Math.random() * (max - min) + min : 0.5;
};

/**
 * Generate a random string (SSR-safe)
 * Returns a fixed string on server, random string on client
 */
export const getRandomString = (length: number = 10): string => {
  if (isServer) {
    return 'ssr-random-string';
  }
  return Math.random().toString(36).substring(2, length + 2);
};

/**
 * Format date (SSR-safe)
 * Handles both client and server date formatting
 */
export const formatDate = (dateString: string): string => {
  if (isServer) {
    return 'Server-side date';
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get session ID (SSR-safe)
 * Returns a fixed ID on server, actual session ID on client
 */
export const getSessionId = (): string => {
  if (isServer) {
    return 'ssr-session-id';
  }
  
  let sessionId = sessionStorage.getItem('packmovego-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('packmovego-session-id', sessionId);
  }
  return sessionId;
};

/**
 * Execute function only on client side
 */
export const clientOnly = <T>(fn: () => T, fallback: T): T => {
  return isClient ? fn() : fallback;
};

/**
 * Execute function only on server side
 */
export const serverOnly = <T>(fn: () => T, fallback: T): T => {
  return isServer ? fn() : fallback;
};
