import React from 'react';

interface ApiAuthStatusProps {
  // Add any props that might be needed
}

const ApiAuthStatus: React.FC<ApiAuthStatusProps> = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">API Authentication Status</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Status:</span> Not implemented
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Last Check:</span> N/A
        </p>
      </div>
    </div>
  );
};

export default ApiAuthStatus;
