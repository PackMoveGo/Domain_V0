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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load referral data';
      console.error('❌ Referral loading error:', errorMessage);
      setError(errorMessage);
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