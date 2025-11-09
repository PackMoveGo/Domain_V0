/**
 * Simple API Error Test Component
 * 
 * This component tests the API error handling system
 */

import React, { useState } from 'react';
import { handleApiError } from '../../util/apiErrorHandler';
import { api } from '../../services/service.apiSW';

const ApiErrorTest: React.FC = () => {
  const [result, setResult] = useState<string>('');

  const testApiError = async () => {
    setResult('Testing API error...');
    
    try {
      // This should fail since backend is not running
      // const response = await api.getServices(); // Reserved for future use
      await api.getServices();
      setResult('API call succeeded (unexpected)');
    } catch (error) {
      setResult('API call failed as expected');
      
      // Test the error handler
      handleApiError(error, '/v0/services', {
        context: 'ApiErrorTest',
        showModal: true,
        logError: true
      });
    }
  };

  const testDirectError = () => {
    setResult('Testing direct error...');
    
    // Test direct error handling
    handleApiError(new Error('Test error'), '/test-endpoint', {
      context: 'ApiErrorTest',
      showModal: true,
      logError: true
    });
    
    setResult('Direct error test completed');
  };

  const checkConsentStatus = () => {
    const savedPreferences = localStorage.getItem('packmovego-cookie-preferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setResult(`Consent Status: hasMadeChoice=${parsed.hasMadeChoice}, hasOptedOut=${parsed.hasOptedOut}`);
    } else {
      setResult('No cookie preferences found');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Error Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testApiError}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 min-h-[48px] touch-manipulation"
        >
          Test API Error (should fail)
        </button>
        
        <button
          onClick={testDirectError}
          className="w-full bg-red-500 text-white py-3 px-4 rounded hover:bg-red-600 min-h-[48px] touch-manipulation"
        >
          Test Direct Error
        </button>
        
        <button
          onClick={checkConsentStatus}
          className="w-full bg-gray-500 text-white py-3 px-4 rounded hover:bg-gray-600 min-h-[48px] touch-manipulation"
        >
          Check Consent Status
        </button>
        
        {result && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiErrorTest;
