import { useSupplies } from '../hook/useSupplies';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import Supplies from '../component/pages/page.Supplies';

const SuppliesPage = () => {
  const { supplies, isLoading, error } = useSupplies();
  const { getSectionProps } = useGiveSectionId();

  return (
    <ErrorBoundary>
        <SEO
          title="Moving Supplies - Pack Move Go"
          description="Professional moving supplies and packing materials for your move. Quality boxes, tape, and packing materials."
          keywords="moving supplies, packing materials, boxes, tape, moving equipment"
        />
        
        <div {...getSectionProps('hero')}>
          <Supplies supplies={supplies} isLoading={isLoading} error={error} />
        </div>
    </ErrorBoundary>
  );
};

export default SuppliesPage; 