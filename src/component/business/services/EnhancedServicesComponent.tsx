import React from 'react';
import { useApiData } from '../hook/useApiData';
import { LoadingSpinner, SkeletonLoader } from './LoadingSpinner';
import { ApiStatusIndicator } from '../hook/useApiStatus';
// import { usePerformanceMonitor } from '../util/performanceMonitor';

interface Service {
  id: string;
  title: string;
  description: string;
  price?: string;
}

interface ServicesData {
  data?: {
    services?: Service[];
  };
}

// Example component using all the API utilities
export const EnhancedServicesComponent: React.FC = () => {
  const { data, isLoading, error } = useApiData<ServicesData>('/v0/services');
  // const { trackPageLoad } = usePerformanceMonitor();

  // Track page load performance
  React.useEffect(() => {

    return () => {

      // trackPageLoad('services', loadTime);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingSpinner size="large" />
        <SkeletonLoader lines={5} className="mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h3 className="font-bold mb-2">Error loading services</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data?.services?.map((service: Service) => (
          <div key={service.id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold">{service.title}</h3>
            <p className="text-gray-600">{service.description}</p>
            {service.price && (
              <p className="text-green-600 font-bold mt-2">{service.price}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* API Status Indicator */}
      <ApiStatusIndicator />
    </div>
  );
};

// Add displayName for React DevTools
EnhancedServicesComponent.displayName = 'EnhancedServicesComponent'; 