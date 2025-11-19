import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "../services/service.apiSW";
import { normalizeServices, NormalizedService } from "./serviceNormalizer";
import { logger as debugLogger } from "./debug";
import { handleApiError } from "./apiErrorHandler";
import { FALLBACK_SERVICES } from "../data/fallbackData";
import { logger } from "./logger";

// Global cache for services
let servicesCache: NormalizedService[] | null = null;
let servicesCacheTime = 0;
const SERVICES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useServicesData(autoLoad = true) {
  const [services, setServices] = useState<NormalizedService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedFromApi, setHasLoadedFromApi] = useState(false);
  const hasInitialized = useRef(false);

  const fetchServices = useCallback(async (force = false) => {
    // Prevent multiple simultaneous calls
    if (hasInitialized.current && !force) {
      return;
    }
    hasInitialized.current = true;

    setLoading(true);
    setError(null);
    
    // Get current time for cache and fallback operations
    const now = Date.now();
    
    try {
      // Check cache first
      if (!force && servicesCache && (now - servicesCacheTime) < SERVICES_CACHE_DURATION) {
        logger.debug('Using cached services data', { count: servicesCache.length }, { sensitive: true });
        setServices(servicesCache);
        setHasLoadedFromApi(true);
        setLoading(false);
        return;
      }

      // Check if we have data from batch loading
      const batchData = (window as any).__INITIAL_SERVICES_DATA__;
      if (batchData) {
        debugLogger.debug('Using batch-loaded services data', { count: batchData.services?.length || 0 }, { sensitive: true });
        const normalizedServices = normalizeServices(batchData.services || []);
        servicesCache = normalizedServices;
        servicesCacheTime = now;
        setServices(normalizedServices);
        setHasLoadedFromApi(true);
        setLoading(false);
        // Clear the batch data to prevent memory leaks
        delete (window as any).__INITIAL_SERVICES_DATA__;
        return;
      }

      debugLogger.debug('Fetching services from API', null, { sensitive: true });
      const response = await api.getServices();
      
      if (response && response.services) {
        const normalizedServices = normalizeServices(response.services);
        
        // Cache the results
        servicesCache = normalizedServices;
        servicesCacheTime = now;
        
        setServices(normalizedServices);
        setHasLoadedFromApi(true);
        debugLogger.debug('Services loaded and cached successfully', { count: response.services.length }, { sensitive: true });
      } else {
        throw new Error('Invalid services response format');
      }
    } catch (err) {
      // Check if this is a 503 error
      const is503Error = err instanceof Error && (err as any).is503Error;
      
      if (is503Error) {
        setError('503 Service Unavailable');
        // Use fallback services when API is unavailable
        debugLogger.debug('Using fallback services due to 503 error', { count: FALLBACK_SERVICES.length }, { sensitive: true });
        const normalizedFallback = normalizeServices(FALLBACK_SERVICES);
        servicesCache = normalizedFallback;
        servicesCacheTime = now;
        setServices(normalizedFallback);
        setHasLoadedFromApi(false); // Mark as not from API
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
        setError(errorMessage);
      }
      logger.error('Failed to fetch services', err);
      
      // Use centralized error handling (but don't show modal for 503 if we have fallback)
      if (!is503Error) {
        handleApiError(err, '/v0/services', {
          context: 'serviceParser',
          showModal: true,
          logError: true
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      fetchServices();
    }
  }, [autoLoad, fetchServices]);

  return { 
    services, 
    loading, 
    isLoading: loading, 
    error, 
    hasLoadedFromApi, 
    refetch: () => fetchServices(true) 
  };
}

export async function fetchServices() {
  try {
    const response = await api.getServices();
    return response.services || [];
  } catch (error) {
    logger.error('Failed to fetch services', error);
    return [];
  }
}

export interface ServiceData {
  id: string;
  title: string;
  description: string;
  price: string | null;
  duration?: string;
  icon?: string;
  link?: string;
} 