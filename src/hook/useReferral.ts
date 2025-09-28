import { useState, useEffect, useCallback } from 'react';
import { fetchReferralData, ReferralData } from '../util/referralParser';

export function useReferral() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferralData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading referral data...');
      
      const data = await fetchReferralData();
      setReferralData(data);
      console.log('✅ Referral data loaded successfully');
    } catch (err) {
      // Check if this is a 503 error
      if (err instanceof Error && (err as any).is503Error) {
        setError('503 Service Unavailable');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load referral data';
        setError(errorMessage);
      }
      console.error('❌ Referral loading error:', err);
    } finally {
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