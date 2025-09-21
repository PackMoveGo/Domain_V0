import { useState, useEffect, useMemo, useRef } from 'react';

export interface NavItem {
  id: string;
  path: string;
  label: string;
}

// Global cache for navigation items
let navCache: NavItem[] | null = null;
let navCacheTime = 0;
const NAV_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useNavItems = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitingForConsent, setWaitingForConsent] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const fetchNavItems = async () => {
      // Prevent multiple simultaneous calls
      if (hasInitialized.current) {
        return;
      }
      hasInitialized.current = true;

      try {
        setLoading(true);
        
        // Check cache first
        const now = Date.now();
        if (navCache && (now - navCacheTime) < NAV_CACHE_DURATION) {
          console.log('📋 Using cached navigation items');
          setNavItems(navCache);
          setLoading(false);
          return;
        }

        // Check if we have data from batch loading
        const batchData = (window as any).__INITIAL_NAV_DATA__;
        if (batchData) {
          console.log('📋 Using batch-loaded navigation data');
          const navigationData = processNavResponse(batchData);
          navCache = navigationData;
          navCacheTime = now;
          setNavItems(navigationData);
          setLoading(false);
          // Clear the batch data to prevent memory leaks
          delete (window as any).__INITIAL_NAV_DATA__;
          return;
        }

        console.log('📋 Using static navigation items (no API call)');
        
        // Use static navigation items instead of API call
        const staticNavItems: NavItem[] = [
          { id: 'home', path: '/', label: 'Home' },
          { id: 'about', path: '/about', label: 'About' },
          { id: 'contact', path: '/contact', label: 'Contact' }
        ];
        
        // Cache the results
        navCache = staticNavItems;
        navCacheTime = now;
        
        setNavItems(staticNavItems);
        console.log('📋 Static navigation items loaded');
      } catch (err) {
        console.error('useNavItems: Unexpected error:', err);
        setError('Navigation error');
        
        // Set fallback items on error
        const fallbackItems = [
          { id: 'home', path: '/', label: 'Home' },
          { id: 'about', path: '/about', label: 'About' },
          { id: 'contact', path: '/contact', label: 'Contact' }
        ];
        setNavItems(fallbackItems);
      } finally {
        setLoading(false);
      }
    };

    fetchNavItems();
  }, []);

  // Helper function to process navigation response
  const processNavResponse = (response: any): NavItem[] => {
    let navigationData: NavItem[] = [];
    
    if (response && response.mainNav) {
      // Handle real API format: { mainNav: [{ path, label }] }
      navigationData = response.mainNav.map((item: any, index: number) => ({
        id: item.id || `nav-${index}`,
        path: item.path || '/',
        label: item.label || 'Unknown'
      }));
    } else if (response && response.navigation) {
      // Handle legacy development API override format: { navigation: [{ id, title, path }] }
      navigationData = response.navigation.map((item: any, index: number) => ({
        id: item.id || `nav-${index}`,
        path: item.path || item.href || '/',
        label: item.title || item.label || item.text || 'Unknown'
      }));
    } else if (response && response.data && response.data.links) {
      // Handle fallback API format: { data: { links: [{ href, text }] } }
      navigationData = response.data.links.map((link: any, index: number) => ({
        id: link.id || `nav-${index}`,
        path: link.href || link.path || '/',
        label: link.text || link.label || link.title || 'Unknown'
      }));
    } else if (response && Array.isArray(response)) {
      // Handle direct array response
      navigationData = response.map((item: any, index: number) => ({
        id: item.id || `nav-${index}`,
        path: item.path || item.href || '/',
        label: item.label || item.text || item.title || 'Unknown'
      }));
    } else {
      // No fallback data - let the error state handle this
      throw new Error('API returned no valid navigation data');
    }
    
    // Validate that each item has a label
    navigationData.forEach((item, index) => {
      if (!item.label || item.label === 'Unknown') {
        console.warn(`useNavItems: Item ${index} has missing or invalid label:`, item);
      }
    });
    
    return navigationData;
  };

  // Memoize the items to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => {
    return navItems;
  }, [navItems]);

  return { 
    items: memoizedItems, 
    navItems: memoizedItems, 
    isLoading: loading, 
    loading, 
    error, 
    waitingForConsent 
  };
}; 