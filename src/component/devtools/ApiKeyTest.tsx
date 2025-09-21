import React, { useState, useEffect } from 'react';
import { getApiKey, getRawApiUrl } from '../../../services/service.apiSW';
import { api } from '../../services/service.apiSW';

const ApiKeyTest: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      console.log('🔑 Testing API connection with key:', getApiKey());
      const result = await api.testConnection();
      setApiStatus(result);
      setTestResult('API test completed - check console for details');
    } catch (error) {
      console.error('❌ API test failed:', error);
      setTestResult(`API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testHealthEndpoint = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      console.log('🔑 Testing health endpoint with key:', getApiKey());
      const result = await api.checkHealth();
      setApiStatus(result);
      setTestResult('Health endpoint test completed - check console for details');
    } catch (error) {
      console.error('❌ Health test failed:', error);
      setTestResult(`Health test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Key Authentication Test</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Configuration:</h4>
          <ul className="text-sm space-y-1">
            <li><strong>API URL:</strong> {getRawApiUrl()}</li>
            <li><strong>API Available:</strong> {apiStatus?.success ? 'Yes' : 'No'}</li>
            <li><strong>API Key:</strong> {getApiKey() ? `${getApiKey().substring(0, 10)}...` : 'Not set'}</li>
            <li><strong>Key Length:</strong> {getApiKey().length}</li>
          </ul>
        </div>

        <div className="space-x-2">
          <button
            onClick={testApiConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </button>
          
          <button
            onClick={testHealthEndpoint}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Health Endpoint'}
          </button>
        </div>

        {testResult && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        {apiStatus && (
          <div className="p-3 bg-gray-50 border rounded">
            <h4 className="font-medium mb-2">API Status Response:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(apiStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyTest;
