import React from 'react';

interface ServicesUnavailableProps {
  error?: string | null;
  onRetry?: () => void;
}

export const ServicesUnavailable: React.FC<ServicesUnavailableProps> = ({ 
  error, 
  onRetry 
}) => {
  const defaultMessage = 'Services temporarily unavailable. Please try again later.';
  const displayMessage = error || defaultMessage;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Services Temporarily Unavailable
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {displayMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Refresh Page
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            If this problem persists, please contact our support team.
          </p>
          <p className="mt-1">
            Phone: (555) 123-4567 | Email: report@packmovego.com
          </p>
        </div>
      </div>
    </div>
  );
}; 