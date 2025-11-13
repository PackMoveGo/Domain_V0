

import { useReferral } from '../hook/useReferral';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import ReferPage from '../component/pages/ReferPage';

const ReferPageComponent = () => {
  const { referralData, isLoading, error } = useReferral();
  const { getSectionProps } = useGiveSectionId();

  return (
    <ErrorBoundary>
        <SEO
          title="Referral Program - Pack Move Go"
          description="Join our referral program and earn rewards for recommending Pack Move Go services to friends and family."
          keywords="referral program, earn rewards, moving services referral"
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
    </ErrorBoundary>
  );
};

export default ReferPageComponent; 