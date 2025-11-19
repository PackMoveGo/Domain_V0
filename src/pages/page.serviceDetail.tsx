import React, { FC, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../component/business/SEO';
import { LoadingSpinner } from '../component/ui/LoadingSpinner';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import { getServiceById, ServiceItem } from '../services/routes/route.servicesAPI';
import { useGiveSectionId } from '../hook/useGiveSectionId';

const ServiceDetail: FC = () => {
  const { service: serviceId } = useParams<{ service: string }>();
  const navigate = useNavigate();
  const { getSectionProps } = useGiveSectionId();
  
  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchService = useCallback(async () => {
    if (!serviceId) {
      setError('Service ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const serviceData = await getServiceById(serviceId);
      
      if (!serviceData) {
        setError('Service not found');
        setService(null);
      } else {
        setService(serviceData);
      }
    } catch (err) {
      console.error('❌ Failed to fetch service:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load service details';
      setError(errorMessage);
      setService(null);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleGetQuote = useCallback(() => {
    navigate('/booking');
  }, [navigate]);

  const handleBackToServices = useCallback(() => {
    navigate('/services');
  }, [navigate]);

  // Get service icon based on category or title
  const getServiceIcon = (service: ServiceItem) => {
    if (service.icon) return service.icon;
    const titleLower = service.name.toLowerCase();
    if (titleLower.includes('residential') || titleLower.includes('home')) return '🏠';
    if (titleLower.includes('commercial') || titleLower.includes('office')) return '🏢';
    if (titleLower.includes('packing') || titleLower.includes('pack')) return '📦';
    if (titleLower.includes('storage') || titleLower.includes('warehouse')) return '🏪';
    if (titleLower.includes('specialty') || titleLower.includes('special')) return '⭐';
    return '🛠️';
  };

  // Get category badge info
  const getCategoryInfo = (service: ServiceItem) => {
    const categoryLower = service.category?.toLowerCase() || '';
    if (categoryLower.includes('residential') || categoryLower.includes('home')) {
      return { name: 'Residential', color: 'bg-green-100 text-green-800' };
    } else if (categoryLower.includes('commercial') || categoryLower.includes('office')) {
      return { name: 'Commercial', color: 'bg-blue-100 text-blue-800' };
    } else if (categoryLower.includes('packing') || categoryLower.includes('pack')) {
      return { name: 'Packing', color: 'bg-orange-100 text-orange-800' };
    } else if (categoryLower.includes('storage') || categoryLower.includes('warehouse')) {
      return { name: 'Storage', color: 'bg-purple-100 text-purple-800' };
    } else if (categoryLower.includes('specialty') || categoryLower.includes('special')) {
      return { name: 'Specialty', color: 'bg-pink-100 text-pink-800' };
    }
    return { name: 'General', color: 'bg-gray-100 text-gray-800' };
  };

  // SEO data
  const seoTitle = service 
    ? `${service.name} - Pack Move Go | Professional Moving Services`
    : 'Service Details - Pack Move Go';
  const seoDescription = service
    ? service.shortDescription || (service.description ? service.description.substring(0, 160) : '')
    : 'View detailed information about our professional moving services';
  const seoUrl = serviceId 
    ? `https://packmovego.com/services/${serviceId}`
    : 'https://packmovego.com/services';

  return (
    <ErrorBoundary>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={`${service?.name || 'moving service'}, moving services, professional movers, relocation, ${service?.category || 'moving'}`}
        url={seoUrl}
        image="/images/moving-services.jpg"
        type="product"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Loading State */}
        {isLoading && (
          <div className="container mx-auto px-4 py-20 text-center">
            <LoadingSpinner size="large" />
            <div className="text-xl text-gray-600 mt-4">Loading service details...</div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="container mx-auto px-4 py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <div className="text-red-800 text-2xl font-semibold mb-4">
                {error === 'Service not found' ? 'Service Not Found' : 'Error Loading Service'}
              </div>
              <div className="text-red-600 mb-6">
                {error === 'Service not found' 
                  ? 'The service you are looking for does not exist or has been removed.'
                  : 'We encountered an error while loading the service details. Please try again.'}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={handleBackToServices}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
                >
                  Back to Services
                </button>
                <button 
                  onClick={fetchService}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Detail Content */}
        {!isLoading && !error && service && (
          <>
            {/* Hero Section */}
            <section {...getSectionProps('hero')} className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-16 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              </div>
              
              <div className="container mx-auto px-4 relative z-10">
                <button
                  onClick={handleBackToServices}
                  className="mb-6 text-white/80 hover:text-white flex items-center transition duration-300 hover:translate-x-[-4px]"
                >
                  <span className="mr-2">←</span>
                  Back to Services
                </button>
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 mb-4 animate-fade-in">
                    <span className="text-6xl animate-bounce-subtle">{getServiceIcon(service)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl md:text-5xl font-bold">{service.name}</h1>
                        {service.isPopular && (
                          <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {service.category && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryInfo(service).color}`}>
                            {getCategoryInfo(service).name}
                          </span>
                        )}
                        {service.isAvailable !== false ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Available
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {service.shortDescription && (
                    <p className="text-xl text-white/90 mt-4">{service.shortDescription}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Main Content */}
            <section {...getSectionProps('details')} className="py-16 bg-gradient-to-b from-gray-50 to-white">
              <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Description */}
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {service.description || 'No description available.'}
                        </div>
                      </div>

                      {/* Features */}
                      {service.features && service.features.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
                          <ul className="space-y-3">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Benefits */}
                      {service.benefits && service.benefits.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                          <ul className="space-y-3">
                            {service.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-500 mr-3 mt-1">★</span>
                                <span className="text-gray-700">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* What's Included */}
                      {service.included && service.included.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
                          <ul className="space-y-3">
                            {service.included.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* FAQs */}
                      {service.faqs && service.faqs.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                          <div className="space-y-6">
                            {service.faqs.map((faq, index) => (
                              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-700">{faq.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl p-8 sticky top-8 border border-blue-100">
                        {/* Pricing */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {typeof service.price === 'object' && service.price !== null
                              ? (service.price.display || `From $${service.price.starting || 'N/A'}`)
                              : (service.price || 'Contact for pricing')}
                          </div>
                          {service.priceRange && (
                            <div className="text-sm text-gray-600">
                              Range: ${service.priceRange.min} - ${service.priceRange.max}
                            </div>
                          )}
                          {typeof service.price === 'object' && service.price !== null && service.price.perHour && (
                            <div className="text-sm text-gray-600 mt-1">
                              ${service.price.perHour}/hour
                            </div>
                          )}
                        </div>

                        {/* Duration */}
                        {(service.estimatedDuration || (service as any).duration) && (
                          <div className="mb-6 pb-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Estimated Duration</h3>
                            <div className="text-xl font-semibold text-gray-700">
                              {(() => {
                                const duration = (service as any).duration || service.estimatedDuration;
                                if (typeof duration === 'object' && duration !== null) {
                                  return duration.display || `${duration.min || ''}-${duration.max || ''} ${duration.unit || 'hours'}`;
                                }
                                return duration || 'Varies';
                              })()}
                            </div>
                          </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                          <button
                            onClick={handleGetQuote}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <span className="flex items-center justify-center">
                              <span className="mr-2">📅</span>
                              Book Now
                            </span>
                          </button>
                          <button
                            onClick={() => navigate('/contact')}
                            className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300 font-medium transform hover:scale-105"
                          >
                            <span className="flex items-center justify-center">
                              <span className="mr-2">💬</span>
                              Contact Us
                            </span>
                          </button>
                        </div>

                        {/* Additional Info */}
                        {service.category && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              <div className="mb-2">
                                <span className="font-medium">Category:</span> {service.category}
                              </div>
                              {service.isPopular && (
                                <div className="text-blue-600 font-medium">⭐ Popular Service</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ServiceDetail;

