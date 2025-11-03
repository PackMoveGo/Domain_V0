import { useState, useEffect, useCallback } from 'react';
import { fetchLocationsData, LocationRegion, ServiceType } from '../util/locationsParser';

export function useLocations() {
  const [locations, setLocations] = useState<LocationRegion[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading locations data...');
      
      const locationsData = await fetchLocationsData();
      
      // Ensure we always have arrays
      const safeLocations = Array.isArray(locationsData.locations) ? locationsData.locations : [];
      const safeServiceTypes = Array.isArray(locationsData.serviceTypes) ? locationsData.serviceTypes : [];
      
      setLocations(safeLocations);
      setServiceTypes(safeServiceTypes);
      console.log('✅ Locations loaded successfully:', safeLocations.length, 'regions,', safeServiceTypes.length, 'service types');
    } catch (err) {
      // Check if this is a 503 error
      if (err instanceof Error && (err as any).is503Error) {
        setError('503 Service Unavailable');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load locations';
        setError(errorMessage);
      }
      console.error('❌ Locations loading error:', err);
      
      // Set empty arrays as fallback to prevent undefined errors
      setLocations([]);
      setServiceTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const refreshLocations = useCallback(() => {
    loadLocations();
  }, [loadLocations]);

  return {
    locations,
    serviceTypes,
    isLoading,
    error,
    refreshLocations
  };
} 