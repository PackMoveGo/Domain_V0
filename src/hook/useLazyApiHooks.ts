import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/service.apiSW';
import { useCookieConsent } from './useCookieConsent';

// Global state to prevent double execution across all hooks
const globalExecutionState = new Map<string, boolean>();

// Generic lazy loading hook
function useLazyApiData<T>(
  endpoint: string,
  apiMethod: () => Promise<T>,
  fallbackData: T,
  preload: boolean = false
) {
  const [data, setData] = useState<T>(fallbackData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { hasConsent } = useCookieConsent();
  const hasRunRef = useRef(false);
  
  // Create a unique key for this hook instance
  const hookKey = `${endpoint}-${preload ? 'preload' : 'lazy'}`;

  const loadData = useCallback(async () => {
    if (!hasConsent) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiMethod();
      
      // Check if result is a 503 error response
      if (result && typeof result === 'object' && (result as any).error && (result as any).statusCode === 503) {
        setError('Service temporarily unavailable (503)');
        setData(fallbackData);
        return;
      }
      
      setData(result);
    } catch (err) {
      // Handle 503 errors specifically
      if (err instanceof Error && (err.message.includes('503') || err.message.includes('Service Unavailable'))) {
        setError('Service temporarily unavailable (503)');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
      setData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  }, [apiMethod, fallbackData, hasConsent]);

  useEffect(() => {
    // Prevent double execution using both local ref and global state
    if (hasRunRef.current || globalExecutionState.get(hookKey)) {
      return;
    }
    
    if (preload || hasConsent) {
      hasRunRef.current = true;
      globalExecutionState.set(hookKey, true);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preload, hasConsent, hookKey]); // Removed loadData from dependencies to prevent infinite loops

  return { data, error, isLoading, retry: loadData };
}

// Lazy loading hooks for all API endpoints
export function useLazyServices() {
  return useLazyApiData(
    '/v0/services',
    api.getServices,
    { services: [] },
    true // Preload services as they're critical
  );
}

export function useLazyTestimonials() {
  return useLazyApiData(
    '/v0/testimonials',
    () => api.makeRequest('/v0/testimonials'),
    { testimonials: [] }
  );
}

export function useLazyReviews() {
  return useLazyApiData(
    '/v0/reviews',
    () => api.makeRequest('/v0/reviews'),
    { reviews: [] }
  );
}

export function useLazyLocations() {
  return useLazyApiData(
    '/v0/locations',
    api.getLocations,
    { locations: [], serviceTypes: [] }
  );
}

export function useLazySupplies() {
  return useLazyApiData(
    '/v0/supplies',
    api.getSupplies,
    { supplies: [] }
  );
}

export function useLazyReferral() {
  return useLazyApiData(
    '/v0/referral',
    () => api.makeRequest('/v0/referral'),
    { referral: {} }
  );
}

export function useLazyContact() {
  return useLazyApiData(
    '/v0/contact',
    api.getContact,
    { contact: {} }
  );
}

export function useLazyBlog() {
  return useLazyApiData(
    '/v0/blog',
    () => api.makeRequest('/v0/blog'),
    { blog: [] }
  );
}

export function useLazyAbout() {
  return useLazyApiData(
    '/v0/about',
    api.getAbout,
    { about: {} }
  );
}

export function useLazyNav() {
  return useLazyApiData(
    '/v0/nav',
    api.getNav,
    { success: false, data: { navigation: [] }, timestamp: new Date().toISOString() },
    true // Preload nav as it's critical
  );
}

// Specific navigation hook for Navbar component
export function useLazyNavigation() {
  const { data, error, isLoading, retry } = useLazyNav();
  
  // Transform the data to match the expected format for Navbar
  const navItems = data && data.success && data.data && data.data.navigation 
    ? data.data.navigation.map((item: any, index: number) => ({
        id: item.id || `nav-${index}`,
        path: item.href || item.path || '/',
        label: item.name || item.label || 'Unknown',
        icon: item.icon,
        children: item.children
      }))
    : [];

  return {
    items: navItems,
    error,
    isLoading,
    retry,
    hasConsent: true, // This will be handled by the hook internally
    isTransitioning: false,
    waitingForConsent: false
  };
}

export function useLazyApiHealth() {
  return useLazyApiData(
    '/health',
    api.checkHealth,
    { status: 'fallback', message: 'Health check unavailable' }
  );
}