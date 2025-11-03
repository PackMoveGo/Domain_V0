import { useState, useEffect, useCallback } from 'react';
import { fetchSuppliesData, SupplyCategory } from '../util/suppliesParser';

export function useSupplies() {
  const [supplies, setSupplies] = useState<SupplyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSupplies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading supplies data...');
      
      const suppliesData = await fetchSuppliesData();
      setSupplies(suppliesData.supplies);
      console.log('✅ Supplies loaded successfully:', suppliesData.supplies.length, 'categories');
    } catch (err) {
      // Check if this is a 503 error
      if (err instanceof Error && (err as any).is503Error) {
        setError('503 Service Unavailable');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load supplies';
        setError(errorMessage);
      }
      console.error('❌ Supplies loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupplies();
  }, [loadSupplies]);

  const refreshSupplies = useCallback(() => {
    loadSupplies();
  }, [loadSupplies]);

  return {
    supplies,
    isLoading,
    error,
    refreshSupplies
  };
} 