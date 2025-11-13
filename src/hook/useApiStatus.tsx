/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { getCurrentTimestamp } from '../util/ssrUtils';

// Real-time API status monitoring
export const useApiStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [, setLastCheck] = useState(getCurrentTimestamp());

  useEffect(() => {
    const checkStatus = async () => {
    try {
      // Use centralized API service with authentication
      const { api } = await import('../services/service.apiSW');
      const result = await api.checkHealth();
      setIsOnline(!!result && !result.error);
      setLastCheck(Date.now());
    } catch (_error) { // Reserved for future use
      setIsOnline(false);
    }
    };

    // Check immediately
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isOnline };
};

// API Status Indicator Component
export const ApiStatusIndicator: React.FC = () => {
  const { isOnline } = useApiStatus();

  return (
    <div className={`fixed bottom-4 right-4 p-2 rounded ${isOnline ? 'bg-green-500' : 'bg-red-500'} text-white`}>
      {isOnline ? '🟢 API Online' : '🔴 API Offline'}
    </div>
  );
};

// Add displayName for React DevTools
ApiStatusIndicator.displayName = 'ApiStatusIndicator'; 