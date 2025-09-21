import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UserTrackerAPI } from '../util/user-tracker';

interface UseUserTrackingOptions {
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

export const useUserTracking = (options: UseUserTrackingOptions) => {
  const location = useLocation();
  const isInitialized = useRef(false);
  const previousPath = useRef<string>('');

  // Note: UserTracker initialization is handled by UserTrackingProvider
  // This hook only uses the already initialized instance
  useEffect(() => {
    isInitialized.current = true;
  }, []);

  // Auto-track page views
  useEffect(() => {
    if (isInitialized.current && options.autoTrackPageViews !== false) {
      const currentPath = location.pathname;
      if (previousPath.current && previousPath.current !== currentPath) {
        UserTrackerAPI.trackPageView(currentPath, previousPath.current);
      } else if (!previousPath.current) {
        UserTrackerAPI.trackPageView(currentPath);
      }
      previousPath.current = currentPath;
    }
  }, [location.pathname, options.autoTrackPageViews]);

  // Note: UserTracker lifecycle is managed by UserTrackingProvider

  // Manual tracking functions
  const setUserInfo = useCallback((userId: string, email?: string, role?: string) => {
    UserTrackerAPI.setUserInfo(userId, email, role);
  }, []);

  const trackPageView = useCallback((page: string, fromPage?: string) => {
    UserTrackerAPI.trackPageView(page, fromPage);
  }, []);

  const trackInteraction = useCallback((type: string, data?: any) => {
    UserTrackerAPI.trackInteraction(type, data);
  }, []);

  const trackCustomEvent = useCallback((eventName: string, data?: any) => {
    UserTrackerAPI.trackInteraction(eventName, data);
  }, []);

  const getAnalytics = useCallback(() => {
    return UserTrackerAPI.getAnalytics();
  }, []);

  return {
    setUserInfo,
    trackPageView,
    trackInteraction,
    trackCustomEvent,
    getAnalytics,
    isInitialized: isInitialized.current
  };
};

// Hook for tracking specific user actions
export const useTrackUserAction = () => {
  const trackInteraction = useCallback((type: string, data?: any) => {
    UserTrackerAPI.trackInteraction(type, data);
  }, []);

  const trackClick = useCallback((element: string, data?: any) => {
    trackInteraction('click', {
      element,
      ...data
    });
  }, [trackInteraction]);

  const trackFormSubmit = useCallback((formId: string, data?: any) => {
    trackInteraction('form_submit', {
      formId,
      ...data
    });
  }, [trackInteraction]);

  const trackButtonClick = useCallback((buttonText: string, data?: any) => {
    trackInteraction('button_click', {
      buttonText,
      ...data
    });
  }, [trackInteraction]);

  const trackLinkClick = useCallback((linkText: string, href: string, data?: any) => {
    trackInteraction('link_click', {
      linkText,
      href,
      ...data
    });
  }, [trackInteraction]);

  const trackVideoPlay = useCallback((videoId: string, data?: any) => {
    trackInteraction('video_play', {
      videoId,
      ...data
    });
  }, [trackInteraction]);

  const trackDownload = useCallback((fileName: string, data?: any) => {
    trackInteraction('download', {
      fileName,
      ...data
    });
  }, [trackInteraction]);

  return {
    trackInteraction,
    trackClick,
    trackFormSubmit,
    trackButtonClick,
    trackLinkClick,
    trackVideoPlay,
    trackDownload
  };
};

// Hook for tracking user engagement
export const useTrackEngagement = () => {
  const trackInteraction = useCallback((type: string, data?: any) => {
    UserTrackerAPI.trackInteraction(type, data);
  }, []);

  const trackScroll = useCallback((scrollDepth: number, data?: any) => {
    trackInteraction('scroll', {
      scrollDepth,
      ...data
    });
  }, [trackInteraction]);

  const trackTimeOnPage = useCallback((timeSpent: number, data?: any) => {
    trackInteraction('time_on_page', {
      timeSpent,
      ...data
    });
  }, [trackInteraction]);

  const trackVisibilityChange = useCallback((isVisible: boolean, data?: any) => {
    trackInteraction('visibility_change', {
      isVisible,
      ...data
    });
  }, [trackInteraction]);

  const trackFocusChange = useCallback((isFocused: boolean, data?: any) => {
    trackInteraction('focus_change', {
      isFocused,
      ...data
    });
  }, [trackInteraction]);

  return {
    trackScroll,
    trackTimeOnPage,
    trackVisibilityChange,
    trackFocusChange
  };
};

// Hook for tracking user location
export const useTrackLocation = () => {
  const getAnalytics = useCallback(() => {
    return UserTrackerAPI.getAnalytics();
  }, []);

  const isLocationEnabled = useCallback(() => {
    const analytics = getAnalytics();
    return analytics.locationPermission === 'granted';
  }, [getAnalytics]);

  const getCurrentLocation = useCallback(() => {
    const analytics = getAnalytics();
    return analytics.location;
  }, [getAnalytics]);

  return {
    getCurrentLocation,
    isLocationEnabled,
    getAnalytics
  };
};

export default useUserTracking; 