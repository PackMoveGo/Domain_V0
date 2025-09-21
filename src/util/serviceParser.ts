import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "../services/service.apiSW";
import { normalizeServices, NormalizedService } from "./serviceNormalizer";
import { logger } from "./debug";
import { handleApiError } from "./apiErrorHandler";

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
    
    try {
      // Check cache first
      const now = Date.now();
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
        console.log('🔧 serviceParser: Using batch-loaded services data:', {
          hasBatchData: !!batchData,
          hasServices: !!(batchData.services),
          servicesCount: batchData.services?.length || 0,
          batchData: batchData
        });
        logger.debug('Using batch-loaded services data', { count: batchData.services?.length || 0 }, { sensitive: true });
        const normalizedServices = normalizeServices(batchData.services || []);
        console.log('🔧 serviceParser: Batch data normalized:', {
          normalizedCount: normalizedServices.length,
          normalizedServices: normalizedServices
        });
        servicesCache = normalizedServices;
        servicesCacheTime = now;
        setServices(normalizedServices);
        setHasLoadedFromApi(true);
        setLoading(false);
        // Clear the batch data to prevent memory leaks
        delete (window as any).__INITIAL_SERVICES_DATA__;
        console.log('🔧 serviceParser: Batch data processed and cleared');
        return;
      }

      logger.debug('Fetching services from API', null, { sensitive: true });
      console.log('🔧 serviceParser: Fetching services from API...');
      const response = await api.getServices();
      console.log('🔧 serviceParser: Raw API response received:', {
        hasResponse: !!response,
        hasServices: !!(response && response.services),
        servicesCount: response?.services?.length || 0
      });
      
      if (response && response.services) {
        console.log('🔧 serviceParser: Normalizing services data...', {
          count: response.services.length
        });
        const normalizedServices = normalizeServices(response.services);
        console.log('🔧 serviceParser: Normalized services count:', normalizedServices.length);
        
        // Cache the results
        servicesCache = normalizedServices;
        servicesCacheTime = now;
        
        setServices(normalizedServices);
        setHasLoadedFromApi(true);
        logger.debug('Services loaded and cached successfully', { count: response.services.length }, { sensitive: true });
        console.log('🔧 serviceParser: Services successfully loaded and cached');
      } else {
        console.error('🔧 serviceParser: Invalid services response format:', response);
        throw new Error('Invalid services response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      setError(errorMessage);
      logger.error('Failed to fetch services', err);
      
      // Use centralized error handling
      handleApiError(err, '/v0/services', {
        context: 'serviceParser',
        showModal: true,
        logError: true
      });
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