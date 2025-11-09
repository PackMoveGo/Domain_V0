
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAppLoadingFallbackOptions {
  timeoutMs?: number;
  enableFallback?: boolean;
}

interface UseAppLoadingFallbackReturn {
  showFallback: boolean;
  triggerFallback: () => void;
  hideFallback: () => void;
  resetFallback: () => void;
}

export function useAppLoadingFallback({
  timeoutMs = 15000,
  enableFallback = true
}: UseAppLoadingFallbackOptions = {}): UseAppLoadingFallbackReturn {
  const [showFallback, setShowFallback] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Check if app is loaded
  const isAppLoaded = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const root = document.getElementById('root');
    if (!root) return false;

    // Check if React app is mounted and has content
    const reactRoot = root.querySelector('.App, [data-reactroot], [data-reactid]');
    if (!reactRoot) return false;

    const hasContent = reactRoot.children.length > 0 || (reactRoot.textContent?.trim().length || 0) > 0;
    const hasRealContent = Boolean(
      reactRoot.querySelector('nav, header, main, .navbar, .hero, .content, .footer')
    ) || ((reactRoot.textContent?.trim().length || 0) > 100);
    
    // Check for skeleton loaders specifically (more comprehensive detection)
    // Narrow skeleton detection to explicit markers to avoid Tailwind false positives
    const skeletonSelectors = [
      '.skeleton',
      '.skeleton-loader',
      '.loading-skeleton',
      '[data-skeleton]',
      '[data-loading="true"]',
      '[aria-busy="true"]',
      '[role="status"][aria-live]'
    ];

    let hasSkeletonLoaders = skeletonSelectors.some(selector => !!reactRoot.querySelector(selector));
    // Only treat animate-pulse as skeleton when inside an explicit skeleton container
    if (!hasSkeletonLoaders) {
      hasSkeletonLoaders = !!reactRoot.querySelector('[data-skeleton] [class*="animate-pulse"], .skeleton [class*="animate-pulse"]');
    }
    
    // Check for other loading indicators
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[class*="loading"]',
      '[class*="spinner"]',
      '.loading-spinner',
      '.loading-indicator'
    ];
    
    const hasLoadingSpinners = loadingSelectors.some(selector => 
      reactRoot.querySelector(selector)
    );
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 App Loading Check:', {
        hasContent,
        hasRealContent,
        hasSkeletonLoaders,
        hasLoadingSpinners,
        textLength: reactRoot.textContent?.trim().length || 0
      });
    }
    
    // App is considered loaded if it has real content and no skeleton loaders
    // Skeleton loaders indicate the app is still loading content
    return hasContent && hasRealContent && !hasSkeletonLoaders && !hasLoadingSpinners;
  }, []);

  // Start timeout monitoring
  const startTimeout = useCallback(() => {
    if (!enableFallback) return;

    // Clear any existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      if (!isAppLoaded()) {
        console.log('App loading fallback triggered - timeout reached');
        setShowFallback(true);
      }
    }, timeoutMs);

    timeoutIdRef.current = timeout;
  }, [timeoutMs, enableFallback, isAppLoaded]);

  // Stop timeout monitoring
  // const stopTimeout = useCallback(() => { // Reserved for future use
  const _stopTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  // Trigger fallback manually
  const triggerFallback = useCallback(() => {
    if (enableFallback) {
      console.log('App loading fallback triggered manually');
      setShowFallback(true);
      // Clear timeout manually
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    }
  }, [enableFallback]);

  // Hide fallback
  const hideFallback = useCallback(() => {
    setShowFallback(false);
  }, []);

  // Reset fallback state
  const resetFallback = useCallback(() => {
    setShowFallback(false);
    // Clear timeout manually
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    // Start new timeout
    startTimeout();
  }, [startTimeout]);

  // Monitor app loading state
  useEffect(() => {
    if (!enableFallback) return;

    let consecutiveFailures = 0;
    const maxFailures = 10; // After 5 seconds of continuous failures, trigger fallback

    const checkAppLoaded = () => {
      if (isAppLoaded()) {
        console.log('App loaded successfully - hiding fallback');
        setShowFallback(false);
        consecutiveFailures = 0;
        // Clear timeout manually instead of calling stopTimeout
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
      } else {
        consecutiveFailures++;
        
        // If we've had too many consecutive failures, trigger fallback
        if (consecutiveFailures >= maxFailures) {
          console.log('App loading fallback triggered - too many consecutive failures');
          setShowFallback(true);
        }
      }
    };

    // Start monitoring
    startTimeout();
    const checkInterval: NodeJS.Timeout = setInterval(checkAppLoaded, 500);

    // Cleanup
    return () => {
      // Clear timeout manually instead of calling stopTimeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [enableFallback, startTimeout, isAppLoaded]);

  // Listen for global loading timeout events from HTML script
  useEffect(() => {
    if (!enableFallback) return;

    const handleGlobalTimeout = () => {
      console.log('Global loading timeout detected - triggering fallback');
      setShowFallback(true);
      // Clear timeout manually
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    // Listen for custom events from the HTML loading script
    window.addEventListener('app-loading-timeout', handleGlobalTimeout);
    
    // Listen for the specific loading timeout event
    const handleSpecificTimeout = (event: any) => {
      if (event.detail?.message === 'Fallback: App loading timeout reached') {
        handleGlobalTimeout();
      }
    };

    window.addEventListener('loading-timeout', handleSpecificTimeout);

    return () => {
      window.removeEventListener('app-loading-timeout', handleGlobalTimeout);
      window.removeEventListener('loading-timeout', handleSpecificTimeout);
    };
  }, [enableFallback]);

  return {
    showFallback,
    triggerFallback,
    hideFallback,
    resetFallback
  };
}
