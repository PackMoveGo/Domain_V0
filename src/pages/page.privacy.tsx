
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../component/business/SEO';
import QuoteForm, { FormData } from '../component/forms/form.quote';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import { usePageSEO } from '../hook/useSEO';
import { searchContent, SearchResult } from '../util/search';
import { getCurrentDate } from '../util/ssrUtils';

interface SearchResultWithExcerpt extends SearchResult {
  excerpt: string;
}

// Define sections for the privacy page
const privacySections = [
  { id: 'hero', title: 'Privacy Policy Hero Section' },
  { id: 'information-collection', title: 'Information Collection Section' },
  { id: 'information-usage', title: 'Information Usage Section' },
  { id: 'information-sharing', title: 'Information Sharing Section' },
  { id: 'data-security', title: 'Data Security Section' },
  { id: 'cookies-tracking', title: 'Cookies & Tracking Section' },
  { id: 'third-party-services', title: 'Third-Party Services Section' },
  { id: 'user-rights', title: 'User Rights Section' },
  { id: 'children-privacy', title: 'Children Privacy Section' },
  { id: 'changes-policy', title: 'Changes to Policy Section' },
  { id: 'contact-info', title: 'Contact Information Section' },
  { id: 'quote-form', title: 'Quote Form Section' }
];

export default function Privacy() {
  // Debug logging - only in development mode
  const isDevMode = (import.meta as any).env.VITE_DEV_MODE === 'development';
  
  // Log component initialization
  if (isDevMode) {
    console.log('🔍 Privacy: Component initialized');
    console.log('📍 Privacy: Current URL:', window.location.href);
    console.log('📍 Privacy: Current pathname:', window.location.pathname);
  }
  
  const location = useLocation();

  const { getSectionProps } = useGiveSectionId(privacySections);

  // Log React Router location
  if (isDevMode) {
    console.log('📍 Privacy: React Router location:', location);
  }

  // Use the usePageSEO hook for SEO data
  const seoData = usePageSEO(
    "Privacy Policy | Pack Move Go - Your Data Protection",
    "Learn how Pack Move Go protects your privacy and personal information. Our comprehensive privacy policy outlines how we collect, use, and safeguard your data when you use our moving services.",
    "privacy policy, data protection, personal information, moving company privacy, customer data protection, GDPR compliance, privacy rights, data security",
    "/images/moving-truck.webp",
    "https://packmovego.com/privacy"
  );

  // Log SEO data in development
  if (isDevMode) {
    console.log('📊 Privacy: SEO data configured:', {
      title: seoData.title,
      description: seoData.description.substring(0, 100) + '...',
      url: seoData.url
    });
  }

  /**
   * Handle search functionality
   * @param query - Search query string
   * @returns Search results array
   */
  const handleSearch = useCallback((query: string) => {
    if (isDevMode) {
      console.log('🔍 Privacy: Search triggered with query:', query);
    }
    
    const results = searchContent(query) as SearchResultWithExcerpt[];
    
    if (isDevMode) {
      console.log('🔍 Privacy: Search results found:', results.length);
    }
    
    return results;
  }, [isDevMode]);

  /**
   * Handle search completion callback
   * @param results - Array of search results
   */
  const handleSearchComplete = useCallback((results: SearchResult[]) => {
    if (isDevMode) {
      console.log('✅ Privacy: Search completed with results:', results.length);
    }
    
  }, [isDevMode]);

  /**
   * Handle quote form submission
   * @param data - Form data from quote form
   */
  const handleQuoteSubmit = useCallback((data: FormData) => {
    if (isDevMode) {
      console.log('📝 Privacy: Quote form submitted:', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        moveDate: data.moveDate,
        fromZip: data.fromZip,
        toZip: data.toZip,
        rooms: data.rooms
      });
    }
    
    // Here you would typically send the data to your backend
    // For now, we'll just log it in development mode
    if (isDevMode) {
      console.log('📤 Privacy: Quote form data ready for submission');
    }
  }, [isDevMode]);

  return (
    <>
      <SEO {...seoData} />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section {...getSectionProps('hero')} className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Your privacy is important to us. Learn how we protect your information.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <p className="text-lg text-blue-50">
                  <strong>Last Updated:</strong> {getCurrentDate().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Information Collection Section */}
        <section {...getSectionProps('information-collection')} className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Information We Collect</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">Personal Information</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Name and contact information
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Email address and phone number
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Mailing addresses (current and destination)
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Payment information
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Move details and preferences
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">Technical Information</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      IP address and device information
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Browser type and version
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Pages visited and time spent
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Cookies and tracking data
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Referral sources
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Information Usage Section */}
        <section {...getSectionProps('information-usage')} className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">How We Use Your Information</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-xl font-semibold mb-3 text-blue-800">Service Provision</h3>
                    <p className="text-gray-700">
                      We use your information to provide moving services, process payments, 
                      and coordinate your move with our team.
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                    <h3 className="text-xl font-semibold mb-3 text-green-800">Communication</h3>
                    <p className="text-gray-700">
                      To contact you about your move, send confirmations, updates, 
                      and respond to your inquiries.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                    <h3 className="text-xl font-semibold mb-3 text-purple-800">Improvement</h3>
                    <p className="text-gray-700">
                      To improve our services, website functionality, and customer experience.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                    <h3 className="text-xl font-semibold mb-3 text-orange-800">Legal Compliance</h3>
                    <p className="text-gray-700">
                      To comply with legal obligations, resolve disputes, and enforce our agreements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Information Sharing Section */}
        <section {...getSectionProps('information-sharing')} className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Information Sharing</h2>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">We Do Not Sell Your Data</h3>
                    <p className="text-gray-700 mb-4">
                      Pack Move Go does not sell, trade, or rent your personal information to third parties.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">Limited Sharing</h3>
                    <p className="text-gray-700 mb-4">
                      We may share your information only in these specific circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>With your explicit consent</li>
                      <li>With service providers who assist in our operations</li>
                      <li>To comply with legal requirements</li>
                      <li>To protect our rights and safety</li>
                      <li>In connection with a business transfer or merger</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security Section */}
        <section {...getSectionProps('data-security')} className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Data Security</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Encryption</h3>
                  <p className="text-gray-600 text-sm">
                    All data is encrypted using industry-standard SSL/TLS protocols
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Access Control</h3>
                  <p className="text-gray-600 text-sm">
                    Strict access controls limit who can view your personal information
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Regular Updates</h3>
                  <p className="text-gray-600 text-sm">
                    Security measures are regularly updated and monitored
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookies & Tracking Section */}
        <section {...getSectionProps('cookies-tracking')} className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Cookies & Tracking</h2>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">What Are Cookies?</h3>
                    <p className="text-gray-700 mb-4">
                      Cookies are small text files stored on your device that help us provide 
                      a better experience on our website.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">How We Use Cookies</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Remember your preferences and settings</li>
                      <li>Analyze website traffic and usage patterns</li>
                      <li>Improve website functionality and performance</li>
                      <li>Provide personalized content and recommendations</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">Managing Cookies</h3>
                    <p className="text-gray-700">
                      You can control cookies through your browser settings. However, 
                      disabling cookies may affect website functionality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Services Section */}
        <section {...getSectionProps('third-party-services')} className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Third-Party Services</h2>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <p className="text-gray-700 mb-6">
                  Our website may use third-party services for analytics, payment processing, 
                  and other functionality. These services have their own privacy policies.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-blue-600">Analytics Services</h3>
                    <p className="text-gray-600 text-sm">
                      Google Analytics and similar services help us understand website usage
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-blue-600">Payment Processors</h3>
                    <p className="text-gray-600 text-sm">
                      Secure payment processing through trusted third-party providers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Rights Section */}
        <section {...getSectionProps('user-rights')} className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Your Rights</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">Access & Control</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Access your personal information
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Request corrections to your data
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Request deletion of your data
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Opt-out of marketing communications
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">Data Portability</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Request a copy of your data
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Transfer your data to another service
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Restrict processing of your data
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Object to data processing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Children Privacy Section */}
        <section {...getSectionProps('children-privacy')} className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Children's Privacy</h2>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">Protection for Minors</h3>
                    <p className="text-gray-700 mb-4">
                      Our services are not intended for children under 13 years of age. 
                      We do not knowingly collect personal information from children under 13.
                    </p>
                    <p className="text-gray-700">
                      If you believe we have collected information from a child under 13, 
                      please contact us immediately so we can remove the information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Changes to Policy Section */}
        <section {...getSectionProps('changes-policy')} className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Changes to This Policy</h2>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">Policy Updates</h3>
                    <p className="text-gray-700 mb-4">
                      We may update this privacy policy from time to time to reflect changes 
                      in our practices or applicable laws.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">Notification</h3>
                    <p className="text-gray-700 mb-4">
                      We will notify you of any material changes by:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Posting the updated policy on our website</li>
                      <li>Sending an email notification to registered users</li>
                      <li>Displaying a prominent notice on our website</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-600">Continued Use</h3>
                    <p className="text-gray-700">
                      Your continued use of our services after any changes indicates your 
                      acceptance of the updated privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section {...getSectionProps('contact-info')} className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Contact Us</h2>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">Privacy Questions</h3>
                    <p className="text-gray-700 mb-4">
                      If you have any questions about this privacy policy or our data practices, 
                      please contact us:
                    </p>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Email:</strong> privacy@packmovego.com</p>
                      <p><strong>Phone:</strong> (555) 123-4567</p>
                      <p><strong>Address:</strong> 123 Moving Way, Orange County, CA 92626</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">Data Requests</h3>
                    <p className="text-gray-700 mb-4">
                      To exercise your data rights or make a privacy request:
                    </p>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Data Access:</strong> data@packmovego.com</p>
                      <p><strong>Opt-Out:</strong> unsubscribe@packmovego.com</p>
                      <p><strong>Complaints:</strong> complaints@packmovego.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Form Section */}
        <section {...getSectionProps('quote-form')} className="py-16 bg-blue-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Ready to Move?
                </h2>
                <p className="text-xl text-blue-100">
                  Get a free quote for your move while we protect your privacy
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <QuoteForm onSubmit={handleQuoteSubmit} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
} 