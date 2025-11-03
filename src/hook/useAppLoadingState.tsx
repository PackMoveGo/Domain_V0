import { useState, useEffect } from 'react';
import { useServicesData } from '../util/serviceParser';
import { useLocations } from './useLocations';
import { useReviews } from './useReviews';

export const useAppLoadingState = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);

  // Monitor multiple API calls
  const { isLoading: servicesLoading, error: servicesError } = useServicesData(false);
  const { isLoading: locationsLoading, error: locationsError } = useLocations();
  const { isLoading: reviewsLoading, error: reviewsError } = useReviews();

  useEffect(() => {
    // Check if any critical API is still loading
    const isLoading = servicesLoading || locationsLoading || reviewsLoading;
    
    // Check for any errors
    const errors = [servicesError, locationsError, reviewsError].filter(Boolean);
    const hasError = errors.length > 0;

    setIsAppLoading(isLoading);
    
    if (hasError) {
      setAppError(errors[0] || 'Failed to load app data');
    } else {
      setAppError(null);
    }
  }, [
    servicesLoading, 
    locationsLoading, 
    reviewsLoading,
    servicesError, 
    locationsError, 
    reviewsError
  ]);

  return {
    isAppLoading,
    appError,
    servicesLoading,
    locationsLoading,
    reviewsLoading
  };
}; 