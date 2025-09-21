import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookiePreferences } from '../../../context/CookiePreferencesContext';

interface NavigationAwareWrapperProps {
  children: React.ReactNode;
  onNavigationChange?: (pathname: string) => void;
}

const NavigationAwareWrapper: React.FC<NavigationAwareWrapperProps> = ({ 
  children, 
  onNavigationChange 
}) => {
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Get cookie preferences with error handling
  let hasConsent = false;
  try {
    const cookiePreferences = useCookiePreferences();
    hasConsent = cookiePreferences.hasMadeChoice && !cookiePreferences.hasOptedOut;
  } catch (error) {
    console.warn('Cookie preferences context not available in NavigationAwareWrapper:', error);
  }

  // Handle navigation changes
  useEffect(() => {
    if (previousPath && previousPath !== location.pathname) {
      // Navigation occurred
      setIsNavigating(true);
      
      // Notify parent component if callback provided
      if (onNavigationChange) {
        onNavigationChange(location.pathname);
      }
      
      // Clear navigation state after a short delay
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    setPreviousPath(location.pathname);
  }, [location.pathname, previousPath, onNavigationChange]);

  // Force content reload when navigating and consent is available
  useEffect(() => {
    if (isNavigating && hasConsent) {
      // Trigger a small delay to ensure content hooks re-evaluate
      const timer = setTimeout(() => {
        // This will trigger content hooks to reload
        window.dispatchEvent(new CustomEvent('navigation-content-reload'));
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isNavigating, hasConsent]);

  return (
    <div className={`navigation-aware-wrapper ${isNavigating ? 'navigating' : ''}`}>
      {children}
    </div>
  );
};

// Add displayName for React DevTools
NavigationAwareWrapper.displayName = 'NavigationAwareWrapper';

export default NavigationAwareWrapper; 