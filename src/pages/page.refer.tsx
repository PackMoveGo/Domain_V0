

import { lazy, Suspense } from 'react';
import { useReferral } from '../hook/useReferral';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import ReferPage from '../component/pages/page.Refer';

// Lazy load QuoteForm
const QuoteForm = lazy(() => import('../component/forms/form.quote'));

const ReferPageComponent = () => {
  const { referralData, isLoading, error } = useReferral();
  const { getSectionProps } = useGiveSectionId();

  return (
    <ErrorBoundary>
        <SEO
          title="Refer Friends & Earn Rewards - PackMoveGo Referral Program"
          description="Join PackMoveGo's referral program and earn rewards for recommending our professional moving services to friends and family. Get discounts on future moves!"
          keywords="referral program, earn rewards, refer friends, moving services referral, referral bonus, moving discounts, friend referral"
          url="https://packmovego.com/refer"
          type="website"
        />
        
        <div {...getSectionProps('hero')}>
            <ReferPage
            referralProgram={referralData?.referralProgram}
            howItWorks={referralData?.howItWorks}
            referralTerms={referralData?.referralTerms}
            referralStats={referralData?.referralStats}
            socialSharing={referralData?.socialSharing}
            referralForm={referralData?.referralForm}
            successStories={referralData?.successStories}
              isLoading={isLoading}
              error={error}
            />
        </div>

        {/* Quote Form Section */}
        <section {...getSectionProps('quote-form')}>
          <ErrorBoundary>
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
          </ErrorBoundary>
        </section>
    </ErrorBoundary>
  );
};

export default ReferPageComponent; 