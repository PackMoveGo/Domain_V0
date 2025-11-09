
import { useReviews } from '../hook/useReviews';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import Reviews from '../component/pages/Reviews';

const ReviewPage = () => {
  const { reviews, stats, services, isLoading, error } = useReviews();
  const { getSectionProps } = useGiveSectionId();

  return (
    <ErrorBoundary>
        <SEO
          title="Customer Reviews - Pack Move Go"
          description="Read what our customers say about Pack Move Go's professional moving and packing services."
          keywords="customer reviews, moving reviews, packing reviews, testimonials"
        />
        
        <div {...getSectionProps('hero')}>
          <Reviews reviews={reviews} stats={stats} services={services} isLoading={isLoading} error={error} />
        </div>
    </ErrorBoundary>
  );
};

export default ReviewPage; 