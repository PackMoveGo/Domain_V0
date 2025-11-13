import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ENV_CONFIG } from './services/service.apiSW';
import { UserTrackingProvider } from './component/business/UserTrackingProvider';
import { CookiePreferencesProvider } from './context/CookiePreferencesContext';
import { SectionDataProvider } from './context/SectionDataContext';
import { SectionVerificationProvider } from './context/SectionVerificationContext';
import { AuthProvider } from './context/AuthContext';
// import { SSRProviders } from './context/SSRSafeProviders'; // Reserved for future use
import AppCSR from './appCSR';
// import AppSSR from './appSSR'; // Reserved for future use
import ErrorDebugger from './component/debug/ErrorDebugger';

// SSR-safe environment detection
const isSSR = typeof window === 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

function App() {
  useEffect(() => {
    // Only run in browser environment
    if (!isSSR) {
      // No auto-acceptance - users must make their own choice
      
      // Run initial health check on app startup (before cookie consent)
      // This allows us to detect real API failures and show the 503 modal immediately
      const runInitialHealthCheck = async () => {
        try {
          const { APIsw } = await import('./services/service.apiSW');
          const api = APIsw.getInstance();
          
          // Check health - this bypasses cookie consent for /v0/health endpoint
          const healthResult = await api.checkHealth();
          
          // If health check fails, show modal immediately
          if (!healthResult || healthResult.error) {
            console.log('🚨 [INITIAL-HEALTH] Health check failed on initial load - showing 503 modal');
            api.showApiFailureModal(['/v0/health'], true);
          } else {
            console.log('✅ [INITIAL-HEALTH] Health check passed on initial load');
          }
        } catch (error) {
          // Health check failed with an error - show modal
          console.error('🚨 [INITIAL-HEALTH] Health check error on initial load:', error);
          try {
            const { APIsw } = await import('./services/service.apiSW');
            const api = APIsw.getInstance();
            api.showApiFailureModal(['/v0/health'], true);
          } catch (modalError) {
            console.error('❌ [INITIAL-HEALTH] Failed to show API failure modal:', modalError);
          }
        }
      };
      
      // Run health check after a short delay to ensure API service is initialized
      setTimeout(runInitialHealthCheck, 100);
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
      <AuthProvider>
      <UserTrackingProvider serverUrl={ENV_CONFIG.API_URL}>
        <CookiePreferencesProvider>
          <SectionDataProvider>
            <SectionVerificationProvider>
              <AppCSR />
              <Analytics />
              <SpeedInsights />
            </SectionVerificationProvider>
          </SectionDataProvider>
        </CookiePreferencesProvider>
      </UserTrackingProvider>
      </AuthProvider>
    </ErrorDebugger>
  );
}

export default App;
