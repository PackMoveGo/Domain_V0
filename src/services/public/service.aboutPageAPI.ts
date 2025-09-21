/**
 * About Page API Service
 * 
 * This service handles all API calls needed for the about page including:
 * - Company information
 * - Team data
 * - Statistics
 * - Navigation data
 * - Recent moves count
 * 
 * Features:
 * - Centralized API calls for about page
 * - Data caching for performance
 * - Error handling and fallbacks
 * - Public endpoints (no authentication required)
 */

import { api } from '../service.apiSW';
import { handleApiError, getFailedEndpoints, has503Errors } from '../../util/apiErrorHandler';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CompanyInfo {
  title: string;
  description: string;
  story: string;
  mission: string;
  values: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  founded: string;
  location: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: number;
  specialties: string[];
  image?: string;
  bio?: string;
}

export interface Statistics {
  totalMoves: number;
  customerRating: number;
  yearsExperience: number;
  satisfactionRate: number;
}

export interface NavItem {
  id: string;
  path: string;
  label: string;
  order?: number;
  isVisible?: boolean;
  children?: NavItem[];
}

export interface AboutPageData {
  companyInfo: CompanyInfo;
  teamMembers: TeamMember[];
  statistics: Statistics;
  navItems: NavItem[];
  totalMovesCount: number;
  lastUpdated: string;
}

export interface AboutPageServiceData {
  nav: any;
  about: any;
  totalMovesCount: number;
  health: any;
  lastUpdated: string;
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

  clearExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

const aboutPageCache = new AboutPageCache();

// =============================================================================
// API CALL FUNCTIONS
// =============================================================================

/**
 * Get company information from the API
 */
export const getCompanyInfo = async (): Promise<CompanyInfo> => {
  const cacheKey = 'company_info';
  const cached = aboutPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached company info data');
    return cached;
  }

  try {
    console.log('🔧 Fetching company info from API service...');
    const response = await api.getAbout() as any;
    
    const companyInfo: CompanyInfo = {
      title: response.title || 'About Pack Move Go',
      description: response.description || 'Pack Move Go is a dedicated moving company in Orange County committed to helping people move in and out and transport their belongings.',
      story: response.story || 'Founded in Orange County, Pack Move Go began with a simple mission: to make moving stress-free and reliable for families and businesses.',
      mission: response.mission || 'We\'re driven by our commitment to excellence and customer satisfaction',
      values: response.values || [
        {
          title: 'Reliability',
          description: 'We show up on time, every time, and deliver what we promise. Your trust is our most valuable asset.',
          icon: '✓'
        },
        {
          title: 'Care',
          description: 'We treat your belongings with the same care we would our own. Every item matters to us.',
          icon: '❤️'
        },
        {
          title: 'Service',
          description: 'Exceptional customer service is at the heart of everything we do. Your satisfaction is our priority.',
          icon: '👥'
        }
      ],
      founded: response.founded || '2020',
      location: response.location || 'Orange County, CA'
    };

    aboutPageCache.set(cacheKey, companyInfo);
    console.log('✅ Company info loaded');
    return companyInfo;
  } catch (error) {
    console.error('❌ Failed to fetch company info:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Get team members from the API
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const cacheKey = 'team_members';
  const cached = aboutPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached team members data');
    return cached;
  }

  try {
    console.log('🔧 Fetching team members from API service...');
    const response = await api.getAbout() as any;
    const members = response.team || response.teamMembers || response || [];
    
    const teamMembers: TeamMember[] = members.map((member: any) => ({
      id: member.id || member._id || `member-${Math.random().toString(36).substr(2, 9)}`,
      name: member.name || 'Team Member',
      role: member.role || 'Mover',
      experience: member.experience || 0,
      specialties: member.specialties || [],
      image: member.image,
      bio: member.bio
    }));

    aboutPageCache.set(cacheKey, teamMembers);
    console.log('✅ Team members loaded:', teamMembers.length);
    return teamMembers;
  } catch (error) {
    console.error('❌ Failed to fetch team members:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Get statistics from the API
 */
export const getStatistics = async (): Promise<Statistics> => {
  const cacheKey = 'statistics';
  const cached = aboutPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached statistics data');
    return cached;
  }

  try {
    console.log('🔧 Fetching statistics from API service...');
    const response = await api.getAbout() as any;
    
    const statistics: Statistics = {
      totalMoves: response.totalMoves || 500,
      customerRating: response.customerRating || 5.0,
      yearsExperience: response.yearsExperience || 4,
      satisfactionRate: response.satisfactionRate || 100
    };

    aboutPageCache.set(cacheKey, statistics);
    console.log('✅ Statistics loaded');
    return statistics;
  } catch (error) {
    console.error('❌ Failed to fetch statistics:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};


/**
 * Get total moves count from the API
 */
export const getTotalMovesCount = async (): Promise<number> => {
  const cacheKey = 'total_moves_count';
  const cached = aboutPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached total moves count data');
    return cached;
  }

  try {
    console.log('🔧 Fetching total moves count from API service...');
    const count = await api.getTotalRecentMovesCount();

    aboutPageCache.set(cacheKey, count);
    console.log('✅ Total moves count loaded:', count);
    return count;
  } catch (error) {
    console.error('❌ Failed to fetch total moves count:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

// =============================================================================
// ABOUT PAGE DATA FUNCTIONS
// =============================================================================

/**
 * Get about page data with error handling
 */
export const getAboutPageData = async (): Promise<AboutPageServiceData> => {
  try {
    console.log('🎯 [ABOUT-PAGE] Loading about page data...');
    
    // Load all about page data using the API service
    const [navData, aboutData, totalMovesData, healthData] = await Promise.allSettled([
      api.getNav(),                    // /v0/nav
      api.getAbout(),                  // /v0/about
      api.getTotalRecentMovesCount(),  // /v0/recentMoves/total
      api.checkHealth()                // /v0/health
    ]);
    
    const result: AboutPageServiceData = {
      nav: navData.status === 'fulfilled' ? navData.value : null,
      about: aboutData.status === 'fulfilled' ? aboutData.value : null,
      totalMovesCount: totalMovesData.status === 'fulfilled' ? totalMovesData.value : 500,
      health: healthData.status === 'fulfilled' ? healthData.value : null,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ [ABOUT-PAGE] About page data loaded successfully');
    return result;
  } catch (error) {
    console.error('❌ [ABOUT-PAGE] Failed to load about page data:', error);
    throw error;
  }
};

/**
 * Check if there are any 503 errors in about page data
 */
export const hasAboutPage503Errors = (): boolean => {
  return has503Errors();
};

/**
 * Get about page failed endpoints
 */
export const getAboutPageFailedEndpoints = (): string[] => {
  return getFailedEndpoints();
};

// =============================================================================
// INDIVIDUAL DATA LOADING FUNCTIONS
// =============================================================================

/**
 * Load company info data with error handling
 */
export const loadCompanyInfoData = async () => {
  try {
    console.log('🎯 [LOADER] Loading company info data...');
    const data = await getCompanyInfo();
    console.log('✅ [LOADER] Company info data loaded successfully');
    return { data, error: null, loading: false };
  } catch (error) {
    console.error('❌ [LOADER] Company info data failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load company info';
    return { data: null, error: errorMessage, loading: false };
  }
};

/**
 * Load team members data with error handling
 */
export const loadTeamMembersData = async () => {
  try {
    console.log('🎯 [LOADER] Loading team members data...');
    const data = await getTeamMembers();
    console.log('✅ [LOADER] Team members data loaded successfully');
    return { data, error: null, loading: false };
  } catch (error) {
    console.error('❌ [LOADER] Team members data failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load team members';
    return { data: null, error: errorMessage, loading: false };
  }
};

/**
 * Load statistics data with error handling
 */
export const loadStatisticsData = async () => {
  try {
    console.log('🎯 [LOADER] Loading statistics data...');
    const data = await getStatistics();
    console.log('✅ [LOADER] Statistics data loaded successfully');
    return { data, error: null, loading: false };
  } catch (error) {
    console.error('❌ [LOADER] Statistics data failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load statistics';
    return { data: null, error: errorMessage, loading: false };
  }
};

// =============================================================================
// MAIN API FUNCTION
// =============================================================================

/**
 * Get all about page data from the API
 * This is the main function that should be called to load about page data
 */
export const API_AboutPage = async (): Promise<AboutPageData> => {
  console.log('🚀 Loading about page data...');
  
  try {
    // Get consolidated data from the API service
    const consolidatedData = await api.getAboutPageData();
    
    // Transform the consolidated data to match our interface
    const aboutPageData: AboutPageData = {
      companyInfo: {
        title: consolidatedData.about?.title || 'About Pack Move Go',
        description: consolidatedData.about?.description || 'Pack Move Go is a dedicated moving company in Orange County committed to helping people move in and out and transport their belongings.',
        story: consolidatedData.about?.story || 'Founded in Orange County, Pack Move Go began with a simple mission: to make moving stress-free and reliable for families and businesses.',
        mission: consolidatedData.about?.mission || 'We\'re driven by our commitment to excellence and customer satisfaction',
        values: consolidatedData.about?.values || [
          {
            title: 'Reliability',
            description: 'We show up on time, every time, and deliver what we promise. Your trust is our most valuable asset.',
            icon: '✓'
          },
          {
            title: 'Care',
            description: 'We treat your belongings with the same care we would our own. Every item matters to us.',
            icon: '❤️'
          },
          {
            title: 'Service',
            description: 'Exceptional customer service is at the heart of everything we do. Your satisfaction is our priority.',
            icon: '👥'
          }
        ],
        founded: consolidatedData.about?.founded || '2020',
        location: consolidatedData.about?.location || 'Orange County, CA'
      },
      teamMembers: consolidatedData.about?.team || consolidatedData.about?.teamMembers || [],
      statistics: {
        totalMoves: consolidatedData.totalMovesCount || 500,
        customerRating: consolidatedData.about?.customerRating || 5.0,
        yearsExperience: consolidatedData.about?.yearsExperience || 4,
        satisfactionRate: consolidatedData.about?.satisfactionRate || 100
      },
      navItems: [],
      totalMovesCount: consolidatedData.totalMovesCount || 500,
      lastUpdated: new Date().toISOString()
    };

    // Navigation items are now static (no API call needed)

    // Transform team members if available
    if (consolidatedData.about?.team || consolidatedData.about?.teamMembers) {
      const members = consolidatedData.about?.team || consolidatedData.about?.teamMembers || [];
      aboutPageData.teamMembers = members.map((member: any) => ({
        id: member.id || member._id || `member-${Math.random().toString(36).substr(2, 9)}`,
        name: member.name || 'Team Member',
        role: member.role || 'Mover',
        experience: member.experience || 0,
        specialties: member.specialties || [],
        image: member.image,
        bio: member.bio
      }));
    }

    console.log('✅ About page data loaded successfully:', {
      companyInfo: !!aboutPageData.companyInfo,
      teamMembers: aboutPageData.teamMembers.length,
      statistics: !!aboutPageData.statistics,
      navItems: aboutPageData.navItems.length,
      totalMovesCount: aboutPageData.totalMovesCount
    });

    return aboutPageData;
  } catch (error) {
    console.error('❌ Failed to load about page data:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Comprehensive About Page Data Controller with Modal Integration
 * Loads all data needed for the about page including nav, auth, and total moves
 * Uses modal middleware for error handling
 */
export const getComprehensiveAboutPageData = async () => {
  console.log('🚀 [CONTROLLER] Loading comprehensive about page data with modal integration...');
  
  try {
    // Load all about page data using the API service with modal middleware
    const [navData, aboutData, totalMovesData, healthData] = await Promise.allSettled([
      api.getNav(),                    // /v0/nav
      api.getAbout(),                  // /v0/about
      api.getTotalRecentMovesCount(),  // /v0/recentMoves/total
      api.checkHealth()                // /v0/health
    ]);
    
    // Process the results
    const result = {
      nav: navData.status === 'fulfilled' ? navData.value : null,
      about: aboutData.status === 'fulfilled' ? aboutData.value : null,
      totalMovesCount: totalMovesData.status === 'fulfilled' ? totalMovesData.value : 500,
      health: healthData.status === 'fulfilled' ? healthData.value : null
    };
    
    // Check if any API calls failed and show modal
    const failedEndpoints = [navData, aboutData, totalMovesData, healthData]
      .map((result, index) => result.status === 'rejected' ? ['/v0/nav', '/v0/about', '/v0/recentMoves/total', '/v0/health'][index] : null)
      .filter((endpoint): endpoint is string => endpoint !== null);
    
    // Show modal if there are failed endpoints
    if (failedEndpoints.length > 0) {
      console.log('🚨 [CONTROLLER] Some endpoints failed, showing modal:', failedEndpoints);
      
      // Show modal using the API service
      api.showApiFailureModal(failedEndpoints, true);
    }
    
    console.log('✅ [CONTROLLER] Comprehensive about page data loaded successfully:', {
      nav: !!result.nav,
      about: !!result.about,
      totalMovesCount: result.totalMovesCount,
      health: !!result.health,
      failedEndpoints: failedEndpoints
    });
    
    return result;
  } catch (error) {
    console.error('❌ [CONTROLLER] Failed to load comprehensive about page data:', error);
    
    // Show modal for any error
    api.showApiFailureModal(['API call failed'], true);
    
    throw error;
  }
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
    companyInfo: aboutPageCache.get('company_info') || null,
    teamMembers: aboutPageCache.get('team_members') || [],
    statistics: aboutPageCache.get('statistics') || null,
    navItems: aboutPageCache.get('navigation_items') || [],
    totalMovesCount: aboutPageCache.get('total_moves_count') || 500
  };
};

/**
 * Check if about page data is cached and not expired
 */
export const isAboutPageDataCached = (): boolean => {
  return aboutPageCache.get('company_info') !== null;
};

// =============================================================================
// MODAL INTEGRATION FUNCTIONS
// =============================================================================

/**
 * Get the current modal props from the API service
 */
export const getApiFailureModalProps = () => {
  return api.getApiFailureModalProps();
};

/**
 * Get the ApiFailureModal component with middleware integration
 * This function returns the modal component that's managed by the middleware
 */
export const getApiFailureModalComponent = () => {
  return api.getApiFailureModalComponent();
};

/**
 * Get current modal state
 */
export const getModalState = () => {
  return api.getModalState();
};

/**
 * Hide the API failure modal
 */
export const hideApiFailureModal = () => {
  api.hideApiFailureModal();
};

/**
 * Add a listener for modal state changes
 */
export const addModalStateListener = (listener: () => void) => {
  api.addModalStateListener(listener);
};

/**
 * Remove a listener for modal state changes
 */
export const removeModalStateListener = (listener: () => void) => {
  api.removeModalStateListener(listener);
};

/**
 * Get comprehensive error status for the about page
 * Returns both failed endpoints and 503 error status
 */
export const getAboutPageErrorStatus = () => {
  return {
    failedEndpoints: getFailedEndpoints(),
    has503Error: has503Errors(),
    totalFailedEndpoints: getFailedEndpoints().length
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Main API Functions
  API_AboutPage,
  getComprehensiveAboutPageData,
  
  // Individual Data Functions
  getCompanyInfo,
  getTeamMembers,
  getStatistics,
  getTotalMovesCount,
  loadCompanyInfoData,
  loadTeamMembersData,
  loadStatisticsData,
  
  // Cache Management
  clearAboutPageCache,
  getCachedAboutPageData,
  isAboutPageDataCached,
  
  // Modal Integration Functions
  getApiFailureModalProps,
  getApiFailureModalComponent,
  getModalState,
  hideApiFailureModal,
  addModalStateListener,
  removeModalStateListener,
  getAboutPageErrorStatus
};
