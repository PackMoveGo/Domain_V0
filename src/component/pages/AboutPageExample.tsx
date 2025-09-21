import React from 'react';
import { useAbout, useContact, useServices } from '../../hook/useApiData';

const AboutPageExample: React.FC = () => {
  const about = useAbout();
  const contact = useContact();
  const services = useServices();

  if (about.isLoading || contact.isLoading || services.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page content...</p>
        </div>
      </div>
    );
  }

  if (about.error || contact.error || services.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Content Loading Error</h2>
          <p className="text-gray-600">Some content couldn't be loaded. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* About Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {about.data?.title || 'About PackMoveGo'}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Professional Moving Services
          </p>
        </section>

        {/* Services Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Services</h2>
          {services.data?.services && services.data.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.data.services.map((service: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {service.price && (
                    <div className="text-blue-600 font-semibold">
                      Starting at ${service.price}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <p className="text-gray-500">Services information coming soon...</p>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Information</h2>
          {contact.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  {contact.data.address && (
                    <div className="flex items-start">
                      <span className="text-gray-500 mr-3">📍</span>
                      <div>
                        <strong>Address:</strong><br />
                        {contact.data.address}
                      </div>
                    </div>
                  )}
                  {contact.data.phone && (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-3">📞</span>
                      <div>
                        <strong>Phone:</strong> {contact.data.phone}
                      </div>
                    </div>
                  )}
                  {contact.data.email && (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-3">✉️</span>
                      <div>
                        <strong>Email:</strong> {contact.data.email}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Hours</h3>
                <div className="text-gray-600">
                  Monday - Friday: 8:00 AM - 6:00 PM<br />
                  Saturday: 9:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </div>
              </div>
            </div>
          )}
        </section>

        {/* API Status Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🔧 API Integration Status</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• About API: {about.data ? '✅ Connected' : '❌ Using fallback'}</div>
            <div>• Services API: {services.data?.services ? '✅ Connected' : '❌ Using fallback'}</div>
            <div>• Contact API: {contact.data ? '✅ Connected' : '❌ Using fallback'}</div>
            <div>• Cookie Consent: {about.hasConsent ? '✅ Given' : '❌ Required'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPageExample; 