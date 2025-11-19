/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { getCurrentTimestamp } from '../util/ssrUtils';
import { checkPendingApiErrors } from '../util/apiErrorHandler';
import { resetHealthGate, updateApiBlockedState, emitConsentStateChange } from '../services/service.apiSW';

interface CookiePreferences {
  thirdPartyAds: boolean;
  analytics: boolean;
  functional: boolean;
  hasMadeChoice: boolean;
  lastUpdated?: number;
}

interface CookiePreferencesContextType {
  preferences: CookiePreferences;
  updatePreferences: (newPreferences: Partial<CookiePreferences>) => void;
  optOut: () => void;
  optIn: () => void;
  hasOptedOut: boolean;
  hasOptedIn: boolean;
  hasMadeChoice: boolean;
  isLoading: boolean;
  // Banner timer functions
  checkBannerTimer: () => boolean;
  clearBannerCache: () => void;
  // API blocking functions
  isApiBlocked: boolean;
  hasConsent: boolean;
  isWaitingForConsent: boolean;
  // Event system
  addConsentListener: (listener: (hasConsent: boolean) => void) => () => void;
}

const defaultPreferences: CookiePreferences = {
  thirdPartyAds: true,
  analytics: true,
  functional: true,
  hasMadeChoice: false, // This should be false to show banner for new users
};

const CookiePreferencesContext = createContext<CookiePreferencesContextType | undefined>(undefined);

export const useCookiePreferences = () => {
  const context = useContext(CookiePreferencesContext);
  if (!context) {
    throw new Error('useCookiePreferences must be used within a CookiePreferencesProvider');
  }
  return context;
};

interface CookiePreferencesProviderProps {
  children: ReactNode;
}

export const CookiePreferencesProvider: React.FC<CookiePreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  
  // Event listeners for consent state changes
  const consentListenersRef = useRef<Set<(hasConsent: boolean) => void>>(new Set());
  
  // Add listener for consent state changes
  const addConsentListener = (listener: (hasConsent: boolean) => void) => {
    consentListenersRef.current.add(listener);
    return () => {
      consentListenersRef.current.delete(listener);
    };
  };
  
  // Emit consent state change to all listeners
  const emitConsentChange = (hasConsent: boolean) => {
    consentListenersRef.current.forEach(listener => {
      try {
        listener(hasConsent);
      } catch (error) {
        console.error('Error in consent listener:', error);
      }
    });
  };

  // Banner timer functions - SSR-safe
  const checkBannerTimer = (): boolean => {
    if (typeof window === 'undefined') return true; // SSR: always show banner
    const lastBannerTime = localStorage.getItem('packmovego-last-banner-time');
    if (lastBannerTime) {
      const lastTime = parseInt(lastBannerTime);
      const thirtyMinutes = 30 * 60 * 1000;
      const timeDiff = Date.now() - lastTime;
      return timeDiff > thirtyMinutes;
    }
    return true; // No last banner time, show banner
  };

  const clearBannerCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('packmovego-last-banner-time');
    }
  };

  // Compute hasOptedOut based on preferences (if all cookies are disabled)
  const hasOptedOut = preferences.hasMadeChoice && 
    !preferences.thirdPartyAds && 
    !preferences.analytics && 
    !preferences.functional;
  
  // Compute hasOptedIn (only true when user has made choice AND all cookies are enabled)
  const hasOptedIn = preferences.hasMadeChoice && 
    preferences.thirdPartyAds && 
    preferences.analytics && 
    preferences.functional;
  
  // API blocking logic - simplified to use hasOptedIn
  const isApiBlocked = !hasOptedIn;
  const hasConsent = hasOptedIn;
  const isWaitingForConsent = !hasOptedIn;
  
  // Update API service when consent state changes
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      updateApiBlockedState(isApiBlocked);
      emitConsentStateChange(hasConsent);
      emitConsentChange(hasConsent);
      
    }
  }, [isLoading, hasConsent, isApiBlocked, hasOptedIn]);

  useEffect(() => {
    const loadPreferences = () => {
      // Always start with default preferences for consistent hydration
      setPreferences(defaultPreferences);
      setIsLoading(false);
      
      // Only load from localStorage in browser environment after hydration
      if (typeof window !== 'undefined') {
        const savedPreferences = localStorage.getItem('packmovego-cookie-preferences');
        if (savedPreferences) {
          try {
            const parsed = JSON.parse(savedPreferences);
            if (parsed.hasMadeChoice === undefined) { parsed.hasMadeChoice = true; }
            if (!parsed.lastUpdated) { parsed.lastUpdated = Date.now(); }
            // Update preferences after hydration to avoid mismatch
            setTimeout(() => setPreferences(parsed), 0);
          } catch (error) {
            console.error('Error parsing saved cookie preferences:', error);
          }
        }
      }
    };
    
    loadPreferences();
  }, []);

  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      const preferencesWithTimestamp = { ...preferences, lastUpdated: getCurrentTimestamp() };
      localStorage.setItem('packmovego-cookie-preferences', JSON.stringify(preferencesWithTimestamp));
      
      // Include hasOptedIn in console report (computed value, not stored)
      const reportWithOptIn = {
        thirdPartyAds: preferences.thirdPartyAds,
        analytics: preferences.analytics,
        functional: preferences.functional,
        hasOptedIn: hasOptedIn,
        hasMadeChoice: preferences.hasMadeChoice,
        lastUpdated: preferencesWithTimestamp.lastUpdated
      };
    }
  }, [preferences, isLoading, hasOptedOut, hasOptedIn]);

  // Reset health gate when user opts in to allow fresh API calls
  useEffect(() => {
    if (!isLoading && hasOptedIn) {
      resetHealthGate();
    }
  }, [isLoading, hasOptedIn]);

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const optOut = () => {
    const newPreferences = {
      thirdPartyAds: false,
      analytics: false,
      functional: false,
      hasMadeChoice: true,
      lastUpdated: getCurrentTimestamp(),
    };
    setPreferences(newPreferences);
    
    // Dispatch opt-out event for other components to handle (SSR-safe)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-opt-out'));
      
      // Update API service state
      updateApiBlockedState(true);
      emitConsentStateChange(false);
      emitConsentChange(false);
      
      // Refresh the page to apply opt-out restrictions
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const optIn = () => {
    const newPreferences = {
      thirdPartyAds: true,
      analytics: true,
      functional: true,
      hasMadeChoice: true,
      lastUpdated: getCurrentTimestamp(),
    };
    
    setPreferences(newPreferences);
    
    // Update last banner time (SSR-safe)
    if (typeof window !== 'undefined') {
      localStorage.setItem('packmovego-last-banner-time', getCurrentTimestamp().toString());
      
      // Notify consent change via multiple channels
      window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: { hasConsent: true } }));
      window.dispatchEvent(new CustomEvent('cookie-opt-in'));
      
      // Update API service state immediately
      updateApiBlockedState(false);
      emitConsentStateChange(true);
      emitConsentChange(true);
      
      // Check for pending API errors now that consent is given
      setTimeout(() => {
        checkPendingApiErrors();
        // Trigger retry for any pending API calls
        window.dispatchEvent(new CustomEvent('api-consent-granted'));
      }, 100);
    }
  };

  const value: CookiePreferencesContextType = {
    preferences,
    updatePreferences,
    optOut,
    optIn,
    hasOptedOut: hasOptedOut,
    hasOptedIn: hasOptedIn,
    hasMadeChoice: preferences.hasMadeChoice,
    isLoading,
    checkBannerTimer,
    clearBannerCache,
    isApiBlocked,
    hasConsent,
    isWaitingForConsent,
    addConsentListener,
  };

  return (
    <CookiePreferencesContext.Provider value={value}>
      {children}
    </CookiePreferencesContext.Provider>
  );
};