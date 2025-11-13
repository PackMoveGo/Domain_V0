/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode } from 'react';

// SSR-safe context providers that provide default values during server-side rendering

// SSR-safe CookiePreferencesContext
interface SSRCookiePreferencesContextType {
  preferences: {
    thirdPartyAds: boolean;
    analytics: boolean;
    functional: boolean;
    hasMadeChoice: boolean;
  };
  isLoading: boolean;
  updatePreferences: (prefs: any) => void;
  optIn: () => void;
  optOut: () => void;
  hasOptedOut: boolean;
  hasOptedIn: boolean;
  hasMadeChoice: boolean;
  hasConsent: boolean;
  isWaitingForConsent: boolean;
  isApiBlocked: boolean;
}

const SSRCookiePreferencesContext = createContext<SSRCookiePreferencesContextType | undefined>(undefined);

export const SSRCookiePreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: SSRCookiePreferencesContextType = {
    preferences: {
      thirdPartyAds: true,
      analytics: true,
      functional: true,
      hasMadeChoice: false,
    },
    isLoading: false,
    updatePreferences: () => {},
    optIn: () => {},
    optOut: () => {},
    hasOptedOut: false,
    hasOptedIn: false,
    hasMadeChoice: false,
    hasConsent: false,
    isWaitingForConsent: true,
    isApiBlocked: true,
  };

  return (
    <SSRCookiePreferencesContext.Provider value={value}>
      {children}
    </SSRCookiePreferencesContext.Provider>
  );
};

export const useSSRCookiePreferences = () => {
  const context = useContext(SSRCookiePreferencesContext);
  if (!context) {
    throw new Error('useSSRCookiePreferences must be used within a SSRCookiePreferencesProvider');
  }
  return context;
};

// SSR-safe SectionDataContext
interface SSRSectionDataContextType {
  sections: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchSections: () => Promise<void>;
  refreshSections: () => Promise<void>;
  resetRetryCount: () => void;
}

const SSRSectionDataContext = createContext<SSRSectionDataContextType | undefined>(undefined);

export const SSRSectionDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: SSRSectionDataContextType = {
    sections: [],
    loading: false,
    error: null,
    lastUpdated: null,
    fetchSections: async () => {},
    refreshSections: async () => {},
    resetRetryCount: () => {},
  };

  return (
    <SSRSectionDataContext.Provider value={value}>
      {children}
    </SSRSectionDataContext.Provider>
  );
};

export const useSSRSectionData = () => {
  const context = useContext(SSRSectionDataContext);
  if (!context) {
    throw new Error('useSSRSectionData must be used within a SSRSectionDataProvider');
  }
  return context;
};

// SSR-safe SectionVerificationContext
interface SSRSectionVerificationContextType {
  isTampered: boolean;
  showWarning: boolean;
  verificationDetails: any;
  lastVerified: number | null;
  verifySections: (sections: string[], path: string) => Promise<void>;
  dismissWarning: () => void;
}

const SSRSectionVerificationContext = createContext<SSRSectionVerificationContextType | undefined>(undefined);

export const SSRSectionVerificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: SSRSectionVerificationContextType = {
    isTampered: false,
    showWarning: false,
    verificationDetails: null,
    lastVerified: null,
    verifySections: async () => {},
    dismissWarning: () => {},
  };

  return (
    <SSRSectionVerificationContext.Provider value={value}>
      {children}
    </SSRSectionVerificationContext.Provider>
  );
};

export const useSSRSectionVerification = () => {
  const context = useContext(SSRSectionVerificationContext);
  if (!context) {
    throw new Error('useSSRSectionVerification must be used within a SSRSectionVerificationProvider');
  }
  return context;
};

// SSR-safe UserTrackingProvider
interface SSRUserTrackingProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

export const SSRUserTrackingProvider: React.FC<SSRUserTrackingProviderProps> = ({ children, serverUrl: _serverUrl }) => { // serverUrl reserved for future use
  return <>{children}</>;
};

// Combined SSR-safe providers
export const SSRProviders: React.FC<{ children: ReactNode; serverUrl?: string }> = ({ children, serverUrl: _serverUrl }) => { // serverUrl reserved for future use
  return (
    <SSRUserTrackingProvider serverUrl={_serverUrl}>
      <SSRCookiePreferencesProvider>
        <SSRSectionDataProvider>
          <SSRSectionVerificationProvider>
            {children}
          </SSRSectionVerificationProvider>
        </SSRSectionDataProvider>
      </SSRCookiePreferencesProvider>
    </SSRUserTrackingProvider>
  );
};
