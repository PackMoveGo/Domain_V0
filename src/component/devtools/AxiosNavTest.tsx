import React, { useState, useEffect } from 'react';
import { getMainNavigation } from '../../services/routes/route.navAPI';
import { useCookieConsent } from '../../hook/useCookieConsent';

const AxiosNavTest: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { hasConsent } = useCookieConsent();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadNavigation = async () => {
      if (!hasConsent) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const navItems = await getMainNavigation();
        setItems(navItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load navigation');
      } finally {
        setIsLoading(false);
      }
    };

    loadNavigation();
  }, [hasConsent]);

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Axios Navigation Test</h3>
        <div className="text-blue-600">Loading navigation data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Axios Navigation Test</h3>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">Axios Navigation Test</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          <strong>Cookie Consent:</strong> {hasConsent ? '✅ Given' : '❌ Not given'}
        </div>
        <div className="text-sm text-gray-600">
          <strong>Transitioning:</strong> {isTransitioning ? '🔄 Yes' : '✅ No'}
        </div>
        <div className="text-sm text-gray-600">
          <strong>Items Count:</strong> {items.length}
        </div>
      </div>

      {items.length > 0 ? (
        <div>
          <h4 className="font-medium text-green-700 mb-2">Navigation Items:</h4>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-green-600">
                <span className="font-medium">{item.label}</span> → <code className="bg-green-100 px-1 rounded">{item.path}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-green-600">No navigation items found</div>
      )}
    </div>
  );
};

export default AxiosNavTest; 