import React from 'react';

interface NoDataSectionProps {
  title?: string;
  message?: string;
  icon?: string;
  className?: string;
  showRetryButton?: boolean;
  onRetry?: () => void;
}

const NoDataSection: React.FC<NoDataSectionProps> = ({
  title = "No Data Available",
  message = "We couldn't find any information to display at the moment.",
  icon = "📭",
  className = "",
  showRetryButton = false,
  onRetry
}) => {
  return (
    <div className={`no-data-section ${className}`}>
      <div className="flex flex-col items-center justify-center py-12">
        {/* Icon */}
        <div className="text-4xl mb-4">{icon}</div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {message}
        </p>
        
        {/* Retry Button (optional) */}
        {showRetryButton && onRetry && (
          <button 
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default NoDataSection; 