import React from 'react';
import { getCurrentBusinessStatus } from '../../../util/contactParser';

interface ContactInfo {
  title: string;
  description: string;
}

interface ContactHeaderProps {
  contactInfo: ContactInfo;
  isLoading?: boolean;
  error?: string | null;
}

const ContactHeader: React.FC<ContactHeaderProps> = ({ 
  contactInfo, 
  isLoading, 
  error 
}) => {
  // Safely get business status with fallback
  const businessStatus = (() => {
    try {
      return getCurrentBusinessStatus();
    } catch (error) {
      console.warn('Failed to get business status:', error);
      return { isOpen: true, nextOpen: null };
    }
  })();
  const { isOpen, nextOpen } = businessStatus;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded mb-4 mx-auto w-96"></div>
          <div className="h-6 bg-gray-200 rounded mx-auto w-80"></div>
        </div>

        {/* Business Status Banner */}
        <div className="rounded-lg p-4 mb-8 text-center bg-gray-100">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mb-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Information Unavailable</h1>
        <p className="text-xl text-gray-600">Unable to load contact page header</p>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
};

// Add displayName for React DevTools
ContactHeader.displayName = 'ContactHeader';

export default ContactHeader;
