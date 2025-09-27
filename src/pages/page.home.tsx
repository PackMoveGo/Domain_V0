import React, { lazy, Suspense } from 'react'; // Added missing import
import Layout from '../component/layout/Layout';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import { getHomePageData, getHomePageStatusCode, getHomePageFailedEndpoints, HomePageServiceData } from '../services/public/service.homePageAPI';
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
(FinalCTA as any).displayName='FinalCTA';

export default function HomePage(){
  // State for home page data
  const [homePageData, setHomePageData] = React.useState<HomePageServiceData | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(false);
  const [dataError, setDataError] = React.useState<string | null>(null);
  const [statusCode, setStatusCode] = React.useState<number>(200);

  // Check if we're in production mode (SSR-safe)
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Load home page data using service pattern
  const loadHomePageData = async () => {
    if (isProduction) return;
    
    setIsLoadingData(true);
    setDataError(null);
    setStatusCode(200);
    
    try {
      // Use the home page service data function
      const data = await getHomePageData();
      
      setHomePageData(data);
      setStatusCode(getHomePageStatusCode());
      
      // Check if there are any errors and set appropriate states
      const hasErrors = !data.services || !data.testimonials || !data.recentMoves || !data.nav || !data.authStatus;
      if (hasErrors) {
        setDataError('503 Service Unavailable');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setDataError(errorMessage);
      setStatusCode(getHomePageStatusCode());
      
      // Modal will be handled by middleware automatically
    } finally {
      setIsLoadingData(false);
    }
  };

  // Call load data on component mount
  React.useEffect(() => {
    loadHomePageData();
  }, []);

  // Modal is now managed by middleware - no need for state listeners
  
  const {getSectionProps} = useGiveSectionId();

  // Determine if we should show services in Hero
  const shouldShowServicesInHero = !isProduction && homePageData?.services;
  
  // Transform services data for components
  const servicesData = homePageData?.services?.services || [];
  const recentMovesData = homePageData?.recentMoves?.recentMoves || homePageData?.recentMoves?.moves || [];
  const testimonialsData = homePageData?.testimonials?.testimonials || [];
  const totalMoves = recentMovesData.length || 0;
  const totalMovesCount = homePageData?.totalMoves || 500;

  // Show loading state while data is being fetched
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Home...</h2>
          <p className="text-gray-600">Please wait while we load the home page content</p>
        </div>
      </div>
    );
  }

  return (
    <Layout forceHideSearch={false}>
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
              isLoading={isLoadingData} 
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
            isLoading={isLoadingData}
            error={dataError}
          />
        </section>

        {/* Services Section - Only show when API is available and not in production */}
        {shouldShowServicesInHero && (
          <section {...getSectionProps('services')}>
            <OurServices 
              services={servicesData}
              isLoading={isLoadingData}
              error={dataError}
            />
          </section>
        )}

        {/* Process Steps Section */}
        <section {...getSectionProps('process-steps')}>
          <ProcessSteps />
        </section>

        {/* Our Services Section */}
        <section {...getSectionProps('services')}>
          <OurServices 
            services={servicesData}
            isLoading={isLoadingData}
            error={dataError}
          />
        </section>

        {/* Testimonials Section */}
        <section {...getSectionProps('testimonials')}>
          <Testimonials 
            testimonials={testimonialsData}
            isLoading={isLoadingData}
            error={dataError}
          />
        </section>

        {/* Recent Moves Section */}
        <section {...getSectionProps('recent-moves')}>
          <RecentMoves 
            recentMoves={recentMovesData}
            isLoading={isLoadingData}
            error={dataError}
          />
        </section>

        {/* Why Choose Us Section */}
        <section {...getSectionProps('why-choose-us')}>
          <WhyChooseUs 
            totalMovesCount={totalMovesCount}
            isLoading={isLoadingData}
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

        {/* Final CTA Section */}
        <section {...getSectionProps('final-cta')}>
          <FinalCTA />
        </section>
      </div>
      
    </Layout>
  );
}

// Add displayName for React DevTools
HomePage.displayName='HomePage'; 