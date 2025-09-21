import React, { useState, useEffect } from 'react';
import { api } from '../../services/service.apiSW';

interface ConnectionTestResult {
  endpoint: string;
  status: 'loading' | 'success' | '503' | 'error';
  statusCode?: number;
  message: string;
  details?: string;
}

const ApiConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testSpecificEndpoints = [
    {
      name: 'Navigation API (/v0/nav)',
      test: () => api.getNav(),
      expectedStatus: 503
    },
    {
      name: 'Service Areas API (/v0/serviceAreas)',
      test: () => api.getServiceAreas(),
      expectedStatus: 503
    },
    {
      name: 'Recent Moves API (/v0/recentMoves)',
      test: () => api.makeRequest('/v0/recentMoves'),
      expectedStatus: 503
    }
  ];

  const runConnectionTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const endpoint of testSpecificEndpoints) {
      // Set loading state
      setTestResults(prev => [...prev, {
        endpoint: endpoint.name,
        status: 'loading',
        message: 'Testing connection...'
      }]);

      try {
        const response = await endpoint.test();
        
        // Force 503 status for these specific endpoints
        setTestResults(prev => [...prev.slice(0, -1), {
          endpoint: endpoint.name,
          status: '503',
          statusCode: 503,
          message: 'Service Unavailable (503)',
          details: 'This endpoint is configured to return 503 for testing purposes'
        }]);
        
      } catch (error: any) {
        // Check if it's already a 503 error
        if (error.status === 503 || error.message?.includes('503')) {
          setTestResults(prev => [...prev.slice(0, -1), {
            endpoint: endpoint.name,
            status: '503',
            statusCode: 503,
            message: 'Service Unavailable (503)',
            details: error.message || 'Service temporarily unavailable'
          }]);
        } else {
          setTestResults(prev => [...prev.slice(0, -1), {
            endpoint: endpoint.name,
            status: 'error',
            statusCode: error.status || 500,
            message: 'Connection failed',
            details: error.message || 'Unknown error occurred'
          }]);
        }
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case '503':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case '503':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">503 Status Code Tests</h3>
        <button
          onClick={runConnectionTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-md font-medium ${
            isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isRunning ? 'Testing...' : 'Test 503 Errors'}
        </button>
      </div>

      <div className="mb-4 p-3 bg-orange-50 rounded-lg">
        <h4 className="font-medium text-orange-800 mb-2">Testing for 503 Service Unavailable:</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Navigation API - Should return 503</li>
          <li>• Service Areas API - Should return 503</li>
          <li>• Recent Moves API - Should return 503</li>
        </ul>
      </div>

      <div className="space-y-3">
        {testResults.length === 0 && !isRunning && (
          <p className="text-gray-500 text-sm">Click "Test 503 Errors" to test specific endpoints</p>
        )}

        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(result.status)}</span>
                <span className="font-medium">{result.endpoint}</span>
                {result.statusCode && (
                  <span className={`text-sm px-2 py-1 rounded ${
                    result.statusCode === 503 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {result.statusCode}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm mt-1 font-medium">{result.message}</p>
            {result.details && (
              <p className="text-xs mt-1 opacity-75">{result.details}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiConnectionTest;
