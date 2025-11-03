import React from 'react';

const ContextLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-40 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <div className="text-sm text-gray-600">Initializing...</div>
      </div>
    </div>
  );
};

export default ContextLoader; 