import { useState, useEffect, useCallback } from 'react';
import { fetchReviewsData, Review, ReviewStats, ServiceReview } from '../util/reviewsParser';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    fiveStarReviews: 0,
    fourStarReviews: 0,
    threeStarReviews: 0,
    twoStarReviews: 0,
    oneStarReviews: 0,
    verifiedReviews: 0,
    totalHelpful: 0
  });
  const [services, setServices] = useState<ServiceReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading reviews data...');
      
      const reviewsData = await fetchReviewsData();
      setReviews(reviewsData.reviews);
      setStats(reviewsData.stats);
      setServices(reviewsData.services);
      console.log('✅ Reviews loaded successfully:', reviewsData.reviews.length, 'reviews,', reviewsData.services.length, 'services');
    } catch (err) {
      // Check if this is a 503 error
      if (err instanceof Error && (err as any).is503Error) {
        setError('503 Service Unavailable');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews';
        setError(errorMessage);
      }
      console.error('❌ Reviews loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const refreshReviews = useCallback(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    stats,
    services,
    isLoading,
    error,
    refreshReviews
  };
} 