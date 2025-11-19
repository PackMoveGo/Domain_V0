import React, { useState, useEffect, useMemo } from 'react';
import { getAllServiceAreas } from '../../services/routes/route.serviceAreasAPI';
import { api } from '../../services/service.apiSW';
import { useGeolocation } from '../../hook/useGeolocation';
import { calculateDistance } from '../../util/locationsParser';

interface ServiceAreasProps {
  error?: string | null;
  simulationEnabled?: boolean;
}

// Central coordinates for each service area (approximate)
const SERVICE_AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  'Los Angeles County': { lat: 34.0522, lng: -118.2437 },
  'San Francisco Bay Area': { lat: 37.7749, lng: -122.4194 },
  'San Diego County': { lat: 32.7157, lng: -117.1611 },
  'Orange County': { lat: 33.7175, lng: -117.8311 },
  'Inland Empire': { lat: 33.9806, lng: -117.3755 },
  'Sacramento Metro': { lat: 38.5816, lng: -121.4944 },
  'Central Valley': { lat: 36.7378, lng: -119.7871 }
};

const ServiceAreas: React.FC<ServiceAreasProps> = ({ error: propError, /* simulationEnabled = false */ }) => { // simulationEnabled reserved for future use
  const [error, setError] = useState<string | null>(propError || null);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceAreas, setServiceAreas] = useState<any[]>([]);
  const { latitude, longitude, state: userState, error: geoError, isLoading: geoLoading } = useGeolocation();

  // Calculate nearby service areas based on user location
  const nearbyAreas = useMemo(() => {
    if (latitude !== null && longitude !== null && serviceAreas.length > 0) {
      // Calculate distance to each service area
      const areasWithDistance = serviceAreas.map(area => {
        const coords = SERVICE_AREA_COORDS[area.name];
        if (coords) {
          const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng);
          return { ...area, distance };
        }
        return area;
      });
      
      // Sort by distance and return top 3
      return areasWithDistance
        .filter(area => area.distance !== undefined)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
    }
    return [];
  }, [serviceAreas, latitude, longitude]);

  useEffect(() => {
    const loadServiceAreas = async () => {
      // If there's already an error prop, use that
      if (propError) {
        setError(propError);
        return;
      }

      // Check if API is available using the API service
      try {
        const healthCheck = await api.checkHealth();
        if (!healthCheck || healthCheck.error) {
          setError('503 Service Unavailable: API health check failed');
          return;
        }
      } catch (healthError) {
        console.error('❌ Health check failed:', healthError);
        setError('503 Service Unavailable: API health check failed');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const serviceAreasData = await getAllServiceAreas();
        // Filter to only California service areas
        const californiaAreas = serviceAreasData.filter((area: any) => area.state === 'CA');
        setServiceAreas(californiaAreas);
      } catch (err) {
        console.error('❌ Failed to load service areas:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load service areas';
        setError(errorMessage);
        setServiceAreas([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceAreas();
  }, [propError]);

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Service Areas
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We provide moving services across California
          </p>
          {geoLoading && (
            <p className="text-blue-500 mt-2 text-sm">Detecting your location...</p>
          )}
          {latitude && longitude && userState && (
            <p className="text-gray-600 mt-2 text-sm">
              {userState === 'California' ? `📍 Showing areas near you in ${userState}` : `Currently in ${userState} - Showing California service areas`}
            </p>
          )}
          {geoError && (
            <p className="text-gray-500 mt-2 text-sm">Location detection unavailable - Showing all California areas</p>
          )}
        </div>
        
        {isLoading ? (
          <div className="mt-12 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading service areas...</span>
            </div>
          </div>
        ) : (error || propError) ? (
          <div className="mt-12">
            <div className="text-center">
              {/* Only show error message when there's an actual API error (503) */}
              {(error?.includes('503') || propError?.includes('503') || error?.includes('Service Unavailable') || propError?.includes('Service Unavailable')) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <div className="text-yellow-600 text-2xl mr-2">⚠️</div>
              <h3 className="text-lg font-semibold text-yellow-800">Service Areas Temporarily Unavailable</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              We're experiencing technical difficulties loading our service areas. Please contact us directly for information about our coverage areas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:(949) 414-5282"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Call Us: (949) 414-5282
              </a>
              <a
                href="mailto:info@packmovego.com"
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
              >
                Email Us: info@packmovego.com
              </a>
            </div>
          </div>
              )}
              {/* Show generic message for other errors */}
              {(!error?.includes('503') && !propError?.includes('503') && !error?.includes('Service Unavailable') && !propError?.includes('Service Unavailable')) && (
              <div className="text-gray-500 text-lg">
                Service areas information is currently unavailable
              </div>
              )}
            </div>
          </div>
        ) : serviceAreas.length > 0 ? (
          <div className="mt-12">
            {/* Show nearby areas if user location is available and in California */}
            {nearbyAreas.length > 0 && userState === 'California' && (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Service Areas Near You</h3>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12">
                  {nearbyAreas.map((area) => (
                    <div key={area.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {area.name}
                        </h3>
                        {area.distance !== undefined && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            {area.distance.toFixed(0)} mi
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{area.state}</p>
                      {area.description && (
                        <p className="text-sm text-gray-500 mb-3">{area.description}</p>
                      )}
                      {area.cities && area.cities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {area.cities.slice(0, 3).map((city: string, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {city}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Show all California areas */}
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {nearbyAreas.length > 0 && userState === 'California' ? 'All California Service Areas' : 'Our California Service Areas'}
            </h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {serviceAreas.map((area) => (
                <div key={area.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {area.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{area.state}</p>
                  {area.description && (
                    <p className="text-sm text-gray-500 mb-3">{area.description}</p>
                  )}
                  {area.cities && area.cities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {area.cities.slice(0, 4).map((city: string, idx: number) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {city}
                        </span>
                      ))}
                      {area.cities.length > 4 && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          +{area.cities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Local Moves
              </h3>
              <p className="text-gray-600">
                Professional local moving services within your city
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Long Distance
              </h3>
              <p className="text-gray-600">
                Reliable long-distance moving across states
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Commercial
              </h3>
              <p className="text-gray-600">
                Office and business relocation services
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceAreas;