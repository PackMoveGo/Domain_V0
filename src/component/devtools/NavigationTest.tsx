import React, { useState, useEffect } from 'react';
import { getMainNavigation, getFooterNavigation, getMobileNavigation } from '../../services/routes/route.navAPI';
import { useCookieConsent } from '../../hook/useCookieConsent';

const NavigationTest: React.FC = () => {
  const [mainNav, setMainNav] = useState<any[]>([]);
  const [footerNav, setFooterNav] = useState<any[]>([]);
  const [mobileNav, setMobileNav] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    const loadNavigation = async () => {
      if (!hasConsent) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [main, footer, mobile] = await Promise.all([
          getMainNavigation(),
          getFooterNavigation(),
          getMobileNavigation()
        ]);
        
        setMainNav(main);
        setFooterNav(footer);
        setMobileNav(mobile);
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
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Navigation Test</h3>
        <div className="text-blue-600">Loading navigation data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Navigation Test</h3>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Navigation Test</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          <strong>Cookie Consent:</strong> {hasConsent ? '✅ Given' : '❌ Not given'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Navigation */}
        <div>
          <h4 className="font-medium text-green-700 mb-2">Main Navigation ({mainNav.length} items):</h4>
          {mainNav.length > 0 ? (
            <ul className="space-y-1">
              {mainNav.map((item, index) => (
                <li key={index} className="text-sm text-green-600">
                  <span className="font-medium">{item.label}</span> → <code className="bg-green-100 px-1 rounded">{item.path}</code>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-green-600">No main navigation items found</div>
          )}
        </div>

        {/* Footer Navigation */}
        <div>
          <h4 className="font-medium text-green-700 mb-2">Footer Navigation ({footerNav.length} items):</h4>
          {footerNav.length > 0 ? (
            <ul className="space-y-1">
              {footerNav.map((item, index) => (
                <li key={index} className="text-sm text-green-600">
                  <span className="font-medium">{item.label}</span> → <code className="bg-green-100 px-1 rounded">{item.path}</code>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-green-600">No footer navigation items found</div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div>
          <h4 className="font-medium text-green-700 mb-2">Mobile Navigation ({mobileNav.length} items):</h4>
          {mobileNav.length > 0 ? (
            <ul className="space-y-1">
              {mobileNav.map((item, index) => (
                <li key={index} className="text-sm text-green-600">
                  <span className="font-medium">{item.label}</span> → <code className="bg-green-100 px-1 rounded">{item.path}</code>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-green-600">No mobile navigation items found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationTest;

