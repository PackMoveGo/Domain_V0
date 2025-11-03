import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface RouteLoaderProps {
  message?: string;
  className?: string;
}

const RouteLoader: React.FC<RouteLoaderProps> = ({ 
  message = "Loading page...", 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen bg-white flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="mb-6">
          <LoadingSpinner size="large" />
        </div>
        <div className="text-gray-600">
          <p className="text-lg font-medium mb-2">{message}</p>
          <p className="text-sm text-gray-500">Please wait while we prepare your content</p>
        </div>
      </div>
    </div>
  );
};

export default RouteLoader; 