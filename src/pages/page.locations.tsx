
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
          title="Service Locations - PackMoveGo | Nationwide Moving Services"
          description="PackMoveGo provides professional moving and packing services nationwide. Find our service locations and areas we cover for your residential or commercial move."
          keywords="moving services locations, service areas, nationwide movers, local moving areas, packmovego locations, moving service coverage"
          url="https://packmovego.com/locations"
          type="website"
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