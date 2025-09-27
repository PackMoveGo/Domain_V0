import React, { FC, ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

interface LayoutSSRProps {
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
  // SSR-specific props
  isSSR?: boolean;
  initialScrollY?: number;
  hasConsent?: boolean;
  isWaitingForConsent?: boolean;
  isApiBlocked?: boolean;
  hasOptedOut?: boolean;
  hasMadeChoice?: boolean;
  hasOptedIn?: boolean;
}

const LayoutSSR: FC<LayoutSSRProps> = ({
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
  isSSR = false,
  initialScrollY = 0,
  hasConsent = false,
  isWaitingForConsent = false,
  isApiBlocked = false,
  hasOptedOut = false,
  hasMadeChoice = false,
  hasOptedIn = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProduction = (import.meta as any).env?.NODE_ENV === 'production';
  
  // Static pages that don't need API failure modal or search bar
  const staticPages = ['/cookie-opt-out', '/privacy', '/terms'];
  const isStaticPage = staticPages.includes(location.pathname);
  
  // Search bar visibility state - SSR-safe initialization
  const [showSearch, setShowSearch] = useState(() => {
    if (isSSR) {
      return !forceHideSearch && !isStaticPage;
    }
    return true;
  });
  const [lastScrollY, setLastScrollY] = useState(initialScrollY);
  const [upScrollDistance, setUpScrollDistance] = useState(0);
  
  // Modal state management - only for non-static pages
  const [modalProps, setModalProps] = useState<{
    isVisible: boolean;
    onClose: () => void;
    failedEndpoints: string[];
    is503Error: boolean;
  }>(() => 
    isStaticPage ? { isVisible: false, onClose: () => {}, failedEndpoints: [], is503Error: false } : { isVisible: false, onClose: () => {}, failedEndpoints: [], is503Error: false }
  );

  // Scroll handling for search bar visibility - SSR-safe
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || isSSR) {
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
  }, [lastScrollY, focusSearch, forceHideSearch, upScrollDistance, isStaticPage, isSSR]);

  // Control API blocking based on cookie consent - only for non-static pages and browser environment
  useEffect(() => {
    if (typeof window !== 'undefined' && !isStaticPage && !isSSR) {
      // Import and use setApiBlocked only in browser
      import('../../services/service.apiSW').then(({ setApiBlocked }) => {
        setApiBlocked(!hasOptedIn);
      });
    }
  }, [isStaticPage, hasOptedIn, isSSR]);

  // Listen for modal state changes and update React state - only for non-static pages and browser environment
  useEffect(() => {
    if (typeof window === 'undefined' || isStaticPage || isSSR) {
      setModalProps({ isVisible: false, onClose: () => {}, failedEndpoints: [], is503Error: false });
      return;
    }

    // Import and use modal functions only in browser
    import('../../services/service.apiSW').then(({ getApiFailureModalProps, addModalStateListener, removeModalStateListener }) => {
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
    });
  }, [isStaticPage, isSSR]);

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
      
      {isProduction && !isSSR && (<><VercelAnalytics /><SpeedInsights /></>)}
      <main 
        className={`flex-grow transition-[padding] duration-200 ease-out
          ${noTopPadding ? '' : (!forceHideSearch ? 'pt-2' : 'pt-0')}`}
      >
        {renderChildren()}
      </main>
      {/* Cookie Modal - Only show on non-static pages when user hasn't made a choice */}
      {!isStaticPage && !hasMadeChoice && !isSSR && (
        <CookieOptOut />
      )}
      {!isSSR && <ScrollToTopButton />}
      {!forceHideFooter && <Footer />}
      {/* Development Tools - Only show when NODE_ENV=development and not SSR */}
      {/* {!isProduction && !isSSR && <DevToolsLauncher isVisible={true} />} */}
      {/* API Failure Modal - Only show on non-static pages when user has opted in */}
      {!isStaticPage && hasOptedIn && !isSSR && <ApiFailureModal {...modalProps} />}
    </div>
  );
};

LayoutSSR.displayName = 'LayoutSSR';

export default LayoutSSR;
