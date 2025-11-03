import React, { useState, useEffect } from 'react';
import SkeletonLoader from '../ui/SkeletonLoader';

interface ProgressiveLoaderProps {
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode;
  skeletonType?: 'text' | 'card' | 'list' | 'hero' | 'services' | 'testimonials';
  skeletonCount?: number;
  fallbackMessage?: string;
  errorMessage?: string;
  className?: string;
  showSkeletonOnError?: boolean;
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  isLoading,
  error,
  children,
  skeletonType = 'text',
  skeletonCount = 3,
  fallbackMessage = 'Content is loading...',
  errorMessage = 'Failed to load content',
  className = '',
  showSkeletonOnError = false
}) => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Show skeleton immediately when loading starts
  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      setShowContent(false);
    } else {
      // Keep skeleton visible for a short time to prevent flicker
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        setShowContent(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // If there's an error and we don't want to show skeleton, show error immediately
  useEffect(() => {
    if (error && !showSkeletonOnError) {
      setShowSkeleton(false);
      setShowContent(true);
    }
  }, [error, showSkeletonOnError]);

  return (
    <div className={`progressive-loader ${className}`}>
      {/* Show skeleton while loading */}
      {showSkeleton && (isLoading || (error && showSkeletonOnError)) && (
        <div className="transition-opacity duration-300 ease-in-out">
          <SkeletonLoader 
            type={skeletonType} 
            count={skeletonCount}
            className="opacity-100"
          />
        </div>
      )}

      {/* Show content when loaded */}
      {showContent && !isLoading && !error && (
        <div className="transition-opacity duration-300 ease-in-out opacity-100">
          {children}
        </div>
      )}

      {/* Show error state */}
      {showContent && error && !showSkeletonOnError && (
        <div className="transition-opacity duration-300 ease-in-out opacity-100">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-2xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {errorMessage}
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Show fallback message for very slow connections */}
      {isLoading && !showSkeleton && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{fallbackMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ProgressiveLoader; 