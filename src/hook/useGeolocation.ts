import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
  city?: string;
  state?: string;
  country?: string;
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

  const getLocationFromIP = useCallback(async () => {
    if (typeof window === 'undefined') {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not available in SSR',
        isLoading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try multiple IP geolocation services for reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/?fields=status,message,lat,lon,city,region,country',
        'https://freeipapi.com/api/json/'
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
    }
  }, []);

  useEffect(() => {
    getLocationFromIP();
  }, [getLocationFromIP]);

  return {
    ...state,
    refresh: getLocationFromIP
  };
}

