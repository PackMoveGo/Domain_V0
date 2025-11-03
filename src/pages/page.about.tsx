import React, { lazy, Suspense } from 'react';
import { useGiveSectionId, defaultAboutSections } from '../hook/useGiveSectionId';
import { getComprehensiveAboutPageData } from '../services/public/service.aboutPageAPI';
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
  const isProduction = process.env.NODE_ENV === 'production';
  
  // State for about page data - initialize with SSR-safe defaults
  const [aboutPageData, setAboutPageData] = React.useState<any>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(false); // Never show loading during SSR
  const [dataError, setDataError] = React.useState<string | null>(null);
  
  // Modal state is handled by Layout component
  
  // Load about page data using comprehensive API service with modal middleware
  const loadAboutPageData = async () => {
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
      
      // Check if there are any errors and set appropriate states
      const hasErrors = !data.nav || !data.about || !data.totalMovesCount;
      if (hasErrors) {
        setDataError('503 Service Unavailable');
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
  };

  // Call load data on component mount (client-side only)
  React.useEffect(() => {
    if (!isSSR) {
      loadAboutPageData();
    }
  }, [isSSR]);

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
              totalMovesCount={aboutPageData?.totalMovesCount || 500}
              isLoading={isLoadingData}
              error={dataError}
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
            {dataError ? (
              <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Your Free Quote</h2>
                    <p className="text-lg text-gray-600 mb-8">Fill out the form and a team member will follow up with you</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
                      <div className="flex items-center justify-center mb-4">
                        <div className="text-yellow-600 text-4xl mr-3">⚠️</div>
                        <h3 className="text-lg font-semibold text-yellow-800">Form Temporarily Unavailable</h3>
                      </div>
                      <p className="text-yellow-700 mb-4">
                        Our contact form is currently experiencing technical difficulties. Please use one of the alternative contact methods below.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                          href="tel:(949) 414-5282"
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Call Us: (949) 414-5282
                        </a>
                        <a
                          href="mailto:info@packmovego.com"
                          className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                          Email Us: info@packmovego.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <QuoteForm />
            )}
          </Suspense>
        </section>
        
    </div>
  );
}

// Add displayName for React DevTools
AboutPage.displayName = 'AboutPage';