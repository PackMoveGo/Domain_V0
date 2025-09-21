import React, { useState } from 'react';
import { 
  ContactInfo, 
  OfficeLocation, 
  ContactMethod, 
  ContactForm, 
  FAQ, 
  BusinessHours,
  formatPhoneNumber,
  validateContactForm,
  getCurrentBusinessStatus,
  generateGoogleMapsUrl,
  generateDirectionsUrl
} from '../../util/contactParser';

interface ContactPageProps {
  contactInfo: ContactInfo;
  officeLocations: OfficeLocation[];
  contactMethods: ContactMethod[];
  contactForm: ContactForm;
  faq: FAQ[];
  businessHours: BusinessHours;
  isLoading: boolean;
  error: string | null;
}

const ContactPage: React.FC<ContactPageProps> = ({ 
  contactInfo, 
  officeLocations, 
  contactMethods, 
  contactForm, 
  faq, 
  businessHours,
  isLoading, 
  error 
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  const { isOpen, nextOpen } = getCurrentBusinessStatus();

  // Validate required props to prevent runtime errors
  if (!contactInfo || !contactInfo.title) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Contact Information Unavailable</h3>
          <p className="text-gray-600">Contact information is not properly loaded. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Contact Information</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContactForm(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setFormData({});
    }, 2000);
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleLocationSelect = (locationId: number) => {
    setSelectedLocation(selectedLocation === locationId ? null : locationId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {contactInfo.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {contactInfo.description}
        </p>
      </div>

      {/* Business Status Banner */}
      <div className={`rounded-lg p-4 mb-8 text-center ${isOpen ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className={`font-medium ${isOpen ? 'text-green-800' : 'text-yellow-800'}`}>
            {isOpen ? 'We are currently open!' : 'We are currently closed'}
          </span>
          {!isOpen && nextOpen && (
            <span className="text-yellow-700">Next open: {nextOpen}</span>
          )}
        </div>
      </div>

      {/* Contact Methods */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Get in Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(contactMethods || []).map((method) => (
            <div key={method.id} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className={`${method.color} text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-4`}>
                {method.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{method.description}</p>
              <div className="space-y-2">
                <div className="font-medium text-gray-900">{method.primary}</div>
                <div className="text-sm text-gray-600">{method.secondary}</div>
                <div className="text-xs text-gray-500">{method.hours}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Office Locations */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Offices</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {(officeLocations || []).map((location) => (
            <div key={location.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{location.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{location.type}</p>
                  </div>
                  <button
                    onClick={() => handleLocationSelect(location.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {selectedLocation === location.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-400 mr-3 mt-1">📍</span>
                    <div>
                      <p className="text-gray-900">{location.address.street}</p>
                      <p className="text-gray-600">{location.address.city}, {location.address.state} {location.address.zip}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">📞</span>
                    <a href={`tel:${location.phone}`} className="text-blue-600 hover:text-blue-800">
                      {formatPhoneNumber(location.phone)}
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">✉️</span>
                    <a href={`mailto:${location.email}`} className="text-blue-600 hover:text-blue-800">
                      {location.email}
                    </a>
                  </div>
                </div>

                {selectedLocation === location.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Business Hours</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(location.hours || {}).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize text-gray-600">{day}</span>
                          <span className="text-gray-900">{hours}</span>
                        </div>
                      ))}
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-3 mt-4">Services Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {(location.services || []).map((service, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <a
                        href={generateGoogleMapsUrl(location.address.fullAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        View on Map
                      </a>
                      <a
                        href={generateDirectionsUrl('', location.address.fullAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                      >
                        Get Directions
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{contactForm.title}</h2>
          <p className="text-gray-600">{contactForm.description}</p>
        </div>

        {!submitSuccess ? (
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(contactForm.fields || []).map((field) => (
                <div key={field.name} className={field.name === 'message' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`contact-${field.name}`}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={5}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`contact-${field.name}`}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {(field.options || [])?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      id={`contact-${field.name}`}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                  
                  {formErrors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
            <p className="text-gray-600 mb-6">Thank you for contacting us. We'll get back to you within 2 hours.</p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto">
          {(faq || []).map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md mb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                <span className="text-blue-600 text-2xl">
                  {expandedFAQ === index ? '−' : '+'}
                </span>
              </button>
              {expandedFAQ === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{businessHours.title}</h2>
        <p className="text-gray-600 mb-6">{businessHours.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Regular Hours</h3>
                    <div className="space-y-3">
          {Object.entries(businessHours.hours || {}).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize text-gray-700">{day}</span>
                  <span className={`font-medium ${hours.status === 'closed' ? 'text-red-600' : 'text-gray-900'}`}>
                    {hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Emergency Support</h3>
            <p className="text-gray-600 mb-4">{businessHours.emergency}</p>
            <a
              href={`tel:${contactInfo.emergencyPhone}`}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-block"
            >
              Call Emergency Line
            </a>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Start Your Move?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Get a free quote today and experience the difference that professional moving services make.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`tel:${contactInfo.mainPhone}`}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Call Now: {formatPhoneNumber(contactInfo.mainPhone)}
          </a>
          <a
            href={`mailto:${contactInfo.mainEmail}`}
            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
ContactPage.displayName = 'ContactPage';

export default ContactPage; 