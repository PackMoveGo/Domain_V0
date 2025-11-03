import React from 'react';

interface ContactInfo {
  mainPhone: string;
  mainEmail: string;
}

interface ContactForm {
  title: string;
  description: string;
}

interface ContactFormSectionProps {
  contactForm: ContactForm;
  contactInfo: ContactInfo;
  isLoading?: boolean;
  error?: string | null;
}

const ContactFormSection: React.FC<ContactFormSectionProps> = ({ 
  contactForm, 
  contactInfo,
  isLoading, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 mb-12 animate-pulse">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded mb-4 mx-auto w-64"></div>
          <div className="h-4 bg-gray-200 rounded mx-auto w-80"></div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{contactForm.title}</h2>
          <p className="text-gray-600">{contactForm.description}</p>
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">Unable to load contact form</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{contactForm.title}</h2>
        <p className="text-gray-600">{contactForm.description}</p>
      </div>
      
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="text-yellow-600 text-4xl mr-3">⚠️</div>
            <h3 className="text-lg font-semibold text-yellow-800">Form Temporarily Unavailable</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            Our contact form is currently experiencing technical difficulties. Please use one of the alternative contact methods below.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${contactInfo.mainPhone}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Call Us: {contactInfo.mainPhone}
            </a>
            <a
              href={`mailto:${contactInfo.mainEmail}`}
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Email Us: {contactInfo.mainEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
ContactFormSection.displayName = 'ContactFormSection';

export default ContactFormSection;
