/**
 * Navigation API - Public API
 * 
 * This service handles navigation-related API calls that don't require authentication.
 * Used for displaying navigation menu items on the public website.
 */

import { api } from '../service.apiSW';
import { handleApiError } from '../../util/apiErrorHandler';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface NavItem {
  id: string;
  path: string;
  label: string;
  order?: number;
  isVisible?: boolean;
  children?: NavItem[];
}

export interface NavigationResponse {
  mainNav: NavItem[];
  footerNav?: NavItem[];
  mobileNav?: NavItem[];
}

export interface NavigationConfig {
  scrollThreshold: number;
  animationDuration: number;
  searchBarHeight: number;
  headerHeight: number;
}

export interface NavigationState {
  showSearch: boolean;
  lastScrollY: number;
  upScrollDistance: number;
  isScrollingUp: boolean;
}

export interface NavigationControllerProps {
  forceHideSearch?: boolean;
  focusSearch?: boolean;
  isRelative?: boolean;
}

// =============================================================================
// NAVIGATION CONFIGURATION
// =============================================================================

export const NAVIGATION_CONFIG: NavigationConfig = {
  scrollThreshold: 80,
  animationDuration: 300,
  searchBarHeight: 8,
  headerHeight: 16
};

// =============================================================================
// NAVIGATION UTILITY FUNCTIONS
// =============================================================================

/**
 * Create initial navigation state
 */
export const createInitialNavigationState = (): NavigationState => ({
  showSearch: true,
  lastScrollY: 0,
  upScrollDistance: 0,
  isScrollingUp: false
});

/**
 * Calculate scroll direction and distance
 */
export const calculateScrollMetrics = (
  currentScrollY: number,
  lastScrollY: number,
  upScrollDistance: number
): { isScrollingUp: boolean; newUpScrollDistance: number } => {
  const isScrollingUp = currentScrollY < lastScrollY;
  
  let newUpScrollDistance = upScrollDistance;
  if (isScrollingUp) {
    newUpScrollDistance = upScrollDistance + (lastScrollY - currentScrollY);
  } else {
    newUpScrollDistance = 0;
  }
  
  return { isScrollingUp, newUpScrollDistance };
};

/**
 * Determine if search bar should be visible
 */
export const shouldShowSearchBar = (
  currentScrollY: number,
  upScrollDistance: number,
  scrollThreshold: number = NAVIGATION_CONFIG.scrollThreshold
): boolean => {
  return currentScrollY === 0 || upScrollDistance >= scrollThreshold;
};

/**
 * Create scroll event handler for navigation
 */
export const createScrollHandler = (
  setShowSearch: (show: boolean) => void,
  setLastScrollY: (y: number) => void,
  setUpScrollDistance: (distance: number) => void,
  setShowSearchProp?: (show: boolean) => void,
  lastScrollY: number = 0,
  upScrollDistance: number = 0
) => {
  let ticking = false;

  return () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const { isScrollingUp, newUpScrollDistance } = calculateScrollMetrics(
          currentScrollY,
          lastScrollY,
          upScrollDistance
        );

        const shouldShow = shouldShowSearchBar(currentScrollY, newUpScrollDistance);
        
        setShowSearch(shouldShow);
        if (typeof setShowSearchProp === 'function') {
          setShowSearchProp(shouldShow);
        }

        setLastScrollY(currentScrollY);
        setUpScrollDistance(newUpScrollDistance);
        ticking = false;
      });
      ticking = true;
    }
  };
};

/**
 * Get navigation fallback UI configuration
 */
export const getNavigationFallbackConfig = () => ({
  headerClasses: 'bg-white shadow-sm',
  containerClasses: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  flexClasses: 'flex justify-between h-16',
  logoClasses: 'flex-shrink-0',
  logoText: 'Pack Move Go',
  loadingClasses: 'flex items-center',
  spinnerClasses: 'animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2',
  loadingText: 'Loading navigation...',
  loadingTextClasses: 'text-sm text-gray-500'
});

/**
 * Navigation state management utilities
 * These can be used by components that need navigation state management
 */
export const createNavigationStateManager = () => {
  let state: NavigationState = createInitialNavigationState();

  const updateState = (updates: Partial<NavigationState>) => {
    state = { ...state, ...updates };
  };

  const resetState = () => {
    state = createInitialNavigationState();
  };

  const getState = () => ({ ...state });

  return {
    getState,
    updateState,
    resetState,
    showSearch: state.showSearch,
    lastScrollY: state.lastScrollY,
    upScrollDistance: state.upScrollDistance,
    isScrollingUp: state.isScrollingUp
  };
};

// =============================================================================
// NAVIGATION API FUNCTIONS
// =============================================================================

/**
 * Get main navigation items
 */
export const getMainNavigation = async (): Promise<NavItem[]> => {
  try {
    const response = await api.makeRequest('/v0/nav') as any;
    
    const navItems: NavItem[] = response.mainNav?.map((item: any) => ({
      id: item.id || item._id || `nav-${Math.random().toString(36).substr(2, 9)}`,
      path: item.path || item.href || '/',
      label: item.label || item.title || item.text || 'Unknown',
      order: item.order || 0,
      isVisible: item.isVisible !== false,
      children: item.children?.map((child: any) => ({
        id: child.id || child._id || `nav-child-${Math.random().toString(36).substr(2, 9)}`,
        path: child.path || child.href || '/',
        label: child.label || child.title || child.text || 'Unknown',
        order: child.order || 0,
        isVisible: child.isVisible !== false
      })) || []
    })) || [];

    return navItems;
  } catch (error) {
    console.error('❌ Failed to fetch main navigation:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Navigation API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/nav', {
        context: 'Navigation API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Navigation temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/nav', {
      context: 'Navigation API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return fallback navigation items
    return [
      { id: 'home', path: '/', label: 'Home', order: 1, isVisible: true },
      { id: 'about', path: '/about', label: 'About', order: 2, isVisible: true },
      { id: 'contact', path: '/contact', label: 'Contact', order: 3, isVisible: true }
    ];
  }
};

/**
 * Get footer navigation items
 */
export const getFooterNavigation = async (): Promise<NavItem[]> => {
  try {
    console.log('🔧 Fetching footer navigation from public API...');
    const response = await api.makeRequest('/v0/nav/footer') as any;
    
    const navItems: NavItem[] = response.footerNav?.map((item: any) => ({
      id: item.id || item._id || `footer-nav-${Math.random().toString(36).substr(2, 9)}`,
      path: item.path || item.href || '/',
      label: item.label || item.title || item.text || 'Unknown',
      order: item.order || 0,
      isVisible: item.isVisible !== false
    })) || [];

    console.log('✅ Footer navigation loaded:', navItems.length);
    return navItems;
  } catch (error) {
    console.error('❌ Failed to fetch footer navigation:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Footer navigation API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/nav/footer', {
        context: 'Footer Navigation API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Footer navigation temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/nav/footer', {
      context: 'Footer Navigation API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return fallback footer navigation items
    return [
      { id: 'privacy', path: '/privacy', label: 'Privacy Policy', order: 1, isVisible: true },
      { id: 'terms', path: '/terms', label: 'Terms of Service', order: 2, isVisible: true },
      { id: 'contact', path: '/contact', label: 'Contact Us', order: 3, isVisible: true }
    ];
  }
};

/**
 * Get mobile navigation items
 */
export const getMobileNavigation = async (): Promise<NavItem[]> => {
  try {
    console.log('🔧 Fetching mobile navigation from public API...');
    const response = await api.makeRequest('/v0/nav/mobile') as any;
    
    const navItems: NavItem[] = response.mobileNav?.map((item: any) => ({
      id: item.id || item._id || `mobile-nav-${Math.random().toString(36).substr(2, 9)}`,
      path: item.path || item.href || '/',
      label: item.label || item.title || item.text || 'Unknown',
      order: item.order || 0,
      isVisible: item.isVisible !== false
    })) || [];

    console.log('✅ Mobile navigation loaded:', navItems.length);
    return navItems;
  } catch (error) {
    console.error('❌ Failed to fetch mobile navigation:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Mobile navigation API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/nav/mobile', {
        context: 'Mobile Navigation API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Mobile navigation temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/nav/mobile', {
      context: 'Mobile Navigation API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return fallback mobile navigation items (same as main nav for simplicity)
    return [
      { id: 'home', path: '/', label: 'Home', order: 1, isVisible: true },
      { id: 'about', path: '/about', label: 'About', order: 2, isVisible: true },
      { id: 'contact', path: '/contact', label: 'Contact', order: 3, isVisible: true }
    ];
  }
};

/**
 * Get complete navigation structure
 */
export const getCompleteNavigation = async (): Promise<NavigationResponse> => {
  try {
    console.log('🔧 Fetching complete navigation structure...');
    const response = await api.makeRequest('/v0/nav') as any;
    
    const navigation: NavigationResponse = {
      mainNav: response.mainNav?.map((item: any) => ({
        id: item.id || item._id || `nav-${Math.random().toString(36).substr(2, 9)}`,
        path: item.path || item.href || '/',
        label: item.label || item.title || item.text || 'Unknown',
        order: item.order || 0,
        isVisible: item.isVisible !== false,
        children: item.children?.map((child: any) => ({
          id: child.id || child._id || `nav-child-${Math.random().toString(36).substr(2, 9)}`,
          path: child.path || child.href || '/',
          label: child.label || child.title || child.text || 'Unknown',
          order: child.order || 0,
          isVisible: child.isVisible !== false
        })) || []
      })) || [],
      footerNav: response.footerNav?.map((item: any) => ({
        id: item.id || item._id || `footer-nav-${Math.random().toString(36).substr(2, 9)}`,
        path: item.path || item.href || '/',
        label: item.label || item.title || item.text || 'Unknown',
        order: item.order || 0,
        isVisible: item.isVisible !== false
      })) || [],
      mobileNav: response.mobileNav?.map((item: any) => ({
        id: item.id || item._id || `mobile-nav-${Math.random().toString(36).substr(2, 9)}`,
        path: item.path || item.href || '/',
        label: item.label || item.title || item.text || 'Unknown',
        order: item.order || 0,
        isVisible: item.isVisible !== false
      })) || []
    };

    console.log('✅ Complete navigation loaded');
    return navigation;
  } catch (error) {
    console.error('❌ Failed to fetch complete navigation:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('⚠️ Complete navigation API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/nav', {
        context: 'Complete Navigation API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Complete navigation temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/nav', {
      context: 'Complete Navigation API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    // Return fallback navigation structure
    return {
      mainNav: [
        { id: 'home', path: '/', label: 'Home', order: 1, isVisible: true },
        { id: 'about', path: '/about', label: 'About', order: 2, isVisible: true },
        { id: 'contact', path: '/contact', label: 'Contact', order: 3, isVisible: true }
      ],
      footerNav: [
        { id: 'privacy', path: '/privacy', label: 'Privacy Policy', order: 1, isVisible: true },
        { id: 'terms', path: '/terms', label: 'Terms of Service', order: 2, isVisible: true },
        { id: 'contact', path: '/contact', label: 'Contact Us', order: 3, isVisible: true }
      ],
      mobileNav: [
        { id: 'home', path: '/', label: 'Home', order: 1, isVisible: true },
        { id: 'about', path: '/about', label: 'About', order: 2, isVisible: true },
        { id: 'contact', path: '/contact', label: 'Contact', order: 3, isVisible: true }
      ]
    };
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Clear navigation cache
 */
export const clearNavigationCache = (): void => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('packmovego-nav-data');
      console.log('🧹 Navigation cache cleared');
    }
  } catch (error) {
    console.warn('Failed to clear navigation cache:', error);
  }
};

export default {
  getMainNavigation,
  getFooterNavigation,
  getMobileNavigation,
  getCompleteNavigation,
  clearNavigationCache
};
