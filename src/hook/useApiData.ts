import { useState, useEffect } from 'react';

interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useApiData<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    retry: fetchData,
  };
}