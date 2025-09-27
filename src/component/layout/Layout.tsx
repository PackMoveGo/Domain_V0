import React, { FC, ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCookiePreferences } from '../../context/CookiePreferencesContext';
import { getApiFailureModalProps, addModalStateListener, removeModalStateListener, setApiBlocked } from '../../services/service.apiSW';
import { SearchResult } from '../../util/search';
import { FormData } from '../forms/form.quote';
import Analytics from '../business/Analytics';
import Navbar, { StaticNavbar } from '../navigation/Navbar';
import SearchBar from '../navigation/SearchBar';
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import QuoteForm from '../forms/form.quote';
import ScrollToTopButton from '../ui/navigation/ScrollToTopButton';
import Footer from '../ui/footer.footer';
// import DevToolsLauncher from '../devtools/DevToolsLauncher';
import ApiFailureModal from '../ui/overlay/modal.apistatus';
import CookieOptOut from '../../pages/modal.cookieOptOut';
import LayoutSSR from './LayoutSSR';

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
  const location = useLocation();
  const navigate = useNavigate();
  const isProduction = (import.meta as any).env?.NODE_ENV === 'production';
  
  // Detect if we're in SSR mode
  const isServerSide = typeof window === 'undefined' || isSSR;
  
  // If SSR, use the SSR-safe layout component
  if (isServerSide) {
    return (
      <LayoutSSR
        forceHideSearch={forceHideSearch}
        focusSearch={focusSearch}
        noTopPadding={noTopPadding}
        isRelative={isRelative}
        forceHideNavbar={forceHideNavbar}
        forceHideFooter={forceHideFooter}
        onSearch={onSearch}
        onSearchComplete={onSearchComplete}
        onQuoteSubmit={onQuoteSubmit}
        isSSR={true}
        hasConsent={false}
        isWaitingForConsent={false}
        isApiBlocked={false}
        hasOptedOut={false}
        hasMadeChoice={false}
        hasOptedIn={false}
      >
        {children}
      </LayoutSSR>
    );
  }
  
  // SSR-safe context usage - always use context but handle SSR gracefully
  let cookiePrefs;
  try {
    cookiePrefs = useCookiePreferences();
  } catch (error) {
    // Fallback for SSR when context is not available
    cookiePrefs = {
      hasConsent: false,
      isWaitingForConsent: false,
      isApiBlocked: false,
      optIn: () => {},
      hasOptedOut: false,
      hasMadeChoice: false,
      hasOptedIn: false
    };
  }
  const { hasConsent, isWaitingForConsent, isApiBlocked, optIn, hasOptedOut, hasMadeChoice, hasOptedIn } = cookiePrefs;
  
  // Static pages that don't need API failure modal or search bar
  const staticPages = ['/cookie-opt-out', '/privacy', '/terms'];
  const isStaticPage = staticPages.includes(location.pathname);
  
  // Search bar visibility state
  const [showSearch, setShowSearch] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [upScrollDistance, setUpScrollDistance] = useState(0);
  
  // Modal state management - only for non-static pages
  const [modalProps, setModalProps] = useState(() => 
    isStaticPage ? { isVisible: false, onClose: () => {}, failedEndpoints: [], is503Error: false } : getApiFailureModalProps()
  );

  // Scroll handling for search bar visibility - SSR-safe
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      setShowSearch(!forceHideSearch && !isStaticPage);
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
  }, [lastScrollY, focusSearch, forceHideSearch, upScrollDistance, isStaticPage]);

  // Control API blocking based on cookie consent - only for non-static pages and browser environment
  useEffect(() => {
    if (typeof window !== 'undefined' && !isStaticPage) {
      // Block API calls if user hasn't opted in
      setApiBlocked(!hasOptedIn);
    }
  }, [isStaticPage, hasOptedIn]);

  // Listen for modal state changes and update React state - only for non-static pages and browser environment
  useEffect(() => {
    if (typeof window === 'undefined' || isStaticPage) {
      setModalProps({ isVisible: false, onClose: () => {}, failedEndpoints: [], is503Error: false });
      return;
    }

    const updateModalState = () => {
      const currentModalProps = getApiFailureModalProps();
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
    <div className="flex flex-col min-h-screen">
      <Analytics />
      
      {/* Navigation Header */}
      {!forceHideNavbar && (
        <header className={`${isRelative ? 'relative' : 'sticky top-0'} w-full z-50`}>
          {isStaticPage ? <StaticNavbar /> : <Navbar hasConsent={hasOptedIn} isWaitingForConsent={!hasOptedIn} isApiBlocked={!hasOptedIn} />}
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
      
      {isProduction && (<><VercelAnalytics /><SpeedInsights /></>)}
      <main 
        className={`flex-grow transition-[padding] duration-200 ease-out
          ${noTopPadding ? '' : (!forceHideSearch ? 'pt-2' : 'pt-0')}`}
      >
        {renderChildren()}
      </main>
      {/* Cookie Modal - Only show on non-static pages when user hasn't made a choice */}
      {!isStaticPage && !hasMadeChoice && (
        <CookieOptOut />
      )}
      <ScrollToTopButton />
      {!forceHideFooter && <Footer />}
      {/* Development Tools - Only show when NODE_ENV=development */}
      {/* {!isProduction && <DevToolsLauncher isVisible={true} />} */}
      {/* API Failure Modal - Only show on non-static pages when user has opted in */}
      {!isStaticPage && hasOptedIn && <ApiFailureModal {...modalProps} />}
    </div>
  );
};

Layout.displayName = 'Layout';

export default Layout; 