import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/service.apiSW';
import { apiCache } from '../util/apiCache';
import { useCookiePreferences } from '../context/CookiePreferencesContext';
import { handleApiError } from '../util/apiErrorHandler';

// Check if cookie consent has been given with fast cache access
const checkCookieConsent = (): boolean => {
  try {
    // Try memory cache first for instant access
    const memoryCached = apiCache.getCachedUserPreferences();
    if (memoryCached && memoryCached.hasMadeChoice === true) {
      return true;
    }

    // Fallback to localStorage
    const savedPreferences = localStorage.getItem('packmovego-cookie-preferences');
    if (!savedPreferences) {
      return false;
    }
    
    const preferences = JSON.parse(savedPreferences);
    const hasConsent = preferences.hasMadeChoice === true;
    
    // Cache in memory for faster future access
    if (hasConsent) {
      apiCache.cacheUserPreferences(preferences);
    }
    
    return hasConsent;
  } catch (error) {
    console.error('Error checking cookie consent:', error);
    return false;
  }
};

// Throttle API calls to prevent excessive requests
const apiCallThrottle = new Map<string, number>();
const THROTTLE_DELAY = 2000; // 2 seconds between calls

export function useApiData<T>(endpoint: string, fallbackData?: T) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [waitingForConsent, setWaitingForConsent] = useState(false);
  
  const location = useLocation();
  const pathname = location.pathname;
  const lastLoadTime = useRef<number>(0);

  // Get cookie preferences context for transition state
  let contextTransitioning = false;
  try {
    const { isTransitioning: contextTransitioningState } = useCookiePreferences();
    contextTransitioning = contextTransitioningState;
  } catch (error) {
    // Context not available, use default value
    console.warn('Cookie preferences context not available:', error);
  }

  // Map endpoint to API method
  const getApiMethod = (endpoint: string) => {
    const methods = {
      '/v0/nav': api.getNav,
      '/v0/about': api.getAbout,
      '/v0/blog': api.getBlog,
      '/v0/contact': api.getContact,
      '/v0/services': api.getServices,
      '/v0/supplies': api.getSupplies,
      '/v0/locations': api.getLocations,
      '/v0/reviews': api.getReviews,
      '/v0/referral': api.getReferral,
      '/v0/testimonials': () => api.makeRequest('/v0/testimonials'),
      '/health': api.checkHealth,
    };
    return methods[endpoint as keyof typeof methods];
  };

  const loadData = useCallback(async () => {
    try {
      // Throttle API calls to prevent excessive requests
      const now = Date.now();
      const lastCall = apiCallThrottle.get(endpoint) || 0;
      
      if (now - lastCall < THROTTLE_DELAY) {
        // Skip this call if it's too soon after the last one
        return;
      }
      
      apiCallThrottle.set(endpoint, now);
      
      setIsLoading(true);
      setError(null);
      
      const consentGiven = checkCookieConsent();
      setHasConsent(consentGiven);
      
      console.log('🔧 useApiData loadData:', {
        endpoint,
        consentGiven,
        hasConsent,
        waitingForConsent,
        willMakeApiCall: consentGiven
      });
      
      if (!consentGiven) {
        // Set waiting state and use fallback data if available
        setWaitingForConsent(true);
        if (fallbackData) {
          setData(fallbackData);
        }
        // Don't set an error - this is expected behavior
        return;
      }
      
      // Clear waiting state if consent is given
      setWaitingForConsent(false);
      
      // Map endpoint to API method
      const apiMethod = getApiMethod(endpoint);
      if (!apiMethod) {
        throw new Error(`Unknown endpoint: ${endpoint}`);
      }
      
      console.log('🔧 Making API call for endpoint:', endpoint);
      const result = await apiMethod();
      console.log('🔧 API call successful for endpoint:', endpoint);
      setData(result);
      setError(null);
      lastLoadTime.current = now;
    } catch (err) {
      console.error(`🔧 ERROR in useApiData for ${endpoint}:`, err);
      setError(err instanceof Error ? err.message : `Failed to load ${endpoint}`);
      if (fallbackData) {
        setData(fallbackData);
      }
      
      // Use centralized error handling
      handleApiError(err, endpoint, {
        context: 'useApiData',
        showModal: true,
        logError: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, fallbackData]);

  // Handle transition state from context
  useEffect(() => {
    if (contextTransitioning) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [contextTransitioning]);

  // Listen for cookie consent changes and retry when consent is given
  useEffect(() => {
    const handleConsentChange = () => {
      // Retry loading when consent is given
      if (waitingForConsent) {
        loadData();
      }
    };

    window.addEventListener('cookie-consent-change', handleConsentChange);
    return () => window.removeEventListener('cookie-consent-change', handleConsentChange);
  }, [waitingForConsent, loadData]);

  // Load data on mount and when location changes (with throttling)
  useEffect(() => {
    const now = Date.now();
    // Only reload if it's been more than 5 seconds since last load or if it's the first load
    if (now - lastLoadTime.current > 5000 || lastLoadTime.current === 0) {
      loadData();
    }
  }, [pathname, loadData]);

  return {
    data,
    error,
    isLoading,
    hasConsent,
    isTransitioning: isTransitioning || contextTransitioning,
    waitingForConsent
  };
}

// Specific hooks for each endpoint
export function useAbout() {
  return useApiData('/v0/about', {
    title: 'About Pack Move Go',
    content: 'Professional moving services in Orange County'
  });
}

export function useBlog() {
  return useApiData('/v0/blog', {
    posts: [
      { id: 1, title: 'Moving Tips', content: 'Essential tips for a smooth move' }
    ]
  });
}

export function useContact() {
  return useApiData('/v0/contact', {
    phone: '(555) 123-4567',
    email: 'info@packmovego.com',
    address: 'Orange County, CA'
  });
}

export function useServices() {
  return useApiData('/v0/services', {
    services: [
      { id: 1, name: 'Residential Moving', description: 'Complete residential moving services' }
    ]
  });
}

export function useSupplies() {
  return useApiData('/v0/supplies', {
    supplies: [
      { id: 1, name: 'Moving Boxes', price: '$5.99' }
    ]
  });
}

export function useLocations() {
  return useApiData('/v0/locations', {
    locations: [
      { id: 1, city: 'Orange County', state: 'CA' }
    ]
  });
}

export function useReviews() {
  return useApiData('/v0/reviews', {
    reviews: [
      { id: 1, rating: 5, comment: 'Excellent service!' }
    ]
  });
}

export function useReferral() {
  return useApiData('/v0/referral', {
    program: 'Refer a friend and get $50 off your next move!'
  });
}

export function useTestimonials() {
  return useApiData('/v0/testimonials', {
    testimonials: [
      { id: 1, name: 'John Doe', content: 'Great moving experience!' }
    ]
  });
}

export function useApiHealth() {
  return useApiData('/health', {
    status: 'ok',
    timestamp: new Date().toISOString()
  });
} 