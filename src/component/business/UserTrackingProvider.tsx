import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UserTrackerAPI } from '../../util/user-tracker';

interface UserTrackingContextType {
  setUserInfo: (userId: string, email?: string, role?: string) => void;
  trackPageView: (page: string, fromPage?: string) => void;
  trackInteraction: (type: string, data?: any) => void;
  trackCustomEvent: (eventName: string, data?: any) => void;
  getAnalytics: () => any;
  isInitialized: boolean;
}

const UserTrackingContext = createContext<UserTrackingContextType | null>(null);

interface UserTrackingProviderProps {
  children: React.ReactNode;
  serverUrl: string;
  enableLocation?: boolean;
  enableInteractions?: boolean;
  enablePing?: boolean;
  pingInterval?: number;
  maxQueueSize?: number;
  debug?: boolean;
  autoTrackPageViews?: boolean;
  autoTrackInteractions?: boolean;
}

export const UserTrackingProvider: React.FC<UserTrackingProviderProps> = ({
  children,
  serverUrl,
  enableLocation = true,
  enableInteractions = true,
  enablePing = true,
  pingInterval = 30000,
  maxQueueSize = 100,
  debug = false,
  autoTrackPageViews = true,
  // autoTrackInteractions = true // Unused variable
}) => {
  const location = useLocation();
  const isInitialized = useRef(false);
  const previousPath = useRef<string>('');

  // Initialize user tracking (SSR-safe)
  useEffect(() => {
    if (!isInitialized.current && typeof window !== 'undefined') {
      UserTrackerAPI.init(serverUrl, {
        enableLocation,
        enableInteractions,
        enablePing,
        pingInterval,
        maxQueueSize,
        debug
      });
      isInitialized.current = true;
    }
  }, [serverUrl, enableLocation, enableInteractions, enablePing, pingInterval, maxQueueSize, debug]);

  // Auto-track page views (SSR-safe)
  useEffect(() => {
    if (isInitialized.current && autoTrackPageViews && typeof window !== 'undefined') {
      const currentPath = location.pathname;
      if (previousPath.current && previousPath.current !== currentPath) {
        UserTrackerAPI.trackPageView(currentPath, previousPath.current);
      } else if (!previousPath.current) {
        UserTrackerAPI.trackPageView(currentPath);
      }
      previousPath.current = currentPath;
    }
  }, [location.pathname, autoTrackPageViews]);

  // Cleanup on unmount (SSR-safe)
  useEffect(() => {
    return () => {
      if (isInitialized.current && typeof window !== 'undefined') {
        UserTrackerAPI.destroy();
      }
    };
  }, []);

  const contextValue: UserTrackingContextType = {
    setUserInfo: (userId: string, email?: string, role?: string) => {
      UserTrackerAPI.setUserInfo(userId, email, role);
    },
    trackPageView: (page: string, fromPage?: string) => {
      UserTrackerAPI.trackPageView(page, fromPage);
    },
    trackInteraction: (type: string, data?: any) => {
      UserTrackerAPI.trackInteraction(type, data);
    },
    trackCustomEvent: (eventName: string, data?: any) => {
      UserTrackerAPI.trackInteraction(eventName, data);
    },
    getAnalytics: () => {
      return UserTrackerAPI.getAnalytics();
    },
    isInitialized: isInitialized.current
  };

  return (
    <UserTrackingContext.Provider value={contextValue}>
      {children}
    </UserTrackingContext.Provider>
  );
};

// Hook to use user tracking context
export const useUserTrackingContext = () => {
  const context = useContext(UserTrackingContext);
  if (!context) {
    throw new Error('useUserTrackingContext must be used within a UserTrackingProvider');
  }
  return context;
};

// Higher-order component for easy integration
export const withUserTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  trackingProps?: Partial<UserTrackingProviderProps>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { serverUrl, ...restProps } = trackingProps || {};
    
    if (!serverUrl) {
      console.warn('withUserTracking: serverUrl is required');
      return <WrappedComponent {...(props as P)} ref={ref} />;
    }

    return (
      <UserTrackingProvider serverUrl={serverUrl} {...restProps}>
        <WrappedComponent {...(props as P)} ref={ref} />
      </UserTrackingProvider>
    );
  });
};

export default UserTrackingProvider; 