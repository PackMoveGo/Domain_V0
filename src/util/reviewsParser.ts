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

export async function fetchReviewsData(): Promise<ReviewsData> {
  try {
    console.log('🚀 Fetching reviews data from API...');
    
    // Use the new axiosApi method
    const response = await api.getReviews();
    console.log('📡 Reviews API response:', response);
    
    // Handle different response formats
    if (response && response.reviews && response.stats && response.services) {
      console.log('✅ Reviews data loaded successfully');
      return response as ReviewsData;
    } else if (response && response.success && response.data && response.data.reviews && response.data.stats && response.data.services) {
      console.log('✅ Reviews data loaded from wrapped response');
      return { 
        reviews: response.data.reviews, 
        stats: response.data.stats,
        services: response.data.services
      };
    } else {
      console.warn('⚠️ Unexpected reviews data format:', response);
      throw new Error('Invalid reviews data format');
    }
  } catch (error) {
    console.error('❌ Error loading reviews data:', error);
    throw new Error('Failed to load reviews data');
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