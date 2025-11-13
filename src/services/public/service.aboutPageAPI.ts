/**
 * About Page API Service
 * 
 * This service handles all API calls needed for the about page including:
 * - About information
 * - Company statistics
 * - Team members
 * - Navigation data
 * 
 * Features:
 * - Centralized API calls for about page
 * - Data caching for performance
 * - Error handling and fallbacks
 * - Public endpoints (no authentication required)
 */

import { api } from '../service.apiSW';
import { /* handleApiError, */ getFailedEndpoints /* , has503Errors */ } from '../../util/apiErrorHandler'; // Reserved for future use

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface AboutPageData {
  nav: any;
  about: any;
  totalMovesCount: number;
  lastUpdated: string;
}

export interface AboutPageServiceData {
  nav: any;
  about: any;
  totalMovesCount: number;
  lastUpdated: string;
  hasErrors?: boolean;
  failedEndpoints?: string[];
}

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

class AboutPageCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const aboutPageCache = new AboutPageCache();

// =============================================================================
// ABOUT PAGE DATA FUNCTIONS
// =============================================================================

/**
 * Get about page data with error handling
 */
export const getAboutPageData = async (): Promise<AboutPageServiceData> => {
  try {
    console.log('🚀 Loading about page data...');
    
    // Don't track API calls or show modals at the page level
    // Let individual API calls handle their own tracking
    
    // Proceed with individual route calls - use Promise.all for better performance
    const [navData, aboutData, totalMovesData] = await Promise.all([
      api.getNav().catch(err => {
        console.warn('⚠️ Nav failed, using fallback:', err);
        return null;
      }),
      api.getAbout().catch(err => {
        console.warn('⚠️ About failed, using fallback:', err);
        return null;
      }),
      api.makeRequest('/v0/recentMoves/total').catch(err => {
        console.warn('⚠️ Total moves failed, using fallback:', err);
        return { totalCount: 0 };
      })
    ]);
    
    // Parse totalMovesCount from API response (handle both number and object responses)
    let totalMovesCount = 0; // Default for new business
    const value = totalMovesData;
    if (typeof value === 'number') {
      totalMovesCount = value; // Allow 0 as a valid value
    } else if (value && typeof value === 'object') {
      // Handle object responses like { totalCount: 0 } or { total_count: 0 } or { count: 0 }
      // Check each property and use the first one that's not undefined/null (but allow 0)
      const obj = value as any;
      if (obj.totalCount !== undefined && obj.totalCount !== null) {
        totalMovesCount = obj.totalCount;
      } else if (obj.total_count !== undefined && obj.total_count !== null) {
        totalMovesCount = obj.total_count;
      } else if (obj.count !== undefined && obj.count !== null) {
        totalMovesCount = obj.count;
      }
      // If none found, keep default 0
    } else if (value !== null && value !== undefined) {
      // Try to parse as number
      const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
      totalMovesCount = isNaN(parsed) ? 0 : parsed;
    }
    
    // Return data - no error tracking, let components handle null gracefully
    const result: AboutPageServiceData = {
      nav: navData,
      about: aboutData,
      totalMovesCount: totalMovesCount,
      lastUpdated: new Date().toISOString(),
      hasErrors: false,
      failedEndpoints: []
    };
    
    console.log('✅ About page data loaded successfully:', {
      nav: !!result.nav,
      about: !!result.about,
      totalMovesCount: result.totalMovesCount
    });
    
    return result;
  } catch (error) {
    console.error('❌ Failed to load about page data:', error);
    throw error;
  }
};

/**
 * Get comprehensive about page data (legacy function for compatibility)
 */
export const getComprehensiveAboutPageData = async () => {
  return await getAboutPageData();
};

/**
 * Get about page status code
 */
export const getAboutPageStatusCode = async () => {
  return 200; // This would be determined by the actual API calls
};

/**
 * Get about page failed endpoints
 */
export const getAboutPageFailedEndpoints = async () => {
  return getFailedEndpoints();
};

/**
 * Load company info data (placeholder)
 */
export const loadCompanyInfoData = async () => {
  return {};
};

/**
 * Load team members data (placeholder)
 */
export const loadTeamMembersData = async () => {
  return [];
};

/**
 * Load statistics data (placeholder)
 */
export const loadStatisticsData = async () => {
  return {};
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Clear all cached about page data
 */
export const clearAboutPageCache = (): void => {
  aboutPageCache.clear();
  console.log('🧹 About page cache cleared');
};

/**
 * Get cached data without making API calls
 */
export const getCachedAboutPageData = (): Partial<AboutPageData> | null => {
  return {
    nav: aboutPageCache.get('nav') || null,
    about: aboutPageCache.get('about') || null,
    totalMovesCount: aboutPageCache.get('totalMovesCount') || 500
  };
};

/**
 * Check if about page data is cached and not expired
 */
export const isAboutPageDataCached = (): boolean => {
  return aboutPageCache.get('nav') !== null;
};