import React from 'react';

interface LoadingSectionProps {
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode;
  fallbackMessage?: string;
  className?: string;
}

const LoadingSection: React.FC<LoadingSectionProps> = ({
  isLoading,
  error,
  children,

  className = ""
}) => {
  if (isLoading) {
    return (
      <div className={`loading-section ${className}`}>
        <div className="flex flex-col items-center justify-center py-12">
          {/* Loading Logo */}
          <div className="loading-logo mb-6">
            <img 
              src="/images/favicon/favicon-32x32.png" 
              alt="Loading..." 
              className="w-16 h-16 animate-pulse"
              loading="eager"
            />
          </div>
          
          {/* Loading Animation */}
          <div className="loading-animation mb-4">
            <div className="flex justify-center items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 mb-2">Loading content...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the latest information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`error-section ${className}`}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Content</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If not loading and no error, show children (actual content)
  return <>{children}</>;
};

export default LoadingSection; 