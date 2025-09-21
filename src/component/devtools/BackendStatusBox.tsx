import React, { useState, useEffect } from 'react';
import { apiMonitor, showBackendStatus } from '../../util/apiHealthMonitor';

interface BackendStatus {
  isOnline: boolean;
  lastCheck: number;
  responseTime: number;
  environment: string;
  version?: string;
  uptime?: string;
  services?: Record<string, string>;
  error?: string;
}

interface BackendStatusBoxProps {
  showDetails?: boolean;
  showConsole?: boolean;
  className?: string;
  compact?: boolean;
  title?: string;
}

export const BackendStatusBox: React.FC<BackendStatusBoxProps> = ({ 
  showDetails = true, 
  showConsole = true,
  className = '',
  compact = false,
  title = 'Backend Status'
}) => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updateStatus = () => {
      const detailedStatus = apiMonitor.getDetailedStatus();
      setStatus(detailedStatus);
      setLastUpdate(new Date());
      setIsLoading(false);
    };

    // Initial update
    updateStatus();

    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleShowConsole = () => {
    if (showConsole) {
      showBackendStatus();
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await apiMonitor.checkHealth();
    const detailedStatus = apiMonitor.getDetailedStatus();
    setStatus(detailedStatus);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-blue-600">Checking...</span>
          </div>
        ) : !status ? (
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-xs text-yellow-800">Backend status unknown</span>
            <button
              onClick={handleRefresh}
              className="text-xs text-blue-600 hover:text-blue-800"
              title="Refresh status"
            >
              ↻
            </button>
          </div>
        ) : (
          <>
            <span className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={`text-xs font-medium ${status.isOnline ? 'text-green-700' : 'text-red-700'}`}>
              {status.isOnline ? 'Online' : 'Offline'}
            </span>
            <span className="text-xs text-gray-500">
              {status.responseTime.toFixed(0)}ms
            </span>
            <button
              onClick={handleRefresh}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Refresh status"
            >
              ↻
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium text-gray-900">{title}</h5>
        <div className="flex space-x-1">
          {showConsole && (
            <button
              onClick={handleShowConsole}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Show detailed console info"
            >
              Console
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            title="Refresh status"
          >
            ↻
          </button>
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className="flex items-center space-x-2 mb-2">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-blue-600">Checking backend status...</span>
          </div>
        ) : !status ? (
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-xs text-yellow-800">Backend status unknown</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className={`text-lg ${status.isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {status.isOnline ? '✅' : '❌'}
            </span>
            <span className={`text-sm font-medium ${status.isOnline ? 'text-green-800' : 'text-red-800'}`}>
              Backend {status.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {status && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Response:</span>
            <span className={status.responseTime < 100 ? 'text-green-600' : status.responseTime < 500 ? 'text-yellow-600' : 'text-red-600'}>
              {status.responseTime.toFixed(0)}ms
            </span>
          </div>
          <div className="flex justify-between">
            <span>Environment:</span>
            <span className="text-gray-600">{status.environment}</span>
          </div>
          {status.version && (
            <div className="flex justify-between">
              <span>Version:</span>
              <span className="text-gray-600">{status.version}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Updated:</span>
            <span className="text-gray-600">{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && status && (
        <>
          {/* Services Status */}
          {status.services && (
            <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
              <div className="font-semibold mb-1 text-purple-800 text-xs">Services:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(status.services).map(([service, serviceStatus]) => (
                  <div key={service} className="flex justify-between">
                    <span className="capitalize">{service}:</span>
                    <span className={serviceStatus === 'operational' ? 'text-green-600' : 'text-red-600'}>
                      {serviceStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Details */}
          {status.error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <div className="font-semibold mb-1 text-red-800 text-xs">Error:</div>
              <div className="text-xs text-red-700 bg-red-100 p-1 rounded">
                {status.error}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {status.uptime && (
            <div className="mt-3 p-2 bg-indigo-50 border border-indigo-200 rounded">
              <div className="font-semibold mb-1 text-indigo-800 text-xs">Uptime:</div>
              <div className="text-xs text-indigo-700">{status.uptime}</div>
            </div>
          )}
        </>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center mt-2">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default BackendStatusBox; 