
import { useLocations } from '../hook/useLocations';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import Locations from '../component/pages/page.Locations';

const LocationsPage = () => {
  const { locations, serviceTypes, isLoading, error } = useLocations();
  const { getSectionProps } = useGiveSectionId();

  return (
    <ErrorBoundary>
        <SEO
          title="Service Locations - Pack Move Go"
          description="Find Pack Move Go services in your area. We provide professional moving and packing services across multiple locations."
          keywords="moving services, packing services, locations, service areas"
        />
        
        <div {...getSectionProps('hero')}>
          <Locations
            locations={locations}
            serviceTypes={serviceTypes}
            isLoading={isLoading}
            error={error}
          />
        </div>
    </ErrorBoundary>
  );
};

export default LocationsPage; 