import { useReviews } from '../hook/useReviews';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import Reviews from '../component/pages/page.Reviews';

const ReviewPage = () => {
  const { reviews, stats, services, isLoading, error } = useReviews();
  const { getSectionProps } = useGiveSectionId();

  return (
    <ErrorBoundary>
        <SEO
          title="Customer Reviews & Testimonials - PackMoveGo | 5-Star Moving Services"
          description="Read real customer reviews and testimonials about PackMoveGo's professional moving services. See why thousands trust us with their residential and commercial moves."
          keywords="customer reviews, moving reviews, testimonials, moving company ratings, 5-star movers, customer feedback, moving service reviews, packmovego reviews"
          url="https://packmovego.com/review"
          type="website"
        />
        
        <div {...getSectionProps('hero')}>
          <Reviews reviews={reviews} stats={stats} services={services} isLoading={isLoading} error={error} />
        </div>
    </ErrorBoundary>
  );
};

export default ReviewPage; 