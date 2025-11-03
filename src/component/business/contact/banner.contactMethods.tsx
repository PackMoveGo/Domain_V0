import React from 'react';

interface ContactMethod {
  id: string;
  title: string;
  description: string;
  primary: string;
  secondary?: string;
  hours?: string;
  icon: string;
  color: string;
}

interface ContactMethodsProps {
  contactMethods: ContactMethod[];
  isLoading?: boolean;
  error?: string | null;
}

const ContactMethods: React.FC<ContactMethodsProps> = ({ 
  contactMethods, 
  isLoading, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Get in Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
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
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Get in Touch</h2>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">Unable to load contact methods</p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

// Add displayName for React DevTools
ContactMethods.displayName = 'ContactMethods';

export default ContactMethods;
