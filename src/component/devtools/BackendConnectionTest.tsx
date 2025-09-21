import React, { useState, useEffect } from 'react';
import { api } from '../../services/service.apiSW';

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: Date;
}

const BackendConnectionTest: React.FC = () => {
  const [results, setResults] = useState<ConnectionTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const addResult = (result: ConnectionTestResult) => {
    setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testEnvironmentConfig = async (): Promise<ConnectionTestResult> => {
    try {
      const config = api.getConfig();
      setConfig(config);
      
      return {
        success: true,
        message: 'Environment configuration loaded successfully',
        details: config,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to load environment configuration',
        details: error.message,
        timestamp: new Date()
      };
    }
  };

  const testApiHealth = async (): Promise<ConnectionTestResult> => {
    try {
      const response = await api.checkHealth();
      return {
        success: true,
        message: 'Backend health check successful',
        details: response,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Backend health check failed',
        details: error.message,
        timestamp: new Date()
      };
    }
  };

  const testCorsConnection = async (): Promise<ConnectionTestResult> => {
    try {
      // Test basic CORS by making a simple request
      const response = await fetch(`${config?.API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'CORS connection test successful',
          details: { status: response.status, data },
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: `CORS connection failed with status ${response.status}`,
          details: { status: response.status, statusText: response.statusText },
          timestamp: new Date()
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'CORS connection test failed',
        details: error.message,
        timestamp: new Date()
      };
    }
  };

  const testJwtAuthentication = async (): Promise<ConnectionTestResult> => {
    try {
      // Test JWT authentication flow
      const isAuthenticated = api.isAuthenticated();
      const user = api.getUser();
      const authHeaders = api.getAuthHeaders();

      return {
        success: true,
        message: 'JWT authentication status checked',
        details: {
          isAuthenticated,
          hasUser: !!user,
          hasAuthHeaders: !!authHeaders.Authorization
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'JWT authentication test failed',
        details: error.message,
        timestamp: new Date()
      };
    }
  };

  const testApiEndpoints = async (): Promise<ConnectionTestResult> => {
    try {
      const endpoints = [
        { name: 'Navigation', test: () => api.getNav() },
        { name: 'Services', test: () => api.getServices() },
        { name: 'Reviews', test: () => api.getReviews() }
      ];

      const results = await Promise.allSettled(
        endpoints.map(async ({ name, test }) => {
          try {
            await test();
            return { name, success: true };
          } catch (error: any) {
            return { name, success: false, error: error?.message || 'Unknown error' };
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const total = endpoints.length;

      return {
        success: successful > 0,
        message: `API endpoints test: ${successful}/${total} successful`,
        details: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }),
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'API endpoints test failed',
        details: error.message,
        timestamp: new Date()
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      { name: 'Environment Config', test: testEnvironmentConfig },
      { name: 'API Health', test: testApiHealth },
      { name: 'CORS Connection', test: testCorsConnection },
      { name: 'JWT Authentication', test: testJwtAuthentication },
      { name: 'API Endpoints', test: testApiEndpoints }
    ];

    for (const { name, test } of tests) {
      console.log(`🧪 Running ${name} test...`);
      const result = await test();
      addResult(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    // Load initial config
    testEnvironmentConfig().then(addResult);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Backend Connection Test
        </h2>
        <p className="text-gray-600">
          Test and debug the connection between frontend and backend with CORS and JWT authentication.
        </p>
      </div>

      {/* Configuration Display */}
      {config && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><strong>API URL:</strong> {config.API_URL}</div>
            <div><strong>Port:</strong> {config.PORT}</div>
            <div><strong>Dev Mode:</strong> {config.DEV_MODE}</div>
            <div><strong>Skip Backend Check:</strong> {config.SKIP_BACKEND_CHECK ? 'Yes' : 'No'}</div>
            <div><strong>Is SSR:</strong> {config.IS_SSR ? 'Yes' : 'No'}</div>
            <div><strong>Mode:</strong> {config.MODE}</div>
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Test Results</h3>
        {results.length === 0 ? (
          <p className="text-gray-500 italic">No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.success
                  ? 'bg-green-50 border-green-400'
                  : 'bg-red-50 border-red-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-medium text-gray-800">{result.message}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Troubleshooting Tips */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Troubleshooting Tips</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Ensure your backend server is running on the correct port (default: 3003)</li>
          <li>• Check that CORS is properly configured on your backend</li>
          <li>• Verify JWT_SECRET is set in your environment files</li>
          <li>• Make sure your .env.local file has the correct API_URL</li>
          <li>• Check browser console for additional error details</li>
        </ul>
      </div>
    </div>
  );
};

export default BackendConnectionTest;
