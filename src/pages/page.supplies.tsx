
import { useSupplies } from '../hook/useSupplies';
import { useLoadingGuard } from '../hook/useLoadingGuard';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import Layout from '../component/layout/Layout';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import Supplies from '../component/pages/Supplies';

const SuppliesPage = () => {
  const { supplies, isLoading, error } = useSupplies();
  const { getSectionProps } = useGiveSectionId();

  const { renderContent: renderSupplies } = useLoadingGuard({
    isLoading,
    error,
    data: supplies
  });

  return (
    <ErrorBoundary>
      <Layout>
        <SEO
          title="Moving Supplies - Pack Move Go"
          description="Professional moving supplies and packing materials for your move. Quality boxes, tape, and packing materials."
          keywords="moving supplies, packing materials, boxes, tape, moving equipment"
        />
        
        <div {...getSectionProps('hero')}>
          {renderSupplies(<Supplies supplies={supplies} isLoading={isLoading} error={error} />)}
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default SuppliesPage; 