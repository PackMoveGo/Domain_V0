import { useState, useEffect } from 'react';
import { connectionMonitor } from '../util/connectionMonitor';

export function useConnectionMonitor() {
  const [connectionInfo, setConnectionInfo] = useState(connectionMonitor.getConnectionInfo());

  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribe = connectionMonitor.subscribe((info) => {
      setConnectionInfo(info);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const getLoadingStrategy = () => {
    return connectionMonitor.getLoadingStrategy();
  };

  const getApiTimeout = () => {
    return connectionMonitor.getApiTimeout();
  };

  const isSlowConnection = () => {
    return connectionMonitor.isSlowConnection();
  };

  return {
    connectionInfo,
    getLoadingStrategy,
    getApiTimeout,
    isSlowConnection
  };
}

// Connection Status Indicator Component
export const ConnectionStatusIndicator: React.FC = () => {
  const { connectionInfo } = useConnectionMonitor();

  if (!connectionInfo.isSlow) {
    return null; // Don't show anything for good connections
  }

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <span>🐌</span>
        <span className="text-sm">Slow Connection</span>
      </div>
    </div>
  );
}; 