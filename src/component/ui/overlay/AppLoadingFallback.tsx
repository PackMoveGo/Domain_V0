
import React, { useEffect, useState } from 'react';

interface AppLoadingFallbackProps {
  isVisible: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function AppLoadingFallback({ 
  isVisible, 
  onRetry, 
  onDismiss 
}: AppLoadingFallbackProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Add a small delay for smooth animation
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleReportBug = () => {
    window.open('https://bug.packmovego.com/report/fallback', '_blank');
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-[9400] 
          transition-opacity duration-300 ease-in-out
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div 
        className={`
          fixed inset-0 z-[9500] flex items-center justify-center p-4
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        <div 
          className="
            bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4
            border border-gray-200 overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-white text-2xl">⚠️</div>
                <div>
                  <h2 className="text-white font-bold text-lg">Website Failed to Load</h2>
                  <p className="text-red-100 text-sm">Status: 503 Service Unavailable</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <div className="text-gray-600 mb-4">
                <p className="text-lg font-medium text-gray-800 mb-2">
                  We're experiencing technical difficulties
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The website failed to load properly. This could be due to a temporary server issue, 
                  network problem, or browser compatibility issue.
                </p>
              </div>
              
              {/* Status Code Display */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">HTTP Status Code</div>
                <div className="text-2xl font-bold text-red-600">503</div>
                <div className="text-xs text-gray-600">Service Unavailable</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="
                  w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg
                  transition-colors duration-200 flex items-center justify-center space-x-2
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </button>

              <button
                onClick={handleReportBug}
                className="
                  w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg
                  transition-colors duration-200 flex items-center justify-center space-x-2
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Report Bug</span>
              </button>

              <button
                onClick={handleDismiss}
                className="
                  w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg
                  transition-colors duration-200
                "
              >
                Dismiss
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                <p>If the problem persists, please contact our support team.</p>
                <p className="mt-1">
                  <a 
                    href="mailto:report@packmovego.com" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    report@packmovego.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
