import React, { useEffect, useState } from 'react';
import { resetHealthGate, getTrackedApiCalls, getCurrentPageName } from '../../../services/service.apiSW';

// SSR-safe environment detection
const isSSR = typeof window === 'undefined';

interface ApiFailureModalProps {
  isVisible: boolean;
  onClose: () => void;
  failureDetails?: { endpoint: string; error: string } | null;
  failedEndpoints?: string[];
  is503Error?: boolean;
}

export default function ApiFailureModal({ isVisible, onClose, failureDetails, failedEndpoints = [], is503Error = false }: ApiFailureModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [allFailedEndpoints, setAllFailedEndpoints] = useState<string[]>([]);
  const [allTrackedCalls, setAllTrackedCalls] = useState<string[]>([]);
  const [currentPageName, setCurrentPageName] = useState<string>('');
  const [has503Error, setHas503Error] = useState(false);

  // Debug logging
  console.log('🔧 [MODAL] ApiFailureModal render:', {
    isVisible,
    failedEndpoints,
    is503Error,
    isSSR,
    allTrackedCalls,
    currentPageName
  });

  // Get all tracked API calls and failed endpoints for the current page
  useEffect(() => {
    if (isVisible && !isSSR) {
      // Get all tracked API calls for the current page
      const trackedCalls = getTrackedApiCalls();
      const pageName = getCurrentPageName();
      
      setAllTrackedCalls(trackedCalls);
      setCurrentPageName(pageName);
      setAllFailedEndpoints(failedEndpoints);
      setHas503Error(is503Error);
      
      console.log('🔧 [MODAL] API calls for page:', {
        pageName,
        trackedCalls,
        failedEndpoints,
        is503Error
      });
    }
  }, [isVisible, failedEndpoints, is503Error, isSSR]);

  useEffect(() => {
    if (isVisible && !isSSR) {
      // Add a small delay for smooth animation
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, isSSR]);

  // SSR-safe visibility check - don't render during SSR
  if (isSSR || !isVisible) {
    return null;
  }

  const handleRetry = () => {
    // Reset health gate to allow fresh health check
    resetHealthGate();
    if (!isSSR) {
      window.location.reload();
    }
  };

  const handleReportBug = () => {
    if (!isSSR) {
      const reportEmail = 'mailto:report@packmovego.com';
      window.open(reportEmail, '_blank');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-[10002] 
          transition-opacity duration-300 ease-in-out
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          fixed inset-0 z-[10003] flex items-center justify-center p-2 sm:p-4
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        <div 
          className="
            bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full mx-2 sm:mx-4
            border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="text-white text-xl sm:text-2xl flex-shrink-0">⚠️</div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white font-bold text-base sm:text-lg leading-tight">
                    {has503Error ? 'Service Temporarily Unavailable' : 'Website Failed to Load'}
                  </h2>
                  <p className="text-red-100 text-xs sm:text-sm mt-1">
                    Status: {has503Error ? '503 Service Unavailable' : '503 Service Unavailable'}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-red-100 text-xs opacity-75 mt-1">
                      {allTrackedCalls.length > 0 ? (
                        <div>
                          <p className="break-all">Page: {currentPageName}</p>
                          <p className="break-all">All API Routes Called: {allTrackedCalls.length} endpoints</p>
                          <p className="break-all text-xs mt-1">Routes: {allTrackedCalls.join(', ')}</p>
                          {(allFailedEndpoints.length > 0 || has503Error) && (
                            <p className="break-all text-xs mt-1">Failed: {has503Error ? allTrackedCalls.join(', ') : allFailedEndpoints.join(', ')}</p>
                          )}
                          {failureDetails && <p className="break-all text-xs mt-1">Primary Error: {failureDetails.endpoint}</p>}
                        </div>
                      ) : allFailedEndpoints.length > 0 ? (
                        <div>
                          <p className="break-all">All API Routes Called: {allFailedEndpoints.length} endpoints</p>
                          <p className="break-all text-xs mt-1">Routes: {allFailedEndpoints.join(', ')}</p>
                          {failureDetails && <p className="break-all text-xs mt-1">Primary Error: {failureDetails.endpoint}</p>}
                        </div>
                      ) : failureDetails ? (
                        <p className="break-all">[API Failed: {failureDetails.endpoint}]</p>
                      ) : (
                        <p>[DevTools Triggered]</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-2"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-gray-600 mb-3 sm:mb-4">
                <p className="text-base sm:text-lg font-medium text-gray-800 mb-2">
                  {has503Error ? 'Our services are temporarily unavailable' : 'We\'re experiencing technical difficulties'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {has503Error 
                    ? 'Our API services are currently down for maintenance. This affects the dynamic content on our website, but you can still browse our static content and contact us directly.'
                    : 'The website failed to load properly. This could be due to a temporary server issue, network problem, or browser compatibility issue.'
                  }
                </p>
                {process.env.NODE_ENV === 'development' && (failureDetails || allTrackedCalls.length > 0 || allFailedEndpoints.length > 0) && (
                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium mb-1">Technical Details (Dev Only):</p>
                    {allTrackedCalls.length > 0 ? (
                      <div>
                        <p className="text-xs text-red-600 font-medium mb-1">Page: {currentPageName}</p>
                        <p className="text-xs text-red-600 font-medium mb-1">All API Routes Called ({allTrackedCalls.length} total):</p>
                        {allTrackedCalls.map((endpoint, index) => (
                          <p key={index} className={`text-xs ml-2 break-all ${
                            allFailedEndpoints.includes(endpoint) || has503Error ? 'text-red-600 font-semibold' : 'text-gray-600'
                          }`}>
                            • {endpoint} {allFailedEndpoints.includes(endpoint) || has503Error ? '(FAILED)' : '(OK)'}
                          </p>
                        ))}
                        {(allFailedEndpoints.length > 0 || has503Error) && (
                          <p className="text-xs text-red-600 mt-2 font-medium">
                            Failed endpoints: {has503Error ? allTrackedCalls.join(', ') : allFailedEndpoints.join(', ')}
                          </p>
                        )}
                        {failureDetails && (
                          <p className="text-xs text-red-600 mt-2 break-all">
                            Primary error: {failureDetails.error}
                          </p>
                        )}
                      </div>
                    ) : allFailedEndpoints.length > 0 ? (
                      <div>
                        <p className="text-xs text-red-600 font-medium mb-1">All API Routes Called ({allFailedEndpoints.length} total):</p>
                        {allFailedEndpoints.map((endpoint, index) => (
                          <p key={index} className="text-xs text-red-600 ml-2 break-all">
                            • {endpoint}
                          </p>
                        ))}
                        {failureDetails && (
                          <p className="text-xs text-red-600 mt-2 break-all">
                            Primary error: {failureDetails.error}
                          </p>
                        )}
                      </div>
                    ) : failureDetails ? (
                      <div>
                        <p className="text-xs text-red-600 break-all">
                          Failed endpoint: {failureDetails.endpoint}
                        </p>
                        <p className="text-xs text-red-600 break-all">
                          Error: {failureDetails.error}
                        </p>
                      </div>
                    ) : null}
                    <p className="text-xs text-red-600">
                      HTTP Status Code: 503
                    </p>
                  </div>
                )}
              </div>
              
              {/* Status Code Display */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                <div className="text-xs text-gray-500 mb-1">HTTP Status Code</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600">503</div>
                <div className="text-xs text-gray-600">Service Unavailable</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handleRetry}
                className="
                  w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg
                  transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{has503Error ? 'Refresh Page' : 'Try Again'}</span>
              </button>

              {has503Error && (
                <button
                  onClick={() => !isSSR && window.open('mailto:contact@packmovego.com', '_blank')}
                  className="
                    w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg
                    transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact Us Directly</span>
                </button>
              )}

              <button
                onClick={handleReportBug}
                className="
                  w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg
                  transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Report Bug</span>
              </button>

              <button
                onClick={onClose}
                className="
                  w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 sm:px-4 rounded-lg
                  transition-colors duration-200 text-sm sm:text-base
                "
              >
                Dismiss
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                {has503Error ? (
                  <div>
                    <p>Our API services are temporarily down for maintenance.</p>
                    <p className="mt-1">You can still browse our website and contact us directly.</p>
                    <p className="mt-2">
                      <a 
                        href="mailto:contact@packmovego.com" 
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        contact@packmovego.com
                      </a>
                    </p>
                  </div>
                ) : (
                  <div>
                    <p>If the problem persists, please contact our support team.</p>
                    <p className="mt-1">
                      <a 
                        href="mailto:report@packmovego.com" 
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        report@packmovego.com
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
