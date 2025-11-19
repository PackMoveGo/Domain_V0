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
          title="Moving Supplies & Packing Materials - PackMoveGo"
          description="Shop professional moving supplies and packing materials from PackMoveGo. Quality boxes, bubble wrap, tape, and all the supplies you need for a successful move."
          keywords="moving supplies, packing materials, moving boxes, bubble wrap, packing tape, moving equipment, box sizes, packing supplies, moving kit"
          url="https://packmovego.com/supplies"
          type="website"
        />
        
        <div {...getSectionProps('hero')}>
          <Supplies supplies={supplies} isLoading={isLoading} error={error} />
        </div>
    </ErrorBoundary>
  );
};

export default SuppliesPage; 