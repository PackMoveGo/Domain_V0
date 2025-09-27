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

function App() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // No auto-acceptance - users must make their own choice
    }
  }, []);

  // Development: Use AppCSR (Client-Side Rendering)
  // Production: Use AppSSR (Server-Side Rendering)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🚀 App Environment:', { isDevelopment, isProduction, NODE_ENV: process.env.NODE_ENV });
  console.log('🚀 App rendering with providers...');

  return (
    <ErrorDebugger>
      {isDevelopment ? (
        <UserTrackingProvider serverUrl={ENV_CONFIG.API_URL}>
          <CookiePreferencesProvider>
            <SectionDataProvider>
              <SectionVerificationProvider>
                <AppCSR />
              </SectionVerificationProvider>
            </SectionDataProvider>
          </CookiePreferencesProvider>
        </UserTrackingProvider>
      ) : (
        <SSRProviders serverUrl={ENV_CONFIG.API_URL}>
          <AppSSR url={typeof window !== 'undefined' ? window.location.pathname : '/'} />
        </SSRProviders>
      )}
    </ErrorDebugger>
  );
}

export default App;