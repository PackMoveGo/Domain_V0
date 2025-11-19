import { useState, useEffect, useCallback } from 'react';
import { fetchReferralData, ReferralData } from '../util/referralParser';
import { logger } from '../util/logger';

export function useReferral() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferralData = useCallback(async () => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setIsLoading(true);
      setError(null);
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Request timeout - please try again'));
        }, 10000); // 10 second timeout
      });
      
      try {
        const data = await Promise.race([
          fetchReferralData(),
          timeoutPromise
        ]) as ReferralData;
        
        // Cancel timeout if API call succeeded
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        setReferralData(data);
        logger.debug('✅ Referral data loaded');
      } catch (raceError) {
        // Cancel timeout when error occurs
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Re-throw to be caught by outer catch
        throw raceError;
      }
    } catch (err) {
      // Prioritize 503 errors over timeout errors
      if (err instanceof Error && (err as any).is503Error) {
        setError('503 Service Unavailable');
      } else if (err instanceof Error && err.message.includes('timeout')) {
        setError('Request timeout - please try again');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load referral data';
        setError(errorMessage);
      }
      console.error('❌ Referral loading error:', err);
    } finally {
      // Clean up timeout if still active
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  const refreshReferralData = useCallback(() => {
    loadReferralData();
  }, [loadReferralData]);

  return {
    referralData,
    isLoading,
    error,
    refreshReferralData
  };
} 