
import { useReviews } from '../hook/useReviews';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import Layout from '../component/layout/Layout';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import Reviews from '../component/pages/Reviews';

const ReviewPage = () => {
  const { reviews, stats, services, isLoading, error } = useReviews();
  const { getSectionProps } = useGiveSectionId();

  return (
    <ErrorBoundary>
      <Layout>
        <SEO
          title="Customer Reviews - Pack Move Go"
          description="Read what our customers say about Pack Move Go's professional moving and packing services."
          keywords="customer reviews, moving reviews, packing reviews, testimonials"
        />
        
        <div {...getSectionProps('hero')}>
          <Reviews reviews={reviews} stats={stats} services={services} isLoading={isLoading} error={error} />
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default ReviewPage; 