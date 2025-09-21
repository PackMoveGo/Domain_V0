import React, { useState } from 'react';
import { Review, ReviewStats, ServiceReview, getTopReviews, searchReviews, getReviewsByService, formatDate, renderStars } from '../../util/reviewsParser';

interface ReviewsProps {
  reviews: Review[];
  stats: ReviewStats;
  services: ServiceReview[];
  isLoading: boolean;
  error: string | null;
}

const Reviews: React.FC<ReviewsProps> = ({ reviews, stats, services, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'date' | 'helpful' | 'rating'>('date');

  // Debug logging
  console.log('🔧 Reviews component received:', { 
    reviewsCount: reviews?.length || 0,
    servicesCount: services?.length || 0,
    stats: stats,
    isLoading, 
    error 
  });

  // Safety checks for undefined arrays
  const safeReviews = reviews && Array.isArray(reviews) ? reviews : [];
  const safeServices = services && Array.isArray(services) ? services : [];
  const safeStats = stats || {
    averageRating: 0,
    totalReviews: 0,
    fiveStarReviews: 0,
    fourStarReviews: 0,
    threeStarReviews: 0,
    twoStarReviews: 0,
    oneStarReviews: 0,
    verifiedReviews: 0,
    totalHelpful: 0
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Reviews</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const topReviews = getTopReviews(safeReviews, 3);
  
  // Apply filters
  let filteredReviews = safeReviews;
  if (searchTerm) {
    filteredReviews = searchReviews(safeReviews, searchTerm);
  } else if (selectedService !== 'all') {
    filteredReviews = getReviewsByService(safeReviews, selectedService);
  } else if (selectedRating > 0) {
    filteredReviews = safeReviews.filter(review => review.rating === selectedRating);
  }

  // Apply sorting
  filteredReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'helpful':
        return b.helpful - a.helpful;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const serviceOptions = [
    { id: 'all', name: 'All Services' },
    ...safeServices.map(service => ({ id: service.name, name: service.name }))
  ];

  const ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 5, label: '5 Stars' },
    { value: 4, label: '4 Stars' },
    { value: 3, label: '3 Stars' },
    { value: 2, label: '2 Stars' },
    { value: 1, label: '1 Star' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Customer Reviews
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See what our customers are saying about Pack Move Go's professional moving and packing services
        </p>
        {/* Debug info */}
        <div className="text-sm text-gray-500 mt-2">
          Found {safeReviews.length} reviews with {safeServices.length} service types
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{safeStats.averageRating.toFixed(1)}</div>
            <div className="text-yellow-400 text-2xl mb-2">{renderStars(safeStats.averageRating)}</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalReviews}</div>
            <div className="text-gray-600">Total Reviews</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.verifiedReviews}</div>
            <div className="text-gray-600">Verified Reviews</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalHelpful}</div>
            <div className="text-gray-600">Helpful Votes</div>
          </div>
        </div>
      </div>

      {/* Top Reviews Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {topReviews.map((review) => (
            <ReviewCard key={review.id} review={review} featured={true} />
          ))}
        </div>
      </div>

      {/* Service Ratings */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Ratings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceRatingCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {serviceOptions.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ratingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'helpful' | 'rating')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="helpful">Sort by Helpful</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* All Reviews Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchTerm ? `Search Results for "${searchTerm}"` : 
             selectedService !== 'all' ? `${selectedService} Reviews` :
             selectedRating > 0 ? `${selectedRating} Star Reviews` : 'All Reviews'}
          </h2>
          <span className="text-sm text-gray-600">
            {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
          </span>
        </div>
        
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No reviews found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} featured={false} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Experience Our Service?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join our satisfied customers and let us make your move stress-free and efficient.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Free Quote
          </button>
          <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReviewCardProps {
  review: Review;
  featured: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, featured }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden ${featured ? 'ring-2 ring-blue-200' : ''}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-yellow-400">{renderStars(review.rating)}</div>
              <span className="text-sm text-gray-600">({review.rating}/5)</span>
            </div>
          </div>
          {featured && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-4">{review.content}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div>
            <span className="font-medium">{review.customerName}</span>
            <span className="mx-2">•</span>
            <span>{review.location}</span>
          </div>
          <div>{formatDate(review.date)}</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {review.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {review.verified && (
              <span className="text-green-600 text-xs font-medium">✓ Verified</span>
            )}
            <span className="text-gray-500 text-sm">{review.helpful} helpful</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ServiceRatingCardProps {
  service: ServiceReview;
}

const ServiceRatingCard: React.FC<ServiceRatingCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
      <div className="text-yellow-400 text-2xl mb-2">{renderStars(service.averageRating)}</div>
      <div className="text-2xl font-bold text-blue-600 mb-1">{service.averageRating.toFixed(1)}</div>
      <div className="text-sm text-gray-600">{service.reviewCount} reviews</div>
    </div>
  );
};

// Add displayName for React DevTools
Reviews.displayName = 'Reviews';
ReviewCard.displayName = 'ReviewCard';
ServiceRatingCard.displayName = 'ServiceRatingCard';

export default Reviews; 