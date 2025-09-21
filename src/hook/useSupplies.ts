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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load supplies';
      console.error('❌ Supplies loading error:', errorMessage);
      setError(errorMessage);
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