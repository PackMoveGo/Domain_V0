
import React, { useState, useEffect } from 'react';
import { useApiStatus } from '../../hook/useApiStatus';
import { api } from '../../services/service.apiSW';
import { log, error as logError, success } from '../../util/consoleManager';

interface DebugInfo {
  userAgent: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  cookieConsent: any;
  apiConfig: any;
  apiTest: any;
  localStorage: any;
  sessionStorage: any;
}

const MobileApiDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Detect mobile device
  const detectMobile = () => {
    if (typeof window === 'undefined') {
      return { userAgent: '', isMobile: false, isIOS: false, isAndroid: false };
    }
    
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    return { userAgent, isMobile, isIOS, isAndroid };
  };

  // Get cookie consent status
  const getCookieConsent = () => {
    try {
      const savedPreferences = localStorage.getItem('packmovego-cookie-preferences');
      if (savedPreferences) {
        return JSON.parse(savedPreferences);
      }
      return null;
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Get API configuration
  const getApiConfig = () => {
    try {
      const config = api.getConfig();
      return {
        baseURL: config.baseURL,
        headers: config.headers,
        environment: {
          VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
          MODE: import.meta.env.MODE,
          VITE_API_URL: import.meta.env.VITE_API_URL
        }
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      setIsLoading(true);
      const result = await api.testConnection();
      return result;
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Get storage info
  const getStorageInfo = () => {
    try {
      const localStorageData: any = {};
      const sessionStorageData: any = {};
      
      // Get all localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            localStorageData[key] = localStorage.getItem(key);
          } catch (e) {
            localStorageData[key] = 'Error reading value';
          }
        }
      }
      
      // Get all sessionStorage items
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          try {
            sessionStorageData[key] = sessionStorage.getItem(key);
          } catch (e) {
            sessionStorageData[key] = 'Error reading value';
          }
        }
      }
      
      return { localStorage: localStorageData, sessionStorage: sessionStorageData };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Collect all debug information
  const collectDebugInfo = async () => {
    log('🔍 Collecting mobile debug information...');
    
    const deviceInfo = detectMobile();
    const cookieConsent = getCookieConsent();
    const apiConfig = getApiConfig();
    const apiTest = await testApiConnection();
    const storageInfo = getStorageInfo();
    
    const debugData: DebugInfo = {
      ...deviceInfo,
      cookieConsent,
      apiConfig,
      apiTest,
      localStorage: storageInfo.localStorage,
      sessionStorage: storageInfo.sessionStorage
    };
    
    setDebugInfo(debugData);
    success('✅ Debug information collected');
    
    return debugData;
  };

  // Toggle debug panel
  const toggleDebugPanel = () => {
    setIsVisible(!isVisible);
    if (!isVisible && !debugInfo) {
      collectDebugInfo();
    }
  };

  // Refresh debug info
  const refreshDebugInfo = async () => {
    setIsLoading(true);
    await collectDebugInfo();
    setIsLoading(false);
  };

  // Test API after opt-in
  const testApiAfterOptIn = async () => {
    try {
      setIsLoading(true);
      log('🧪 Testing API after opt-in...');
      
      // Simulate opt-in
      const optInPreferences = {
        thirdPartyAds: true,
        analytics: true,
        functional: true,
        hasOptedOut: false,
        hasMadeChoice: true,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem('packmovego-cookie-preferences', JSON.stringify(optInPreferences));
      
      // Wait a moment for localStorage to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Test API
      const result = await api.testConnection();
      
      success('✅ API test after opt-in completed');
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('❌ API test after opt-in failed:', errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all storage
  const clearAllStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      success('✅ All storage cleared');
      refreshDebugInfo();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('❌ Failed to clear storage:', errorMessage);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleDebugPanel}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
          title="Mobile API Debugger"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Mobile API Debugger</h2>
          <button
            onClick={toggleDebugPanel}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={refreshDebugInfo}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh Debug Info'}
            </button>
            <button
              onClick={testApiAfterOptIn}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test API After Opt-in'}
            </button>
            <button
              onClick={clearAllStorage}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Clear All Storage
            </button>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <div className="space-y-4">
              {/* Device Information */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">Device Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><strong>User Agent:</strong> {debugInfo.userAgent}</div>
                  <div><strong>Is Mobile:</strong> {debugInfo.isMobile ? 'Yes' : 'No'}</div>
                  <div><strong>Is iOS:</strong> {debugInfo.isIOS ? 'Yes' : 'No'}</div>
                  <div><strong>Is Android:</strong> {debugInfo.isAndroid ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Cookie Consent */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">Cookie Consent</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.cookieConsent, null, 2)}
                </pre>
              </div>

              {/* API Configuration */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">API Configuration</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.apiConfig, null, 2)}
                </pre>
              </div>

              {/* API Test Result */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">API Test Result</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.apiTest, null, 2)}
                </pre>
              </div>

              {/* Local Storage */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">Local Storage</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.localStorage, null, 2)}
                </pre>
              </div>

              {/* Session Storage */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">Session Storage</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.sessionStorage, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {!debugInfo && !isLoading && (
            <div className="text-center text-gray-500">
              Click "Refresh Debug Info" to collect information
            </div>
          )}

          {isLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2">Loading debug information...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileApiDebugger; 