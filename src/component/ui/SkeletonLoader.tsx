import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'list' | 'hero' | 'services' | 'testimonials' | 'recent-moves';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        );
      
      case 'card':
        return (
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        );
      
      case 'list':
        return (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        );
      
      case 'hero':
        return (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        );
      
      case 'services':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        );
      
      case 'testimonials':
        return (
          <div className="space-y-6">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'recent-moves':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        );
    }
  };

  return (
    <div className={`skeleton-loader ${className}`}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader; 