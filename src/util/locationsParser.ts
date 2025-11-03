import { api } from '../services/service.apiSW';

export interface City {
  name: string;
  county: string;
  population: string;
  services: string[];
  popular: boolean;
}

export interface LocationRegion {
  id: string;
  region: string;
  icon: string;
  description: string;
  cities: City[];
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface LocationsData {
  locations: LocationRegion[];
  serviceTypes: ServiceType[];
}

export async function fetchLocationsData(): Promise<LocationsData> {
  try {
    console.log('🚀 Fetching locations data from API...');
    
    // Use the new axiosApi method
    console.log('🔧 Calling api.getLocations()...');
    const response = await api.getLocations();
    console.log('📡 Locations API response:', response);
    console.log('📡 Response type:', typeof response);
    console.log('📡 Response is array:', Array.isArray(response));
    console.log('📡 Response keys:', response ? Object.keys(response) : 'null/undefined');
    
    // Handle different response formats
    console.log('🔍 Checking response structure:', {
      hasResponse: !!response,
      hasLocations: !!(response && response.locations),
      hasServiceTypes: !!(response && response.serviceTypes),
      hasSuccess: !!(response && response.success),
      hasData: !!(response && response.data),
      responseKeys: response ? Object.keys(response) : [],
      locationsType: response && response.locations ? typeof response.locations : 'undefined',
      serviceTypesType: response && response.serviceTypes ? typeof response.serviceTypes : 'undefined'
    });

    if (response && response.locations && response.serviceTypes) {
      console.log('✅ Locations data loaded successfully');
      console.log('📊 Locations count:', response.locations.length);
      console.log('📊 Service types count:', response.serviceTypes.length);
      return response as LocationsData;
    } else if (response && response.success && response.data && response.data.locations && response.data.serviceTypes) {
      console.log('✅ Locations data loaded from wrapped response');
      return { 
        locations: response.data.locations, 
        serviceTypes: response.data.serviceTypes 
      };
    } else {
      console.warn('⚠️ Unexpected locations data format:', response);
      console.warn('⚠️ Expected structure: { locations: [...], serviceTypes: [...] }');
      throw new Error('Invalid locations data format');
    }
  } catch (error) {
    console.error('❌ Error loading locations data:', error);
    throw new Error('Failed to load locations data');
  }
}

export function getPopularCities(locations: LocationRegion[]): City[] {
  const popularCities: City[] = [];
  
  if (!locations || !Array.isArray(locations)) {
    return popularCities;
  }
  
  locations.forEach(region => {
    if (region.cities && Array.isArray(region.cities)) {
      region.cities.forEach(city => {
        if (city.popular) {
          popularCities.push(city);
        }
      });
    }
  });
  
  return popularCities;
}

export function getLocationsByRegion(locations: LocationRegion[], regionId: string): LocationRegion | undefined {
  if (!locations || !Array.isArray(locations)) {
    return undefined;
  }
  return locations.find(region => region.id === regionId);
}

export function searchLocations(locations: LocationRegion[], searchTerm: string): City[] {
  const searchResults: City[] = [];
  const term = searchTerm.toLowerCase();
  
  if (!locations || !Array.isArray(locations)) {
    return searchResults;
  }
  
  locations.forEach(region => {
    if (region.cities && Array.isArray(region.cities)) {
      region.cities.forEach(city => {
        if (
          city.name.toLowerCase().includes(term) ||
          city.county.toLowerCase().includes(term) ||
          region.region.toLowerCase().includes(term) ||
          (city.services && Array.isArray(city.services) && city.services.some(service => service.toLowerCase().includes(term)))
        ) {
          searchResults.push(city);
        }
      });
    }
  });
  
  return searchResults;
}

export function getCitiesByService(locations: LocationRegion[], serviceName: string): City[] {
  const citiesWithService: City[] = [];
  
  if (!locations || !Array.isArray(locations)) {
    return citiesWithService;
  }
  
  locations.forEach(region => {
    if (region.cities && Array.isArray(region.cities)) {
      region.cities.forEach(city => {
        if (city.services && Array.isArray(city.services) && city.services.includes(serviceName)) {
          citiesWithService.push(city);
        }
      });
    }
  });
  
  return citiesWithService;
} 