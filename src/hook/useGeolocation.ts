/* global AbortController */
import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
  city?: string;
  state?: string;
  country?: string;
}

const CACHE_KEY = 'geolocation_cache';
const CACHE_TTL = 3600000; // 1 hour in milliseconds
const DEBOUNCE_DELAY = 500; // 500ms debounce

interface CachedLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  timestamp: number;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true,
    city: undefined,
    state: undefined,
    country: undefined
  });
  
  const isLoadingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from cache if available
  const loadFromCache = useCallback((): CachedLocation | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedLocation = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp < CACHE_TTL) {
        return data;
      }
      
      // Cache expired, remove it
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }, []);

  // Save to cache
  const saveToCache = useCallback((location: Omit<CachedLocation, 'timestamp'>) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cached: CachedLocation = {
        ...location,
        timestamp: Date.now()
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const getLocationFromIP = useCallback(async () => {
    if (typeof window === 'undefined') {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not available in SSR',
        isLoading: false
      }));
      return;
    }

    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return;
    }

    // Check cache first
    const cached = loadFromCache();
    if (cached) {
      setState({
        latitude: cached.latitude,
        longitude: cached.longitude,
        error: null,
        isLoading: false,
        city: cached.city,
        state: cached.state,
        country: cached.country
      });
      console.log('✅ [GEOLOCATION] Retrieved from cache');
      return;
    }

    isLoadingRef.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try backend proxy first (avoids CORS, rate limits, DNS issues)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/v0/geolocation', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.latitude && data.longitude) {
            const locationData = {
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
              city: data.city,
              state: data.region,
              country: data.country
            };
            setState({
              ...locationData,
              error: null,
              isLoading: false
            });
            saveToCache(locationData);
            console.log('✅ [GEOLOCATION] Retrieved from backend proxy');
            isLoadingRef.current = false;
            return;
          }
        }
      } catch (backendError) {
        console.warn('⚠️  [GEOLOCATION] Backend proxy failed, falling back to direct API calls:', backendError);
      }

      // Fallback: Try only the most reliable IP geolocation service (reduced from 3 to 1)
      // ipapi.co is generally the most reliable and has good rate limits
      const services = [
        'https://ipapi.co/json/'
      ];

      let locationData = null;
      let lastError = null;

      for (const serviceUrl of services) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(serviceUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();

          // Handle different response formats
          if (serviceUrl.includes('ipapi.co')) {
            if (data.latitude && data.longitude) {
              locationData = {
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                city: data.city,
                state: data.region,
                country: data.country_name
              };
              break;
            }
          } else if (serviceUrl.includes('ip-api.com')) {
            if (data.status === 'success' && data.lat && data.lon) {
              locationData = {
                latitude: parseFloat(data.lat),
                longitude: parseFloat(data.lon),
                city: data.city,
                state: data.region,
                country: data.country
              };
              break;
            }
          } else if (serviceUrl.includes('freeipapi.com')) {
            if (data.latitude && data.longitude) {
              locationData = {
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                city: data.cityName,
                state: data.regionName,
                country: data.countryName
              };
              break;
            }
          }
        } catch (err) {
          lastError = err;
          console.warn(`Failed to fetch from ${serviceUrl}:`, err);
          continue;
        }
      }

      if (locationData) {
        setState({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          error: null,
          isLoading: false,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country
        });
        saveToCache({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country
        });
      } else {
        throw lastError || new Error('All IP geolocation services failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to retrieve your location from IP';
      setState({
        latitude: null,
        longitude: null,
        error: errorMessage,
        isLoading: false,
        city: undefined,
        state: undefined,
        country: undefined
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, [loadFromCache, saveToCache]);

  useEffect(() => {
    // Debounce the geolocation call to prevent rapid successive calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
    getLocationFromIP();
    }, DEBOUNCE_DELAY);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [getLocationFromIP]);

  return {
    ...state,
    refresh: getLocationFromIP
  };
}

