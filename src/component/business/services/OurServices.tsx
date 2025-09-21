
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../../../styles/common';
import { ServiceData } from '../../../util/serviceParser';
import { LazySection } from '../../loading/LazySection';
import { api } from '../../../services/service.apiSW';

interface OurServicesProps {
  services?: ServiceData[];
}

function getDisplay(val: any) {
  if (!val) return '';
  if (typeof val === 'object' && val.display) return val.display;
  return val;
}

export default function OurServices({ services: propServices }: OurServicesProps) {
  const navigate = useNavigate();
  
  // State for API availability (SSR-safe)
  const [apiAvailable, setApiAvailable] = React.useState(false);
  const [apiUrl, setApiUrl] = React.useState('');
  
  // Get services from props only (no API calls)
  const services = propServices || [];
  
  // Set API availability on client side only
  React.useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        const config = api.getConfig();
        setApiAvailable(true);
        setApiUrl(config.apiUrl);
      } catch (error) {
        setApiAvailable(false);
        setApiUrl('');
      }
    };
    checkApiAvailability();
  }, []);
  
  // Check if we have data
  const hasServices = services && services.length > 0;

  // Show message when no services are provided
  if (!hasServices) {
    return (
      <LazySection sectionId="services" preload={true}>
        <div className={`${styles.section.default} bg-gray-50`}>
          <div className={styles.container}>
            <div className="text-center mb-16">
              <h2 className={styles.heading.h2}>Our Services</h2>
              <p className={`${styles.text.body} max-w-3xl mx-auto text-gray-600`}>
                Services will be loaded when available.
              </p>
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
            {services.map((service: ServiceData) => (
              <div key={service.title} className={`${styles.card.default} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
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
                
                <div className="flex space-x-4 mt-6">
                  <button 
                    onClick={() => navigate('/booking')}
                    className={`flex-1 ${styles.button.primary}`}
                  >
                    Book Now
                  </button>
                  <button 
                    onClick={() => navigate('/services')}
                    className={`flex-1 ${styles.button.secondary}`}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
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