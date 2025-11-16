import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './component/ui/feedback/ErrorBoundary';
import Layout from './component/layout/Layout';

// Optimized lazy loading with error boundaries and SSR compatibility
const createLazyComponent = (importFunc: () => Promise<any>, _fallback?: React.ReactNode) => { // Reserved for future use
  const LazyComponent = lazy(() => 
    importFunc().catch((error) => {
      console.error('Failed to load component:', error);
      // Return a fallback component instead of throwing
      return { 
        default: () => (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-yellow-800 font-semibold">Component Loading Error</h3>
            <p className="text-yellow-600 text-sm">
              Failed to load this component. Please refresh the page.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2 text-xs text-yellow-600">
                <summary>Error Details</summary>
                <pre className="mt-1 p-2 bg-yellow-100 rounded overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        )
      };
    })
  );
  
  const LazyComponentWrapper = (props: any) => (
    <ErrorBoundary>
      <LazyComponent {...props} />
    </ErrorBoundary>
  );
  LazyComponentWrapper.displayName = 'LazyComponentWrapper';
  return LazyComponentWrapper;
};

// Lazy load pages with error boundaries and SSR compatibility
const HomePage = createLazyComponent(() => import('./pages/page.home'));
const AboutPage = createLazyComponent(() => import('./pages/page.about'));
const ServicesPage = createLazyComponent(() => import('./pages/page.services'));
const ContactPage = createLazyComponent(() => import('./pages/page.contact'));
const BlogPage = createLazyComponent(() => import('./pages/page.blog'));
const FAQPage = createLazyComponent(() => import('./pages/page.faq'));
const LocationsPage = createLazyComponent(() => import('./pages/page.locations'));
const BookingPage = createLazyComponent(() => import('./pages/page.booking'));
const ReviewPage = createLazyComponent(() => import('./pages/page.review'));
const ReferPage = createLazyComponent(() => import('./pages/page.refer'));
const SuppliesPage = createLazyComponent(() => import('./pages/page.supplies'));
const TipsPage = createLazyComponent(() => import('./pages/page.tipsPage'));
const SignInPage = createLazyComponent(() => import('./pages/page.signIn'));
const SignUpPage = createLazyComponent(() => import('./pages/page.signUp'));
const SignOutPage = createLazyComponent(() => import('./pages/page.signOut'));
const PrivacyPage = createLazyComponent(() => import('./pages/page.privacy'));
const TermsPage = createLazyComponent(() => import('./pages/page.terms'));
const CookieOptOutPage = createLazyComponent(() => import('./pages/page.cookieOptOut'));
const SitemapPage = createLazyComponent(() => import('./pages/page.sitemap'));
const NotFoundPage = createLazyComponent(() => import('./pages/page.404'));

// Import ServicesTest component directly for testing
// import ServicesTest from './component/devtools/ServicesTest';
import ApiErrorHandlingExample from './component/examples/ApiErrorHandlingExample';
import ModalOrderTest from './component/examples/ModalOrderTest';
import ErrorTestingExample from './component/examples/ErrorTestingExample';

const AppContent: React.FC = () => {
  console.log('🚀 AppCSR rendering...');
  
  return (
    <Layout isSSR={false}>
      <div className="App">
        {/* Analytics Root */}
        <div id="analytics-root"></div>
        
        {/* Main Content with optimized routing */}
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/reviews" element={<ReviewPage />} />
            <Route path="/refer" element={<ReferPage />} />
            <Route path="/supplies" element={<SuppliesPage />} />
            <Route path="/tips" element={<TipsPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signout" element={<SignOutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/opt-in" element={<CookieOptOutPage />} />
            <Route path="/cookie-test" element={<NotFoundPage />} />
            {/* <Route path="/services-test" element={<ServicesTest />} /> */}
            <Route path="/error-handling-example" element={<ApiErrorHandlingExample />} />
            <Route path="/modal-order-test" element={<ModalOrderTest />} />
            <Route path="/error-testing" element={<ErrorTestingExample />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </Layout>
  );
};

export default AppContent; 