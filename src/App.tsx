import React, { useEffect } from 'react';
import { ENV_CONFIG } from './services/service.apiSW';
import { UserTrackingProvider } from './component/business/UserTrackingProvider';
import { CookiePreferencesProvider } from './context/CookiePreferencesContext';
import { SectionDataProvider } from './context/SectionDataContext';
import { SectionVerificationProvider } from './context/SectionVerificationContext';
import AppSSR from './AppSSR';
import AppCSR from './AppCSR';

function App() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // No auto-acceptance - users must make their own choice
    }
  }, []);

  return (
    <UserTrackingProvider serverUrl={ENV_CONFIG.API_URL}>
      <CookiePreferencesProvider>
        <SectionDataProvider>
          <SectionVerificationProvider>
            {import.meta.env.PROD ? <AppSSR url={window.location.pathname} /> : <AppCSR />}
          </SectionVerificationProvider>
        </SectionDataProvider>
      </CookiePreferencesProvider>
    </UserTrackingProvider>
  );
}

export default App;