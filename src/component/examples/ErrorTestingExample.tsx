import React, { useState, useEffect } from 'react';
import { getErrorLog, get503Errors, clearErrorLog, resetHealthGate } from '../../services/service.apiSW';

const ErrorTestingExample: React.FC = () => {
  const [errorLog, setErrorLog] = useState<any[]>([]);
  const [errors503, setErrors503] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshErrorLog = () => {
    setErrorLog(getErrorLog());
    setErrors503(get503Errors());
  };

  useEffect(() => {
    refreshErrorLog();
    const interval = setInterval(refreshErrorLog, 1000); // Refresh every second
    return () => clearInterval(interval);
  }, []);

  const handleClearLog = () => {
    clearErrorLog();
    refreshErrorLog();
  };

  const handleResetHealth = () => {
    resetHealthGate();
    console.log('🔄 Health gate reset - API calls will be allowed again');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Error Testing Dashboard</h1>
            <div className="flex space-x-3">
              <button
                onClick={refreshErrorLog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleClearLog}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Log
              </button>
              <button
                onClick={handleResetHealth}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reset Health Gate
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800">Total Errors</h3>
              <p className="text-3xl font-bold text-blue-600">{errorLog.length}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800">503 Errors</h3>
              <p className="text-3xl font-bold text-red-600">{errors503.length}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800">Connection Errors</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {errorLog.filter(e => e.isConnectionError).length}
              </p>
            </div>
          </div>

          {/* 503 Errors Section */}
          {errors503.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">🚨 503 Service Unavailable Errors</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                {errors503.map((error, index) => (
                  <div key={index} className="mb-3 p-3 bg-white rounded border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-red-800">{error.endpoint}</span>
                      <span className="text-sm text-red-600">{formatTimestamp(error.timestamp)}</span>
                    </div>
                    <p className="text-red-700 text-sm mb-1">Page: {error.pageName}</p>
                    <p className="text-red-600 text-sm">{error.error}</p>
                    {error.statusCode && (
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-1">
                        Status: {error.statusCode}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Errors Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">All API Errors</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              {errorLog.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No errors logged yet</p>
              ) : (
                errorLog.slice().reverse().map((error, index) => (
                  <div key={index} className={`mb-3 p-3 rounded border ${
                    error.is503Error 
                      ? 'bg-red-50 border-red-200' 
                      : error.isConnectionError 
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${
                        error.is503Error ? 'text-red-800' : 'text-gray-800'
                      }`}>
                        {error.endpoint}
                      </span>
                      <span className="text-sm text-gray-600">{formatTimestamp(error.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">Page: {error.pageName}</p>
                    <p className={`text-sm mb-1 ${
                      error.is503Error ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {error.error}
                    </p>
                    <div className="flex space-x-2">
                      {error.statusCode && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Status: {error.statusCode}
                        </span>
                      )}
                      {error.is503Error && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          503 Error
                        </span>
                      )}
                      {error.isConnectionError && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Connection Error
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Testing Instructions</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Navigate to different pages to trigger API calls</li>
              <li>• 503 errors will be logged and displayed above</li>
              <li>• Use "Reset Health Gate" to allow API calls again after errors</li>
              <li>• Check browser console for detailed error logs</li>
              <li>• Errors are tracked per page and endpoint</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTestingExample;
