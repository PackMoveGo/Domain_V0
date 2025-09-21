import React from 'react';
import { formatPhoneNumber } from '../../../util/contactParser';

interface ContactInfo {
  mainPhone: string;
  mainEmail: string;
}

interface ContactCTAProps {
  contactInfo: ContactInfo;
  isLoading?: boolean;
  error?: string | null;
}

const ContactCTA: React.FC<ContactCTAProps> = ({ 
  contactInfo, 
  isLoading, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 mx-auto w-64"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 mx-auto w-80"></div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="h-12 bg-gray-200 rounded w-48"></div>
          <div className="h-12 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-gray-600">Unable to load contact information</p>
      </div>
    );
  }

  return (
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
          Call Now: {(() => {
            try {
              return formatPhoneNumber(contactInfo.mainPhone);
            } catch (error) {
              console.warn('Phone formatting error:', error);
              return contactInfo.mainPhone;
            }
          })()}
        </a>
        <a
          href={`mailto:${contactInfo.mainEmail}`}
          className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Email Us
        </a>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
ContactCTA.displayName = 'ContactCTA';

export default ContactCTA;
