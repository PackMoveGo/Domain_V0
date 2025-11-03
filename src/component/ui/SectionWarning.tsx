import React from 'react';

interface SectionWarningProps {
  isVisible: boolean;
  message?: string;
  onDismiss?: () => void;
}

const SectionWarning: React.FC<SectionWarningProps> = ({ isVisible, message = 'Section temporarily disabled', onDismiss }) => {
  if (!isVisible) return null;
  
  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      {message}
      {onDismiss && (
        <button onClick={onDismiss} className="ml-2 text-yellow-600 hover:text-yellow-800">
          ×
        </button>
      )}
    </div>
  );
};

export default SectionWarning;