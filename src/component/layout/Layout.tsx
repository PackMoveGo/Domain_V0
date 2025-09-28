import React, { FC, ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCookiePreferences } from '../../context/CookiePreferencesContext';
import { getApiFailureModalProps, addModalStateListener, removeModalStateListener, setApiBlocked } from '../../services/service.apiSW';
import { SearchResult } from '../../util/search';
import { FormData } from '../forms/form.quote';
import Analytics from '../business/Analytics';
import Navbar, { StaticNavbar, SSRNavbar } from '../navigation/Navbar';
import SearchBar from '../navigation/SearchBar';
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import QuoteForm from '../forms/form.quote';
import ScrollToTopButton from '../ui/navigation/ScrollToTopButton';
import Footer from '../ui/footer.footer';
// import DevToolsLauncher from '../devtools/DevToolsLauncher';
import ApiFailureModal from '../ui/overlay/modal.apistatus';
import CookieOptOut from '../../pages/modal.cookieOptOut';
import { Helmet } from 'react-helmet-async';

// SSR-safe environment detection
const isSSR = typeof window === 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

interface LayoutProps {
  forceHideSearch?: boolean;
  focusSearch?: boolean;
  noTopPadding?: boolean;
  isRelative?: boolean;
  forceHideNavbar?: boolean;
  forceHideFooter?: boolean;
  onSearch?: (query: string) => SearchResult[] | Promise<SearchResult[]>;
  onSearchComplete?: (results: SearchResult[]) => void;
  onQuoteSubmit?: (data: FormData) => void;
  children: ReactNode;
  // SSR detection
  isSSR?: boolean;
}

const Layout: FC<LayoutProps> = ({
  forceHideSearch = false,
  focusSearch = false,
  noTopPadding = false,
  isRelative = false,
  forceHideNavbar = false,
  forceHideFooter = false,
  onSearch,
  onSearchComplete,
  onQuoteSubmit,
  children,
  isSSR = false
}) => {
  // SSR-safe router hooks - use consistent fallback values
  let location, navigate;
  if (isSSR) {
    // SSR: use consistent fallback values
    location = { pathname: '/' };
    navigate = () => {};
  } else {
    try {
      location = useLocation();
      navigate = useNavigate();
    } catch (error) {
      // Fallback for SSR when router is not available
      location = { pathname: '/' };
      navigate = () => {};
    }
  }
  
  // Detect if we're in SSR mode - use the prop value
  const isServerSide = isSSR;
  
  // SSR-safe context usage - always use context but handle SSR gracefully
  let cookiePrefs;
  if (isSSR) {
    // SSR: use consistent fallback values
    cookiePrefs = {
      hasConsent: false,
      isWaitingForConsent: true,
      isApiBlocked: true,
      optIn: () => {},
      hasOptedOut: false,
      hasMadeChoice: false,
      hasOptedIn: false,
      checkBannerTimer: () => true
    };
  } else {
    try {
      cookiePrefs = useCookiePreferences();
    } catch (error) {
      // Fallback for SSR when context is not available
      cookiePrefs = {
        hasConsent: false,
        isWaitingForConsent: true,
        isApiBlocked: true,
        optIn: () => {},
        hasOptedOut: false,
        hasMadeChoice: false,
        hasOptedIn: false,
        checkBannerTimer: () => true
      };
    }
  }
  const { hasConsent, isWaitingForConsent, isApiBlocked, optIn, hasOptedOut, hasMadeChoice, hasOptedIn, checkBannerTimer } = cookiePrefs;
  
  // SSR-safe consent state - use consistent values to prevent hydration mismatches
  // Always start with the same initial values for both server and client
  const hasValidConsent = true; // Allow modal to show for testing
  const isWaitingForValidConsent = false;
  const isApiBlockedForSSR = false;
  
  // Static pages that don't need API failure modal or search bar
  const staticPages = ['/cookie-opt-out', '/privacy', '/terms'];
  const isStaticPage = staticPages.includes(location.pathname);
  
  // Search bar visibility state
  const [showSearch, setShowSearch] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [upScrollDistance, setUpScrollDistance] = useState(0);
  
  // Modal state management - only for non-static pages (SSR-safe)
  const [modalProps, setModalProps] = useState(() => {
    if (isStaticPage || isSSR) {
      return { isVisible: false, onClose: () => {}, failedEndpoints: [], is503Error: false };
    }
    return getApiFailureModalProps();
  });

  // Scroll handling for search bar visibility - SSR-safe
  useEffect(() => {
    // Set initial state consistently for both SSR and CSR
    setShowSearch(!forceHideSearch && !isStaticPage);
    
    // Only run scroll handling in browser environment
    if (isSSR) {
      return;
    }

    if (focusSearch || forceHideSearch || isStaticPage) {
      setShowSearch(!forceHideSearch && !isStaticPage);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isScrollingUp = currentScrollY < lastScrollY;

          if (isScrollingUp) {
            setUpScrollDistance(prev => prev + (lastScrollY - currentScrollY));
          } else {
            setUpScrollDistance(0);
          }

          const shouldShow = currentScrollY === 0 || upScrollDistance >= 80;
          setShowSearch(shouldShow);

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, focusSearch, forceHideSearch, upScrollDistance, isStaticPage, isSSR]);

  // Control API blocking based on cookie consent - only for non-static pages and browser environment
  useEffect(() => {
    if (!isSSR && !isStaticPage) {
      // Block API calls if user hasn't opted in
      setApiBlocked(!hasOptedIn);
    }
  }, [isStaticPage, hasOptedIn, isSSR]);

  // Listen for modal state changes and update React state - only for non-static pages and browser environment
  useEffect(() => {
    if (isSSR || isStaticPage) {
      setModalProps({ isVisible: false, onClose: () => {}, failedEndpoints: [], is503Error: false });
      return;
    }

    const updateModalState = () => {
      const currentModalProps = getApiFailureModalProps();
      console.log('🔧 [LAYOUT] Modal state updated:', currentModalProps);
      console.log('🔧 [LAYOUT] Modal isVisible:', currentModalProps.isVisible);
      console.log('🔧 [LAYOUT] Modal failedEndpoints:', currentModalProps.failedEndpoints);
      setModalProps(currentModalProps);
    };

    // Add listener for modal state changes
    addModalStateListener(updateModalState);

    // Cleanup listener on unmount
    return () => {
      removeModalStateListener(updateModalState);
    };
  }, [isStaticPage]);

    const renderChildren = () => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        const childContent = child.props?.children;
        if (childContent && childContent.type === QuoteForm && onQuoteSubmit) {
          return React.cloneElement(child, {
            ...child.props,
            children: React.cloneElement(childContent, {
              ...childContent.props,
              onSubmit: onQuoteSubmit
            })
          });
        }
      }
      return child;
    });
  };

  return (
    <>
      {/* SEO and Metadata */}
      <Helmet>
        <title>PackMoveGo - Professional Moving & Packing Services</title>
        <meta name="description" content="Professional moving and packing services for residential and commercial moves. Trusted by thousands of customers." />
        <meta name="keywords" content="moving services, packing services, relocation, moving company" />
        <meta name="author" content="PackMoveGo Team" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph */}
        <meta property="og:title" content="PackMoveGo - Professional Moving & Packing Services" />
        <meta property="og:description" content="Professional moving and packing services for residential and commercial moves." />
        <meta property="og:url" content="https://packmovego.com" />
        <meta property="og:site_name" content="PackMoveGo" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="PackMoveGo Moving Services" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PackMoveGo - Professional Moving & Packing Services" />
        <meta name="twitter:description" content="Professional moving and packing services for residential and commercial moves." />
        <meta name="twitter:image" content="/og-image.jpg" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://packmovego.com" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Analytics />
        
        {/* Navigation Header */}
        {!forceHideNavbar && (
          <header className={`${isRelative ? 'relative' : 'sticky top-0'} w-full z-50`}>
            {isStaticPage ? (
              <StaticNavbar />
            ) : (
              <Navbar hasConsent={hasValidConsent} isWaitingForConsent={isWaitingForValidConsent} isApiBlocked={isApiBlockedForSSR} />
            )}
          {!forceHideSearch && !isStaticPage && (
            <div
              className={`w-full transition-all duration-300 ease-in-out transform ${
                showSearch ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-8 opacity-0 pointer-events-none'
              }`}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="w-full bg-white py-2 px-4">
                <SearchBar 
                  onSearch={onSearch}
                  onSearchComplete={onSearchComplete}
                  className="w-full"
                />
              </div>
            </div>
          )}
          </header>
        )}
        
        {/* Analytics - Only render in browser to prevent hydration mismatch */}
        {isProduction && !isSSR && (<><VercelAnalytics /><SpeedInsights /></>)}
        <main 
          className={`flex-grow transition-[padding] duration-200 ease-out
            ${noTopPadding ? '' : (!forceHideSearch ? 'pt-2' : 'pt-0')}`}
        >
          {renderChildren()}
        </main>
        <ScrollToTopButton />
        {!forceHideFooter && <Footer />}
        {/* Development Tools - Only show when NODE_ENV=development */}
        {/* {!isProduction && <DevToolsLauncher isVisible={true} />} */}
        
        {/* Cookie Modal - Show on non-static pages when user hasn't made a choice OR when 30 minutes have passed (SSR-safe) */}
        {!isStaticPage && (!hasMadeChoice || checkBannerTimer()) && !isSSR && (
          <CookieOptOut />
        )}
        
        {/* API Failure Modal - Only show on non-static pages (SSR-safe) */}
        {!isStaticPage && !isSSR && <ApiFailureModal {...modalProps} />}
      </div>
    </>
  );
};

Layout.displayName = 'Layout';

export default Layout; 