
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/service.apiSW';
import { useDevApiOverride } from './devApiOverride';
import ApiFailureModal from '../ui/overlay/modal.apistatus';

interface DevToolsLauncherProps {
  isVisible?: boolean;
}

interface Position {
  x: number;
  y: number;
}

export default function DevToolsLauncher({ isVisible = false }: DevToolsLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState('main');
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // State for tab components
  const [selectedApiComponent, setSelectedApiComponent] = useState<string | null>(null);
  const [selectedDebugComponent, setSelectedDebugComponent] = useState<string | null>(null);
  const [selectedPerformanceComponent, setSelectedPerformanceComponent] = useState<string | null>(null);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  
  // API Override functionality
  const { shouldUseDevData, enableDevApi, disableDevApi, useLocalApi, resetToEnvHierarchy, isDevMode } = useDevApiOverride();

  // Check if dev tools should be enabled
  const shouldShowDevTools = () => {
    const enableDevTools = process.env.ENABLE_DEV_TOOLS === 'true' || 
                          (typeof window !== 'undefined' && (window as any).__ENABLE_DEV_TOOLS__ === 'true');
    const devMode = process.env.NODE_ENV || 
                   (typeof window !== 'undefined' && (window as any).__DEV_MODE__) || 
                   'development';
    
    return enableDevTools && devMode === 'development';
  };

  // Load saved position from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('devtools-launcher-position');
      if (savedPosition) {
        try {
          const parsed = JSON.parse(savedPosition);
          setPosition(parsed);
        } catch (e) {
          console.warn('Failed to parse saved devtools launcher position', e);
        }
      }
    }
  }, []);

  // Save position to localStorage
  const savePosition = (pos: Position) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('devtools-launcher-position', JSON.stringify(pos));
    }
  };

  // Cleanup skeleton loaders on component mount and unmount
  useEffect(() => {
    // Remove any existing skeleton loaders when component mounts
    const root = document.getElementById('root');
    if (root) {
      const skeletonLoaders = root.querySelectorAll('.skeleton-loader');
      skeletonLoaders.forEach(skeleton => skeleton.remove());
      if (skeletonLoaders.length > 0) {
        console.log('🔧 DevTools: Cleaned up existing skeleton loaders on mount');
      }
    }

    return () => {
      // Remove any skeleton loaders when component unmounts
      const root = document.getElementById('root');
      if (root) {
        const skeletonLoaders = root.querySelectorAll('.skeleton-loader');
        skeletonLoaders.forEach(skeleton => skeleton.remove());
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      
      // Allow movement across entire screen with minimal bounds
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      const newPosition = { x: boundedX, y: boundedY };
      setPosition(newPosition);
      savePosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const testApiConnection = async () => {
    try {
      // Get API URL for display
      const getApiUrl = () => {
        if (process.env.API_URL && process.env.API_URL !== 'undefined') {
          return process.env.API_URL;
        }
        if (typeof import.meta !== 'undefined' && import.meta.env?.API_URL) {
          return import.meta.env.API_URL;
        }
        return null; // Return null instead of 'Not configured' to check for undefined
      };

      const apiUrl = getApiUrl();
      
      // Throw error if API_URL is not defined
      if (!apiUrl) {
        throw new Error('API_URL not defined. Please check your environment configuration.');
      }
      
      console.log('🔧 Testing API connection to:', apiUrl);
      
      // Show loading state
      alert('🔄 Testing API connection... Please wait.');
      
      const result = await api.testConnection();
      console.log('API Test Result:', result);
      
      if (result.success) {
        const message = `✅ API Connection Successful!

URL: ${apiUrl}
Status: Connected
${result.data ? `Response: ${JSON.stringify(result.data, null, 2)}` : 'No data returned'}

The API is working correctly.`;
        alert(message);
      } else {
        const message = `❌ API Connection Failed

URL: ${apiUrl}
Status: Disconnected
Error: ${result.error || 'Connection refused'}

This is expected if the backend API is not running.
Click "Trigger Fallback" to simulate the user experience when API is down.`;
        alert(message);
      }
    } catch (error) {
      console.error('API test failed:', error);
      
      // Enhanced error message for API_URL not defined
      if (error instanceof Error && error.message.includes('API_URL not defined')) {
        alert(`❌ API Configuration Error:
${error.message}

Please check:
1. .env.development.local file has API_URL defined
2. vite.config.js is properly setting API_URL
3. Environment variables are loaded correctly

Current environment: ${process.env.NODE_ENV || 'development'}`);
      } else {
        const apiUrl = process.env.API_URL || 'Not configured';
        const message = `❌ API Test Failed

URL: ${apiUrl}
Error: ${error instanceof Error ? error.message : 'Unknown error'}

This is expected if the backend API is not running.
Click "Trigger Fallback" to simulate the user experience when API is down.`;
        alert(message);
      }
    }
  };

  const clearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 Cache cleared');
      alert('Cache cleared successfully');
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const openDevTools = () => {
    if (typeof window !== 'undefined') {
      // Open browser dev tools
      window.open('', '_blank');
    }
  };

  const showEnvironmentInfo = () => {
    // Get API URL from multiple sources for better compatibility
    const getApiUrl = () => {
      // Try process.env first (from vite.config.js define)
      if (process.env.API_URL && process.env.API_URL !== 'undefined') {
        return process.env.API_URL;
      }
      // Try import.meta.env as fallback
      if (typeof import.meta !== 'undefined' && import.meta.env?.API_URL) {
        return import.meta.env.API_URL;
      }
      // Try window global as last resort
      if (typeof window !== 'undefined' && (window as any).__API_URL__) {
        return (window as any).__API_URL__;
      }
      return null; // Return null to indicate not configured
    };

    const apiUrl = getApiUrl();
    
    // Check if API_URL is not defined and show warning
    if (!apiUrl) {
      alert(`⚠️ API Configuration Warning:
API_URL is not defined in your environment configuration.

Please check:
1. .env.development.local file has API_URL defined
2. vite.config.js is properly setting API_URL
3. Environment variables are loaded correctly

Current environment: ${process.env.NODE_ENV || 'development'}`);
      return;
    }

    const envInfo = {
      appName: process.env.APP_NAME || 'PackMoveGo',
      appVersion: process.env.APP_VERSION || '0.1.0',
      devMode: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '5001',
      apiUrl: apiUrl,
      enableDevTools: process.env.ENABLE_DEV_TOOLS === 'true',
      reduceLogging: process.env.REDUCE_LOGGING === 'true',
      skipBackendCheck: process.env.SKIP_BACKEND_CHECK === 'true',
      // Additional API configuration details
      apiTimeout: process.env.API_TIMEOUT || '10000',
      apiRetryAttempts: process.env.API_RETRY_ATTEMPTS || '3',
      apiRetryDelay: process.env.API_RETRY_DELAY || '1000'
    };
    console.log('Environment Info:', envInfo);
    alert(`Environment Info:\n${JSON.stringify(envInfo, null, 2)}`);
  };

  const triggerFallback = () => {
    console.log('🔧 DevTools: Manually triggering fallback modal');
    
    // Show confirmation dialog first
    const confirmMessage = `🔧 Trigger Fallback Modal

This will simulate the user experience when the API is not working.

The fallback modal will show:
• "Website Failed to Load" message
• "503 Service Unavailable" status
• Options to retry or report the issue

This is useful for testing the fallback UI when the backend API is down.

Do you want to continue?`;
    
    if (confirm(confirmMessage)) {
      // Set a flag to indicate this was triggered by dev tools
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dev-tools-fallback-triggered', 'true');
      }
      
      setShowFallbackModal(true);
      console.log('🔧 DevTools: Fallback modal triggered successfully');
    } else {
      console.log('🔧 DevTools: Fallback modal trigger cancelled by user');
    }
  };

  if (!shouldShowDevTools() || !isVisible) {
    return null;
  }

  const renderMainTab = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <h4 className="font-semibold text-sm text-blue-800 mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={testApiConnection}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
          >
            Test API
          </button>
          <button
            onClick={() => setActiveTab('api-override')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs"
          >
            API Override
          </button>
          <button
            onClick={clearCache}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
          >
            Clear Cache
          </button>
          <button
            onClick={reloadPage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
          >
            Reload Page
          </button>
          <button
            onClick={triggerFallback}
            className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
            title="Simulate API failure and show fallback modal to end user"
          >
            Trigger Fallback
          </button>
          <button
            onClick={async () => {
              // Test API first, then trigger fallback if it fails
              try {
                await testApiConnection();
                // If API test succeeds, ask if user wants to trigger fallback anyway
                if (confirm('API test completed. Do you want to trigger the fallback modal anyway for testing?')) {
                  triggerFallback();
                }
              } catch (error) {
                // If API test fails, automatically trigger fallback
                console.log('API test failed, automatically triggering fallback');
                triggerFallback();
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
            title="Test API and trigger fallback if it fails"
          >
            Test & Fallback
          </button>
          <button
            onClick={() => {
              // Simulate app loading failure by adding skeleton loaders
              const root = document.getElementById('root');
              if (root) {
                // Clean up existing skeleton loaders first
                const existingSkeletons = root.querySelectorAll('.skeleton-loader');
                existingSkeletons.forEach(skeleton => skeleton.remove());
                
                const skeletonDiv = document.createElement('div');
                skeletonDiv.className = 'skeleton-loader animate-pulse bg-gray-200';
                skeletonDiv.innerHTML = '<div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>';
                root.appendChild(skeletonDiv);
                console.log('🔧 DevTools: Added skeleton loader to simulate loading failure');
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
            title="Add skeleton loader to test fallback detection"
          >
            Add Skeleton
          </button>
          <button
            onClick={() => {
              // Remove all skeleton loaders from the DOM
              const root = document.getElementById('root');
              if (root) {
                const skeletonLoaders = root.querySelectorAll('.skeleton-loader');
                skeletonLoaders.forEach(skeleton => skeleton.remove());
                console.log('🔧 DevTools: Removed all skeleton loaders');
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
            title="Remove all skeleton loaders from the page"
          >
            Remove Skeletons
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded border border-gray-200">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Development Tools</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('api-tests')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
          >
            API Tests
          </button>
          <button
            onClick={() => setActiveTab('debug-tools')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm"
          >
            Debug Tools
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded text-sm"
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('environment')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm"
          >
            Environment
          </button>
          <button
            onClick={() => setActiveTab('api-config')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
          >
            API Config
          </button>
          <button
            onClick={() => setActiveTab('api-override')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm"
          >
            API Override
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <h4 className="font-semibold text-sm text-blue-800 mb-2">API Configuration</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>API URL:</strong> {(() => {
            if (process.env.API_URL && process.env.API_URL !== 'undefined') {
              return process.env.API_URL;
            }
            if (typeof import.meta !== 'undefined' && import.meta.env?.API_URL) {
              return import.meta.env.API_URL;
            }
            return '❌ Not configured - Check environment files';
          })()}</div>
          <div><strong>Skip Backend Check:</strong> {process.env.SKIP_BACKEND_CHECK === 'true' ? 'Yes' : 'No'}</div>
          <div><strong>API Timeout:</strong> {process.env.API_TIMEOUT || '10000'}ms</div>
          <div><strong>Retry Attempts:</strong> {process.env.API_RETRY_ATTEMPTS || '3'}</div>
        </div>
      </div>

      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
        <h4 className="font-semibold text-sm text-yellow-800 mb-2">API Override Quick Status</h4>
        <div className="text-xs text-yellow-700">
          <div>Mock Data: {shouldUseDevData ? 'Enabled' : 'Disabled'}</div>
          <div>Click "API Override" tab for full control</div>
        </div>
      </div>
    </div>
  );

  const renderApiTestsTab = () => {
    const components = {
      'simple-api': { name: 'Simple API Test', component: 'SimpleApiTest' },
      'secure-api': { name: 'Secure API Test', component: 'SecureApiTest' },
      'api-connection': { name: 'API Connection Test', component: 'ApiConnectionTest' },
      'backend-connection': { name: 'Backend Connection Test', component: 'BackendConnectionTest' },
      'api-loading': { name: 'API Loading Debug', component: 'ApiLoadingDebug' },
      'api-diagnostic': { name: 'API Diagnostic', component: 'ApiDiagnostic' },
      'api-auth': { name: 'API Auth Status', component: 'ApiAuthStatus' }
    };

    if (selectedApiComponent) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm text-purple-800">
              {components[selectedApiComponent as keyof typeof components]?.name}
            </h4>
            <button
              onClick={() => setSelectedApiComponent(null)}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              ← Back to Tests
            </button>
          </div>
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <p className="text-sm text-purple-700">
              Component: {components[selectedApiComponent as keyof typeof components]?.component}
            </p>
            <p className="text-sm text-purple-600 mt-2">
              This component would be dynamically loaded here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-purple-50 p-3 rounded border border-purple-200">
          <h4 className="font-semibold text-sm text-purple-800 mb-2">API Test Components</h4>
          <div className="space-y-2">
            {Object.entries(components).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => setSelectedApiComponent(key)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDebugToolsTab = () => {
    const components = {
      'mobile-api-debugger': { name: 'Mobile API Debugger', component: 'MobileApiDebugger' },
      'axios-nav-debug': { name: 'Axios Navigation Debug', component: 'AxiosNavDebug' },
      'axios-nav-test': { name: 'Axios Navigation Test', component: 'AxiosNavTest' },
      'user-tracking-demo': { name: 'User Tracking Demo', component: 'UserTrackingDemo' },
      'cookie-consent-test': { name: 'Cookie Consent Test', component: 'CookieConsentTest' },
      'services-test': { name: 'Services Test', component: 'ServicesTest' }
    };

    if (selectedDebugComponent) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm text-orange-800">
              {components[selectedDebugComponent as keyof typeof components]?.name}
            </h4>
            <button
              onClick={() => setSelectedDebugComponent(null)}
              className="text-orange-600 hover:text-orange-800 text-sm"
            >
              ← Back to Debug Tools
            </button>
          </div>
          <div className="bg-orange-50 p-3 rounded border border-orange-200">
            <p className="text-sm text-orange-700">
              Component: {components[selectedDebugComponent as keyof typeof components]?.component}
            </p>
            <p className="text-sm text-orange-600 mt-2">
              This component would be dynamically loaded here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-orange-50 p-3 rounded border border-orange-200">
          <h4 className="font-semibold text-sm text-orange-800 mb-2">Debug Tools</h4>
          <div className="space-y-2">
            {Object.entries(components).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => setSelectedDebugComponent(key)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    const components = {
      'cache-performance-monitor': { name: 'Cache Performance Monitor', component: 'CachePerformanceMonitor' },
      'cache-control': { name: 'Cache Control', component: 'CacheControl' },
      'backend-status-box': { name: 'Backend Status Box', component: 'BackendStatusBox' },
      'backend-status-widget': { name: 'Backend Status Widget', component: 'BackendStatusWidget' }
    };

    if (selectedPerformanceComponent) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm text-teal-800">
              {components[selectedPerformanceComponent as keyof typeof components]?.name}
            </h4>
            <button
              onClick={() => setSelectedPerformanceComponent(null)}
              className="text-teal-600 hover:text-teal-800 text-sm"
            >
              ← Back to Performance Tools
            </button>
          </div>
          <div className="bg-teal-50 p-3 rounded border border-teal-200">
            <p className="text-sm text-teal-700">
              Component: {components[selectedPerformanceComponent as keyof typeof components]?.component}
            </p>
            <p className="text-sm text-teal-600 mt-2">
              This component would be dynamically loaded here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-teal-50 p-3 rounded border border-teal-200">
          <h4 className="font-semibold text-sm text-teal-800 mb-2">Performance Tools</h4>
          <div className="space-y-2">
            {Object.entries(components).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => setSelectedPerformanceComponent(key)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded text-sm"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEnvironmentTab = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
        <h4 className="font-semibold text-sm text-indigo-800 mb-2">Environment Info</h4>
        <button
          onClick={showEnvironmentInfo}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm"
        >
          Show Environment Info
        </button>
      </div>
      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
        <h4 className="font-semibold text-sm text-yellow-800 mb-2">Environment Priority</h4>
        <div className="text-xs text-yellow-700 space-y-1">
          <div>1. .env.local (highest)</div>
          <div>2. .env.production (npm start)</div>
          <div>3. .env.development (npm run dev)</div>
          <div>4. .env.global (general)</div>
          <div>5. .env (lowest)</div>
        </div>
      </div>
    </div>
  );

  const renderApiConfigTab = () => {
    const getApiUrl = () => {
      if (process.env.API_URL && process.env.API_URL !== 'undefined') {
        return process.env.API_URL;
      }
      if (typeof import.meta !== 'undefined' && import.meta.env?.API_URL) {
        return import.meta.env.API_URL;
      }
      return 'Not configured';
    };

    const apiUrl = getApiUrl();

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold text-sm text-blue-800 mb-3">Current API Configuration</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">API URL:</span>
              <span className="text-blue-600 font-mono text-xs break-all">{apiUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">Skip Backend Check:</span>
              <span className="text-blue-600">{process.env.SKIP_BACKEND_CHECK === 'true' ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">API Timeout:</span>
              <span className="text-blue-600">{process.env.API_TIMEOUT || '10000'}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">Retry Attempts:</span>
              <span className="text-blue-600">{process.env.API_RETRY_ATTEMPTS || '3'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">Retry Delay:</span>
              <span className="text-blue-600">{process.env.API_RETRY_DELAY || '1000'}ms</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded border border-green-200">
          <h4 className="font-semibold text-sm text-green-800 mb-3">API Connection Test</h4>
          <div className="space-y-2">
            <button
              onClick={testApiConnection}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Test API Connection
            </button>
            <p className="text-xs text-green-700">
              This will test the connection to the configured API URL and show detailed results.
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h4 className="font-semibold text-sm text-yellow-800 mb-3">API Configuration Sources</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>1. <strong>process.env.API_URL</strong> (from vite.config.js define)</div>
            <div>2. <strong>import.meta.env.API_URL</strong> (Vite environment)</div>
            <div>3. <strong>window.__API_URL__</strong> (global fallback)</div>
            <div className="mt-2 text-yellow-600">
              Current source: {process.env.API_URL && process.env.API_URL !== 'undefined' ? 'process.env' : 
                              typeof import.meta !== 'undefined' && import.meta.env?.API_URL ? 'import.meta.env' : 'Not found'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h4 className="font-semibold text-sm text-gray-800 mb-3">Environment Files Priority</h4>
          <div className="text-xs text-gray-700 space-y-1">
            <div>1. <strong>.env.local</strong> (highest priority)</div>
            <div>2. <strong>.env.development.local</strong> (development mode)</div>
            <div>3. <strong>.env.production.local</strong> (production mode)</div>
            <div>4. <strong>.env.development</strong> (development fallback)</div>
            <div>5. <strong>.env.production</strong> (production fallback)</div>
            <div>6. <strong>.env</strong> (lowest priority)</div>
          </div>
        </div>
      </div>
    );
  };

  const renderApiOverrideTab = () => {
    // Get current API mode from sessionStorage
    const getCurrentApiMode = () => {
      if (typeof window === 'undefined') return 'Unknown';
      const mode = sessionStorage.getItem('use-dev-api');
      if (mode === 'true') return 'Mock Data';
      if (mode === 'false') return 'Real API';
      if (mode === 'local') return 'Local API';
      return 'Environment Hierarchy';
    };

    const currentMode = getCurrentApiMode();

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-semibold text-sm text-yellow-800 mb-2">API Override Status</h4>
          <div className="text-xs text-yellow-700 space-y-2 mb-3">
            <div><strong>Current Mode:</strong> {currentMode}</div>
            <div><strong>Mock Data:</strong> {shouldUseDevData ? 'Enabled' : 'Disabled'}</div>
            <div><strong>Session Storage:</strong> {typeof window !== 'undefined' ? 'Available' : 'Not Available'}</div>
            <div><strong>Development Mode:</strong> {isDevMode ? 'Active' : 'Inactive'}</div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded border border-green-200">
          <h4 className="font-semibold text-sm text-green-800 mb-2">API Mode Controls</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                console.log('🔧 Mock Data button clicked');
                enableDevApi();
              }}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                currentMode === 'Mock Data'
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
              }`}
            >
              Use Mock Data
            </button>
            <button
              onClick={() => {
                console.log('🔧 Real API button clicked');
                disableDevApi();
              }}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                currentMode === 'Real API'
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-200 text-green-800 hover:bg-green-300'
              }`}
            >
              Use Real API
            </button>
            <button
              onClick={() => {
                console.log('🔧 Local API button clicked');
                useLocalApi();
              }}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                currentMode === 'Local API'
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
              }`}
            >
              Use Local API
            </button>
            <button
              onClick={() => {
                console.log('🔧 Reset to Environment Hierarchy button clicked');
                resetToEnvHierarchy();
              }}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                currentMode === 'Environment Hierarchy'
                  ? 'bg-purple-500 text-white' 
                  : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
              }`}
            >
              Reset to .env Hierarchy
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <h4 className="font-semibold text-sm text-blue-800 mb-2">API Override Info</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• <strong>Mock Data:</strong> Uses development mock data for testing</div>
            <div>• <strong>Real API:</strong> Uses production API endpoints</div>
            <div>• <strong>Local API:</strong> Uses local API configuration from .env.local</div>
            <div>• <strong>Environment Hierarchy:</strong> Follows .env.local {'>'} .env.development {'>'} .env.global {'>'} .env</div>
            <div>• Session-based settings (clears on page reload)</div>
            <div>• Only active in development mode</div>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'api-tests':
        return renderApiTestsTab();
      case 'debug-tools':
        return renderDebugToolsTab();
      case 'performance':
        return renderPerformanceTab();
      case 'environment':
        return renderEnvironmentTab();
      case 'api-override':
        return renderApiOverrideTab();
      default:
        return renderMainTab();
    }
  };

  return (
    <>
      {/* Main DevTools Launcher */}
      <div
        ref={dragRef}
        className={`fixed z-50 transition-all duration-300 ${
          isCollapsed ? 'w-12 h-12' : 'w-[90vw] h-[80vh]'
        }`}
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {isCollapsed ? (
          // Collapsed state - sphere wrench icon
          <div 
            className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg border-2 border-white/20 transition-all duration-200 hover:scale-110"
            onClick={() => setIsCollapsed(false)}
            title="🔧 Development Tools Launcher"
          >
            <div className="text-lg">🔧</div>
          </div>
        ) : (
          // Expanded state - full dev tools panel
          <div className="bg-white border border-gray-300 rounded-lg shadow-2xl h-full flex flex-col">
            {/* Header with Tabs */}
            <div className="bg-gray-50 border-b border-gray-200 rounded-t-lg p-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">🔧</span>
                  Dev Tools Launcher
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded hover:bg-gray-200"
                    title="Minimize"
                  >
                    −
                  </button>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('main')}
                  className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                    activeTab === 'main'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Main
                </button>
                <button
                  onClick={() => setActiveTab('api-tests')}
                  className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                    activeTab === 'api-tests'
                      ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  API Tests
                </button>
                <button
                  onClick={() => setActiveTab('debug-tools')}
                  className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                    activeTab === 'debug-tools'
                      ? 'bg-white text-orange-600 border-b-2 border-orange-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Debug Tools
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                    activeTab === 'performance'
                      ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveTab('environment')}
                  className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                    activeTab === 'environment'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Environment
                </button>
                <button
                  onClick={() => setActiveTab('api-config')}
                  className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                    activeTab === 'api-config'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  API Config
                </button>
                <button
                  onClick={() => setActiveTab('api-override')}
                  className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                    activeTab === 'api-override'
                      ? 'bg-white text-yellow-600 border-b-2 border-yellow-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  API Override
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderActiveTab()}
            </div>
          </div>
        )}
      </div>

      {/* API Failure Modal */}
      <ApiFailureModal
        isVisible={showFallbackModal}
        onClose={() => setShowFallbackModal(false)}
      />
    </>
  );
}
