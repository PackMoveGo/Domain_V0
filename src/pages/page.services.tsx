
import React, { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../component/business/SEO';

import { useGiveSectionId } from '../hook/useGiveSectionId';
import { searchContent, SearchResult } from '../util/search';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import ServicesList from '../component/business/services/ServicesList';
import QuoteForm from '../component/forms/form.quote';
import { useServicesData } from '../util/serviceParser';
import { LoadingSpinner } from '../component/ui/LoadingSpinner';
import { ServicesUnavailable } from '../component/business/services/ServicesUnavailable';
import { isConsentBlockedError } from '../util/apiConsentCoordinator';

// FormData interface moved to form.quote.tsx

const Services: FC = () => {
  const navigate = useNavigate();
  const { getSectionProps } = useGiveSectionId();
  const { services, error, isLoading } = useServicesData();
  
  // Debug logging for ServicesPage
  console.log('🔧 ServicesPage: Component state:', {
    servicesCount: services?.length || 0,
    isLoading: isLoading,
    error: error
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(9); // 3x3 grid

  // Handle cookie consent for services
  const handleAcceptCookies = useCallback(() => {
    localStorage.setItem('packmovego-cookie-preferences', JSON.stringify({
      hasMadeChoice: true,
      analytics: true,
      marketing: true,
      necessary: true
    }));
    window.location.reload();
  }, []);

  // Check if cookie consent is blocking services using coordinator
  const isCookieConsentBlocking = useMemo(() => {
    if (!error) return false;
    // Check if error is consent-blocked using coordinator
    const errorObj = typeof error === 'string' ? { message: error } : error;
    return isConsentBlockedError(errorObj);
  }, [error]);

  // Get unique categories from services
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    services.forEach(service => {
      // Extract category from service title or description
      const title = service.title.toLowerCase();
      if (title.includes('residential') || title.includes('home') || title.includes('house')) {
        categories.add('residential');
      } else if (title.includes('commercial') || title.includes('office') || title.includes('business')) {
        categories.add('commercial');
      } else if (title.includes('packing') || title.includes('pack')) {
        categories.add('packing');
      } else if (title.includes('storage') || title.includes('warehouse')) {
        categories.add('storage');
      } else if (title.includes('specialty') || title.includes('special')) {
        categories.add('specialty');
      } else {
        categories.add('other');
      }
    });
    return Array.from(categories).sort();
  }, [services]);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => {
        const title = service.title.toLowerCase();
        switch (selectedCategory) {
          case 'residential':
            return title.includes('residential') || title.includes('home') || title.includes('house');
          case 'commercial':
            return title.includes('commercial') || title.includes('office') || title.includes('business');
          case 'packing':
            return title.includes('packing') || title.includes('pack');
          case 'storage':
            return title.includes('storage') || title.includes('warehouse');
          case 'specialty':
            return title.includes('specialty') || title.includes('special');
          case 'other':
            return !title.includes('residential') && !title.includes('commercial') && 
                   !title.includes('packing') && !title.includes('storage') && 
                   !title.includes('specialty');
          default:
            return true;
        }
      });
    }

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'price': {
          const priceA = a.price ? parseFloat(a.price.replace(/[^0-9.]/g, '')) : 0;
          const priceB = b.price ? parseFloat(b.price.replace(/[^0-9.]/g, '')) : 0;
          return priceA - priceB;
        }
        case 'duration': {
          const durationA = a.duration ? parseFloat(a.duration.replace(/[^0-9.]/g, '')) : 0;
          const durationB = b.duration ? parseFloat(b.duration.replace(/[^0-9.]/g, '')) : 0;
          return durationA - durationB;
        }
        default:
          return 0;
      }
    });

    console.log('🔧 ServicesPage: Filtered and sorted services:', {
      originalCount: services?.length || 0,
      filteredCount: filtered.length,
      searchTerm: searchTerm,
      selectedCategory: selectedCategory,
      sortBy: sortBy
    });
    
    return filtered;
  }, [services, searchTerm, selectedCategory, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const endIndex = startIndex + servicesPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const handleServiceSelect = useCallback(() => {
    navigate('/booking');
  }, [navigate]);

  const _handleSearch = useCallback((query: string) => { // Reserved for future use
    return searchContent(query);
  }, []);

  const _handleSearchComplete = useCallback((results: SearchResult[]) => { // Reserved for future use
    console.log('Search completed:', results);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'name' | 'price' | 'duration');
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of services section
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div>
      <SEO 
        title="Moving Services - Pack Move Go | Residential & Commercial Moving"
        description="Comprehensive moving services including residential, commercial, packing, and storage solutions. Professional and reliable moving services in Orange County."
        keywords="moving services, residential moving, commercial moving, packing services, storage solutions, local movers, long distance moving"
        url="https://packmovego.com/services"
        image="/images/moving-services.jpg"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section {...getSectionProps('hero')} className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">Professional Moving Services</h1>
              <p className="text-xl mb-8">Comprehensive moving solutions tailored to your needs</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="text-3xl mb-2">🚚</div>
                  <h3 className="font-semibold">Residential Moving</h3>
                  <p className="text-sm opacity-90">Local & Long Distance</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="text-3xl mb-2">🏢</div>
                  <h3 className="font-semibold">Commercial Moving</h3>
                  <p className="text-sm opacity-90">Office & Business</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="text-3xl mb-2">📦</div>
                  <h3 className="font-semibold">Packing Services</h3>
                  <p className="text-sm opacity-90">Professional Packing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories ({services.length})</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)} 
                      ({services.filter(service => {
                        const title = service.title.toLowerCase();
                        switch (category) {
                          case 'residential':
                            return title.includes('residential') || title.includes('home') || title.includes('house');
                          case 'commercial':
                            return title.includes('commercial') || title.includes('office') || title.includes('business');
                          case 'packing':
                            return title.includes('packing') || title.includes('pack');
                          case 'storage':
                            return title.includes('storage') || title.includes('warehouse');
                          case 'specialty':
                            return title.includes('specialty') || title.includes('special');
                          case 'other':
                            return !title.includes('residential') && !title.includes('commercial') && 
                                   !title.includes('packing') && !title.includes('storage') && 
                                   !title.includes('specialty');
                          default:
                            return true;
                        }
                      }).length})
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="duration">Sort by Duration</option>
                </select>
              </div>
            </div>
            {searchTerm && (
              <div className="mt-4 text-sm text-gray-600">
                Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} matching "{searchTerm}"
              </div>
            )}
          </div>
        </section>

        {/* Services Section */}
        <section {...getSectionProps('services')} className="py-16">
          <ErrorBoundary>
            {isLoading ? (
              <div className="container mx-auto px-4 text-center">
                <LoadingSpinner />
                <div className="text-xl text-gray-600 mt-4">Loading services from API...</div>
                <div className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest service information</div>
              </div>
            ) : error ? (
              <div className="container mx-auto px-4">
                {isCookieConsentBlocking ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <div className="text-yellow-800 text-xl font-semibold mb-4">
                      Cookie Consent Required
                    </div>
                    <div className="text-yellow-600 mb-6">
                      To view our services, you need to accept cookies. This allows us to load service information from our API.
                    </div>
                    <button 
                      onClick={handleAcceptCookies}
                      className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition duration-300 font-medium"
                    >
                      Accept Cookies & View Services
                    </button>
                  </div>
                ) : (
                  <ServicesUnavailable 
                    error={error} 
                    onRetry={() => window.location.reload()} 
                  />
                )}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="container mx-auto px-4 text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                  <div className="text-gray-600 text-xl mb-2">No services found</div>
                  <div className="text-gray-500 mb-4">
                    {searchTerm ? `No services match "${searchTerm}"` : 
                     selectedCategory !== 'all' ? `No services found in "${selectedCategory}" category` :
                     'No services available at the moment'}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        Clear Search
                      </button>
                    )}
                    {selectedCategory !== 'all' && (
                      <button 
                        onClick={() => setSelectedCategory('all')}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
                      >
                        Show All Categories
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Services Summary */}
                <div className="container mx-auto px-4 mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          Available Services
                        </h3>
                        <p className="text-blue-700">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} of {filteredServices.length} services
                          {searchTerm && ` matching "${searchTerm}"`}
                          {selectedCategory !== 'all' && ` in "${selectedCategory}" category`}
                          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                            setSortBy('name');
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <ServicesList 
                  services={paginatedServices} 
                  onServiceSelect={handleServiceSelect} 
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg transition duration-300 ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </ErrorBoundary>
        </section>

        {/* Quote Form Section */}
        <section {...getSectionProps('quote-form')} className="py-16 bg-white">
          <ErrorBoundary>
            <QuoteForm />
          </ErrorBoundary>
        </section>
      </div>
    </div>
  );
};

export default Services; 