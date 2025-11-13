import React, { useState, useMemo } from 'react';
import { LocationRegion, City, ServiceType, getPopularCities, searchLocations, getCitiesByService, enrichCitiesWithLocation, getCitiesNearby } from '../../util/locationsParser';
import { useGeolocation } from '../../hook/useGeolocation';

interface LocationsProps {
  locations: LocationRegion[];
  serviceTypes: ServiceType[];
  isLoading: boolean;
  error: string | null;
}

const Locations: React.FC<LocationsProps> = ({ locations, serviceTypes, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const { latitude, longitude, error: geoError, isLoading: geoLoading } = useGeolocation();

  // Debug logging with better error handling
  console.log('🔧 Locations component received:', { 
    locationsCount: locations && Array.isArray(locations) ? locations.length : 0,
    serviceTypesCount: serviceTypes && Array.isArray(serviceTypes) ? serviceTypes.length : 0,
    isLoading, 
    error,
    locationsType: typeof locations,
    serviceTypesType: typeof serviceTypes
  });

  // Safety checks for undefined arrays
  const safeLocations = locations && Array.isArray(locations) ? locations : [];
  const safeServiceTypes = serviceTypes && Array.isArray(serviceTypes) ? serviceTypes : [];

  // Get nearby cities if user location is available - MUST be before early returns
  const nearbyCities = useMemo(() => {
    if (latitude !== null && longitude !== null && safeLocations.length > 0) {
      return getCitiesNearby(safeLocations, latitude, longitude, 6);
    }
    return [];
  }, [safeLocations, latitude, longitude]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Locations</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const popularCities = getPopularCities(safeLocations);
  
  // Apply filters
  let filteredCities: City[] = [];
  if (searchTerm) {
    filteredCities = searchLocations(safeLocations, searchTerm);
  } else if (selectedRegion !== 'all') {
    const region = safeLocations.find(r => r.id === selectedRegion);
    filteredCities = region ? region.cities : [];
  } else if (selectedService !== 'all') {
    filteredCities = getCitiesByService(safeLocations, selectedService);
  } else {
    filteredCities = safeLocations.flatMap(region => region.cities);
  }
  
  // Enrich filtered cities with distance if user location is available
  if (latitude !== null && longitude !== null) {
    filteredCities = enrichCitiesWithLocation(filteredCities, latitude, longitude);
    // Sort by distance if available
    filteredCities.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return 0;
    });
  }

  const regions = [
    { id: 'all', name: 'All Regions', icon: '🗺️', count: safeLocations.flatMap(r => r.cities).length },
    ...safeLocations.map(region => ({ 
      id: region.id, 
      name: region.region, 
      icon: region.icon, 
      count: region.cities.length 
    }))
  ];

  const services = [
    { id: 'all', name: 'All Services', icon: '🔧' },
    ...safeServiceTypes.map(service => ({ 
      id: service.id, 
      name: service.name, 
      icon: service.icon 
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Service Locations
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional moving and packing services throughout California. Find service areas near you in Orange County, Los Angeles County, Riverside County, and San Bernardino County.
        </p>
        {/* Debug info */}
        <div className="text-sm text-gray-500 mt-2">
          Found {safeLocations.length} regions with {safeLocations.flatMap(r => r.cities).length} cities and {safeServiceTypes.length} service types
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search cities, counties, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.icon} {region.name} ({region.count})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.icon} {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Nearby Cities Section */}
      {!searchTerm && selectedRegion === 'all' && selectedService === 'all' && nearbyCities.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📍 Service Areas Near You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyCities.map((city) => (
              <CityCard key={`${city.name}-${city.county}`} city={city} showDistance={true} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Cities Section */}
      {!searchTerm && selectedRegion === 'all' && selectedService === 'all' && popularCities.length > 0 && nearbyCities.length === 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Service Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCities.map((city) => (
              <CityCard key={`${city.name}-${city.county}`} city={city} />
            ))}
          </div>
        </div>
      )}

      {/* Service Types Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceTypes.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* All Locations Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {searchTerm ? `Search Results for "${searchTerm}"` : 
           selectedRegion === 'all' ? 'All Service Areas' : 
           locations.find(r => r.id === selectedRegion)?.region}
        </h2>
        
        {filteredCities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No locations found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => (
              <CityCard key={`${city.name}-${city.county}`} city={city} showDistance={latitude !== null && longitude !== null} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Don't See Your City?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          We may still be able to serve your area! Contact us to check availability and get a custom quote for your move.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Check Availability
          </button>
          <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Get Free Quote
          </button>
        </div>
      </div>
    </div>
  );
};

interface CityCardProps {
  city: City;
  showDistance?: boolean;
}

const CityCard: React.FC<CityCardProps> = ({ city, showDistance = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {city.name}
          </h3>
          <div className="flex flex-col items-end gap-1">
          {city.popular && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              Popular
            </span>
          )}
            {showDistance && city.distance !== undefined && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {city.distance} mi away
              </span>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <div className="mb-2">
            <span className="font-medium">County:</span> {city.county}
          </div>
          <div className="mb-2">
            <span className="font-medium">Population:</span> {city.population}
          </div>
          {!showDistance && city.distance !== undefined && (
            <div className="mb-2">
              <span className="font-medium">Distance:</span> {city.distance} miles
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available Services:</h4>
          <div className="flex flex-wrap gap-1">
            {city.services.map((service, index) => (
              <span 
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
        
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Get Quote for {city.name}
        </button>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  service: ServiceType;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-6 text-center">
      <div className="text-4xl mb-4">{service.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
      <p className="text-sm text-gray-600">{service.description}</p>
    </div>
  );
};

// Add displayName for React DevTools
Locations.displayName = 'Locations';
CityCard.displayName = 'CityCard';
ServiceCard.displayName = 'ServiceCard';

export default Locations; 