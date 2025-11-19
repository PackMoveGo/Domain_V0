import React, { FC, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../component/business/SEO';
import { LoadingSpinner } from '../component/ui/LoadingSpinner';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import { fetchSuppliesData, SupplyItem, SupplyCategory } from '../util/suppliesParser';

const SupplyDetail: FC = () => {
  const { supply: supplyId } = useParams<{ supply: string }>();
  const navigate = useNavigate();
  const { getSectionProps } = useGiveSectionId();
  
  const [supply, setSupply] = useState<SupplyItem | null>(null);
  const [category, setCategory] = useState<SupplyCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupply = useCallback(async () => {
    if (!supplyId) {
      setError('Supply ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const suppliesData = await fetchSuppliesData();
      
      // Search through all categories to find the supply item
      let foundSupply: SupplyItem | null = null;
      let foundCategory: SupplyCategory | null = null;
      
      for (const cat of suppliesData.supplies) {
        const item = cat.items.find((s: SupplyItem) => 
          s.id === supplyId || 
          s.id === supplyId.toLowerCase() ||
          (s.name && s.name.toLowerCase().replace(/\s+/g, '-') === supplyId.toLowerCase())
        );
        
        if (item) {
          foundSupply = item;
          foundCategory = cat;
          break;
        }
      }
      
      if (!foundSupply) {
        setError('Supply not found');
        setSupply(null);
        setCategory(null);
      } else {
        setSupply(foundSupply);
        setCategory(foundCategory);
      }
    } catch (err) {
      console.error('❌ Failed to fetch supply:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load supply details';
      setError(errorMessage);
      setSupply(null);
      setCategory(null);
    } finally {
      setIsLoading(false);
    }
  }, [supplyId]);

  useEffect(() => {
    fetchSupply();
  }, [fetchSupply]);

  const handleBackToSupplies = useCallback(() => {
    navigate('/supplies');
  }, [navigate]);

  const handleRequestQuote = useCallback(() => {
    if (supply) {
      navigate(`/contact?subject=Quote for ${encodeURIComponent(supply.name)}`);
    } else {
      navigate('/contact');
    }
  }, [navigate, supply]);

  // Get supply icon based on category
  const getSupplyIcon = (cat: SupplyCategory | null) => {
    if (cat?.icon) return cat.icon;
    return '📦';
  };

  // SEO data
  const seoTitle = supply 
    ? `${supply.name} - Pack Move Go | Moving Supplies`
    : 'Supply Details - Pack Move Go';
  const seoDescription = supply
    ? `${supply.description} - ${supply.name} available at $${supply.price.toFixed(2)}. Professional moving supplies.`
    : 'View detailed information about our professional moving supplies';
  const seoUrl = supplyId 
    ? `https://packmovego.com/supplies/${supplyId}`
    : 'https://packmovego.com/supplies';

  return (
    <ErrorBoundary>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={`${supply?.name || 'moving supply'}, moving supplies, packing materials, ${supply?.category || 'supplies'}`}
        url={seoUrl}
        image="/images/supplies.webp"
        type="product"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Loading State */}
        {isLoading && (
          <div className="container mx-auto px-4 py-20 text-center">
            <LoadingSpinner size="large" />
            <div className="text-xl text-gray-600 mt-4">Loading supply details...</div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="container mx-auto px-4 py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <div className="text-red-800 text-2xl font-semibold mb-4">
                {error === 'Supply not found' ? 'Supply Not Found' : 'Error Loading Supply'}
              </div>
              <div className="text-red-600 mb-6">
                {error === 'Supply not found' 
                  ? 'The supply item you are looking for does not exist or has been removed.'
                  : 'We encountered an error while loading the supply details. Please try again.'}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={handleBackToSupplies}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
                >
                  Back to Supplies
                </button>
                <button 
                  onClick={fetchSupply}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supply Detail Content */}
        {!isLoading && !error && supply && category && (
          <>
            {/* Hero Section */}
            <section {...getSectionProps('hero')} className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-16 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              </div>
              
              <div className="container mx-auto px-4 relative z-10">
                <button
                  onClick={handleBackToSupplies}
                  className="mb-6 text-white/80 hover:text-white flex items-center transition duration-300 hover:translate-x-[-4px]"
                >
                  <span className="mr-2">←</span>
                  Back to Supplies
                </button>
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 mb-4 animate-fade-in">
                    <span className="text-6xl animate-bounce-subtle">{getSupplyIcon(category)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl md:text-5xl font-bold">{supply.name}</h1>
                        {supply.popular && (
                          <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
                          {category.category}
                        </span>
                        {supply.inStock ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            In Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {supply.description && (
                    <p className="text-xl text-white/90 mt-4">{supply.description}</p>
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                        <div className="text-gray-700 leading-relaxed">
                          {supply.description || 'No description available.'}
                        </div>
                      </div>

                      {/* Specifications */}
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
                        <div className="space-y-4">
                          {supply.dimensions && (
                            <div className="flex items-start">
                              <span className="text-blue-500 mr-3 mt-1">📏</span>
                              <div>
                                <span className="font-semibold text-gray-900">Dimensions: </span>
                                <span className="text-gray-700">{supply.dimensions}</span>
                              </div>
                            </div>
                          )}
                          {supply.size && (
                            <div className="flex items-start">
                              <span className="text-blue-500 mr-3 mt-1">📐</span>
                              <div>
                                <span className="font-semibold text-gray-900">Size: </span>
                                <span className="text-gray-700">{supply.size}</span>
                              </div>
                            </div>
                          )}
                          {supply.contents && (
                            <div className="flex items-start">
                              <span className="text-blue-500 mr-3 mt-1">📋</span>
                              <div>
                                <span className="font-semibold text-gray-900">Contents: </span>
                                <span className="text-gray-700">{supply.contents}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start">
                            <span className="text-blue-500 mr-3 mt-1">💰</span>
                            <div>
                              <span className="font-semibold text-gray-900">Price: </span>
                              <span className="text-gray-700 text-xl font-bold text-blue-600">${supply.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Usage Tips */}
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Tips</h2>
                        <ul className="space-y-3">
                          {supply.category === 'Packing Boxes' && (
                            <>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Choose the right size box for your items to prevent damage</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Don't overpack boxes - keep weight under 50 lbs</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Use proper packing materials for fragile items</span>
                              </li>
                            </>
                          )}
                          {supply.category === 'Packing Materials' && (
                            <>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Wrap fragile items individually with bubble wrap or packing paper</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Use furniture pads to protect large items during transport</span>
                              </li>
                            </>
                          )}
                          {supply.category === 'Tape & Tools' && (
                            <>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Seal boxes with H-tape pattern for maximum security</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Label all boxes clearly with permanent markers</span>
                              </li>
                            </>
                          )}
                          {(!supply.category || !['Packing Boxes', 'Packing Materials', 'Tape & Tools'].includes(supply.category)) && (
                            <>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Follow manufacturer instructions for best results</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-3 mt-1">✓</span>
                                <span className="text-gray-700">Store in a dry, cool place when not in use</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl p-8 sticky top-8 border border-blue-100">
                        {/* Pricing */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            ${supply.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Per unit
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${supply.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className={`text-lg font-semibold ${supply.inStock ? 'text-green-600' : 'text-red-600'}`}>
                              {supply.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                          {supply.inStock ? (
                            <button
                              onClick={handleRequestQuote}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <span className="flex items-center justify-center">
                                <span className="mr-2">📧</span>
                                Request Quote
                              </span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed font-medium"
                            >
                              <span className="flex items-center justify-center">
                                <span className="mr-2">⏸️</span>
                                Out of Stock
                              </span>
                            </button>
                          )}
                          <button
                            onClick={() => navigate('/contact')}
                            className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300 font-medium transform hover:scale-105"
                          >
                            <span className="flex items-center justify-center">
                              <span className="mr-2">💬</span>
                              Contact Us
                            </span>
                          </button>
                          <button
                            onClick={handleBackToSupplies}
                            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-100 transition duration-300 font-medium"
                          >
                            <span className="flex items-center justify-center">
                              <span className="mr-2">←</span>
                              View All Supplies
                            </span>
                          </button>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            <div className="mb-2">
                              <span className="font-medium">Category:</span> {category.category}
                            </div>
                            {supply.popular && (
                              <div className="text-blue-600 font-medium">⭐ Popular Item</div>
                            )}
                          </div>
                        </div>
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

export default SupplyDetail;

