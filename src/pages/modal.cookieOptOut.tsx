
import React, { useEffect, useState, useRef } from 'react';
import { useCookiePreferences } from '../context/CookiePreferencesContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentTimestamp } from '../util/ssrUtils';

// SSR-safe environment detection
const isSSR = typeof window === 'undefined';

// SSR-safe Helmet wrapper
const HelmetWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [Helmet, setHelmet] = React.useState<any>(null);

  React.useEffect(() => {
    // Only load Helmet on client-side
    if (typeof window !== 'undefined') {
      import('react-helmet-async').then((module) => {
        setHelmet(() => module.Helmet);
      });
    }
  }, []);

  // Return null during SSR or before Helmet loads
  if (!Helmet) {
    return null;
  }

  return <Helmet>{children}</Helmet>;
};

const CookieOptOut: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollPositionRef = useRef<number>(0);
  
  // Essential pages that should be accessible without cookie consent
  const essentialPages = ['/cookie-opt-out', '/privacy', '/terms'];
  const isEssentialPage = essentialPages.includes(location.pathname);
  
  // Check if this is being used as a full page (on /cookie-opt-out route) or as a modal
  const isFullPage = location.pathname === '/cookie-opt-out';
  
  // Animation states for options
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'accept' | 'reject' | 'custom' | null>(null);
  
  // Get cookie preferences with error handling
  let preferences, hasOptedOut, hasMadeChoice, optIn, optOut, updatePreferences, isLoading, isApiBlocked;
  let checkBannerTimer, clearBannerCache;
  
  try {
    const cookiePrefs = useCookiePreferences();
    preferences = cookiePrefs.preferences;
    hasOptedOut = cookiePrefs.hasOptedOut;
    hasMadeChoice = cookiePrefs.hasMadeChoice;
    optIn = cookiePrefs.optIn;
    optOut = cookiePrefs.optOut;
    updatePreferences = cookiePrefs.updatePreferences;
    isLoading = cookiePrefs.isLoading;
    isApiBlocked = cookiePrefs.isApiBlocked;
    checkBannerTimer = cookiePrefs.checkBannerTimer;
    clearBannerCache = cookiePrefs.clearBannerCache;
  } catch (error) {
    console.error('🍪 CookieOptOut: Error accessing cookie preferences:', error);
    // Provide fallback values
    preferences = { thirdPartyAds: false, analytics: false, functional: false, hasMadeChoice: false };
    hasOptedOut = false;
    hasMadeChoice = false;
    isLoading = false;
    isApiBlocked = false;
    optIn = () => console.warn('Cookie preferences not available');
    optOut = () => console.warn('Cookie preferences not available');
    updatePreferences = () => console.warn('Cookie preferences not available');
    checkBannerTimer = () => true;
    clearBannerCache = () => {};
  }

  // Function to prevent scrolling (SSR-safe)
  const preventScroll = () => {
    if (isSSR) return () => {};
    
    // Store current scroll position
    scrollPositionRef.current = window.scrollY;
    
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    
    // Prevent scrolling on html element as well
    document.documentElement.style.overflow = 'hidden';
    
    // Prevent touch scrolling on mobile
    document.body.style.touchAction = 'none';
    document.documentElement.style.touchAction = 'none';
    
    // Prevent wheel events
    const preventWheel = (e: Event) => {
      e.preventDefault();
    };
    
    // Prevent keyboard navigation (arrow keys, space, page up/down)
    const preventKeydown = (e: KeyboardEvent) => {
      const keys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'PageUp', 'PageDown', 'Home', 'End'
      ];
      if (keys.includes(e.code)) {
        e.preventDefault();
      }
    };
    
    // Add event listeners
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('touchmove', preventWheel, { passive: false });
    document.addEventListener('keydown', preventKeydown);
    
    // Store cleanup function
    return () => {
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventWheel);
      document.removeEventListener('keydown', preventKeydown);
    };
  };

  // Function to restore scrolling (SSR-safe)
  const restoreScroll = () => {
    if (isSSR) return;
    
    // Restore body styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.touchAction = '';
    
    // Restore html styles
    document.documentElement.style.overflow = '';
    document.documentElement.style.touchAction = '';
    
    // Restore scroll position
    window.scrollTo(0, scrollPositionRef.current);
  };

  // Initialize component after a short delay to ensure context is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show options with animation after component is initialized
  useEffect(() => {
    if (isInitialized && !isLoading) {
      const timer = setTimeout(() => {
        setShowOptions(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isLoading]);

  // Listen for dev tools cookie reset event (SSR-safe)
  useEffect(() => {
    if (isSSR) return;
    
    const handleCookieReset = () => {
      console.log('🍪 Cookie consent reset event received - showing modal');
      setIsVisible(true);
      setIsFadingOut(false);
    };

    window.addEventListener('cookie-consent-reset', handleCookieReset);
    return () => window.removeEventListener('cookie-consent-reset', handleCookieReset);
  }, [isSSR]);

  // Handle scroll prevention when visible (only for modal mode, not full page)
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (isVisible && !isLoading && isInitialized && !isFullPage) {
      cleanup = preventScroll();
    } else if (!isVisible && !isFullPage) {
      restoreScroll();
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
      if (!isFullPage) {
        restoreScroll();
      }
    };
  }, [isVisible, isLoading, isInitialized, isFullPage]);

  const handleOptIn = () => {
    console.log('🍪 CookieOptOut: handleOptIn called');
    console.log('🍪 CookieOptOut: optIn function available:', !!optIn);
    console.log('🍪 CookieOptOut: hasMadeChoice:', hasMadeChoice, 'hasOptedOut:', hasOptedOut);
    
    setSelectedOption('accept');
    
    if (optIn) {
      console.log('🍪 CookieOptOut: Calling optIn function');
    setIsTransitioning(true);
    optIn();
    
    // Set last banner time to now (will show again in 30 minutes)
    if (!isSSR) {
      localStorage.setItem('packmovego-last-banner-time', getCurrentTimestamp().toString());
      console.log('🍪 Cookie banner opt-in - will show again in 30 minutes');
    }
      
      if (isFullPage) {
        // For full page mode, just navigate after a short delay
    setTimeout(() => {
          console.log('🍪 CookieOptOut: Navigating to home page after opt-in (full page mode)');
      navigate('/');
        }, 500);
      } else {
        // For modal mode, use fade out animation
        setIsFadingOut(true);
        setTimeout(() => {
          setIsVisible(false);
          setIsFadingOut(false);
      setIsTransitioning(false);
          
          // Wait a bit longer for API state to fully update before navigation
          console.log('🍪 CookieOptOut: Waiting for API state to update before navigation...');
          setTimeout(() => {
            console.log('🍪 CookieOptOut: Navigating to home page after opt-in');
            navigate('/');
          }, 200); // Additional delay for API state
        }, 300);
      }
    } else {
      // Fallback if context is not available
      console.warn('🍪 CookieOptOut: Cookie preferences context not available for opt-in');
    }
  };

  const handleOptOut = () => {
    setSelectedOption('reject');
    setIsTransitioning(true);
    optOut();
    // Don't navigate away - let them see the updated status
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const handleManagePreferences = () => {
    setSelectedOption('custom');
    // Set last banner time to now (SSR-safe)
    if (!isSSR) {
      localStorage.setItem('packmovego-last-banner-time', getCurrentTimestamp().toString());
    }
    // Clear cache
    if (clearBannerCache) clearBannerCache();
    
    if (!isFullPage) {
      navigate('/cookie-opt-out');
    }
    // If already on full page, do nothing (user is already managing preferences)
  };

  const handleDismiss = () => {
    // Set last banner time to now (dismiss for 30 minutes) (SSR-safe)
    if (!isSSR) {
      localStorage.setItem('packmovego-last-banner-time', getCurrentTimestamp().toString());
      console.log('🍪 Cookie banner dismissed - will show again in 30 minutes');
    }
    // Clear cache
    if (clearBannerCache) clearBannerCache();
    
    if (isFullPage) {
      // For full page mode, navigate back to home
      navigate('/');
    } else {
      // For modal mode, hide modal immediately
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsFadingOut(false);
      }, 300);
    }
  };

  const handleClose = () => {
    if (isFullPage) {
      // For full page mode, navigate back to home
      navigate('/');
    } else {
      // For modal mode, hide modal immediately
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsFadingOut(false);
      }, 300);
    }
  };

  const handleToggleCategory = (category: 'thirdPartyAds' | 'analytics' | 'functional') => {
    updatePreferences({
      [category]: !preferences[category],
      hasMadeChoice: true
    });
  };

  // Check if we should show the banner based on 30-minute timer
  const shouldShowBanner = !isSSR && (checkBannerTimer ? checkBannerTimer() : true);
  
  // Don't render if not visible, still loading, or timer says not to show (only for modal mode)
  if (!isVisible || isLoading || !isInitialized || !shouldShowBanner) {
    if (isFullPage) {
      // For full page mode, show loading state
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cookie preferences...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  if (isFullPage) {
    // Full page mode - render as a regular page with smooth animations (keep app background)
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`
            bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-8 lg:p-12 relative
            transition-all duration-1000 ease-out
            ${showOptions ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}
            border border-white/20
          `}>
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`
                absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-300 z-10 touch-manipulation
                ${showOptions ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
              `}
              style={{ transitionDelay: showOptions ? '200ms' : '0ms' }}
              aria-label="Close cookie preferences"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className={`
              text-center mb-6 sm:mb-8
              transition-all duration-1000 ease-out delay-300
              ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
            `}>
              <div className={`
                w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6
                transition-all duration-1000 ease-out delay-400
                ${showOptions ? 'scale-100 rotate-0' : 'scale-75 rotate-12'}
              `}>
                <svg className={`
                  w-8 h-8 sm:w-10 sm:h-10 text-red-600
                  transition-all duration-800 ease-out delay-500
                  ${showOptions ? 'scale-100' : 'scale-0'}
                `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                    </div>
              <h1 className={`
                text-2xl sm:text-3xl font-bold text-gray-900 mb-3
                transition-all duration-800 ease-out delay-600
                ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}>
                Cookie Preferences
              </h1>
              <p className={`
                text-base sm:text-lg text-gray-600
                transition-all duration-800 ease-out delay-700
                ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}>
                Manage your cookie preferences and privacy settings
              </p>
                </div>

        {/* Main Message */}
        <div className={`
          bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6
          transition-all duration-700 ease-out delay-400
          ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
                    </div>
            <div className="ml-3">
              <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">
                Third-Party Advertising Cookies
              </h3>
              <p className="text-sm sm:text-base text-yellow-700 leading-relaxed">
                This website uses third party advertising cookies to serve you relevant ads. 
                You may opt-out from these third party ad cookies by clicking the "Opt-out" button below. 
                If you have a Pack Move GO account, you may opt-out of the "sale" or "sharing" of your data here.
              </p>
                </div>
              </div>
            </div>

        {/* Current Status */}
        <div className={`
          bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6
          transition-all duration-700 ease-out delay-500
          ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm sm:text-base text-red-800 font-medium">
              {hasOptedOut 
                ? 'You are currently opted out of all cookies'
                : 'Please make a choice about cookie preferences'
              }
            </span>
              </div>
            </div>

            {/* Action Buttons */}
        <div className={`
          flex flex-col sm:flex-row gap-3 sm:gap-4
          transition-all duration-700 ease-out delay-600
          ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
              <button
                onClick={handleOptIn}
                disabled={isTransitioning}
                className={`
              flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold 
              py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition duration-200 flex items-center justify-center
              min-h-[48px] touch-manipulation
              ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:bg-blue-800'}
              ${selectedOption === 'accept' ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
            `}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            <span className="text-sm sm:text-base">
              {isTransitioning && selectedOption === 'accept' ? 'Opting In...' : 'Opt In to All Cookies'}
            </span>
              </button>
              
              <button
            onClick={handleManagePreferences}
                disabled={isTransitioning}
                className={`
              flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold 
              py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition duration-200 min-h-[48px] touch-manipulation
              ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 active:bg-gray-400'}
              ${selectedOption === 'custom' ? 'ring-2 ring-gray-300 ring-offset-2' : ''}
            `}
          >
            <span className="text-sm sm:text-base">Manage Preferences</span>
              </button>
            </div>

        {/* Dismiss Button (only for opted-in users) */}
        {hasMadeChoice && !hasOptedOut && (
          <div className={`
            mt-3 sm:mt-4 text-center
            transition-all duration-700 ease-out delay-700
            ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
              <button
              onClick={handleDismiss}
                disabled={isTransitioning}
                className={`
                text-sm sm:text-base text-gray-500 hover:text-gray-700 active:text-gray-800 underline
                py-2 px-3 touch-manipulation
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700 active:text-gray-800'}
              `}
            >
              Dismiss for 30 minutes
              </button>
            </div>
        )}

            {/* Footer */}
            <div className={`
              mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200
              transition-all duration-700 ease-out delay-800
              ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}>
              <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed">
                By opting in, you agree to our{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 active:text-blue-900 underline touch-manipulation">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 active:text-blue-900 underline touch-manipulation">
                  Terms of Service
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal mode - render as overlay modal with enhanced smooth animations
  return (
    <div 
      className={`
        fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-2 sm:p-4
        transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isFadingOut ? 'opacity-0 backdrop-blur-none' : 'opacity-100 backdrop-blur-sm'}
        ${!isInitialized ? 'pointer-events-none' : ''}
      `}
      style={{ touchAction: 'none' }}
    >
      <div className={`
        bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 lg:p-8 relative
        transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] max-h-[95vh] overflow-y-auto
        ${isFadingOut ? 'scale-90 opacity-0 rotate-2 translate-y-4' : 'scale-100 opacity-100 rotate-0 translate-y-0'}
        ${showOptions ? 'translate-y-0' : 'translate-y-12'}
        border border-white/20
        hover:shadow-3xl
      `}>

        {/* Header */}
        <div className={`
          text-center mb-4 sm:mb-6
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-200
          ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          <div className={`
            w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4
            transition-all duration-1200 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] delay-300
            ${showOptions ? 'scale-100 rotate-0' : 'scale-50 rotate-180'}
            hover:scale-110 hover:rotate-12 hover:bg-red-200
            shadow-lg hover:shadow-xl
          `}>
            <svg className={`
              w-6 h-6 sm:w-8 sm:h-8 text-red-600
              transition-all duration-800 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] delay-500
              ${showOptions ? 'scale-100 rotate-0' : 'scale-0 rotate-360'}
            `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className={`
            text-xl sm:text-2xl font-bold text-gray-900 mb-2
            transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-600
            ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
            hover:text-red-600
          `}>
            Cookie Preferences
          </h2>
          <p className={`
            text-sm sm:text-base text-gray-600
            transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-700
            ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
          `}>
            Manage your cookie preferences and privacy settings
          </p>
        </div>

        {/* Main Message */}
        <div className={`
          bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-800
          ${showOptions ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-90'}
          hover:shadow-lg hover:scale-[1.02] hover:bg-yellow-100
        `}>
          <div className="flex items-start">
            <div className={`
              flex-shrink-0
              transition-all duration-800 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] delay-900
              ${showOptions ? 'scale-100 rotate-0' : 'scale-0 rotate-360'}
            `}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mt-0.5 transition-all duration-300 hover:scale-110 hover:text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className={`
              ml-3
              transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-1000
              ${showOptions ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}
            `}>
              <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2 transition-all duration-300 hover:text-yellow-900">
                Third-Party Advertising Cookies
              </h3>
              <p className="text-sm sm:text-base text-yellow-700 leading-relaxed transition-all duration-300 hover:text-yellow-800">
                This website uses third party advertising cookies to serve you relevant ads. 
                You may opt-out from these third party ad cookies by clicking the "Opt-out" button below. 
                If you have a Pack Move GO account, you may opt-out of the "sale" or "sharing" of your data here.
              </p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className={`
          bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-1100
          ${showOptions ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-90'}
          hover:shadow-lg hover:scale-[1.02] hover:bg-red-100
        `}>
          <div className="flex items-center">
            <div className={`
              flex-shrink-0
              transition-all duration-800 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] delay-1200
              ${showOptions ? 'scale-100 rotate-0' : 'scale-0 rotate-360'}
            `}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 transition-all duration-300 hover:scale-110 hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`
              text-sm sm:text-base text-red-800 font-medium
              transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-1300
              ${showOptions ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}
            `}>
              {hasOptedOut 
                ? 'You are currently opted out of all cookies'
                : 'Please make a choice about cookie preferences'
              }
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`
          flex flex-col sm:flex-row gap-3 sm:gap-4
          transition-all duration-700 ease-out delay-1200
          ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          <button
            onClick={handleOptIn}
            disabled={isTransitioning}
            className={`
              flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold 
              py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 flex items-center justify-center
              min-h-[48px] touch-manipulation transform
              ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:bg-blue-800 hover:scale-105 hover:shadow-lg'}
              ${selectedOption === 'accept' ? 'ring-4 ring-blue-300 ring-offset-2 scale-105 shadow-lg' : ''}
              ${showOptions ? 'translate-x-0' : 'translate-x-8'}
            `}
            style={{ transitionDelay: showOptions ? '1300ms' : '0ms' }}
          >
            <svg className={`
              w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0
              transition-all duration-300 ease-out
              ${selectedOption === 'accept' ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
            `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`
              text-sm sm:text-base
              transition-all duration-300 ease-out
              ${selectedOption === 'accept' ? 'font-bold' : 'font-semibold'}
            `}>
              {isTransitioning && selectedOption === 'accept' ? 'Opting In...' : 'Opt In to All Cookies'}
            </span>
          </button>
          
          <button
            onClick={handleManagePreferences}
            disabled={isTransitioning}
            className={`
              flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold 
              py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 min-h-[48px] touch-manipulation transform
              ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 active:bg-gray-400 hover:scale-105 hover:shadow-lg'}
              ${selectedOption === 'custom' ? 'ring-4 ring-gray-300 ring-offset-2 scale-105 shadow-lg' : ''}
              ${showOptions ? 'translate-x-0' : 'translate-x-8'}
            `}
            style={{ transitionDelay: showOptions ? '1400ms' : '0ms' }}
          >
            <span className={`
              text-sm sm:text-base
              transition-all duration-300 ease-out
              ${selectedOption === 'custom' ? 'font-bold' : 'font-semibold'}
            `}>
              Manage Preferences
            </span>
          </button>
        </div>

        {/* Dismiss Button (only for opted-in users) */}
        {hasMadeChoice && !hasOptedOut && (
          <div className={`
            mt-3 sm:mt-4 text-center
            transition-all duration-700 ease-out delay-1500
            ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
          `}>
            <button
              onClick={handleDismiss}
              disabled={isTransitioning}
              className={`
                text-sm sm:text-base text-gray-500 hover:text-gray-700 active:text-gray-800 underline
                py-2 px-3 touch-manipulation transition-all duration-300 transform
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700 active:text-gray-800 hover:scale-105'}
                ${showOptions ? 'translate-x-0' : 'translate-x-4'}
              `}
              style={{ transitionDelay: showOptions ? '1600ms' : '0ms' }}
            >
              Dismiss for 30 minutes
            </button>
          </div>
        )}

        {/* Footer */}
        <div className={`
          mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200
          transition-all duration-700 ease-out delay-1700
          ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `}>
          <p className={`
            text-xs sm:text-sm text-gray-600 text-center leading-relaxed
            transition-all duration-600 ease-out delay-1800
            ${showOptions ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            By opting in, you agree to our{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 active:text-blue-900 underline touch-manipulation transition-all duration-300 hover:scale-105">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 active:text-blue-900 underline touch-manipulation transition-all duration-300 hover:scale-105">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieOptOut; 