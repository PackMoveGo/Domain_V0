import React, { useState, useEffect } from 'react';
import { getAllServiceAreas } from '../../services/routes/route.serviceAreasAPI';
import { api } from '../../services/service.apiSW';

interface ServiceAreasProps {
  error?: string | null;
  simulationEnabled?: boolean;
}

const ServiceAreas: React.FC<ServiceAreasProps> = ({ error: propError, /* simulationEnabled = false */ }) => { // simulationEnabled reserved for future use
  const [error, setError] = useState<string | null>(propError || null);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceAreas, setServiceAreas] = useState<any[]>([]);

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
        console.log('🔧 Loading service areas...');
        
        const serviceAreasData = await getAllServiceAreas();
        setServiceAreas(serviceAreasData);
        console.log('✅ Service areas loaded:', serviceAreasData.length);
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
            We provide moving services across multiple locations
          </p>
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
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {serviceAreas.slice(0, 3).map((area) => (
              <div key={area.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {area.name}
                </h3>
                <p className="text-gray-600">
                  {area.city}, {area.state}
                </p>
                {area.coverageLevel && (
                  <p className="text-blue-600 font-medium mt-2">
                    {area.coverageLevel} Coverage
                  </p>
                )}
              </div>
            ))}
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