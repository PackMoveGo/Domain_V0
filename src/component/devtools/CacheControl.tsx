import React from 'react';
import { offlineMonitor } from '../../util/offlineMonitor';

interface CacheControlProps {
  showOfflineStatus?: boolean;
  className?: string;
}

const CacheControl: React.FC<CacheControlProps> = ({ 
  showOfflineStatus = true, 
  className = '' 
}) => {
  const isOnline = offlineMonitor.getOnlineStatus();

  const handleClearCache = () => {
    offlineMonitor.clearCache();
    // Force a page reload to ensure fresh data
    window.location.reload();
  };

  return (
    <div className={`cache-control ${className}`}>
      {showOfflineStatus && (
        <div className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
        </div>
      )}
      
      <button
        onClick={handleClearCache}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
        title="Clear all cached API data and reload page"
      >
        Clear Cache & Reload
      </button>
    </div>
  );
};

export default CacheControl; 