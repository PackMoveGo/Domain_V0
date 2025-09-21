import { useEffect, useState } from 'react';
import fastLoadStrategy from '../util/fastLoadStrategy';

export interface FastLoadState {
  isInitialized: boolean;
  hasConsent: boolean;
  isBackgroundFetching: boolean;
  backgroundDataLoaded: boolean;
}

export function useFastLoad() {
  const [state, setState] = useState<FastLoadState>({
    isInitialized: false,
    hasConsent: false,
    isBackgroundFetching: false,
    backgroundDataLoaded: false
  });

  useEffect(() => {
    let mounted = true;

    const initializeFastLoad = async () => {
      try {
        // Initialize the fast load strategy
        await fastLoadStrategy.initialize();
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            isInitialized: true,
            hasConsent: fastLoadStrategy.getConsentStatus()
          }));
        }
      } catch (error) {
        console.warn('Fast load initialization failed:', error);
      }
    };

    const handleBackgroundDataLoaded = () => {
      if (mounted) {
        setState(prev => ({
          ...prev,
          isBackgroundFetching: false,
          backgroundDataLoaded: true
        }));
      }
    };

    const handleCachedDataLoaded = () => {
      if (mounted) {
        setState(prev => ({
          ...prev,
          isBackgroundFetching: true
        }));
      }
    };

    // Initialize fast load strategy
    initializeFastLoad();

    // Listen for background data events
    window.addEventListener('backgroundDataLoaded', handleBackgroundDataLoaded);
    window.addEventListener('cachedDataLoaded', handleCachedDataLoaded);

    return () => {
      mounted = false;
      window.removeEventListener('backgroundDataLoaded', handleBackgroundDataLoaded);
      window.removeEventListener('cachedDataLoaded', handleCachedDataLoaded);
    };
  }, []);

  const forceRefresh = async () => {
    setState(prev => ({ ...prev, isBackgroundFetching: true }));
    await fastLoadStrategy.forceRefresh();
    setState(prev => ({ 
      ...prev, 
      isBackgroundFetching: false,
      backgroundDataLoaded: true 
    }));
  };

  return {
    ...state,
    forceRefresh
  };
}

export default useFastLoad; 