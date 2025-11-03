
import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface Service {
  id: string;
  icon?: string;
  title: string;
  description: string;
  duration?: string;
  price: string | null;
  link?: string;
}

export interface ServicesListProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
}

const ServicesList = ({ services, onServiceSelect }: ServicesListProps) => {
  const navigate = useNavigate();

  // Debug logging
  console.log('🔧 ServicesList received:', { 
    servicesCount: services?.length || 0,
    servicesType: typeof services,
    isArray: Array.isArray(services)
  });

  const getPriceDisplay = (price: any) => {
    if (!price) return 'Contact for pricing';
    if (typeof price === 'object' && price.display) return price.display;
    if (typeof price === 'string' && price.startsWith('From ')) return price;
    return `Starting at ${price}`;
  };

  const getDurationDisplay = (duration: any) => {
    if (!duration) return 'Varies';
    if (typeof duration === 'object' && duration.display) return duration.display;
    return duration;
  };

  const getServiceCategory = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('residential') || titleLower.includes('home') || titleLower.includes('house')) {
      return { name: 'Residential', color: 'bg-green-100 text-green-800' };
    } else if (titleLower.includes('commercial') || titleLower.includes('office') || titleLower.includes('business')) {
      return { name: 'Commercial', color: 'bg-blue-100 text-blue-800' };
    } else if (titleLower.includes('packing') || titleLower.includes('pack')) {
      return { name: 'Packing', color: 'bg-orange-100 text-orange-800' };
    } else if (titleLower.includes('storage') || titleLower.includes('warehouse')) {
      return { name: 'Storage', color: 'bg-purple-100 text-purple-800' };
    } else if (titleLower.includes('specialty') || titleLower.includes('special')) {
      return { name: 'Specialty', color: 'bg-pink-100 text-pink-800' };
    }
    return { name: 'Other', color: 'bg-gray-100 text-gray-800' };
  };

  const getServiceIcon = (title: string, defaultIcon?: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('residential') || titleLower.includes('home')) return '🏠';
    if (titleLower.includes('commercial') || titleLower.includes('office')) return '🏢';
    if (titleLower.includes('packing') || titleLower.includes('pack')) return '📦';
    if (titleLower.includes('storage') || titleLower.includes('warehouse')) return '🏪';
    if (titleLower.includes('specialty') || titleLower.includes('special')) return '⭐';
    return defaultIcon || '🛠️';
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Moving Services</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Professional moving services designed to make your relocation smooth and stress-free
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const category = getServiceCategory(service.title);
          const serviceIcon = getServiceIcon(service.title, service.icon);
          
          return (
            <div 
              key={service.id || index} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
            >
              {/* Service Header with Category Badge */}
              <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 p-6 text-center">
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    {category.name}
                  </span>
                </div>
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {serviceIcon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {service.title}
                </h3>
              </div>
              
              {/* Service Content */}
              <div className="p-6 flex flex-col h-full">
                <p className="text-gray-600 mb-4 leading-relaxed whitespace-pre-line flex-grow">
                  {service.description}
                </p>
                
                {/* Service Details */}
                <div className="space-y-3 mb-6">
                  {service.duration && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <span className="w-5 h-5 mr-3 text-blue-500">⏱️</span>
                      <span className="font-medium">Duration:</span>
                      <span className="ml-2 font-semibold">{getDurationDisplay(service.duration)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                    <span className="w-5 h-5 mr-3 text-green-500">💰</span>
                    <span className="font-medium">Price:</span>
                    <span className="ml-2 text-blue-600 font-bold text-lg">
                      {getPriceDisplay(service.price)}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3 mt-auto">
                  <button 
                    onClick={() => onServiceSelect(service)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    <span className="mr-2">📋</span>
                    Get Quote
                  </button>
                  
                  <button 
                    onClick={() => navigate(service.link || '/booking')}
                    className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300 font-medium flex items-center justify-center"
                  >
                    <span className="mr-2">ℹ️</span>
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Call to Action */}
      <div className="text-center mt-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
          <p className="text-lg mb-6 opacity-90">
            Contact us for specialized moving services tailored to your specific needs
          </p>
          <button 
            onClick={() => navigate('/contact')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
          >
            Contact Us Today
          </button>
        </div>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
ServicesList.displayName = 'ServicesList';

export default ServicesList; 