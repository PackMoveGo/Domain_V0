/**
 * Recent Moves API - Public API
 * 
 * This service handles recent moves-related API calls that don't require authentication.
 * Used for displaying recent moves and testimonials on the public website.
 */

import { api } from '../service.apiSW';
import { handleApiError } from '../../util/apiErrorHandler';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface RecentMove {
  id: string;
  customerName: string;
  customerInitials?: string;
  fromLocation: string;
  toLocation: string;
  moveDate: string;
  moveType: string;
  rating: number;
  review: string;
  images?: string[];
  isVerified: boolean;
  isFeatured: boolean;
  serviceType: string;
  duration: string;
  distance?: number;
  testimonial?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentMovesResponse {
  moves: RecentMove[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

// =============================================================================
// RECENT MOVES API FUNCTIONS
// =============================================================================

/**
 * Get all recent moves
 */
export const getAllRecentMoves = async (): Promise<RecentMove[]> => {
  try {
    console.log('🔧 Fetching all recent moves from public API...');
    const response = await api.makeRequest('/v0/recentMoves') as any;
    
    const moves: RecentMove[] = response.moves?.map((move: any) => ({
      id: move.id || move._id,
      customerName: move.customerName || move.customer_name || 'Anonymous',
      customerInitials: move.customerInitials || move.customer_initials || 
        (move.customerName ? move.customerName.split(' ').map((n: string) => n[0]).join('') : 'A'),
      fromLocation: move.fromLocation || move.from_location || 'Unknown',
      toLocation: move.toLocation || move.to_location || 'Unknown',
      moveDate: move.moveDate || move.move_date || new Date().toISOString(),
      moveType: move.moveType || move.move_type || 'Residential',
      rating: move.rating || 5,
      review: move.review || move.testimonial || 'Great service!',
      images: move.images || [],
      isVerified: move.isVerified || move.is_verified || false,
      isFeatured: move.isFeatured || move.is_featured || false,
      serviceType: move.serviceType || move.service_type || 'Moving',
      duration: move.duration || '1 day',
      distance: move.distance,
      testimonial: move.testimonial || move.review,
      createdAt: move.createdAt || move.created_at || new Date().toISOString(),
      updatedAt: move.updatedAt || move.updated_at || new Date().toISOString()
    })) || [];

    console.log('✅ Recent moves loaded:', moves.length);
    return moves;
  } catch (error) {
    console.error('❌ Failed to fetch recent moves:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Recent moves API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/recentMoves', {
        context: 'Recent Moves API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Recent moves temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/recentMoves', {
      context: 'Recent Moves API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return empty array for fallback
    return [];
  }
};

/**
 * Get recent moves by page
 */
export const getRecentMovesByPage = async (page: number = 1, limit: number = 10): Promise<RecentMovesResponse> => {
  try {
    console.log('🔧 Fetching recent moves by page:', { page, limit });
    const response = await api.makeRequest(`/v0/recentMoves?page=${page}&limit=${limit}`) as any;
    
    const moves: RecentMove[] = response.moves?.map((move: any) => ({
      id: move.id || move._id,
      customerName: move.customerName || move.customer_name || 'Anonymous',
      customerInitials: move.customerInitials || move.customer_initials || 
        (move.customerName ? move.customerName.split(' ').map((n: string) => n[0]).join('') : 'A'),
      fromLocation: move.fromLocation || move.from_location || 'Unknown',
      toLocation: move.toLocation || move.to_location || 'Unknown',
      moveDate: move.moveDate || move.move_date || new Date().toISOString(),
      moveType: move.moveType || move.move_type || 'Residential',
      rating: move.rating || 5,
      review: move.review || move.testimonial || 'Great service!',
      images: move.images || [],
      isVerified: move.isVerified || move.is_verified || false,
      isFeatured: move.isFeatured || move.is_featured || false,
      serviceType: move.serviceType || move.service_type || 'Moving',
      duration: move.duration || '1 day',
      distance: move.distance,
      testimonial: move.testimonial || move.review,
      createdAt: move.createdAt || move.created_at || new Date().toISOString(),
      updatedAt: move.updatedAt || move.updated_at || new Date().toISOString()
    })) || [];

    const result: RecentMovesResponse = {
      moves,
      totalCount: response.totalCount || response.total_count || moves.length,
      hasMore: response.hasMore || response.has_more || false,
      nextPage: response.nextPage || response.next_page
    };

    console.log('✅ Recent moves by page loaded:', result.moves.length);
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch recent moves by page:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Recent moves by page API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/recentMoves', {
        context: 'Recent Moves by Page API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Recent moves by page temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/recentMoves', {
      context: 'Recent Moves by Page API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return empty response for fallback
    return {
      moves: [],
      totalCount: 0,
      hasMore: false
    };
  }
};

/**
 * Get featured recent moves
 */
export const getFeaturedRecentMoves = async (limit: number = 6): Promise<RecentMove[]> => {
  try {
    console.log('🔧 Fetching featured recent moves...');
    const response = await api.makeRequest(`/v0/recentMoves/featured?limit=${limit}`) as any;
    
    const moves: RecentMove[] = response.moves?.map((move: any) => ({
      id: move.id || move._id,
      customerName: move.customerName || move.customer_name || 'Anonymous',
      customerInitials: move.customerInitials || move.customer_initials || 
        (move.customerName ? move.customerName.split(' ').map((n: string) => n[0]).join('') : 'A'),
      fromLocation: move.fromLocation || move.from_location || 'Unknown',
      toLocation: move.toLocation || move.to_location || 'Unknown',
      moveDate: move.moveDate || move.move_date || new Date().toISOString(),
      moveType: move.moveType || move.move_type || 'Residential',
      rating: move.rating || 5,
      review: move.review || move.testimonial || 'Great service!',
      images: move.images || [],
      isVerified: move.isVerified || move.is_verified || false,
      isFeatured: true,
      serviceType: move.serviceType || move.service_type || 'Moving',
      duration: move.duration || '1 day',
      distance: move.distance,
      testimonial: move.testimonial || move.review,
      createdAt: move.createdAt || move.created_at || new Date().toISOString(),
      updatedAt: move.updatedAt || move.updated_at || new Date().toISOString()
    })) || [];

    console.log('✅ Featured recent moves loaded:', moves.length);
    return moves;
  } catch (error) {
    console.error('❌ Failed to fetch featured recent moves:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Featured recent moves API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/recentMoves/featured', {
        context: 'Featured Recent Moves API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Featured recent moves temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/recentMoves/featured', {
      context: 'Featured Recent Moves API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return empty array for fallback
    return [];
  }
};

/**
 * Get recent moves by service type
 */
export const getRecentMovesByServiceType = async (serviceType: string): Promise<RecentMove[]> => {
  try {
    console.log('🔧 Fetching recent moves by service type:', serviceType);
    const response = await api.makeRequest(`/v0/recentMoves/service/${serviceType}`) as any;
    
    const moves: RecentMove[] = response.moves?.map((move: any) => ({
      id: move.id || move._id,
      customerName: move.customerName || move.customer_name || 'Anonymous',
      customerInitials: move.customerInitials || move.customer_initials || 
        (move.customerName ? move.customerName.split(' ').map((n: string) => n[0]).join('') : 'A'),
      fromLocation: move.fromLocation || move.from_location || 'Unknown',
      toLocation: move.toLocation || move.to_location || 'Unknown',
      moveDate: move.moveDate || move.move_date || new Date().toISOString(),
      moveType: move.moveType || move.move_type || 'Residential',
      rating: move.rating || 5,
      review: move.review || move.testimonial || 'Great service!',
      images: move.images || [],
      isVerified: move.isVerified || move.is_verified || false,
      isFeatured: move.isFeatured || move.is_featured || false,
      serviceType: serviceType,
      duration: move.duration || '1 day',
      distance: move.distance,
      testimonial: move.testimonial || move.review,
      createdAt: move.createdAt || move.created_at || new Date().toISOString(),
      updatedAt: move.updatedAt || move.updated_at || new Date().toISOString()
    })) || [];

    console.log('✅ Recent moves by service type loaded:', moves.length);
    return moves;
  } catch (error) {
    console.error('❌ Failed to fetch recent moves by service type:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Recent moves by service type API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/recentMoves/service', {
        context: 'Recent Moves by Service Type API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Recent moves by service type temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/recentMoves/service', {
      context: 'Recent Moves by Service Type API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return empty array for fallback
    return [];
  }
};

/**
 * Get total count of recent moves
 */
export const getTotalRecentMovesCount = async (): Promise<number> => {
  try {
    console.log('🔧 Fetching total recent moves count...');
    const response = await api.makeRequest('/v0/recentMoves/total') as any;
    
    const totalCount = response.totalCount || response.total_count || response.count || 0;
    console.log('✅ Total recent moves count loaded:', totalCount);
    return totalCount;
  } catch (error) {
    console.error('❌ Failed to fetch total recent moves count:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Total recent moves count API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/recentMoves/total', {
        context: 'Total Recent Moves Count API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Total recent moves count temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/recentMoves/total', {
      context: 'Total Recent Moves Count API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return fallback count
    return 5000;
  }
};

/**
 * Get recent move by ID
 */
export const getRecentMoveById = async (moveId: string): Promise<RecentMove | null> => {
  try {
    console.log('🔧 Fetching recent move by ID:', moveId);
    const response = await api.makeRequest(`/v0/recentMoves/${moveId}`) as any;
    
    if (!response.move) return null;

    const move: RecentMove = {
      id: response.move.id || response.move._id,
      customerName: response.move.customerName || response.move.customer_name || 'Anonymous',
      customerInitials: response.move.customerInitials || response.move.customer_initials || 
        (response.move.customerName ? response.move.customerName.split(' ').map((n: string) => n[0]).join('') : 'A'),
      fromLocation: response.move.fromLocation || response.move.from_location || 'Unknown',
      toLocation: response.move.toLocation || response.move.to_location || 'Unknown',
      moveDate: response.move.moveDate || response.move.move_date || new Date().toISOString(),
      moveType: response.move.moveType || response.move.move_type || 'Residential',
      rating: response.move.rating || 5,
      review: response.move.review || response.move.testimonial || 'Great service!',
      images: response.move.images || [],
      isVerified: response.move.isVerified || response.move.is_verified || false,
      isFeatured: response.move.isFeatured || response.move.is_featured || false,
      serviceType: response.move.serviceType || response.move.service_type || 'Moving',
      duration: response.move.duration || '1 day',
      distance: response.move.distance,
      testimonial: response.move.testimonial || response.move.review,
      createdAt: response.move.createdAt || response.move.created_at || new Date().toISOString(),
      updatedAt: response.move.updatedAt || response.move.updated_at || new Date().toISOString()
    };

    console.log('✅ Recent move loaded:', move.customerName);
    return move;
  } catch (error) {
    console.error('❌ Failed to fetch recent move by ID:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Recent move by ID API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/recentMoves', {
        context: 'Recent Move by ID API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Recent move temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/recentMoves', {
      context: 'Recent Move by ID API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return null;
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getAllRecentMoves,
  getRecentMovesByPage,
  getFeaturedRecentMoves,
  getRecentMovesByServiceType,
  getRecentMoveById,
  getTotalRecentMovesCount
};
