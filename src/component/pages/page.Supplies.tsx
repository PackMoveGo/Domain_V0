import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupplyCategory, SupplyItem, getPopularSupplies, searchSupplies } from '../../util/suppliesParser';

interface SuppliesProps {
  supplies: SupplyCategory[];
  isLoading: boolean;
  error: string | null;
}

const Supplies: React.FC<SuppliesProps> = ({ supplies, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);

  // Debug logging
  console.log('🔧 Supplies component received:', { 
    suppliesCount: supplies?.length || 0, 
    isLoading, 
    error,
    supplies: supplies
  });

  // Early return if supplies is undefined or not an array
  if (!supplies || !Array.isArray(supplies)) {
    if (isLoading) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading supplies...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Supplies</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      );
    }

    // If not loading and no error, but supplies is still undefined/not array
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Supplies Available</h3>
          <p className="text-gray-600">Supplies data is not available at the moment.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supplies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Supplies</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const popularSupplies = getPopularSupplies(supplies);
  
  // Apply all filters with safe array operations
  let filteredSupplies = searchTerm 
    ? searchSupplies(supplies, searchTerm)
    : selectedCategory === 'all' 
      ? supplies.flatMap(cat => cat.items || [])
      : supplies.find(cat => cat.id === selectedCategory)?.items || [];

  // Apply price filter
  filteredSupplies = filteredSupplies.filter(item => 
    item.price >= priceRange[0] && item.price <= priceRange[1]
  );

  // Apply stock filter
  if (showOnlyInStock) {
    filteredSupplies = filteredSupplies.filter(item => item.inStock);
  }

  // Apply popular filter
  if (showOnlyPopular) {
    filteredSupplies = filteredSupplies.filter(item => item.popular);
  }

  // Debug filtered supplies
  console.log('🔧 Filtered supplies:', {
    searchTerm,
    selectedCategory,
    priceRange,
    showOnlyInStock,
    showOnlyPopular,
    filteredCount: filteredSupplies.length,
    filteredSupplies: filteredSupplies,
    suppliesStructure: supplies.map(cat => ({
      id: cat.id,
      category: cat.category,
      itemsCount: cat.items?.length || 0,
      firstItem: cat.items?.[0]
    }))
  });

  const categories = [
    { id: 'all', name: 'All Supplies', icon: '📦', count: supplies.flatMap(cat => cat.items || []).length },
    ...supplies.map(cat => ({ 
      id: cat.id, 
      name: cat.category, 
      icon: cat.icon, 
      count: cat.items?.length || 0
    }))
  ];

  const allItems = supplies.flatMap(cat => cat.items || []);
  const maxPrice = allItems.length > 0 ? Math.max(...allItems.map(item => item.price)) : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Moving Supplies & Packing Materials
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional-grade moving supplies to make your move easier and protect your belongings
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-2xl mx-auto">
          <input
            type="text"
            id="suppliesSearch"
            placeholder="Search supplies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
            
            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.icon} {category.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  id="priceRangeSlider"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="minPrice"
                    min="0"
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-gray-500 self-center">to</span>
                  <input
                    type="number"
                    id="maxPrice"
                    min={priceRange[0]}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Availability</h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="inStockOnly"
                  checked={showOnlyInStock}
                  onChange={(e) => setShowOnlyInStock(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">In Stock Only</span>
              </label>
            </div>

            {/* Popular Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Popularity</h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyPopular}
                  onChange={(e) => setShowOnlyPopular(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Popular Items Only</span>
              </label>
            </div>

            {/* Clear Filters */}
            {(selectedCategory !== 'all' || searchTerm || priceRange[0] > 0 || priceRange[1] < maxPrice || showOnlyInStock || showOnlyPopular) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setPriceRange([0, maxPrice]);
                  setShowOnlyInStock(false);
                  setShowOnlyPopular(false);
                }}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Supplies */}
        <div className="lg:col-span-3">
          {/* Results Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchTerm ? `Search Results for "${searchTerm}"` : 
                 selectedCategory === 'all' ? 'All Supplies' : 
                 supplies.find(cat => cat.id === selectedCategory)?.category}
              </h2>
              <span className="text-sm text-gray-600">
                {filteredSupplies.length} item{filteredSupplies.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* Popular Supplies Section */}
          {!searchTerm && selectedCategory === 'all' && !showOnlyInStock && !showOnlyPopular && popularSupplies.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Popular Supplies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularSupplies.slice(0, 6).map((item) => (
                  <SupplyCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* All Supplies Section */}
          <div>
            {filteredSupplies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No supplies found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSupplies.map((item) => (
                  <SupplyCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help Choosing Supplies?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our moving experts can help you determine exactly what supplies you need for your specific move.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Get Free Consultation
              </a>
              <a 
                href="/blog" 
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
              >
                View Moving Tips
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SupplyCardProps {
  item: SupplyItem;
}

const SupplyCard: React.FC<SupplyCardProps> = ({ item }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    if (item.id) {
      navigate(`/supplies/${item.id}`);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {item.name}
          </h3>
          {item.popular && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              Popular
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {item.description}
        </p>
        
        {(item.dimensions || item.size || item.contents) && (
          <div className="text-sm text-gray-500 mb-4">
            {item.dimensions && <div>Dimensions: {item.dimensions}</div>}
            {item.size && <div>Size: {item.size}</div>}
            {item.contents && <div>Includes: {item.contents}</div>}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">
            ${item.price.toFixed(2)}
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${item.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-500">
              {item.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.id) {
                navigate(`/supplies/${item.id}`);
              }
            }}
            className="flex-1 border-2 border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
          >
            View Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.inStock) {
                navigate(`/contact?subject=Quote for ${encodeURIComponent(item.name)}`);
              }
            }}
            disabled={!item.inStock}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              item.inStock 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {item.inStock ? 'Get Quote' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
Supplies.displayName = 'Supplies';
SupplyCard.displayName = 'SupplyCard';

export default Supplies; 