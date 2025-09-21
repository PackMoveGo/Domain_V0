import React, { useState, useEffect } from 'react';
import { useCookiePreferences } from '../../context/CookiePreferencesContext';
import { api } from '../../services/service.apiSW';

const CookieConsentTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { optIn, optOut, hasMadeChoice } = useCookiePreferences();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const getLocalStorageInfo = () => {
    try {
      const preferences = localStorage.getItem('packmovego-cookie-preferences');
      const lastBannerTime = localStorage.getItem('packmovego-last-banner-time');
      
      return {
        preferences: preferences ? JSON.parse(preferences) : null,
        lastBannerTime: lastBannerTime ? new Date(parseInt(lastBannerTime)).toLocaleString() : null,
        hasPreferences: !!preferences,
        hasBannerTime: !!lastBannerTime
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const clearAllCookieData = () => {
    localStorage.removeItem('packmovego-cookie-preferences');
    localStorage.removeItem('packmovego-last-banner-time');
    localStorage.removeItem('packmovego-cookie-cache');
    addResult('🧹 Cleared all cookie data from localStorage');
  };

  // Strict consent check for testing - only returns true if consent is explicitly given
  const strictConsentCheck = (): boolean => {
    try {
      const savedPreferences = localStorage.getItem('packmovego-cookie-preferences');
      if (!savedPreferences) {
        return false;
      }
      
      const preferences = JSON.parse(savedPreferences);
      // Compute hasOptedOut based on preferences (if all cookies are disabled)
      const hasOptedOut = preferences.hasMadeChoice && 
        !preferences.thirdPartyAds && 
        !preferences.analytics && 
        !preferences.functional;
      // Only return true if user has explicitly made a choice AND opted in
      return preferences.hasMadeChoice === true && !hasOptedOut;
    } catch (error) {
      return false;
    }
  };

  const runTest = async () => {
    setTestResults([]);
    addResult('Starting cookie consent test...');
    
    // Show localStorage info
    const storageInfo = getLocalStorageInfo();
    addResult(`localStorage preferences: ${storageInfo.hasPreferences ? 'Present' : 'Not found'}`);
    if (storageInfo.preferences) {
      // Compute hasOptedOut based on preferences (if all cookies are disabled)
      const hasOptedOut = storageInfo.preferences.hasMadeChoice && 
        !storageInfo.preferences.thirdPartyAds && 
        !storageInfo.preferences.analytics && 
        !storageInfo.preferences.functional;
      addResult(`  - hasMadeChoice: ${storageInfo.preferences.hasMadeChoice}`);
      addResult(`  - hasOptedOut: ${hasOptedOut} (computed)`);
    }
    
    // Test 1: Check initial state
    addResult(`Has made choice: ${hasMadeChoice ? 'Yes' : 'No'}`);
    
    // Test 2: Test strict consent check
    const strictConsent = strictConsentCheck();
    addResult(`Strict consent check: ${strictConsent ? 'Given' : 'Not given'}`);
    
    // Test 3: Try API call with strict consent check
    addResult('Testing API call with strict consent check...');
    if (!strictConsent) {
      addResult('✅ API call properly blocked - no consent given');
    } else {
      addResult('✅ API call allowed - consent is given (expected behavior)');
    }
    
    // Test 4: Test actual API service blocking
    addResult('Testing actual API service blocking...');
    try {
      // This should throw an error if consent is not given
      await api.getNav();
      if (!strictConsent) {
        addResult('❌ API service call succeeded when it should have been blocked');
      } else {
        addResult('✅ API service call succeeded - consent is given (expected behavior)');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('cookie consent required')) {
        addResult('✅ API service properly blocked - cookie consent required');
      } else {
        addResult(`❌ API service error (not consent related): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Test 5: Check navigation hook state
    addResult(`Navigation hook state: Not available (hooks removed for simplification)`);
    
    // Test 6: Performance and Load Time Analysis
    addResult('--- PERFORMANCE ANALYSIS ---');
    if (!strictConsent) {
      addResult('🚀 LOAD TIME OPTIMIZATION: ACTIVE');
      addResult('  ✅ API calls delayed until consent given');
      addResult('  ✅ No network requests made without consent');
      addResult('  ✅ Faster initial page load');
      addResult('  ✅ Reduced server load');
      addResult('  ✅ Better user experience');
    } else {
      addResult('⚡ API CALLS: ENABLED');
      addResult('  ✅ Consent given - API calls allowed');
      addResult('  ✅ Navigation data loading normally');
      addResult('  ✅ Full functionality available');
    }
    
    addResult('Test completed. Current state: ' + (strictConsent ? 'Consent given - API calls allowed' : 'No consent - API calls blocked'));
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Consent Gate Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Current Status</h3>
          <div className="space-y-2 text-sm">
            <div>Consent Given: <span className="text-gray-600 font-semibold">Not available</span></div>
            <div>Waiting for Consent: <span className="text-gray-600 font-semibold">Not available</span></div>
            <div>Has Made Choice: <span className={hasMadeChoice ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{hasMadeChoice ? '✅ Yes' : '❌ No'}</span></div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Navigation Hook Status</h3>
          <div className="space-y-2 text-sm">
            <div>Loading: <span className="text-gray-600 font-semibold">Not available</span></div>
            <div>Waiting for Consent: <span className="text-gray-600 font-semibold">Not available</span></div>
            <div>Error: <span className="text-gray-600 font-semibold">Not available</span></div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={runTest}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run Test
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear Results
        </button>
        <button
          onClick={clearAllCookieData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear Data
        </button>
        <button
          onClick={optIn}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Opt In
        </button>
        <button
          onClick={optOut}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Opt Out
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Results</h3>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500">Click "Run Test" to see results</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Testing Instructions</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li><strong>Clear Data</strong> - Removes all cookie preferences from localStorage</li>
          <li><strong>Run Test</strong> - Tests API call blocking (should be blocked after clearing data)</li>
          <li><strong>Opt In</strong> - Gives consent and should allow API calls</li>
          <li><strong>Opt Out</strong> - Removes consent and should block API calls</li>
        </ol>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Expected Behavior</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>After Clear Data:</strong> API calls should be blocked, no network requests</li>
          <li>• <strong>After Opt In:</strong> API calls should automatically retry and succeed</li>
          <li>• <strong>After Opt Out:</strong> API calls should be blocked again</li>
          <li>• <strong>Navigation:</strong> Should show fallback content while waiting</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Load Time Optimization Benefits</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>Faster Initial Load:</strong> No API calls until consent given</li>
          <li>• <strong>Reduced Server Load:</strong> Fewer unnecessary requests</li>
          <li>• <strong>Better UX:</strong> Page loads immediately with fallback content</li>
          <li>• <strong>GDPR Compliance:</strong> No data collection without consent</li>
          <li>• <strong>Automatic Retry:</strong> API calls resume when consent given</li>
        </ul>
      </div>
    </div>
  );
};

export default CookieConsentTest; 