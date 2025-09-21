/**
 * Service Areas API - Public API
 * 
 * This service handles service areas-related API calls that don't require authentication.
 * Used for displaying service areas and coverage zones on the public website.
 */

import { api } from '../service.apiSW';
import { handleApiError } from '../../util/apiErrorHandler';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ServiceArea {
  id: string;
  name: string;
  state: string;
  city: string;
  zipCode: string;
  county: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in miles
  isActive: boolean;
  isPrimary: boolean;
  serviceTypes: string[];
  estimatedTravelTime: number; // in minutes
  coverageLevel: 'full' | 'partial' | 'limited';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAreaResponse {
  areas: ServiceArea[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

export interface CoverageZone {
  id: string;
  name: string;
  type: 'city' | 'county' | 'state' | 'region';
  areas: ServiceArea[];
  isFullyCovered: boolean;
  coveragePercentage: number;
}

// =============================================================================
// SERVICE AREAS API FUNCTIONS
// =============================================================================

/**
 * Get all service areas
 */
export const getAllServiceAreas = async (): Promise<ServiceArea[]> => {
  try {
    console.log('🔧 Fetching all service areas from public API...');
    const response = await api.makeRequest('/v0/serviceAreas') as any;
    
    const areas: ServiceArea[] = response.areas?.map((area: any) => ({
      id: area.id || area._id,
      name: area.name || area.city || 'Unknown Area',
      state: area.state || area.state_code || 'Unknown',
      city: area.city || area.name || 'Unknown',
      zipCode: area.zipCode || area.zip_code || area.postal_code || '',
      county: area.county || area.county_name || 'Unknown',
      coordinates: {
        latitude: area.coordinates?.latitude || area.lat || area.latitude || 0,
        longitude: area.coordinates?.longitude || area.lng || area.longitude || 0
      },
      radius: area.radius || area.coverage_radius || 25,
      isActive: area.isActive !== false,
      isPrimary: area.isPrimary || area.is_primary || false,
      serviceTypes: area.serviceTypes || area.service_types || ['moving'],
      estimatedTravelTime: area.estimatedTravelTime || area.estimated_travel_time || 30,
      coverageLevel: area.coverageLevel || area.coverage_level || 'full',
      notes: area.notes || area.description,
      createdAt: area.createdAt || area.created_at || new Date().toISOString(),
      updatedAt: area.updatedAt || area.updated_at || new Date().toISOString()
    })) || [];

    console.log('✅ Service areas loaded:', areas.length);
    return areas;
  } catch (error) {
    console.error('❌ Failed to fetch service areas:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Service areas API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/serviceAreas', {
        context: 'Service Areas API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Service areas temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/serviceAreas', {
      context: 'Service Areas API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return empty array for fallback
    return [];
  }
};

/**
 * Get service areas by state
 */
export const getServiceAreasByState = async (state: string): Promise<ServiceArea[]> => {
  try {
    console.log('🔧 Fetching service areas by state:', state);
    const response = await api.makeRequest(`/v0/serviceAreas/state/${state}`) as any;
    
    const areas: ServiceArea[] = response.areas?.map((area: any) => ({
      id: area.id || area._id,
      name: area.name || area.city || 'Unknown Area',
      state: area.state || area.state_code || state,
      city: area.city || area.name || 'Unknown',
      zipCode: area.zipCode || area.zip_code || area.postal_code || '',
      county: area.county || area.county_name || 'Unknown',
      coordinates: {
        latitude: area.coordinates?.latitude || area.lat || area.latitude || 0,
        longitude: area.coordinates?.longitude || area.lng || area.longitude || 0
      },
      radius: area.radius || area.coverage_radius || 25,
      isActive: area.isActive !== false,
      isPrimary: area.isPrimary || area.is_primary || false,
      serviceTypes: area.serviceTypes || area.service_types || ['moving'],
      estimatedTravelTime: area.estimatedTravelTime || area.estimated_travel_time || 30,
      coverageLevel: area.coverageLevel || area.coverage_level || 'full',
      notes: area.notes || area.description,
      createdAt: area.createdAt || area.created_at || new Date().toISOString(),
      updatedAt: area.updatedAt || area.updated_at || new Date().toISOString()
    })) || [];

    console.log('✅ Service areas by state loaded:', areas.length);
    return areas;
  } catch (error) {
    console.error('❌ Failed to fetch service areas by state:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Service areas by state API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/serviceAreas/state', {
        context: 'Service Areas by State API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Service areas by state temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/serviceAreas/state', {
      context: 'Service Areas by State API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get service areas by city
 */
export const getServiceAreasByCity = async (city: string, state?: string): Promise<ServiceArea[]> => {
  try {
    console.log('🔧 Fetching service areas by city:', { city, state });
    const endpoint = state ? `/v0/serviceAreas/city/${city}/${state}` : `/v0/serviceAreas/city/${city}`;
    const response = await api.makeRequest(endpoint) as any;
    
    const areas: ServiceArea[] = response.areas?.map((area: any) => ({
      id: area.id || area._id,
      name: area.name || area.city || city,
      state: area.state || area.state_code || state || 'Unknown',
      city: area.city || area.name || city,
      zipCode: area.zipCode || area.zip_code || area.postal_code || '',
      county: area.county || area.county_name || 'Unknown',
      coordinates: {
        latitude: area.coordinates?.latitude || area.lat || area.latitude || 0,
        longitude: area.coordinates?.longitude || area.lng || area.longitude || 0
      },
      radius: area.radius || area.coverage_radius || 25,
      isActive: area.isActive !== false,
      isPrimary: area.isPrimary || area.is_primary || false,
      serviceTypes: area.serviceTypes || area.service_types || ['moving'],
      estimatedTravelTime: area.estimatedTravelTime || area.estimated_travel_time || 30,
      coverageLevel: area.coverageLevel || area.coverage_level || 'full',
      notes: area.notes || area.description,
      createdAt: area.createdAt || area.created_at || new Date().toISOString(),
      updatedAt: area.updatedAt || area.updated_at || new Date().toISOString()
    })) || [];

    console.log('✅ Service areas by city loaded:', areas.length);
    return areas;
  } catch (error) {
    console.error('❌ Failed to fetch service areas by city:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Service areas by city API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/serviceAreas/city', {
        context: 'Service Areas by City API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Service areas by city temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/serviceAreas/city', {
      context: 'Service Areas by City API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get service areas by zip code
 */
export const getServiceAreasByZipCode = async (zipCode: string): Promise<ServiceArea[]> => {
  try {
    console.log('🔧 Fetching service areas by zip code:', zipCode);
    const response = await api.makeRequest(`/v0/serviceAreas/zip/${zipCode}`) as any;
    
    const areas: ServiceArea[] = response.areas?.map((area: any) => ({
      id: area.id || area._id,
      name: area.name || area.city || 'Unknown Area',
      state: area.state || area.state_code || 'Unknown',
      city: area.city || area.name || 'Unknown',
      zipCode: area.zipCode || area.zip_code || area.postal_code || zipCode,
      county: area.county || area.county_name || 'Unknown',
      coordinates: {
        latitude: area.coordinates?.latitude || area.lat || area.latitude || 0,
        longitude: area.coordinates?.longitude || area.lng || area.longitude || 0
      },
      radius: area.radius || area.coverage_radius || 25,
      isActive: area.isActive !== false,
      isPrimary: area.isPrimary || area.is_primary || false,
      serviceTypes: area.serviceTypes || area.service_types || ['moving'],
      estimatedTravelTime: area.estimatedTravelTime || area.estimated_travel_time || 30,
      coverageLevel: area.coverageLevel || area.coverage_level || 'full',
      notes: area.notes || area.description,
      createdAt: area.createdAt || area.created_at || new Date().toISOString(),
      updatedAt: area.updatedAt || area.updated_at || new Date().toISOString()
    })) || [];

    console.log('✅ Service areas by zip code loaded:', areas.length);
    return areas;
  } catch (error) {
    console.error('❌ Failed to fetch service areas by zip code:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Service areas by zip code API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/serviceAreas/zip', {
        context: 'Service Areas by Zip Code API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Service areas by zip code temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/serviceAreas/zip', {
      context: 'Service Areas by Zip Code API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get service areas by coordinates
 */
export const getServiceAreasByCoordinates = async (latitude: number, longitude: number, radius: number = 50): Promise<ServiceArea[]> => {
  try {
    console.log('🔧 Fetching service areas by coordinates:', { latitude, longitude, radius });
    const response = await api.makeRequest(`/v0/serviceAreas/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`) as any;
    
    const areas: ServiceArea[] = response.areas?.map((area: any) => ({
      id: area.id || area._id,
      name: area.name || area.city || 'Unknown Area',
      state: area.state || area.state_code || 'Unknown',
      city: area.city || area.name || 'Unknown',
      zipCode: area.zipCode || area.zip_code || area.postal_code || '',
      county: area.county || area.county_name || 'Unknown',
      coordinates: {
        latitude: area.coordinates?.latitude || area.lat || area.latitude || 0,
        longitude: area.coordinates?.longitude || area.lng || area.longitude || 0
      },
      radius: area.radius || area.coverage_radius || 25,
      isActive: area.isActive !== false,
      isPrimary: area.isPrimary || area.is_primary || false,
      serviceTypes: area.serviceTypes || area.service_types || ['moving'],
      estimatedTravelTime: area.estimatedTravelTime || area.estimated_travel_time || 30,
      coverageLevel: area.coverageLevel || area.coverage_level || 'full',
      notes: area.notes || area.description,
      createdAt: area.createdAt || area.created_at || new Date().toISOString(),
      updatedAt: area.updatedAt || area.updated_at || new Date().toISOString()
    })) || [];

    console.log('✅ Service areas by coordinates loaded:', areas.length);
    return areas;
  } catch (error) {
    console.error('❌ Failed to fetch service areas by coordinates:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Service areas by coordinates API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/serviceAreas/nearby', {
        context: 'Service Areas by Coordinates API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Service areas by coordinates temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/serviceAreas/nearby', {
      context: 'Service Areas by Coordinates API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get coverage zones
 */
export const getCoverageZones = async (): Promise<CoverageZone[]> => {
  try {
    console.log('🔧 Fetching coverage zones...');
    const response = await api.makeRequest('/v0/serviceAreas/coverage') as any;
    
    const zones: CoverageZone[] = response.zones?.map((zone: any) => ({
      id: zone.id || zone._id,
      name: zone.name || zone.region || 'Unknown Zone',
      type: zone.type || 'region',
      areas: zone.areas?.map((area: any) => ({
        id: area.id || area._id,
        name: area.name || area.city || 'Unknown Area',
        state: area.state || area.state_code || 'Unknown',
        city: area.city || area.name || 'Unknown',
        zipCode: area.zipCode || area.zip_code || area.postal_code || '',
        county: area.county || area.county_name || 'Unknown',
        coordinates: {
          latitude: area.coordinates?.latitude || area.lat || area.latitude || 0,
          longitude: area.coordinates?.longitude || area.lng || area.longitude || 0
        },
        radius: area.radius || area.coverage_radius || 25,
        isActive: area.isActive !== false,
        isPrimary: area.isPrimary || area.is_primary || false,
        serviceTypes: area.serviceTypes || area.service_types || ['moving'],
        estimatedTravelTime: area.estimatedTravelTime || area.estimated_travel_time || 30,
        coverageLevel: area.coverageLevel || area.coverage_level || 'full',
        notes: area.notes || area.description,
        createdAt: area.createdAt || area.created_at || new Date().toISOString(),
        updatedAt: area.updatedAt || area.updated_at || new Date().toISOString()
      })) || [],
      isFullyCovered: zone.isFullyCovered || zone.is_fully_covered || false,
      coveragePercentage: zone.coveragePercentage || zone.coverage_percentage || 0
    })) || [];

    console.log('✅ Coverage zones loaded:', zones.length);
    return zones;
  } catch (error) {
    console.error('❌ Failed to fetch coverage zones:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Coverage zones API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/serviceAreas/coverage', {
        context: 'Coverage Zones API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Coverage zones temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/serviceAreas/coverage', {
      context: 'Coverage Zones API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Check if location is in service area
 */
export const checkLocationCoverage = async (latitude: number, longitude: number): Promise<{ isCovered: boolean; nearestArea?: ServiceArea; distance?: number }> => {
  try {
    console.log('🔧 Checking location coverage:', { latitude, longitude });
    const response = await api.makeRequest(`/v0/serviceAreas/check?lat=${latitude}&lng=${longitude}`) as any;
    
    const result = {
      isCovered: response.isCovered || response.is_covered || false,
      nearestArea: response.nearestArea ? {
        id: response.nearestArea.id || response.nearestArea._id,
        name: response.nearestArea.name || response.nearestArea.city || 'Unknown Area',
        state: response.nearestArea.state || response.nearestArea.state_code || 'Unknown',
        city: response.nearestArea.city || response.nearestArea.name || 'Unknown',
        zipCode: response.nearestArea.zipCode || response.nearestArea.zip_code || response.nearestArea.postal_code || '',
        county: response.nearestArea.county || response.nearestArea.county_name || 'Unknown',
        coordinates: {
          latitude: response.nearestArea.coordinates?.latitude || response.nearestArea.lat || response.nearestArea.latitude || 0,
          longitude: response.nearestArea.coordinates?.longitude || response.nearestArea.lng || response.nearestArea.longitude || 0
        },
        radius: response.nearestArea.radius || response.nearestArea.coverage_radius || 25,
        isActive: response.nearestArea.isActive !== false,
        isPrimary: response.nearestArea.isPrimary || response.nearestArea.is_primary || false,
        serviceTypes: response.nearestArea.serviceTypes || response.nearestArea.service_types || ['moving'],
        estimatedTravelTime: response.nearestArea.estimatedTravelTime || response.nearestArea.estimated_travel_time || 30,
        coverageLevel: response.nearestArea.coverageLevel || response.nearestArea.coverage_level || 'full',
        notes: response.nearestArea.notes || response.nearestArea.description,
        createdAt: response.nearestArea.createdAt || response.nearestArea.created_at || new Date().toISOString(),
        updatedAt: response.nearestArea.updatedAt || response.nearestArea.updated_at || new Date().toISOString()
      } : undefined,
      distance: response.distance
    };

    console.log('✅ Location coverage checked:', result.isCovered);
    return result;
  } catch (error) {
    console.error('❌ Failed to check location coverage:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Location coverage check API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/serviceAreas/check', {
        context: 'Location Coverage Check API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Location coverage check temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/serviceAreas/check', {
      context: 'Location Coverage Check API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return { isCovered: false };
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getAllServiceAreas,
  getServiceAreasByState,
  getServiceAreasByCity,
  getServiceAreasByZipCode,
  getServiceAreasByCoordinates,
  getCoverageZones,
  checkLocationCoverage
};
