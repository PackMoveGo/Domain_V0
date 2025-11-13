/**
 * Testimonials API - Public API
 * 
 * This service handles testimonial-related API calls that don't require authentication.
 * Used for displaying customer testimonials on the public website.
 */

import { api } from '../service.apiSW';
import { handleApiError } from '../../util/apiErrorHandler';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface Testimonial {
  id: string;
  customerName: string;
  customerInitials: string;
  location: string;
  rating: number;
  comment: string;
  moveDate: string;
  moveType: string;
  moveId?: string;
  isVerified: boolean;
  isFeatured: boolean;
  images?: string[];
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialStats {
  totalTestimonials: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentTestimonials: number;
  verifiedTestimonials: number;
}

// =============================================================================
// TESTIMONIAL API FUNCTIONS
// =============================================================================

/**
 * Get all testimonials
 */
export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  try {
    console.log('🔧 Fetching all testimonials from public API...');
    const response = await api.makeRequest('/v0/testimonials') as any;
    
    const testimonials: Testimonial[] = response.testimonials?.map((testimonial: any) => ({
      id: testimonial.id || testimonial._id,
      customerName: testimonial.customerName || testimonial.customer_name,
      customerInitials: testimonial.customerInitials || testimonial.customer_initials || 
        (testimonial.customerName ? testimonial.customerName.split(' ').map((n: string) => n[0]).join('') : 'C'),
      location: testimonial.location || testimonial.city,
      rating: testimonial.rating || 5,
      comment: testimonial.comment || testimonial.review || testimonial.testimonial,
      moveDate: testimonial.moveDate || testimonial.move_date,
      moveType: testimonial.moveType || testimonial.move_type || 'Residential',
      moveId: testimonial.moveId || testimonial.move_id,
      isVerified: testimonial.isVerified || testimonial.is_verified || false,
      isFeatured: testimonial.isFeatured || testimonial.is_featured || false,
      images: testimonial.images || [],
      videoUrl: testimonial.videoUrl || testimonial.video_url,
      createdAt: testimonial.createdAt || testimonial.created_at,
      updatedAt: testimonial.updatedAt || testimonial.updated_at
    })) || [];

    console.log('✅ Testimonials loaded:', testimonials.length);
    return testimonials;
  } catch (error) {
    console.error('❌ Failed to fetch testimonials:', error);
    
    // Check if it's a 503 error
    const is503Error = error instanceof Error && (
      error.message.includes('503') || 
      error.message.includes('Service Unavailable') ||
      (error as any).is503Error
    );
    
    if (is503Error) {
      console.warn('⚠️ Testimonials API returned 503 - Service Unavailable');
      // Don't throw, return empty array so page can still render
      return [];
    }
    
    // For other errors, also return empty array instead of throwing
    console.warn('⚠️ Testimonials API error, returning empty array');
    return [];
  }
};

/**
 * Get featured testimonials
 */
export const getFeaturedTestimonials = async (limit: number = 6): Promise<Testimonial[]> => {
  try {
    console.log('🔧 Fetching featured testimonials...');
    const response = await api.makeRequest(`/v0/testimonials/featured?limit=${limit}`) as any;
    
    const testimonials: Testimonial[] = response.testimonials?.map((testimonial: any) => ({
      id: testimonial.id || testimonial._id,
      customerName: testimonial.customerName || testimonial.customer_name,
      customerInitials: testimonial.customerInitials || testimonial.customer_initials || 
        (testimonial.customerName ? testimonial.customerName.split(' ').map((n: string) => n[0]).join('') : 'C'),
      location: testimonial.location || testimonial.city,
      rating: testimonial.rating || 5,
      comment: testimonial.comment || testimonial.review || testimonial.testimonial,
      moveDate: testimonial.moveDate || testimonial.move_date,
      moveType: testimonial.moveType || testimonial.move_type || 'Residential',
      moveId: testimonial.moveId || testimonial.move_id,
      isVerified: testimonial.isVerified || testimonial.is_verified || false,
      isFeatured: true,
      images: testimonial.images || [],
      videoUrl: testimonial.videoUrl || testimonial.video_url,
      createdAt: testimonial.createdAt || testimonial.created_at,
      updatedAt: testimonial.updatedAt || testimonial.updated_at
    })) || [];

    console.log('✅ Featured testimonials loaded:', testimonials.length);
    return testimonials;
  } catch (error) {
    console.error('❌ Failed to fetch featured testimonials:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Featured testimonials API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/testimonials/featured', {
        context: 'Featured Testimonials API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Featured testimonials temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/testimonials/featured', {
      context: 'Featured Testimonials API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get testimonials by rating
 */
export const getTestimonialsByRating = async (rating: number): Promise<Testimonial[]> => {
  try {
    console.log('🔧 Fetching testimonials by rating:', rating);
    const response = await api.makeRequest(`/v0/testimonials/rating/${rating}`) as any;
    
    const testimonials: Testimonial[] = response.testimonials?.map((testimonial: any) => ({
      id: testimonial.id || testimonial._id,
      customerName: testimonial.customerName || testimonial.customer_name,
      customerInitials: testimonial.customerInitials || testimonial.customer_initials || 
        (testimonial.customerName ? testimonial.customerName.split(' ').map((n: string) => n[0]).join('') : 'C'),
      location: testimonial.location || testimonial.city,
      rating: testimonial.rating || 5,
      comment: testimonial.comment || testimonial.review || testimonial.testimonial,
      moveDate: testimonial.moveDate || testimonial.move_date,
      moveType: testimonial.moveType || testimonial.move_type || 'Residential',
      moveId: testimonial.moveId || testimonial.move_id,
      isVerified: testimonial.isVerified || testimonial.is_verified || false,
      isFeatured: testimonial.isFeatured || testimonial.is_featured || false,
      images: testimonial.images || [],
      videoUrl: testimonial.videoUrl || testimonial.video_url,
      createdAt: testimonial.createdAt || testimonial.created_at,
      updatedAt: testimonial.updatedAt || testimonial.updated_at
    })) || [];

    console.log('✅ Testimonials by rating loaded:', testimonials.length);
    return testimonials;
  } catch (error) {
    console.error('❌ Failed to fetch testimonials by rating:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Testimonials by rating API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/testimonials/rating', {
        context: 'Testimonials by Rating API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Testimonials by rating temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/testimonials/rating', {
      context: 'Testimonials by Rating API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get recent testimonials
 */
export const getRecentTestimonials = async (limit: number = 10): Promise<Testimonial[]> => {
  try {
    console.log('🔧 Fetching recent testimonials...');
    const response = await api.makeRequest(`/v0/testimonials/recent?limit=${limit}`) as any;
    
    const testimonials: Testimonial[] = response.testimonials?.map((testimonial: any) => ({
      id: testimonial.id || testimonial._id,
      customerName: testimonial.customerName || testimonial.customer_name,
      customerInitials: testimonial.customerInitials || testimonial.customer_initials || 
        (testimonial.customerName ? testimonial.customerName.split(' ').map((n: string) => n[0]).join('') : 'C'),
      location: testimonial.location || testimonial.city,
      rating: testimonial.rating || 5,
      comment: testimonial.comment || testimonial.review || testimonial.testimonial,
      moveDate: testimonial.moveDate || testimonial.move_date,
      moveType: testimonial.moveType || testimonial.move_type || 'Residential',
      moveId: testimonial.moveId || testimonial.move_id,
      isVerified: testimonial.isVerified || testimonial.is_verified || false,
      isFeatured: testimonial.isFeatured || testimonial.is_featured || false,
      images: testimonial.images || [],
      videoUrl: testimonial.videoUrl || testimonial.video_url,
      createdAt: testimonial.createdAt || testimonial.created_at,
      updatedAt: testimonial.updatedAt || testimonial.updated_at
    })) || [];

    console.log('✅ Recent testimonials loaded:', testimonials.length);
    return testimonials;
  } catch (error) {
    console.error('❌ Failed to fetch recent testimonials:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Recent testimonials API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/testimonials/recent', {
        context: 'Recent Testimonials API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Recent testimonials temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/testimonials/recent', {
      context: 'Recent Testimonials API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get testimonial statistics
 */
export const getTestimonialStats = async (): Promise<TestimonialStats | null> => {
  try {
    console.log('🔧 Fetching testimonial statistics...');
    const response = await api.makeRequest('/v0/testimonials/stats') as any;
    
    if (!response.stats) return null;

    const stats: TestimonialStats = {
      totalTestimonials: response.stats.totalTestimonials || response.stats.total_testimonials || 0,
      averageRating: response.stats.averageRating || response.stats.average_rating || 0,
      ratingDistribution: {
        5: response.stats.ratingDistribution?.[5] || response.stats.rating_distribution?.[5] || 0,
        4: response.stats.ratingDistribution?.[4] || response.stats.rating_distribution?.[4] || 0,
        3: response.stats.ratingDistribution?.[3] || response.stats.rating_distribution?.[3] || 0,
        2: response.stats.ratingDistribution?.[2] || response.stats.rating_distribution?.[2] || 0,
        1: response.stats.ratingDistribution?.[1] || response.stats.rating_distribution?.[1] || 0
      },
      recentTestimonials: response.stats.recentTestimonials || response.stats.recent_testimonials || 0,
      verifiedTestimonials: response.stats.verifiedTestimonials || response.stats.verified_testimonials || 0
    };

    console.log('✅ Testimonial statistics loaded');
    return stats;
  } catch (error) {
    console.error('❌ Failed to fetch testimonial statistics:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Testimonial statistics API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/testimonials/stats', {
        context: 'Testimonial Statistics API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Testimonial statistics temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/testimonials/stats', {
      context: 'Testimonial Statistics API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return null;
  }
};

/**
 * Get testimonials by location
 */
export const getTestimonialsByLocation = async (location: string): Promise<Testimonial[]> => {
  try {
    console.log('🔧 Fetching testimonials by location:', location);
    const response = await api.makeRequest(`/v0/testimonials/location/${encodeURIComponent(location)}`) as any;
    
    const testimonials: Testimonial[] = response.testimonials?.map((testimonial: any) => ({
      id: testimonial.id || testimonial._id,
      customerName: testimonial.customerName || testimonial.customer_name,
      customerInitials: testimonial.customerInitials || testimonial.customer_initials || 
        (testimonial.customerName ? testimonial.customerName.split(' ').map((n: string) => n[0]).join('') : 'C'),
      location: testimonial.location || testimonial.city,
      rating: testimonial.rating || 5,
      comment: testimonial.comment || testimonial.review || testimonial.testimonial,
      moveDate: testimonial.moveDate || testimonial.move_date,
      moveType: testimonial.moveType || testimonial.move_type || 'Residential',
      moveId: testimonial.moveId || testimonial.move_id,
      isVerified: testimonial.isVerified || testimonial.is_verified || false,
      isFeatured: testimonial.isFeatured || testimonial.is_featured || false,
      images: testimonial.images || [],
      videoUrl: testimonial.videoUrl || testimonial.video_url,
      createdAt: testimonial.createdAt || testimonial.created_at,
      updatedAt: testimonial.updatedAt || testimonial.updated_at
    })) || [];

    console.log('✅ Testimonials by location loaded:', testimonials.length);
    return testimonials;
  } catch (error) {
    console.error('❌ Failed to fetch testimonials by location:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Testimonials by location API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/testimonials/location', {
        context: 'Testimonials by Location API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Testimonials by location temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/testimonials/location', {
      context: 'Testimonials by Location API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getAllTestimonials,
  getFeaturedTestimonials,
  getTestimonialsByRating,
  getRecentTestimonials,
  getTestimonialStats,
  getTestimonialsByLocation
};
