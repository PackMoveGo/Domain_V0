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

interface BackendStatusWidgetProps {
  showDetails?: boolean;
  showConsole?: boolean;
  className?: string;
  compact?: boolean;
}

export const BackendStatusWidget: React.FC<BackendStatusWidgetProps> = ({ 
  showDetails = true, 
  showConsole = true,
  className = '',
  compact = false
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

  if (isLoading) {
    return (
      <div className={`p-3 bg-blue-50 border border-blue-200 rounded ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-800">Checking backend status...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className={`p-3 bg-yellow-50 border border-yellow-200 rounded ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-800">⚠️ Backend status unknown</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const isOnline = status.isOnline;
  const responseTime = status.responseTime;
  const timeSinceLastCheck = Date.now() - status.lastCheck;
  const minutesAgo = Math.floor(timeSinceLastCheck / 60000);

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${className}`}>
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className={isOnline ? 'text-green-700' : 'text-red-700'}>
          Backend {isOnline ? 'Online' : 'Offline'}
        </span>
        <button
          onClick={handleRefresh}
          className="text-xs text-gray-500 hover:text-gray-700"
          title="Refresh status"
        >
          ↻
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Status Header */}
      <div className={`p-3 rounded border ${
        isOnline 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`text-lg ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? '✅' : '❌'}
            </span>
            <span className={`font-semibold ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
              Backend {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex space-x-2">
            {showConsole && (
              <button
                onClick={handleShowConsole}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Show detailed console info"
              >
                Console
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              title="Refresh status"
            >
              Refresh
            </button>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Status Details */}
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span className={responseTime < 100 ? 'text-green-600' : responseTime < 500 ? 'text-yellow-600' : 'text-red-600'}>
                  {responseTime.toFixed(2)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Check:</span>
                <span>{minutesAgo} min ago</span>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <span>{status.environment}</span>
              </div>
              {status.version && (
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span>{status.version}</span>
                </div>
              )}
              {status.uptime && (
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{status.uptime}</span>
                </div>
              )}
            </div>

            {/* Services Status */}
            {status.services && (
              <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
                <div className="font-semibold mb-1 text-purple-800">Services:</div>
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
                <div className="font-semibold mb-1 text-red-800">Error:</div>
                <div className="text-xs text-red-700 bg-red-100 p-1 rounded">
                  {status.error}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-xs text-gray-500 text-center mt-2">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BackendStatusWidget; 