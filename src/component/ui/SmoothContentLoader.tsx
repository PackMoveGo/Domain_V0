import React from 'react';

interface SmoothContentLoaderProps {
  isLoading: boolean;
  isTransitioning: boolean;
  hasConsent: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const SmoothContentLoader: React.FC<SmoothContentLoaderProps> = ({
  isLoading,
  isTransitioning,
  hasConsent,
  children,
  fallback,
  className = ''
}) => {
  // Show fallback if no consent or loading
  if (!hasConsent || isLoading) {
    return (
      <div className={`transition-opacity duration-300 ease-in-out ${className}`}>
        {fallback || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  }

  // Show content with smooth transition
  return (
    <div className={`
      transition-all duration-500 ease-in-out
      ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Add displayName for React DevTools
SmoothContentLoader.displayName = 'SmoothContentLoader';

export default SmoothContentLoader; 