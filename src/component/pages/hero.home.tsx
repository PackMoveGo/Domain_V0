
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServicesSlideshow from '../business/services/ServicesSlideshow';
import LoadingSection from '../loading/LoadingSection';
import NoDataSection from '../ui/NoDataSection';
import { ServicesUnavailable } from '../business/services/ServicesUnavailable';
import { styles } from '../../styles/common';
import { ServiceData } from '../../util/serviceParser';

interface HeroProps {
  services: ServiceData[];
  isLoading: boolean;
  error: string | null;
}

interface FormData {
  fromZip: string;
  toZip: string;
  moveDate: string;
  rooms: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export default function Hero({ services, isLoading, error }: HeroProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fromZip: '',
    toZip: '',
    moveDate: '',
    rooms: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to booking page with form data
    navigate('/booking', { 
      state: { formData } 
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Moving Truck Background Image */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src="/moving-truck.webp" 
          alt="Moving truck" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Side - Enhanced Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Professional
                <span className="block text-blue-200">Moving Services</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Experience stress-free moving with our professional team. 
                From packing to delivery, we handle every detail with care.
              </p>
            </div>
            
            {/* Enhanced Quick Booking Form */}
            <div className="bg-white rounded-xl p-6 shadow-xl backdrop-blur-md bg-white/95">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Your Free Quote</h3>
                <p className="text-sm text-gray-600">No hidden fees, transparent pricing</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className={styles.grid.form}>
                  <div className="min-h-[48px]">
                    <input
                      type="text"
                      id="heroFromZip"
                      placeholder="From Zip Code"
                      name="fromZip"
                      value={formData.fromZip}
                      onChange={handleChange}
                      className={styles.input.default}
                    />
                  </div>
                  <div className="min-h-[48px]">
                    <input
                      type="text"
                      id="heroToZip"
                      placeholder="To Zip Code"
                      name="toZip"
                      value={formData.toZip}
                      onChange={handleChange}
                      className={styles.input.default}
                    />
                  </div>
                  <button
                    type="submit"
                    className={styles.button.cta}
                  >
                    Get Moving Quote
                  </button>
                </div>
              </form>
              
              {/* Trust indicators */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
                  <span className="flex items-center">
                    <span className="text-green-500 mr-1">✓</span>
                    Licensed & Insured
                  </span>
                  <span className="flex items-center">
                    <span className="text-green-500 mr-1">✓</span>
                    Free Estimates
                  </span>
                  <span className="flex items-center">
                    <span className="text-green-500 mr-1">✓</span>
                    24/7 Support
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Services Section */}
          <div className="w-full lg:w-1/2">
            <div className={`${styles.card.glass} min-h-[400px]`}>
              <div className="mb-4">
                <h3 className="text-white text-lg font-semibold mb-2">Our Services</h3>
                <p className="text-blue-100 text-sm">Professional moving solutions for every need</p>
              </div>
              
              <LoadingSection
                isLoading={isLoading}
                error={error}
                className="text-white"
              >
                {error ? (
                  <div className="text-white">
                    <ServicesUnavailable 
                      error={error} 
                      onRetry={() => window.location.reload()} 
                    />
                  </div>
                ) : services.length > 0 ? (
                  <ServicesSlideshow services={services} />
                ) : (
                  <NoDataSection
                    title="Services arent available in your area"
                    message="We're currently updating our service information. Please check back later or contact us directly."
                    icon="🚚"
                    className="text-white"
                  />
                )}
              </LoadingSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add displayName for React DevTools
Hero.displayName = 'Hero';