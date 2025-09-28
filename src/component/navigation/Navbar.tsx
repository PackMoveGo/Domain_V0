import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationStyles } from '../../styles/navigation';
import { getMainNavigation, NavItem } from '../../services/routes/route.navAPI';
import { resetHealthGate } from '../../services/service.apiSW';

// SSR-safe environment detection
const isSSR = typeof window === 'undefined';

// Static navigation for static pages (no API calls needed)
export const StaticNavbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
                Pack Move Go
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Home
            </a>
            <a href="/about" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              About
            </a>
            <a href="/contact" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

// SSR-safe navbar component that doesn't use any client-side hooks
export const SSRNavbar: React.FC<{ currentPath?: string }> = ({ currentPath = '/' }) => {
  const defaultNavItems: NavItem[] = [
    { id: 'home', path: '/', label: 'Home', order: 1, isVisible: true },
    { id: 'about', path: '/about', label: 'About', order: 2, isVisible: true },
    { id: 'contact', path: '/contact', label: 'Contact', order: 3, isVisible: true }
  ];

  return (
    <nav className={navigationStyles.wrapper}>
      <div className={navigationStyles.container}>
        <div className={navigationStyles.header}>
          {/* Logo */}
          <div className={navigationStyles.logo}>
            <a href="/">
              Pack Move Go
            </a>
          </div>
          
          {/* Desktop Navigation for SSR */}
          <div className="flex-1 flex justify-end">
            <nav className={navigationStyles.desktop.nav}>
              {defaultNavItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`
                    ${navigationStyles.desktop.link.base}
                    ${currentPath === item.path
                      ? navigationStyles.desktop.link.active
                      : navigationStyles.desktop.link.inactive
                    }
                  `}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Client-side only Navbar component
interface NavbarProps {
  hasConsent: boolean;
  isWaitingForConsent: boolean;
  isApiBlocked: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ hasConsent, isWaitingForConsent, isApiBlocked }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default navigation items for fallback
  const defaultNavItems: NavItem[] = [
    { id: 'home', path: '/', label: 'Home', order: 1, isVisible: true },
    { id: 'about', path: '/about', label: 'About', order: 2, isVisible: true },
    { id: 'contact', path: '/contact', label: 'Contact', order: 3, isVisible: true }
  ];
  
  // Navigation state - initialize with default items for SSR and when API is blocked
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  
  const navRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load navigation items from API with rate limiting
  useEffect(() => {
    // Skip API calls during SSR - use fallback navigation
    if (isSSR) {
      setNavItems(defaultNavItems);
      setIsLoading(false);
      return;
    }
    
    // If API is blocked due to no cookie consent, use fallback navigation
    if (isApiBlocked) {
      setNavItems(defaultNavItems);
      setIsLoading(false);
      return;
    }
    
    // Check if we already have navigation data cached
    const cachedNavData = sessionStorage.getItem('packmovego-nav-data');
    if (cachedNavData) {
      try {
        const parsedData = JSON.parse(cachedNavData);
        const now = Date.now();
        // Use cached data if it's less than 5 minutes old
        if (parsedData.timestamp && (now - parsedData.timestamp) < 5 * 60 * 1000) {
          setNavItems(parsedData.items);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // Invalid cached data, continue with API call
        console.warn('Invalid cached navigation data, fetching fresh data');
      }
    }
    
    const loadNavigation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Reset health gate to allow fresh health check
        resetHealthGate();
        
        // Add a small delay to prevent rapid successive calls
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const items = await getMainNavigation();
        setNavItems(items);
        
        // Cache the successful response
        try {
          sessionStorage.setItem('packmovego-nav-data', JSON.stringify({
            items,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
          console.warn('Failed to cache navigation data:', cacheError);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load navigation';
        setError(errorMessage);
        
        console.warn('Navigation API failed, using fallback navigation:', errorMessage);
        
        // Check if it's a rate limiting error or 503 error
        if (errorMessage.includes('429') || errorMessage.includes('503') || errorMessage.includes('Too many requests') || errorMessage.includes('Service Unavailable')) {
          console.warn('API unavailable, using fallback navigation');
          // Use cached data if available, even if expired
          const cachedNavData = sessionStorage.getItem('packmovego-nav-data');
          if (cachedNavData) {
            try {
              const parsedData = JSON.parse(cachedNavData);
              setNavItems(parsedData.items);
              setIsLoading(false);
              return;
            } catch (cacheError) {
              // Fall through to default fallback
            }
          }
        }
        
        // Set fallback navigation items for any error
        setNavItems(defaultNavItems);
        setIsLoading(false);
      }
    };

    loadNavigation();
  }, [isApiBlocked, location.pathname]);

  // Reset menu state when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Log navigation errors in development only
  useEffect(() => {
    const isDevMode = (import.meta as any).env.VITE_DEV_MODE === 'development';
    if (error && isDevMode) {
      console.error('Navigation error:', error);
    }
  }, [error]);

  // Check for overflow on mount and window resize (responsive behavior)
  useEffect(() => {
    // Only run on client side
    if (isSSR) return;
    
    const checkOverflow = () => {
      const isSmallScreen = window.innerWidth < 975;
      setIsOverflowing(isSmallScreen);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [navItems, isSSR]);

  // Disable scrolling when menu is open
  useEffect(() => {
    // Only run on client side
    if (isSSR) return;
    
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMenuOpen, isSSR]);

  // Handlers
  const handleMenuToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const handleNavClick = useCallback((e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
    setIsMenuOpen(false);
  }, [navigate]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
  }, []);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  }, [navigate]);

  // Memoize visible navigation items
  const visibleNavItems = useMemo(() => {
    return navItems.filter(item => item.isVisible !== false);
  }, [navItems]);

  // Always show navigation - no loading states that block fallback navigation

  return (
    <nav className={navigationStyles.wrapper}>
      <div className={navigationStyles.container}>
        <div className={navigationStyles.header}>
          {/* Logo */}
          <div className={navigationStyles.logo}>
            <a href="/" onClick={handleLogoClick}>
              Pack Move Go
            </a>
          </div>
          
          {/* Mobile Navigation */}
          {isOverflowing ? (
            <div className="relative block">
              {/* Menu Button */}
              <button
                onClick={handleMenuToggle}
                className={`
                  ${navigationStyles.mobileBottom.menuButton}
                  ${isMenuOpen ? navigationStyles.mobileBottom.menuButtonActive : ''}
                  transition-all duration-300 ease-in-out transform
                  ${isMenuOpen ? 'scale-110 rotate-180' : 'scale-100 rotate-0'}
                `}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <span className="sr-only">
                  {isMenuOpen ? 'Close menu' : 'Open menu'}
                </span>
                {isMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M6 18L18 6M6 6l12 12"
                      className="text-blue-600" 
                    />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              {/* Menu Overlay */}
              {isMenuOpen && (
                <div
                  className="fixed left-0 right-0 top-16 bottom-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-in-out z-40"
                  onClick={handleOverlayClick}
                />
              )}

              {/* Menu Panel */}
              <div
                className={`
                  ${navigationStyles.mobileBottom.panel}
                  ${isMenuOpen ? navigationStyles.mobileBottom.panelOpen : navigationStyles.mobileBottom.panelClosed}
                `}
              >
                {/* Navigation Links */}
                <div className="flex-1 py-3 px-4 space-y-2">
                  {visibleNavItems.map((item, index) => (
                    <a
                      key={item.path}
                      href={item.path}
                      className={`
                        ${navigationStyles.mobileBottom.link.base}
                        ${location.pathname === item.path
                          ? navigationStyles.mobileBottom.link.active
                          : navigationStyles.mobileBottom.link.inactive
                        }
                        ${isMenuOpen ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-full'}
                      `}
                      onClick={(e) => handleNavClick(e, item.path)}
                      style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                
                {/* Book Now Button */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                  <a
                    href="/booking"
                    className={`
                      ${navigationStyles.mobileBottom.bookNowButton}
                      ${isMenuOpen ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-full'}
                    `}
                    onClick={(e) => handleNavClick(e, '/booking')}
                    style={{ transitionDelay: '800ms' }}
                  >
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Navigation */
            <div ref={containerRef} className="flex-1 flex justify-end">
              <nav ref={navRef} className={navigationStyles.desktop.nav}>
                {visibleNavItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`
                      ${navigationStyles.desktop.link.base}
                      ${location.pathname === item.path
                        ? navigationStyles.desktop.link.active
                        : navigationStyles.desktop.link.inactive
                      }
                    `}
                    onClick={(e) => handleNavClick(e, item.path)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Add displayName for React DevTools
Navbar.displayName = 'Navbar';

export { Navbar };
export default Navbar; 