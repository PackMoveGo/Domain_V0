import { useState, useEffect, useCallback } from 'react';
import { getAllTestimonials, Testimonial } from '../services/routes/route.testimonalsAPI';

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTestimonials = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading testimonials data...');
      
      const testimonialsData = await getAllTestimonials();
      setTestimonials(testimonialsData);
      console.log('✅ Testimonials loaded successfully:', testimonialsData.length, 'testimonials');
    } catch (err) {
      // Check if this is a 503 error
      if (err instanceof Error && (err as any).is503Error) {
        setError('503 Service Unavailable');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load testimonials';
        setError(errorMessage);
      }
      console.error('❌ Testimonials loading error:', err);
      // Set empty array on error
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const refreshTestimonials = useCallback(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  return {
    testimonials,
    isLoading,
    error,
    refreshTestimonials
  };
}

