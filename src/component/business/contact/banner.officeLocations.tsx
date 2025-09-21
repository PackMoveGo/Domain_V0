import React, { useState } from 'react';
import { 
  formatPhoneNumber,
  generateGoogleMapsUrl,
  generateDirectionsUrl
} from '../../../util/contactParser';

interface OfficeLocation {
  id: string;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    fullAddress: string;
  };
  phone: string;
  email: string;
  hours?: Record<string, string>;
  services?: string[];
}

interface OfficeLocationsProps {
  officeLocations: OfficeLocation[];
  isLoading?: boolean;
  error?: string | null;
}

const OfficeLocations: React.FC<OfficeLocationsProps> = ({ 
  officeLocations, 
  isLoading, 
  error 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  const handleLocationSelect = (locationId: number) => {
    setSelectedLocation(selectedLocation === locationId ? null : locationId);
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Offices</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Offices</h2>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">Unable to load office locations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Offices</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(officeLocations || []).map((location) => (
          <div key={location.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{location.type}</p>
                </div>
                <button
                  onClick={() => handleLocationSelect(parseInt(location.id))}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedLocation === parseInt(location.id) ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-gray-400 mr-3 mt-1">📍</span>
                  <div>
                    <p className="text-gray-900">{location.address.street}</p>
                    <p className="text-gray-600">{location.address.city}, {location.address.state} {location.address.zip}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">📞</span>
                  <a href={`tel:${location.phone}`} className="text-blue-600 hover:text-blue-800">
                    {(() => {
                      try {
                        return formatPhoneNumber(location.phone);
                      } catch (error) {
                        console.warn('Phone formatting error:', error);
                        return location.phone;
                      }
                    })()}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">✉️</span>
                  <a href={`mailto:${location.email}`} className="text-blue-600 hover:text-blue-800">
                    {location.email}
                  </a>
                </div>
              </div>

              {selectedLocation === parseInt(location.id) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Business Hours</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(location.hours || {}).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize text-gray-600">{day}</span>
                        <span className="text-gray-900">{String(hours)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-3 mt-4">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {(location.services || []).map((service: any, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {location.address.street === 'TBA' ? (
                      <span className="text-gray-500 px-4 py-2 text-sm">
                        TBA
                      </span>
                    ) : (
                      <>
                        <a
                          href={(() => {
                            try {
                              return generateGoogleMapsUrl(location.address.fullAddress);
                            } catch (error) {
                              console.warn('Google Maps URL generation error:', error);
                              return `https://maps.google.com/?q=${encodeURIComponent(location.address.fullAddress)}`;
                            }
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          View on Map
                        </a>
                        <a
                          href={(() => {
                            try {
                              return generateDirectionsUrl('', location.address.fullAddress);
                            } catch (error) {
                              console.warn('Directions URL generation error:', error);
                              return `https://maps.google.com/?daddr=${encodeURIComponent(location.address.fullAddress)}`;
                            }
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                        >
                          Get Directions
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add displayName for React DevTools
OfficeLocations.displayName = 'OfficeLocations';

export default OfficeLocations;
