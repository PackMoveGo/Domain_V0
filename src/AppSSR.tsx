import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { CookiePreferencesProvider } from './context/CookiePreferencesContext';
import { SectionVerificationProvider } from './context/SectionVerificationContext';
import { SectionDataProvider } from './context/SectionDataContext';
import { UserTrackingProvider } from './component/business/UserTrackingProvider';
import { RouteSEO } from './hook/useRouteSEO.tsx';

// Import pages directly (no lazy loading for SSR)
import HomePage from './pages/page.home';
import AboutPage from './pages/page.about';
import ServicesPage from './pages/page.services';
import Contact from './pages/page.contact';
import BlogPage from './pages/page.blog';
import FAQ from './pages/page.faq';
import Locations from './pages/page.locations';
import Booking from './pages/page.booking';
import Review from './pages/page.review';
import Refer from './pages/page.refer';
import SuppliesPage from './pages/page.supplies';
import Tips from './pages/page.tipsPage';
import SignInPage from './pages/page.signIn';
import SignUpPage from './pages/page.signUp';
import Privacy from './pages/page.privacy';
import Terms from './pages/page.terms';
import CookieOptOutPage from './pages/page.cookieOptOut';
import Sitemap from './pages/page.sitemap';
import NotFoundPage from './pages/page.404';

// Simple routing without Suspense
const AppContentSSR: React.FC<{ url: string }> = ({ url }) => {
  // Simple route matching for SSR
  const getPageComponent = () => {
    switch (url) {
      case '/':
        return <HomePage />;
      case '/about':
        return <AboutPage />;
      case '/services':
        return <ServicesPage />;
      case '/contact':
        return <Contact />;
      case '/blog':
        return <BlogPage />;
      case '/faq':
        return <FAQ />;
      case '/locations':
        return <Locations />;
      case '/booking':
        return <Booking />;
      case '/review':
        return <Review />;
      case '/refer':
        return <Refer />;
      case '/supplies':
        return <SuppliesPage />;
      case '/tips':
        return <Tips />;
      case '/signin':
        return <SignInPage />;
      case '/signup':
        return <SignUpPage />;
      case '/privacy':
        return <Privacy />;
      case '/terms':
        return <Terms />;
      case '/cookie-opt-out':
        return <CookieOptOutPage />;
      case '/cookie-test':
        return <NotFoundPage />;
      case '/api-test':
        return <NotFoundPage />;
      case '/sitemap':
        return <Sitemap />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="App">
      <div id="analytics-root"></div>
      {getPageComponent()}
    </div>
  );
};

const AppSSR: React.FC<{ url: string }> = ({ url }) => {
  return (
    <React.StrictMode>
      <StaticRouter location={url}>
        <CookiePreferencesProvider>
          <SectionVerificationProvider>
            <SectionDataProvider>
              <UserTrackingProvider serverUrl="https://api.packmovego.com">
                <RouteSEO />
                <AppContentSSR url={url} />
              </UserTrackingProvider>
            </SectionDataProvider>
          </SectionVerificationProvider>
        </CookiePreferencesProvider>
      </StaticRouter>
    </React.StrictMode>
  );
};

export default AppSSR;
