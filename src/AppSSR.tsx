import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './component/layout/Layout';

// Import pages directly for SSR (no lazy loading)
import HomePage from './pages/page.home';
import AboutPage from './pages/page.about';
import ServicesPage from './pages/page.services';
import ServiceDetailPage from './pages/page.serviceDetail';
import ContactPage from './pages/page.contact';
import BlogPage from './pages/page.blog';
import FAQPage from './pages/page.faq';
import LocationsPage from './pages/page.locations';
import BookingPage from './pages/page.booking';
import ReviewPage from './pages/page.review';
import ReferPage from './pages/page.refer';
import SuppliesPage from './pages/page.supplies';
import SupplyDetailPage from './pages/page.supplyDetail';
import TipsPage from './pages/page.tipsPage';
import SignInPage from './pages/page.signIn';
import SignUpPage from './pages/page.signUp';
import PrivacyPage from './pages/page.privacy';
import TermsPage from './pages/page.terms';
import CookieOptOutPage from './pages/page.cookieOptOut';
import SitemapPage from './pages/page.sitemap';
import NotFoundPage from './pages/page.404';

// Import ServicesTest component directly for testing
// import ServicesTest from './component/devtools/ServicesTest';
import ApiErrorHandlingExample from './component/examples/ApiErrorHandlingExample';
import ModalOrderTest from './component/examples/ModalOrderTest';

interface AppSSRProps {
  url: string;
}

const AppSSR: React.FC<AppSSRProps> = ({ url }) => {
  console.log('🚀 AppSSR rendering for URL:', url);
  console.log('🚀 AppSSR Environment:', { NODE_ENV: process.env.NODE_ENV });

  return (
    <Layout isSSR={true}>
      <div className="App">
        {/* Analytics Root */}
        <div id="analytics-root"></div>
        
        {/* Main Content with SSR-safe routing using StaticRouter */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:service" element={<ServiceDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/refer" element={<ReferPage />} />
          <Route path="/supplies" element={<SuppliesPage />} />
          <Route path="/supplies/:supply" element={<SupplyDetailPage />} />
          <Route path="/tips" element={<TipsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/opt-in" element={<CookieOptOutPage />} />
          <Route path="/cookie-test" element={<NotFoundPage />} />
          <Route path="/error-handling-example" element={<ApiErrorHandlingExample />} />
          <Route path="/modal-order-test" element={<ModalOrderTest />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Layout>
  );
};

export default AppSSR;
