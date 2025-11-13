import { api } from '../services/service.apiSW';

export interface Review {
  id: number;
  customerName: string;
  location: string;
  rating: number;
  date: string;
  service: string;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  images: string[];
  tags: string[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  fiveStarReviews: number;
  fourStarReviews: number;
  threeStarReviews: number;
  twoStarReviews: number;
  oneStarReviews: number;
  verifiedReviews: number;
  totalHelpful: number;
}

export interface ServiceReview {
  id: string;
  name: string;
  averageRating: number;
  reviewCount: number;
}

export interface ReviewsData {
  reviews: Review[];
  stats: ReviewStats;
  services: ServiceReview[];
}

export async function fetchReviewsData(useUserApi: boolean = false): Promise<ReviewsData> {
  try {
    console.log('🚀 Fetching reviews data from API...', { useUserApi });
    
    // Use user-specific API if authenticated, otherwise use public API
    const response = useUserApi ? await api.getPrivateReviews() : await api.getReviews();
    console.log('📡 Reviews API response:', response);
    
    // Handle different response formats
    let reviews: Review[] = [];
    let stats: ReviewStats = {
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
    let services: ServiceReview[] = [];
    
    if (response && response.reviews && response.stats && response.services) {
      reviews = Array.isArray(response.reviews) ? response.reviews : [];
      stats = response.stats || stats;
      services = Array.isArray(response.services) ? response.services : [];
      console.log('✅ Reviews data loaded successfully');
    } else if (response && response.success && response.data) {
      reviews = Array.isArray(response.data.reviews) ? response.data.reviews : [];
      stats = response.data.stats || stats;
      services = Array.isArray(response.data.services) ? response.data.services : [];
      console.log('✅ Reviews data loaded from wrapped response');
    } else if (response && response.reviews) {
      // Handle case where only reviews array is present
      reviews = Array.isArray(response.reviews) ? response.reviews : [];
      services = Array.isArray(response.services) ? response.services : [];
      // Calculate stats from reviews if not provided
      if (reviews.length > 0) {
        stats = calculateStatsFromReviews(reviews);
      }
      console.log('✅ Reviews data loaded - calculated stats from reviews');
    } else {
      // Return empty data structure instead of throwing error
      console.warn('⚠️ No reviews data found, returning empty structure');
      return { 
        reviews: [],
        stats: stats,
        services: []
      };
    }
    
    // Ensure stats reflect actual review count
    if (stats.totalReviews === 0 && reviews.length > 0) {
      stats = calculateStatsFromReviews(reviews);
    }
    
    console.log('📊 Final reviews data:', {
      reviewsCount: reviews.length,
      totalReviews: stats.totalReviews,
      servicesCount: services.length
    });
    
    return {
      reviews,
      stats,
      services
    };
  } catch (error) {
    console.error('❌ Error loading reviews data:', error);
    // Return empty data structure instead of throwing
    return {
      reviews: [],
      stats: {
        averageRating: 0,
        totalReviews: 0,
        fiveStarReviews: 0,
        fourStarReviews: 0,
        threeStarReviews: 0,
        twoStarReviews: 0,
        oneStarReviews: 0,
        verifiedReviews: 0,
        totalHelpful: 0
      },
      services: []
    };
  }
}

// Helper function to calculate stats from reviews array
function calculateStatsFromReviews(reviews: Review[]): ReviewStats {
  if (!reviews || reviews.length === 0) {
    return {
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
  }

  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageRating = totalRating / totalReviews;

  const ratingCounts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  reviews.forEach(review => {
    const rating = review.rating || 0;
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating as keyof typeof ratingCounts]++;
    }
  });

  const verifiedReviews = reviews.filter(review => review.verified).length;
  const totalHelpful = reviews.reduce((sum, review) => sum + (review.helpful || 0), 0);

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    fiveStarReviews: ratingCounts[5],
    fourStarReviews: ratingCounts[4],
    threeStarReviews: ratingCounts[3],
    twoStarReviews: ratingCounts[2],
    oneStarReviews: ratingCounts[1],
    verifiedReviews,
    totalHelpful
  };
}

export interface SubmitReviewData {
  service: string;
  rating: number;
  title: string;
  content: string;
  location?: string;
  tags?: string[];
  images?: string[];
}

export async function submitReview(reviewData: SubmitReviewData): Promise<Review> {
  try {
    console.log('🚀 Submitting review...', reviewData);
    
    // Submit review via API - use POST method with authentication
    const response = await api.makeRequest('/v0/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
      headers: {
        'Content-Type': 'application/json'
      }
    }, true); // Requires authentication
    
    console.log('📡 Submit review API response:', response);
    
    if (response && response.review) {
      console.log('✅ Review submitted successfully');
      return response.review as Review;
    } else if (response && response.success && response.data && response.data.review) {
      console.log('✅ Review submitted from wrapped response');
      return response.data.review as Review;
    } else if (response && (response as any).id) {
      // Handle case where response is the review directly
      console.log('✅ Review submitted - response is review object');
      return response as Review;
    } else {
      console.warn('⚠️ Unexpected submit review response format:', response);
      throw new Error('Invalid submit review response format');
    }
  } catch (error) {
    console.error('❌ Error submitting review:', error);
    throw new Error('Failed to submit review');
  }
}

export function getTopReviews(reviews: Review[], limit: number = 5): Review[] {
  if (!reviews || !Array.isArray(reviews)) {
    return [];
  }
  return reviews
    .sort((a, b) => b.helpful - a.helpful)
    .slice(0, limit);
}

export function getReviewsByService(reviews: Review[], serviceName: string): Review[] {
  if (!reviews || !Array.isArray(reviews)) {
    return [];
  }
  return reviews.filter(review => review.service === serviceName);
}

export function getReviewsByRating(reviews: Review[], rating: number): Review[] {
  if (!reviews || !Array.isArray(reviews)) {
    return [];
  }
  return reviews.filter(review => review.rating === rating);
}

export function searchReviews(reviews: Review[], searchTerm: string): Review[] {
  const searchResults: Review[] = [];
  const term = searchTerm.toLowerCase();
  
  if (!reviews || !Array.isArray(reviews)) {
    return searchResults;
  }
  
  reviews.forEach(review => {
    if (
      review.customerName.toLowerCase().includes(term) ||
      review.location.toLowerCase().includes(term) ||
      review.service.toLowerCase().includes(term) ||
      review.title.toLowerCase().includes(term) ||
      review.content.toLowerCase().includes(term) ||
      (review.tags && Array.isArray(review.tags) && review.tags.some(tag => tag.toLowerCase().includes(term)))
    ) {
      searchResults.push(review);
    }
  });
  
  return searchResults;
}

export function getVerifiedReviews(reviews: Review[]): Review[] {
  if (!reviews || !Array.isArray(reviews)) {
    return [];
  }
  return reviews.filter(review => review.verified);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
} 