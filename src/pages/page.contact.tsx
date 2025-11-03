import React, { lazy, Suspense } from 'react';
import { getComprehensiveContactPageData } from '../services/public/service.contactPageAPI';
import { useGiveSectionId } from '../hook/useGiveSectionId';
// Modal state is handled by Layout component

// Lazy load contact components
const ContactHeader = lazy(() => import('../component/business/contact/hero.contact'));
const ContactMethods = lazy(() => import('../component/business/contact/banner.contactMethods'));
const OfficeLocations = lazy(() => import('../component/business/contact/banner.officeLocations'));
const ContactFormSection = lazy(() => import('../component/business/contact/banner.contactForm'));
const ContactFAQ = lazy(() => import('../component/pages/banner.FAQ'));
const BusinessHoursSection = lazy(() => import('../component/business/contact/banner.businessHours'));
const ContactCTA = lazy(() => import('../component/business/contact/banner.contactCTA'));

// Add displayName to lazy components
(ContactHeader as any).displayName = 'ContactHeader';
(ContactMethods as any).displayName = 'ContactMethods';
(OfficeLocations as any).displayName = 'OfficeLocations';
(ContactFormSection as any).displayName = 'ContactFormSection';
(ContactFAQ as any).displayName = 'ContactFAQ';
(BusinessHoursSection as any).displayName = 'BusinessHoursSection';
(ContactCTA as any).displayName = 'ContactCTA';

export default function ContactPage() {
  // Check if we're in SSR mode
  const isSSR = typeof window === 'undefined';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // State for contact page data - initialize with SSR-safe defaults
  const [contactPageData, setContactPageData] = React.useState<any>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(false); // Never show loading during SSR
  const [dataError, setDataError] = React.useState<string | null>(null);
  
  // Modal state is handled by Layout component

  // Section verification and tracking
  const { getSectionProps } = useGiveSectionId();

  // Load contact page data using comprehensive API service with modal middleware
  const loadContactPageData = async () => {
    // Skip API calls during SSR
    if (isSSR) {
      return;
    }
    
    setIsLoadingData(true);
    setDataError(null);
    
    try {
      console.log('🚀 Loading contact page data via comprehensive API service with modal middleware...');
      
      // Use the comprehensive contact page data function that includes modal middleware
      const data = await getComprehensiveContactPageData();
      
      // Check if the data contains 503 error information
      if (data && (data as any).error && (data as any).is503Error) {
        setDataError('503 Service Unavailable');
        setContactPageData(null);
        return;
      }
      
      setContactPageData(data);
      
      // Check if there are any errors and set appropriate states
      const hasErrors = !data.nav || !data.contact;
      if (hasErrors) {
        setDataError('503 Service Unavailable');
      }
      
      console.log('✅ Contact page data loaded successfully:', {
        nav: !!data.nav,
        contact: !!data.contact,
        health: !!data.health
      });
    } catch (error) {
      console.error('❌ Failed to load contact page data:', error);
      
      // Check if this is a 503 error
      if (error instanceof Error && (error as any).is503Error) {
        setDataError('503 Service Unavailable');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
        setDataError(errorMessage);
      }
      
      // Modal will be handled by service middleware automatically
    } finally {
      setIsLoadingData(false);
    }
  };

  // Call load data on component mount (client-side only)
  React.useEffect(() => {
    if (!isSSR) {
      loadContactPageData();
    }
  }, [isSSR]);

  // Modal state is handled by Layout component

  // Always render content - no loading state that blocks SSR

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Contact Header */}
          <section {...getSectionProps('contact-header')}>
            <Suspense fallback={
              <div className="text-center mb-12">
                <div className="h-10 bg-gray-200 rounded mb-4 mx-auto w-96 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded mx-auto w-80 animate-pulse"></div>
              </div>
            }>
              <ContactHeader 
                contactInfo={{
                  title: 'Contact Pack Move Go',
                  description: 'Get in touch with us for professional moving services'
                }}
                isLoading={isLoadingData}
              />
            </Suspense>
          </section>

          {/* Contact Methods */}
          <section {...getSectionProps('contact-methods')}>
            <Suspense fallback={
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Get in Touch</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <ContactMethods 
                contactMethods={[
                  {
                    id: 'phone',
                    title: 'Call Us',
                    description: 'Speak with our team directly for immediate assistance',
                    primary: '(949) 414-5282',
                    secondary: 'Mon-Fri 8AM-6PM, Sat-Sun 9AM-4PM',
                    hours: 'Mon-Fri 8AM-6PM, Sat-Sun 9AM-4PM',
                    icon: '📞',
                    color: 'bg-blue-600'
                  },
                  {
                    id: 'email',
                    title: 'Email Us',
                    description: 'Send us a detailed message about your move',
                    primary: 'info@packmovego.com',
                    secondary: 'We respond within 24 hours',
                    hours: '24/7',
                    icon: '✉️',
                    color: 'bg-green-600'
                  },
                  {
                    id: 'emergency',
                    title: 'Emergency Line',
                    description: 'For urgent moving needs and last-minute requests',
                    primary: '(949) 313-0123',
                    secondary: 'Available 24/7',
                    hours: '24/7',
                    icon: '🚨',
                    color: 'bg-red-600'
                  },
                  {
                    id: 'quote',
                    title: 'Get Free Quote',
                    description: 'Request a personalized quote online',
                    primary: 'Online Form',
                    secondary: 'Instant response',
                    hours: '24/7',
                    icon: '💰',
                    color: 'bg-yellow-600'
                  },
                  {
                    id: 'website',
                    title: 'Visit Our Website',
                    description: 'Learn more about our services and track your move',
                    primary: 'packmovego.com',
                    secondary: 'Online 24/7',
                    hours: '24/7',
                    icon: '🌐',
                    color: 'bg-purple-600'
                  },
                  {
                    id: 'social',
                    title: 'Follow Us',
                    description: 'Stay updated on our latest news and offers',
                    primary: '@packmovego',
                    secondary: 'Social media',
                    hours: '24/7',
                    icon: '📱',
                    color: 'bg-indigo-600'
                  }
                ]}
                isLoading={isLoadingData}
              />
            </Suspense>
          </section>

          {/* Office Locations */}
          <section {...getSectionProps('office-locations')}>
            <Suspense fallback={
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Offices</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <OfficeLocations 
                officeLocations={[
                  {
                    id: '1',
                    name: 'Main Office',
                    type: 'Headquarters',
                    address: {
                      street: '123 Main Street',
                      city: 'Irvine',
                      state: 'CA',
                      zip: '92618',
                      fullAddress: '123 Main Street, Irvine, CA 92618'
                    },
                    phone: '(949) 414-5282',
                    email: 'info@packmovego.com',
                    hours: {
                      monday: 'Closed',
                      tuesday: 'Closed',
                      wednesday: 'Closed',
                      thursday: 'Closed',
                      friday: '8:00 AM - 6:00 PM',
                      saturday: '9:00 AM - 4:00 PM',
                      sunday: '10:00 AM - 3:00 PM'
                    },
                    services: ['Local Moving', 'Long Distance', 'Packing Services', 'Storage']
                  },
                  {
                    id: '2',
                    name: 'Newport Beach Branch',
                    type: 'Service Center',
                    address: {
                      street: '456 Harbor Blvd',
                      city: 'Newport Beach',
                      state: 'CA',
                      zip: '92660',
                      fullAddress: '456 Harbor Blvd, Newport Beach, CA 92660'
                    },
                    phone: '(949) 555-0123',
                    email: 'newport@packmovego.com',
                    hours: {
                      monday: 'Closed',
                      tuesday: 'Closed',
                      wednesday: 'Closed',
                      thursday: 'Closed',
                      friday: '8:00 AM - 6:00 PM',
                      saturday: '9:00 AM - 4:00 PM',
                      sunday: '10:00 AM - 3:00 PM'
                    },
                    services: ['Local Moving', 'Packing Services', 'Storage', 'Commercial Moving']
                  },
                  {
                    id: '3',
                    name: 'Santa Ana Warehouse',
                    type: 'Storage Facility',
                    address: {
                      street: '789 Industrial Way',
                      city: 'Santa Ana',
                      state: 'CA',
                      zip: '92705',
                      fullAddress: '789 Industrial Way, Santa Ana, CA 92705'
                    },
                    phone: '(714) 555-0456',
                    email: 'storage@packmovego.com',
                    hours: {
                      monday: 'Closed',
                      tuesday: 'Closed',
                      wednesday: 'Closed',
                      thursday: 'Closed',
                      friday: '8:00 AM - 6:00 PM',
                      saturday: '9:00 AM - 4:00 PM',
                      sunday: '10:00 AM - 3:00 PM'
                    },
                    services: ['Storage', 'Packing Materials', 'Equipment Rental', 'Long Distance']
                  }
                ]}
                isLoading={isLoadingData}
              />
            </Suspense>
          </section>

          {/* Contact Form */}
          <section {...getSectionProps('contact-form')}>
            <Suspense fallback={
              <div className="bg-white rounded-lg shadow-md p-8 mb-12 animate-pulse">
                <div className="text-center mb-8">
                  <div className="h-8 bg-gray-200 rounded mb-4 mx-auto w-64"></div>
                  <div className="h-4 bg-gray-200 rounded mx-auto w-80"></div>
                </div>
                <div className="max-w-2xl mx-auto">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            }>
              <ContactFormSection 
                contactForm={{
                  title: 'Send us a Message',
                  description: 'Fill out the form below and we\'ll get back to you'
                }}
                contactInfo={{
                  mainPhone: '(949) 414-5282',
                  mainEmail: 'info@packmovego.com'
                }}
                isLoading={isLoadingData}
              />
            </Suspense>
          </section>

          {/* FAQ Section */}
          <section {...getSectionProps('faq')}>
            <Suspense fallback={
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
                <div className="max-w-4xl mx-auto">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md mb-4 animate-pulse">
                      <div className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <ContactFAQ />
            </Suspense>
          </section>

          {/* Business Hours */}
          <section {...getSectionProps('business-hours')}>
            <Suspense fallback={
              <div className="bg-gray-50 rounded-lg p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
                <div className="h-4 bg-gray-200 rounded mb-6 w-64"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    {[...Array(7)].map((_, index) => (
                      <div key={index} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                    <div className="h-10 bg-gray-200 rounded w-40"></div>
                  </div>
                </div>
              </div>
            }>
              <BusinessHoursSection 
                businessHours={{
                  title: 'Business Hours',
                  description: 'We\'re here to help you move',
                  hours: {
                    monday: { open: 'Closed', close: 'Closed', status: 'closed' },
                    tuesday: { open: 'Closed', close: 'Closed', status: 'closed' },
                    wednesday: { open: 'Closed', close: 'Closed', status: 'closed' },
                    thursday: { open: 'Closed', close: 'Closed', status: 'closed' },
                    friday: { open: '8:00 AM', close: '6:00 PM', status: 'open' },
                    saturday: { open: '9:00 AM', close: '4:00 PM', status: 'open' },
                    sunday: { open: '10:00 AM', close: '3:00 PM', status: 'open' }
                  },
                  emergency: 'For urgent matters, call our emergency line at (949) 313-0123'
                }}
                contactInfo={{
                  emergencyPhone: '(949) 313-0123'
                }}
                isLoading={isLoadingData}
              />
            </Suspense>
          </section>

          {/* Contact CTA */}
          <section {...getSectionProps('contact-cta')}>
            <Suspense fallback={
              <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4 mx-auto w-80"></div>
                <div className="h-4 bg-gray-200 rounded mb-6 mx-auto w-96"></div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="h-12 bg-gray-200 rounded w-48"></div>
                  <div className="h-12 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            }>
              <ContactCTA 
                contactInfo={{
                  mainPhone: '(949) 414-5282',
                  mainEmail: 'info@packmovego.com'
                }}
                isLoading={isLoadingData}
              />
            </Suspense>
          </section>
        </div>
        
    </div>
  );
}

// Add displayName for React DevTools
ContactPage.displayName = 'ContactPage';