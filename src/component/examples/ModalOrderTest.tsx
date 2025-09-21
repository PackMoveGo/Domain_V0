/**
 * Modal Order Test Component
 * 
 * This component tests the order of modals to ensure cookie consent appears before 503
 */

import React, { useState } from 'react';
import { useCookiePreferences } from '../../context/CookiePreferencesContext';
import { handleApiError } from '../../util/apiErrorHandler';
import { api } from '../../services/service.apiSW';

const ModalOrderTest: React.FC = () => {
  const { hasMadeChoice, hasOptedOut } = useCookiePreferences();
  const [result, setResult] = useState<string>('');

  const testApiError = async () => {
    setResult('Testing API error...');
    
    try {
      // This should fail since backend is not running
      const response = await api.getServices();
      setResult('API call succeeded (unexpected)');
    } catch (error) {
      setResult('API call failed as expected');
      
      // Test the error handler
      handleApiError(error, '/v0/services', {
        context: 'ModalOrderTest',
        showModal: true,
        logError: true
      });
    }
  };

  const clearConsent = () => {
    localStorage.removeItem('packmovego-cookie-preferences');
    setResult('Cookie consent cleared. Refresh the page to see the cookie banner.');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Modal Order Test</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">Current Status:</h2>
          <p className="text-sm text-blue-700">
            <strong>Has Made Choice:</strong> {hasMadeChoice ? 'Yes' : 'No'}<br/>
            <strong>Has Opted Out:</strong> {hasOptedOut ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold text-yellow-900 mb-2">Expected Order:</h2>
          <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
            <li><strong>Cookie Consent Banner</strong> (z-index: 10001) - Shows first if no consent</li>
            <li><strong>Opt-Out Overlay</strong> (z-index: 10000) - Shows if user opted out</li>
            <li><strong>503 API Failure Modal</strong> (z-index: 9999) - Shows only after consent given</li>
          </ol>
        </div>

        <div className="space-y-3">
          <button
            onClick={testApiError}
            className="w-full bg-red-500 text-white py-3 px-4 rounded hover:bg-red-600 min-h-[48px] touch-manipulation"
          >
            Test API Error (should show 503 only if consent given)
          </button>
          
          <button
            onClick={clearConsent}
            className="w-full bg-yellow-500 text-white py-3 px-4 rounded hover:bg-yellow-600 min-h-[48px] touch-manipulation"
          >
            Clear Cookie Consent (refresh page after)
          </button>
        </div>
        
        {result && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <p>{result}</p>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="font-semibold text-green-900 mb-2">Test Steps:</h2>
          <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
            <li>Click "Clear Cookie Consent" and refresh the page</li>
            <li>You should see the <strong>Cookie Consent Banner</strong> first</li>
            <li>Accept cookies</li>
            <li>Click "Test API Error" - you should see the <strong>503 Modal</strong></li>
            <li>If you see 503 before consent, the order is wrong</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ModalOrderTest;
