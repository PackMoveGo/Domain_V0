import React, { useEffect } from 'react';
import { ENV_CONFIG } from './services/service.apiSW';
import { UserTrackingProvider } from './component/business/UserTrackingProvider';
import { CookiePreferencesProvider } from './context/CookiePreferencesContext';
import { SectionDataProvider } from './context/SectionDataContext';
import { SectionVerificationProvider } from './context/SectionVerificationContext';
import { SSRProviders } from './context/SSRSafeProviders';
import AppCSR from './AppCSR';
import AppSSR from './AppSSR';
import ErrorDebugger from './component/debug/ErrorDebugger';

// SSR-safe environment detection
const isSSR = typeof window === 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

function App() {
  useEffect(() => {
    // Only run in browser environment
    if (!isSSR) {
      // No auto-acceptance - users must make their own choice
    }
  }, []);

  // Always use SSR in production, CSR in development
  const isDevelopment = !isProduction;
  
  console.log('🚀 App Environment:', { isDevelopment, isProduction, isSSR, NODE_ENV: process.env.NODE_ENV });
  console.log('🚀 App rendering with providers...');

  // Use AppCSR for client-side rendering to ensure proper routing
  // AppSSR is only used during server-side rendering, not for client-side navigation
  return (
    <ErrorDebugger>
      <UserTrackingProvider serverUrl={ENV_CONFIG.API_URL}>
        <CookiePreferencesProvider>
          <SectionDataProvider>
            <SectionVerificationProvider>
              <AppCSR />
            </SectionVerificationProvider>
          </SectionDataProvider>
        </CookiePreferencesProvider>
      </UserTrackingProvider>
    </ErrorDebugger>
  );
}

export default App;