import React, { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface ContactFAQProps {
  faq: FAQ[];
  isLoading?: boolean;
  error?: string | null;
}

const ContactFAQ: React.FC<ContactFAQProps> = ({ 
  faq, 
  isLoading, 
  error 
}) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">Unable to load FAQ data</p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

// Add displayName for React DevTools
ContactFAQ.displayName = 'ContactFAQ';

export default ContactFAQ;
