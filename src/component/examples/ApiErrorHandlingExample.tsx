/**
 * API Error Handling Example Component
 * 
 * This component demonstrates how to use the centralized API error handling
 * system in different scenarios.
 */

import React, { useState } from 'react';
import { api } from '../../services/service.apiSW';
import { 
  handleApiError, 
  // withApiErrorHandling, // Reserved for future use
  useApiErrorHandler,
  getFriendlyErrorMessage 
} from '../../util/apiErrorHandler';

const ApiErrorHandlingExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  // Example 1: Using the hook for error handling
  const { handleError, wrapApiCall } = useApiErrorHandler('/example', {
    context: 'Example Component',
    showModal: true,
    logError: true
  });

  // Example 2: Manual error handling
  const handleManualApiCall = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const _response = await api.getServices(); // Reserved for future use
      setResult('Success: Services loaded');
    } catch (error) {
      // Use centralized error handling
      handleApiError(error, '/v0/services', {
        context: 'Manual API Call',
        showModal: true,
        logError: true
      });
      setResult(`Error: ${getFriendlyErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Using the wrapper function
  const handleWrappedApiCall = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const _response = await wrapApiCall(() => api.getNav()); // Reserved for future use
      setResult('Success: Navigation loaded');
    } catch (error) {
      setResult(`Error: ${getFriendlyErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Using the hook's handleError function
  const handleWithHookError = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const _response = await api.getLocations(); // Reserved for future use
      setResult('Success: Locations loaded');
    } catch (error) {
      handleError(error); // Uses the hook's error handler
      setResult(`Error: ${getFriendlyErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Error Handling Examples</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Example 1: Manual Error Handling</h2>
          <p className="text-gray-600 mb-3">
            Uses <code>handleApiError()</code> directly in a try-catch block.
          </p>
          <button
            onClick={handleManualApiCall}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Manual Error Handling'}
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Example 2: Wrapper Function</h2>
          <p className="text-gray-600 mb-3">
            Uses <code>withApiErrorHandling()</code> to wrap API calls.
          </p>
          <button
            onClick={handleWrappedApiCall}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Wrapper Function'}
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Example 3: React Hook</h2>
          <p className="text-gray-600 mb-3">
            Uses <code>useApiErrorHandler()</code> hook for error handling.
          </p>
          <button
            onClick={handleWithHookError}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test React Hook'}
          </button>
        </div>

        {result && (
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Result:</h3>
            <p className="text-gray-700">{result}</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">How to Use in Your Components:</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>1. Import the error handler:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`import { handleApiError } from '../util/apiErrorHandler';`}
            </pre>
            
            <p><strong>2. Use in try-catch blocks:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`try {
  const response = await api.getData();
  // Handle success
} catch (error) {
  handleApiError(error, '/v0/data', {
    context: 'MyComponent',
    showModal: true,
    logError: true
  });
}`}
            </pre>
            
            <p><strong>3. Or use the React hook:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`const { handleError } = useApiErrorHandler('/v0/data');
// Then use handleError(error) in catch blocks`}
            </pre>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">⚠️ Important: Cookie Consent Required</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>The 503 modal will ONLY show after the user has given cookie consent.</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>If API fails before consent: Error is stored and shown after consent</li>
              <li>If API fails after consent: Modal shows immediately</li>
              <li>This ensures compliance with privacy regulations</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Test this:</strong> Clear your browser data, refresh the page, and try the examples above. 
              The modal won't show until you accept cookies!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiErrorHandlingExample;
