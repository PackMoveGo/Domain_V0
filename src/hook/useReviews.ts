import { useState, useEffect, useCallback } from 'react';
import { fetchReviewsData, Review, ReviewStats, ServiceReview, submitReview, SubmitReviewData } from '../util/reviewsParser';
import { JWT_AUTH } from '../util/jwtAuth';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(() => {
    const hasToken = JWT_AUTH.hasToken();
    const isExpired = JWT_AUTH.isTokenExpired();
    return hasToken && !isExpired;
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const authenticated = checkAuth();
      setIsAuthenticated(authenticated);
      
      // Use user API if authenticated, otherwise use public API
      const reviewsData = await fetchReviewsData(authenticated);
      setReviews(reviewsData.reviews);
      setStats(reviewsData.stats);
      setServices(reviewsData.services);
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
  }, [checkAuth]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const refreshReviews = useCallback(() => {
    loadReviews();
  }, [loadReviews]);

  const submitUserReview = useCallback(async (reviewData: SubmitReviewData) => {
    try {
      if (!checkAuth()) {
        throw new Error('You must be logged in to submit a review');
      }
      
      // Review submission - no verbose logging needed
      const newReview = await submitReview(reviewData);
      
      // Refresh reviews after submission
      await loadReviews();
      
      console.log('✅ Review submitted successfully');
      return newReview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      console.error('❌ Review submission error:', err);
      throw new Error(errorMessage);
    }
  }, [checkAuth, loadReviews]);

  return {
    reviews,
    stats,
    services,
    isLoading,
    error,
    isAuthenticated,
    refreshReviews,
    submitReview: submitUserReview
  };
} 