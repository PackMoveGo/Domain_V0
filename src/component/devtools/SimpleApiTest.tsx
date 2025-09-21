import React, { useState, useEffect } from 'react';
import { api } from '../../services/service.apiSW';
import { getAllServiceAreas } from '../../services/public/service.serviceAreas';
import { getAllRecentMoves } from '../../services/public/service.recentMoves';
import { is503SimulationEnabled } from '../../util/api503Simulator';

interface ApiTestResult {
  endpoint: string;
  status: 'loading' | 'success' | 'error' | '503';
  statusCode?: number;
  message: string;
  responseTime?: number;
}

const SimpleApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationEnabled, setSimulationEnabled] = useState(is503SimulationEnabled());

  const testEndpoints = [
    {
      name: 'Navigation API',
      test: () => api.getNav(),
      endpoint: '/v0/nav'
    },
    {
      name: 'Service Areas API',
      test: () => getAllServiceAreas(),
      endpoint: '/v0/serviceAreas'
    },
    {
      name: 'Recent Moves API',
      test: () => getAllRecentMoves(),
      endpoint: '/v0/recentMoves'
    }
  ];

  const runApiTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const endpoint of testEndpoints) {
      const startTime = Date.now();
      
      // Set initial loading state
      setTestResults(prev => [...prev, {
        endpoint: endpoint.name,
        status: 'loading',
        message: 'Testing...'
      }]);

      try {
        const response = await endpoint.test();
        const responseTime = Date.now() - startTime;
        
        // If we get here, the API call succeeded (which shouldn't happen for 503 endpoints)
        setTestResults(prev => [...prev.slice(0, -1), {
          endpoint: endpoint.name,
          status: 'success',
          statusCode: 200,
          message: 'Success (503 simulation may not be enabled)',
          responseTime
        }]);
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        
        // Check if it's a 503 error
        if (error.message?.includes('503') || error.status === 503) {
          setTestResults(prev => [...prev.slice(0, -1), {
            endpoint: endpoint.name,
            status: '503',
            statusCode: 503,
            message: 'Service Unavailable (503)',
            responseTime
          }]);
        } else {
          setTestResults(prev => [...prev.slice(0, -1), {
            endpoint: endpoint.name,
            status: 'error',
            statusCode: error.status || 500,
            message: error.message || 'Unknown error',
            responseTime
          }]);
        }
      }

      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
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

  const toggleSimulation = () => {
    const newState = !simulationEnabled;
    setSimulationEnabled(newState);
    // Store in localStorage for persistence
    localStorage.setItem('503-simulation-enabled', newState.toString());
    // Reload page to apply changes
    window.location.reload();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">API Endpoint Tests</h3>
        <div className="flex space-x-2">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              simulationEnabled
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {simulationEnabled ? 'Disable 503 Sim' : 'Enable 503 Sim'}
          </button>
          <button
            onClick={runApiTests}
            disabled={isRunning}
            className={`px-4 py-2 rounded-md font-medium ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Testing...' : 'Run Tests'}
          </button>
        </div>
      </div>

      <div className={`mb-4 p-3 rounded-lg ${
        simulationEnabled 
          ? 'bg-orange-50 border border-orange-200' 
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <span className={`text-lg ${simulationEnabled ? 'text-orange-600' : 'text-gray-500'}`}>
            {simulationEnabled ? '⚠️' : 'ℹ️'}
          </span>
          <span className={`text-sm font-medium ${
            simulationEnabled ? 'text-orange-800' : 'text-gray-700'
          }`}>
            {simulationEnabled 
              ? '503 Simulation ENABLED - These endpoints will return 503 errors'
              : '503 Simulation DISABLED - Endpoints will work normally'
            }
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {testResults.length === 0 && !isRunning && (
          <p className="text-gray-500 text-sm">Click "Run Tests" to test API endpoints</p>
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
                  <span className="text-sm px-2 py-1 bg-white rounded">
                    {result.statusCode}
                  </span>
                )}
              </div>
              {result.responseTime && (
                <span className="text-sm text-gray-500">
                  {result.responseTime}ms
                </span>
              )}
            </div>
            <p className="text-sm mt-1">{result.message}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Expected Results:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Navigation API: 503 Service Unavailable</li>
          <li>• Service Areas API: 503 Service Unavailable</li>
          <li>• Recent Moves API: 503 Service Unavailable</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleApiTest;
