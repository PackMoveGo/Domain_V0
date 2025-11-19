
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../../../styles/common';
import { NormalizedService } from '../../../util/serviceNormalizer';
import { LazySection } from '../../loading/LazySection';

interface OurServicesProps {
  services?: NormalizedService[];
  isLoading?: boolean;
  error?: string | null;
}

function getDisplay(val: any) {
  if (!val) return '';
  if (typeof val === 'object' && val.display) return val.display;
  return val;
}

export default function OurServices({ services: propServices, isLoading: _isLoading, error: _error }: OurServicesProps) { // Reserved for future use
  const navigate = useNavigate();
  
  // Get services from props only (no API calls)
  const services = propServices || [];
  
  // Check if we have data
  const hasServices = services && services.length > 0;

  // Show message when no services are provided - only show error if explicitly passed
  if (!hasServices) {
    // Only show error message if error prop is explicitly provided AND it's a 503 error
    // Don't show error during loading or when error is null/undefined
    const showError = _error && 
                      typeof _error === 'string' && 
                      (_error.includes('503') || _error.includes('Service Unavailable'));
    
    return (
      <LazySection sectionId="services" preload={true}>
        <div className={`${styles.section.default} bg-gray-50`}>
          <div className={styles.container}>
            <div className="text-center mb-16">
              <h2 className={styles.heading.h2}>Our Services</h2>
              <p className={`${styles.text.body} max-w-3xl mx-auto`}>
                Professional moving solutions for every need
              </p>
              
              {/* Only show error message if there's an actual 503 API error */}
              {showError ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-yellow-600 text-4xl mr-3">⚠️</div>
                  <h3 className="text-lg font-semibold text-yellow-800">Services Temporarily Unavailable</h3>
                </div>
                <p className="text-yellow-700 mb-4">
                  We're experiencing technical difficulties loading our services. Please contact us directly for information about our services.
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
              ) : (
                // Show friendly message when data is just not available yet (not an error)
                // This handles loading state and cases where services simply haven't loaded yet
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
                  <p className="text-blue-700">
                    Our services information is being loaded. Please check back in a moment or contact us directly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </LazySection>
    );
  }

  // Show services when data is available
  return (
    <LazySection sectionId="services" preload={true}>
      <div className={`${styles.section.default} bg-gray-50`}>
        <div className={styles.container}>
          <div className="text-center mb-16">
            <h2 className={styles.heading.h2}>Our Services</h2>
            <p className={`${styles.text.body} max-w-3xl mx-auto`}>
              From residential moves to commercial relocations, we offer comprehensive moving solutions tailored to your needs.
            </p>
          </div>
          
          <div className={styles.grid.services}>
            {services
              .filter(service => 
                service.id === 'house-mover' || 
                service.id === 'gun-safe' || 
                service.id === 'furniture-assembly' ||
                service.id === 'residential'
              )
              .slice(0, 4)
              .map((service: NormalizedService) => {
              const handleCardClick = () => {
                const link = service.link || (service.id ? `/services/${service.id}` : '/services');
                navigate(link);
              };
              
              return (
              <div 
                key={service.title} 
                className={`${styles.card.default} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                onClick={handleCardClick}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className={styles.heading.h3}>{service.title}</h3>
                <p className="text-blue-600 font-medium mb-2">{getDisplay(service.duration)}</p>
                <p className={`${styles.text.description} line-clamp-2 mb-4`}>
                  {service.description}
                </p>
                {service.price && (
                  <p className={`${styles.text.price} text-lg mb-4`}>{getDisplay(service.price)}</p>
                )}
                
                {/* Service features */}
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <span className="text-green-500 mr-2">✓</span>
                    Professional movers
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <span className="text-green-500 mr-2">✓</span>
                    Fully insured
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Free estimates
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/booking');
                    }}
                    className={`flex-1 ${styles.button.primary}`}
                  >
                    Book Now
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = service.link || (service.id ? `/services/${service.id}` : '/services');
                      navigate(link);
                    }}
                    className={`flex-1 ${styles.button.secondary}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need a custom solution?</p>
            <button className={`${styles.button.primary} mr-4`}>
              Contact Us
            </button>
            <button className={`${styles.button.secondary}`}>
              View All Services
            </button>
          </div>
        </div>
      </div>
    </LazySection>
  );
} 

OurServices.displayName = 'OurServices'; 