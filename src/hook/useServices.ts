import { api } from '../services/service.apiSW';
import { normalizeServices, NormalizedService } from '../util/serviceNormalizer';
import { useState, useEffect } from 'react';

export const useServices = () => {
  const [services, setServices] = useState<NormalizedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await api.getServices();
        if (response && response.services) {
          setServices(normalizeServices(response.services));
        } else {
          setError('No services data received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
}; 