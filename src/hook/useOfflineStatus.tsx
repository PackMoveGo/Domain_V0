/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { offlineMonitor } from '../util/offlineMonitor';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(offlineMonitor.getOnlineStatus());

  useEffect(() => {
    // Subscribe to online/offline status changes
    const unsubscribe = offlineMonitor.subscribe((onlineStatus) => {
      setIsOnline(onlineStatus);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const clearCache = () => {
    offlineMonitor.clearCache();
  };

  return {
    isOnline,
    clearCache,
    shouldShowOfflineMessage: offlineMonitor.shouldShowOfflineMessage()
  };
}

// Offline Status Indicator Component
export const OfflineStatusIndicator: React.FC = () => {
  const { isOnline, clearCache } = useOfflineStatus();

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <span>📡 Offline</span>
        <button
          onClick={clearCache}
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
          title="Clear cached data"
        >
          Clear Cache
        </button>
      </div>
    </div>
  );
}; 