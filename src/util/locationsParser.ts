import { api } from '../services/service.apiSW';

export interface City {
  name: string;
  county: string;
  population: string;
  services: string[];
  popular: boolean;
  distance?: number;
  coordinates?: { latitude: number; longitude: number };
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

// California city coordinates mapping
const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'Anaheim': { latitude: 33.8366, longitude: -117.9143 },
  'Santa Ana': { latitude: 33.7455, longitude: -117.8677 },
  'Irvine': { latitude: 33.6846, longitude: -117.8265 },
  'Huntington Beach': { latitude: 33.6595, longitude: -117.9988 },
  'Garden Grove': { latitude: 33.7739, longitude: -117.9414 },
  'Fullerton': { latitude: 33.8704, longitude: -117.9242 },
  'Costa Mesa': { latitude: 33.6411, longitude: -117.9187 },
  'Newport Beach': { latitude: 33.6189, longitude: -117.9298 },
  'Tustin': { latitude: 33.7459, longitude: -117.8262 },
  'Yorba Linda': { latitude: 33.8886, longitude: -117.8131 },
  'Mission Viejo': { latitude: 33.6000, longitude: -117.6720 },
  'Brea': { latitude: 33.9167, longitude: -117.9000 },
  'Long Beach': { latitude: 33.7701, longitude: -118.1937 },
  'Torrance': { latitude: 33.8358, longitude: -118.3406 },
  'Redondo Beach': { latitude: 33.8492, longitude: -118.3884 },
  'Manhattan Beach': { latitude: 33.8847, longitude: -118.4109 },
  'Corona': { latitude: 33.8753, longitude: -117.5664 },
  'Riverside': { latitude: 33.9533, longitude: -117.3962 },
  'Moreno Valley': { latitude: 33.9375, longitude: -117.2306 },
  'Chino': { latitude: 34.0128, longitude: -117.6889 },
  'Chino Hills': { latitude: 33.9898, longitude: -117.7326 }
};

// Calculate distance between two coordinates using Haversine formula (returns miles)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

// Get coordinates for a city
export function getCityCoordinates(cityName: string): { latitude: number; longitude: number } | null {
  return CITY_COORDINATES[cityName] || null;
}

// Add coordinates and distance to cities
export function enrichCitiesWithLocation(
  cities: City[],
  userLat?: number,
  userLon?: number
): City[] {
  return cities.map(city => {
    const coords = getCityCoordinates(city.name);
    let distance: number | undefined;
    
    if (coords) {
      city.coordinates = coords;
      if (userLat !== undefined && userLon !== undefined) {
        distance = calculateDistance(userLat, userLon, coords.latitude, coords.longitude);
      }
    }
    
    return { ...city, distance };
  });
}

// Get cities sorted by distance from user location
export function getCitiesNearby(
  locations: LocationRegion[],
  userLat: number,
  userLon: number,
  limit: number = 5
): City[] {
  const allCities: City[] = [];
  
  if (!locations || !Array.isArray(locations)) {
    return allCities;
  }
  
  locations.forEach(region => {
    if (region.cities && Array.isArray(region.cities)) {
      region.cities.forEach(city => {
        allCities.push(city);
      });
    }
  });
  
  const enrichedCities = enrichCitiesWithLocation(allCities, userLat, userLon);
  
  return enrichedCities
    .filter(city => city.distance !== undefined)
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
    .slice(0, limit);
} 