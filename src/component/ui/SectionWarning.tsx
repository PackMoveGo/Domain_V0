import React from 'react';
import { logger } from '../../util/debug';
import { isClient } from '../../util/ssrUtils';

const isProduction = isClient ? import.meta.env.PROD : process.env.NODE_ENV === 'production';

interface SectionWarningProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const SectionWarning: React.FC<SectionWarningProps> = ({ isVisible, onDismiss }) => {
  // Don't show warning in development mode
  if (!isProduction || !isVisible) return null;

  const handleDismiss = () => {
    logger.debug('Warning dismissed');
    onDismiss();
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <div>
            <p className="font-bold">Developer Tools Detected</p>
            <p className="text-sm">
              Using browser developer tools may violate our terms of service. 
              Please close the developer tools to continue using the application normally.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
SectionWarning.displayName = 'SectionWarning';

export default SectionWarning; 