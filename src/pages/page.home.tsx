import React, { lazy, Suspense } from 'react'; // Added missing import
import { useGiveSectionId } from '../hook/useGiveSectionId';
import { getHomePageData, /* getHomePageStatusCode, getHomePageFailedEndpoints */ HomePageServiceData } from '../services/public/service.homePageAPI'; // Reserved for future use
import { useCookiePreferences } from '../context/CookiePreferencesContext';
import { useTestimonials } from '../hook/useTestimonials';
import { 
  FALLBACK_SERVICES, 
  FALLBACK_TESTIMONIALS, 
  FALLBACK_RECENT_MOVES, 
  FALLBACK_TOTAL_MOVES,
  shouldUseFallback 
} from '../data/fallbackData';
import { logger } from '../util/logger';
// Modal state is handled by Layout component
// import SEO from '../component/business/SEO'; // SEO complation
// const { getSectionProps, isTampered, SectionWarning } = useGiveSectionId(contactPageSections); Hash validation example implmintation

// Lazy load Hero component
const Hero = lazy(() => import('../component/pages/hero.home'));
const OurServices = lazy(() => import('../component/business/services/banner.ourServices'));
const Testimonials = lazy(() => import('../component/testimonials/banner.testimonials'));
const WhyChooseUs = lazy(() => import('../component/features/banner.whyChooseUs'));
const ServiceAreas = lazy(() => import('../component/service-areas/banner.serviceAreas'));
const DownloadApps = lazy(() => import('../component/ui/banner.downloadApps'));
const Statistics = lazy(() => import('../component/business/marketing/banner.statistics'));
const ProcessSteps = lazy(() => import('../component/business/marketing/banner.processSteps'));
const RecentMoves = lazy(() => import('../component/business/marketing/banner.recentMoves'));
const EmergencyContact = lazy(() => import('../component/business/contact/banner.emergencyContact'));
const FAQ = lazy(() => import('../component/pages/banner.FAQ'));
const QuoteForm = lazy(() => import('../component/forms/form.quote'));
const FinalCTA = lazy(() => import('../component/business/marketing/banner.finalCTA'));

// Add displayName to lazy components
(Hero as any).displayName='Hero';
(OurServices as any).displayName='OurServices';
(Testimonials as any).displayName='Testimonials';
(WhyChooseUs as any).displayName='WhyChooseUs';
(ServiceAreas as any).displayName='ServiceAreas';
(DownloadApps as any).displayName='DownloadApps';
(Statistics as any).displayName='Statistics';
(ProcessSteps as any).displayName='ProcessSteps';
(RecentMoves as any).displayName='RecentMoves';
(EmergencyContact as any).displayName='EmergencyContact';
(FAQ as any).displayName='FAQ';
(QuoteForm as any).displayName='QuoteForm';
(FinalCTA as any).displayName='FinalCTA';

export default function HomePage(){
  // Check if we're in SSR mode
  const isSSR = typeof window === 'undefined';
  // const isProduction = process.env.NODE_ENV === 'production'; // Reserved for future use
  
  // Get cookie preferences to listen for consent changes
  const { hasConsent, addConsentListener } = useCookiePreferences();
  
  // State for home page data - initialize with SSR-safe defaults
  const [homePageData, setHomePageData] = React.useState<HomePageServiceData | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(false); // Never show loading during SSR
  const [dataError, setDataError] = React.useState<string | null>(null);
  const [_statusCode, setStatusCode] = React.useState<number>(200); // Reserved for future use
  
  // Ref to prevent duplicate calls in React Strict Mode
  const isLoadingRef = React.useRef(false);
  const hasLoadedRef = React.useRef(false);
  
  // Modal state is handled by Layout component
  
  // Page tracking is now handled by RouteTracker in app.tsx
  
  // Load home page data using service pattern
  const loadHomePageData = React.useCallback(async () => {
    // Skip API calls during SSR
    if (isSSR) {
      return;
    }
    
    // Prevent duplicate calls (React Strict Mode protection)
    if (isLoadingRef.current) {
      return;
    }
    
    isLoadingRef.current = true;
    setIsLoadingData(true);
    setDataError(null);
    setStatusCode(200);
    
    try {
      // Use the home page service data function
      const data = await getHomePageData();
      
      // Check if the data contains 503 error information
      // Don't set dataError - let components handle null data gracefully
      if (data && (data as any).error && (data as any).is503Error) {
        setStatusCode(503);
        // Don't set dataError - components will handle null data gracefully
        // setDataError('503 Service Unavailable');
        setHomePageData(null);
        return;
      }
      
      setHomePageData(data);
      setStatusCode(200);
      
      // Don't set error just because data is null - null is valid when API calls fail
      // Only set error if there's an actual error in the data object itself
      // The components will handle null data gracefully
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      
      // Check if this is a 503 error
      // IMPORTANT: Don't set dataError for 503 errors - let components handle null data gracefully
      // The API failure modal will be shown by middleware, and components will show friendly messages
      if (error instanceof Error && (error as any).is503Error) {
        setStatusCode(503);
        // Don't set dataError - let components handle null data gracefully
        // setDataError('503 Service Unavailable');
      } else {
        // Only set error for non-503 errors (actual failures, not just API unavailability)
        setDataError(errorMessage);
        setStatusCode(500);
      }
      
      // Modal will be handled by middleware automatically
    } finally {
      isLoadingRef.current = false;
      hasLoadedRef.current = true;
      setIsLoadingData(false);
    }
  }, [isSSR]);

  // Consolidated effect: Check initial consent state and load data once
  React.useEffect(() => {
    if (isSSR) return;
    
    // Only load once on mount, or when consent changes from false to true
    if (hasConsent && !hasLoadedRef.current) {
      // Increased delay to ensure API is fully unblocked
      setTimeout(() => {
        loadHomePageData();
      }, 200);
    } else if (!hasConsent && !hasLoadedRef.current) {
      // Try to load anyway - will be blocked by consent but sets up the state
      loadHomePageData();
    }
  }, [isSSR, hasConsent, loadHomePageData]);

  // Listen for consent granted events - ALWAYS reload when consent is granted
  React.useEffect(() => {
    if (isSSR) return;
    
    let previousConsent = hasConsent;
    const removeListener = addConsentListener((newHasConsent) => {
      // When consent is granted, reload page data (only if it changed from false to true)
      if (newHasConsent && !previousConsent) {
        hasLoadedRef.current = false; // Reset to allow reload
        previousConsent = newHasConsent;
          // Increased delay and force reload regardless of existing data
          setTimeout(() => {
            loadHomePageData();
          }, 200);
      } else {
        previousConsent = newHasConsent;
        }
      });
      
      // Listen for all consent-related window events
      const handleConsentGranted = () => {
      if (!previousConsent) {
        hasLoadedRef.current = false; // Reset to allow reload
        previousConsent = true;
        setTimeout(() => {
          loadHomePageData();
        }, 200);
      }
      };
      
      window.addEventListener('cookie-opt-in', handleConsentGranted);
      window.addEventListener('api-consent-granted', handleConsentGranted);
      window.addEventListener('cookie-consent-change', handleConsentGranted);
      
      // Cleanup listeners on unmount
      return () => {
        removeListener();
        window.removeEventListener('cookie-opt-in', handleConsentGranted);
        window.removeEventListener('api-consent-granted', handleConsentGranted);
        window.removeEventListener('cookie-consent-change', handleConsentGranted);
      };
  }, [isSSR, addConsentListener, loadHomePageData]);

  // Modal state is handled by Layout component
  
  // Always call hooks at the top level (React Hooks rule)
  const sectionHook = useGiveSectionId();
  
  // Use conditional values based on SSR, but hook is always called
  const getSectionProps = isSSR ? ((id: string) => ({ id })) : sectionHook.getSectionProps;

  // Determine if we should show services in Hero (SSR-safe)
  const shouldShowServicesInHero = isSSR ? true : homePageData?.services;
  
  // Transform services data for components (SSR-safe with fallbacks)
  // Handle different response structures: { services: [...] } or [...] directly
  // Use testimonials hook for API-based testimonials
  const { testimonials: apiTestimonials, isLoading: testimonialsLoading, error: testimonialsError } = useTestimonials();
  
  // Determine if we should use fallback data (503 error or API completely down)
  const useFallback = !isSSR && shouldUseFallback(homePageData, _statusCode, dataError);
  
  // Services data with fallback support
  const servicesData = isSSR ? [] : (
    useFallback 
      ? FALLBACK_SERVICES
      : (homePageData?.services 
          ? (Array.isArray(homePageData.services) 
              ? homePageData.services 
              : (homePageData.services.services || homePageData.services.data || []))
          : [])
  );
  
  // Recent moves data with fallback support
  const recentMovesData = isSSR ? [] : (
    useFallback
      ? FALLBACK_RECENT_MOVES
      : (homePageData?.recentMoves?.recentMoves || homePageData?.recentMoves?.moves || [])
  );
  
  // Testimonials data with fallback support
  // Use API testimonials if available, otherwise fall back to homePageData or fallback
  const testimonialsData = isSSR ? [] : (
    useFallback
      ? FALLBACK_TESTIMONIALS
      : (apiTestimonials.length > 0 
          ? apiTestimonials 
          : (homePageData?.testimonials?.testimonials || []))
  );
  
  const totalMoves = isSSR ? 0 : (recentMovesData.length || 0);
  
  // Total moves count with fallback support
  const totalMovesCount = isSSR ? 0 : (() => {
    if (useFallback) {
      return FALLBACK_TOTAL_MOVES;
    }
    
    const totalMovesValue = homePageData?.totalMoves;
    
    if (typeof totalMovesValue === 'number') {
      return totalMovesValue; // Allow 0 as valid
    }
    
    if (totalMovesValue && typeof totalMovesValue === 'object') {
      // Handle object responses like { totalCount: 0 }
      const count = (totalMovesValue as any).totalCount || (totalMovesValue as any).total_count || (totalMovesValue as any).count;
      if (count !== undefined && count !== null) {
        return count; // Allow 0 as valid
      }
      return 0; // Default for object without valid count
    }
    
    if (totalMovesValue !== undefined && totalMovesValue !== null) {
      const parsed = parseInt(String(totalMovesValue), 10);
      return isNaN(parsed) ? 0 : parsed; // Allow 0 as valid, default to 0 if NaN
    }
    
    return 0; // Default to 0 for new businesses
  })();

  // Always render content - no loading state that blocks navigation

  return (
    <div className="min-h-screen bg-white">
        {/* Hero Section (above the fold) - Lazy loaded with Suspense */}
        <section {...getSectionProps('hero')}>
          <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Hero...</h2>
                <p className="text-gray-600">Please wait while we load the hero section</p>
              </div>
            </div>
          }>
            <Hero 
              services={shouldShowServicesInHero ? servicesData : []} 
              isLoading={isLoadingData && !isSSR} 
              error={dataError} 
            />
          </Suspense>
        </section>

        {/* Emergency Contact Section */}
        <section {...getSectionProps('emergency-contact')}>
          <EmergencyContact />
        </section>

        {/* Statistics Section */}
        <section {...getSectionProps('statistics')}>
          <Statistics 
            totalMoves={totalMoves}
            isLoading={isLoadingData && !isSSR}
            error={dataError}
          />
        </section>

        {/* Process Steps Section */}
        <section {...getSectionProps('process-steps')}>
          <ProcessSteps />
        </section>

        {/* Our Services Section */}
        <section {...getSectionProps('services')}>
          <OurServices 
            services={servicesData}
            isLoading={isLoadingData && !isSSR}
            error={dataError}
          />
        </section>

        {/* Testimonials Section */}
        <section {...getSectionProps('testimonials')}>
          <Testimonials 
            testimonials={testimonialsData}
            isLoading={testimonialsLoading || (isLoadingData && !isSSR)}
            error={testimonialsError || dataError}
          />
        </section>

        {/* Recent Moves Section */}
        <section {...getSectionProps('recent-moves')}>
          <RecentMoves 
            recentMoves={recentMovesData}
            isLoading={isLoadingData && !isSSR}
            error={dataError}
          />
        </section>

        {/* Why Choose Us Section */}
        <section {...getSectionProps('why-choose-us')}>
          <WhyChooseUs 
            totalMovesCount={totalMovesCount}
            isLoading={isLoadingData && !isSSR}
            error={dataError}
          />
        </section>

        {/* Service Areas Section */}
        <section {...getSectionProps('service-areas')}>
          <ServiceAreas 
            error={dataError}
          />
        </section>

        {/* FAQ Section */}
        <section {...getSectionProps('faq')}>
          <FAQ />
        </section>

        {/* Download Apps Section */}
        <section {...getSectionProps('download-apps')}>
          <DownloadApps />
        </section>

        {/* Quote Form Section - Connects to MongoDB */}
        <section {...getSectionProps('quote-form')}>
          <Suspense fallback={
            <div className="py-16 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Quote Form...</p>
              </div>
            </div>
          }>
            <QuoteForm />
          </Suspense>
        </section>

        {/* Final CTA Section */}
        <section {...getSectionProps('final-cta')}>
          <FinalCTA />
        </section>
        
    </div>
  );
}

// Add displayName for React DevTools
HomePage.displayName='HomePage'; 