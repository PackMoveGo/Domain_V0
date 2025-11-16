import React, { lazy, Suspense } from 'react';
import { useGiveSectionId, defaultAboutSections } from '../hook/useGiveSectionId';
import { getComprehensiveAboutPageData } from '../services/public/service.aboutPageAPI';
import { useCookiePreferences } from '../context/CookiePreferencesContext';
// Modal state is handled by Layout component

// Lazy load Hero component
const HeroAbout = lazy(() => import('../component/hero.about'));
const OurStory = lazy(() => import('../component/banner.ourStory'));
const MissionValues = lazy(() => import('../component/banner.missionValues'));
const ProfessionalTeam = lazy(() => import('../component/banner.professionalTeam'));
const ComprehensiveServices = lazy(() => import('../component/banner.comprehensiveServices'));
const WhyChooseUs = lazy(() => import('../component/features/banner.whyChooseUs'));
const QuoteForm = lazy(() => import('../component/forms/form.quote'));

// Add displayName to lazy components
(HeroAbout as any).displayName='HeroAbout';
(OurStory as any).displayName='OurStory';
(MissionValues as any).displayName='MissionValues';
(ProfessionalTeam as any).displayName='ProfessionalTeam';
(ComprehensiveServices as any).displayName='ComprehensiveServices';
(WhyChooseUs as any).displayName='WhyChooseUs';
(QuoteForm as any).displayName='QuoteForm';

export default function AboutPage() {
  // Check if we're in SSR mode
  const isSSR = typeof window === 'undefined';
  // const isProduction = process.env.NODE_ENV === 'production'; // Reserved for future use
  
  // Get cookie preferences to listen for consent changes
  const { hasConsent, addConsentListener } = useCookiePreferences();
  
  // State for about page data - initialize with SSR-safe defaults
  const [aboutPageData, setAboutPageData] = React.useState<any>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(false); // Never show loading during SSR
  const [dataError, setDataError] = React.useState<string | null>(null);
  
  // Modal state is handled by Layout component
  
  // Page tracking is now handled by RouteTracker in app.tsx
  
  // Load about page data using comprehensive API service with modal middleware
  const loadAboutPageData = React.useCallback(async () => {
    // Skip API calls during SSR
    if (isSSR) {
      return;
    }
    
    setIsLoadingData(true);
    setDataError(null);
    
    try {
      console.log('🚀 Loading about page data via comprehensive API service with modal middleware...');
      
      // Use the comprehensive about page data function that includes modal middleware
      const data = await getComprehensiveAboutPageData();
      
      // Check if the data contains 503 error information
      if (data && (data as any).error && (data as any).is503Error) {
        setDataError('503 Service Unavailable');
        setAboutPageData(null);
        return;
      }
      
      setAboutPageData(data);
      
      // Check if there are any errors but don't block rendering
      const hasErrors = data.hasErrors || (!data.nav && !data.about);
      if (hasErrors) {
        // Log error but don't prevent page from rendering
        console.warn('⚠️ Some about page data failed to load, using fallback data');
        setDataError('Some data unavailable - using fallback');
      } else {
        setDataError(null);
      }
      
      console.log('✅ About page data loaded successfully:', {
        nav: !!data.nav,
        about: !!data.about,
        totalMovesCount: data.totalMovesCount
      });
    } catch (error) {
      console.error('❌ Failed to load about page data:', error);
      
      // Check if this is a 503 error
      if (error instanceof Error && (error as any).is503Error) {
        setDataError('503 Service Unavailable');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
        setDataError(errorMessage);
      }
      
      // Modal will be handled by middleware automatically
    } finally {
      setIsLoadingData(false);
    }
  }, [isSSR]);

  // Check initial consent state and load data if already granted - ALWAYS load if consent exists
  React.useEffect(() => {
    if (!isSSR && hasConsent) {
      console.log('🍪 [ABOUT-PAGE] Consent already granted on mount - loading data');
      // Increased delay to ensure API is fully unblocked
      setTimeout(() => {
        loadAboutPageData();
      }, 200);
    }
  }, [isSSR, hasConsent, loadAboutPageData]);

  // Call load data on component mount (client-side only) - only if no consent yet
  React.useEffect(() => {
    if (!isSSR && !hasConsent) {
      // Try to load anyway - will be blocked by consent but sets up the state
      loadAboutPageData();
    }
  }, [isSSR, hasConsent, loadAboutPageData]);

  // Listen for consent granted events - ALWAYS reload when consent is granted
  React.useEffect(() => {
    if (!isSSR) {
      const removeListener = addConsentListener((hasConsent) => {
        // When consent is granted, reload page data
        if (hasConsent) {
          console.log('🍪 [ABOUT-PAGE] Consent granted - reloading page data');
          // Increased delay and force reload regardless of existing data
          setTimeout(() => {
            loadAboutPageData();
          }, 200);
        }
      });
      
      // Listen for all consent-related window events
      const handleConsentGranted = () => {
        console.log('🍪 [ABOUT-PAGE] Window event: consent granted - reloading data');
        setTimeout(() => {
          loadAboutPageData();
        }, 200);
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
    }
  }, [isSSR, addConsentListener, loadAboutPageData]);

  // Modal state is handled by Layout component
  
  const { getSectionProps } = useGiveSectionId(defaultAboutSections);

  // Always render content - no loading state that blocks SSR

  return (
    <div className="min-h-screen bg-white">
        {/* Hero Section - Lazy loaded with Suspense */}
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
            <HeroAbout />
          </Suspense>
        </section>

        {/* Our Story Section - Lazy loaded with Suspense */}
        <section {...getSectionProps('our-story')}>
          <Suspense fallback={
            <div className="py-16 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Our Story...</p>
              </div>
            </div>
          }>
            <OurStory />
          </Suspense>
        </section>

        {/* Mission & Values Section - Lazy loaded with Suspense */}
        <section {...getSectionProps('mission-values')}>
          <Suspense fallback={
            <div className="py-16 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Mission & Values...</p>
              </div>
            </div>
          }>
            <MissionValues />
          </Suspense>
        </section>

        {/* Our Team Section - Lazy loaded with Suspense */}
        <section {...getSectionProps('team')}>
          <Suspense fallback={
            <div className="py-16 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Professional Team...</p>
              </div>
            </div>
          }>
            <ProfessionalTeam />
          </Suspense>
        </section>

        {/* Our Services Section - Lazy loaded with Suspense */}
        <section {...getSectionProps('services')}>
          <Suspense fallback={
            <div className="py-16 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Comprehensive Services...</p>
              </div>
            </div>
          }>
            <ComprehensiveServices />
          </Suspense>
        </section>

        {/* Why Choose Us Section - Lazy loaded with Suspense */}
        <section {...getSectionProps('why-choose-us')}>
          <Suspense fallback={
            <div className="py-16 bg-blue-600 text-white flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Loading Why Choose Us...</p>
              </div>
            </div>
          }>
            <WhyChooseUs 
              totalMovesCount={aboutPageData?.totalMovesCount !== undefined ? aboutPageData.totalMovesCount : 0}
              isLoading={isLoadingData}
              error={aboutPageData?.totalMovesError || dataError}
            />
          </Suspense>
        </section>

        {/* Quote Form Section - Lazy loaded with Suspense */}
        <section {...getSectionProps('quote-form')}>
          <Suspense fallback={
            <div className="py-16 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Quote Form...</p>
              </div>
            </div>
          }>
            <QuoteForm />
          </Suspense>
        </section>
        
    </div>
  );
}

// Add displayName for React DevTools
AboutPage.displayName = 'AboutPage';