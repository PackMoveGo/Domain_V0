import React from 'react';
import { performanceReport } from './consoleManager';

// Performance optimization utilities for PackMoveGo

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domLoad: number; // DOM Content Loaded
  windowLoad: number; // Window Load
}

interface BundleMetrics {
  totalSize: number;
  chunkCount: number;
  largestChunk: number;
  averageChunkSize: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics | null = null;

  private connectionHealth: Map<string, { status: 'healthy' | 'degraded' | 'failed', lastCheck: number, responseTime: number }> = new Map();
  private retryDelays: Map<string, number> = new Map();

  private constructor() {
    // Only initialize observers on client-side
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track API connection health
  trackConnectionHealth(endpoint: string, responseTime: number, status: number): void {
    const now = Date.now();
    let healthStatus: 'healthy' | 'degraded' | 'failed';

    if (status >= 200 && status < 300) {
      healthStatus = responseTime < 1000 ? 'healthy' : 'degraded';
    } else if (status >= 500) {
      healthStatus = 'failed';
    } else {
      healthStatus = 'degraded';
    }

    this.connectionHealth.set(endpoint, {
      status: healthStatus,
      lastCheck: now,
      responseTime
    });

    // Reset retry delay on successful requests
    if (healthStatus === 'healthy') {
      this.retryDelays.set(endpoint, 1000); // Reset to 1 second
    }
  }

  // Get adaptive retry delay based on connection health
  getRetryDelay(endpoint: string): number {
    const health = this.connectionHealth.get(endpoint);
    const currentDelay = this.retryDelays.get(endpoint) || 1000;

    if (!health) {
      return currentDelay;
    }

    if (health.status === 'failed') {
      // Exponential backoff for failed endpoints
      const newDelay = Math.min(currentDelay * 2, 30000); // Max 30 seconds
      this.retryDelays.set(endpoint, newDelay);
      return newDelay;
    } else if (health.status === 'degraded') {
      // Moderate backoff for degraded endpoints
      const newDelay = Math.min(currentDelay * 1.5, 10000); // Max 10 seconds
      this.retryDelays.set(endpoint, newDelay);
      return newDelay;
    }

    return currentDelay;
  }

  // Check if endpoint is healthy
  isEndpointHealthy(endpoint: string): boolean {
    const health = this.connectionHealth.get(endpoint);
    if (!health) return true; // Assume healthy if no data

    const timeSinceLastCheck = Date.now() - health.lastCheck;
    const maxAge = 5 * 60 * 1000; // 5 minutes

    return health.status === 'healthy' && timeSinceLastCheck < maxAge;
  }

  // Get connection health report
  getConnectionHealthReport(): string {
    const report = ['🔌 Connection Health Report', '========================'];
    
    for (const [endpoint, health] of this.connectionHealth.entries()) {
      const age = Math.floor((Date.now() - health.lastCheck) / 1000);
      const statusIcon = health.status === 'healthy' ? '✅' : health.status === 'degraded' ? '⚠️' : '❌';
      const retryDelay = this.retryDelays.get(endpoint) || 1000;
      
      report.push(`${statusIcon} ${endpoint}:`);
      report.push(`  Status: ${health.status}`);
      report.push(`  Response Time: ${health.responseTime}ms`);
      report.push(`  Last Check: ${age}s ago`);
      report.push(`  Retry Delay: ${retryDelay}ms`);
    }

    return report.join('\n');
  }

  private initializeObservers() {
    // SSR Safety Check
    if (typeof window === 'undefined') {
      return;
    }
    
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries[entries.length - 1];
          if (fcp && this.metrics && fcp.entryType === 'paint' && fcp.name === 'first-contentful-paint') {
            this.metrics.fcp = fcp.startTime;
          }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          if (lcp && this.metrics) {
            this.metrics.lcp = lcp.startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'first-input' && this.metrics) {
              const fidEntry = entry as PerformanceEventTiming;
              this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
            }
          });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let cls = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          });
          if (this.metrics) {
            this.metrics.cls = cls;
          }
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance observers failed to initialize:', error);
      }
    }
  }

  public startMonitoring(): void {
    // SSR Safety Check
    if (typeof window === 'undefined') {
      return;
    }

    this.metrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      domLoad: 0,
      windowLoad: 0
    };

    // Initialize observers after metrics object is created
    this.initializeObservers();

    // Measure basic timing
    window.addEventListener('DOMContentLoaded', () => {
      if (this.metrics) {
        this.metrics.domLoad = performance.now();
      }
    });

    window.addEventListener('load', () => {
      if (this.metrics) {
        this.metrics.windowLoad = performance.now();
        this.generateReport();
      }
    });

    // Measure TTFB
    if ('PerformanceNavigationTiming' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation && this.metrics) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
      }
    }
  }

  public getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  public async getCoreWebVitals(): Promise<Partial<PerformanceMetrics>> {
    return new Promise((resolve) => {
      if (this.metrics) {
        resolve({
          fcp: this.metrics.fcp,
          lcp: this.metrics.lcp,
          fid: this.metrics.fid,
          cls: this.metrics.cls
        });
      } else {
        resolve({});
      }
    });
  }

  public generateReport(): void {
    if (!this.metrics) return;

    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      recommendations: this.generateRecommendations()
    };

    // Store in localStorage for debugging
    localStorage.setItem('performance_report', JSON.stringify(report));

    // Log in development using console manager
    if ((import.meta as any).env.DEV) {
      performanceReport(this.metrics, this.generateRecommendations());
    }
  }

  private generateRecommendations(): string[] {
    if (!this.metrics) return [];

    const recommendations: string[] = [];

    if (this.metrics.fcp > 1500) {
      recommendations.push('First Contentful Paint is slow (>1.5s). Consider optimizing critical rendering path.');
    }

    if (this.metrics.lcp > 2500) {
      recommendations.push('Largest Contentful Paint is slow (>2.5s). Optimize largest content element.');
    }

    if (this.metrics.fid > 100) {
      recommendations.push('First Input Delay is high (>100ms). Reduce JavaScript execution time.');
    }

    if (this.metrics.cls > 0.1) {
      recommendations.push('Cumulative Layout Shift is high (>0.1). Fix layout shifts.');
    }

    if (this.metrics.ttfb > 600) {
      recommendations.push('Time to First Byte is slow (>600ms). Optimize server response time.');
    }

    return recommendations;
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  const isDevMode = (import.meta as any).env.VITE_DEV_MODE === 'development';
  // Only log initialization once per session to reduce noise
  if (isDevMode && !sessionStorage.getItem('performance-monitoring-logged')) {
    console.log('🔧 Performance monitoring initialized');
    sessionStorage.setItem('performance-monitoring-logged', 'true');
  }

  const monitor = PerformanceMonitor.getInstance();
  
  // Generate report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitor.generateReport();
    }, 2000);
  });

  // Skip preloading in development mode as Vite serves assets differently
  if ((import.meta as any).env.MODE !== 'development') {
    if (isDevMode) {
      console.log('🔧 Production mode - preloading critical resources');
    }
    // Preload critical resources only in production
    ResourcePreloader.preloadCriticalResources();
  } else {
    if (isDevMode) {
      console.log('🔧 Development mode - skipping preload');
    }
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    // Cleanup if needed
  });
}

// Lazy loading utility for components
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,

): React.LazyExoticComponent<T> {
  return React.lazy(() => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Component loading timeout'));
      }, 10000); // 10 second timeout

      importFunc()
        .then((module) => {
          clearTimeout(timeout);
          resolve(module);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  });
}

// Resource preloading utility
export class ResourcePreloader {
  private static preloadedResources = new Set<string>();

  static preloadScript(src: string): Promise<void> {
    // SSR Safety Check
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.resolve();
    }

    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  static preloadImage(src: string): Promise<void> {
    // SSR Safety Check
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.resolve();
    }

    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  static preloadCriticalResources(): void {
    // SSR Safety Check
    if (typeof window === 'undefined') {
      return;
    }

    // Only preload resources that are actually used
    // Remove problematic preloads that cause warnings
    this.preloadImage('/images/moving-truck-min.png');
    this.preloadImage('/images/favicon/favicon-32x32.png');
  }
}

// Bundle size analyzer
export function analyzeBundleSize(): BundleMetrics | null {
  // SSR Safety Check
  if (typeof window === 'undefined' || !window.performance) return null;

  const resources = performance.getEntriesByType('resource');
  const scripts = resources.filter(r => r.name.endsWith('.js'));
  
  const totalSize = scripts.reduce((sum, script) => sum + (script as any).transferSize || 0, 0);
  const chunkCount = scripts.length;
  const largestChunk = Math.max(...scripts.map(s => (s as any).transferSize || 0));
  const averageChunkSize = totalSize / chunkCount;

  return {
    totalSize,
    chunkCount,
    largestChunk,
    averageChunkSize
  };
}

// Performance budget checker
export function checkPerformanceBudget(metrics: PerformanceMetrics): boolean {
  const budget = {
    fcp: 1500, // 1.5s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    ttfb: 600  // 600ms
  };

  return (
    metrics.fcp <= budget.fcp &&
    metrics.lcp <= budget.lcp &&
    metrics.fid <= budget.fid &&
    metrics.cls <= budget.cls &&
    metrics.ttfb <= budget.ttfb
  );
}

// Export the monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-start monitoring in development - SSR SAFE
if ((import.meta as any).env.DEV && typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
} 

/**
 * Measure and log performance improvements from cookie consent optimization
 */
export const measureCookieConsentPerformance = () => {
  // SSR Safety Check
  if (typeof window === 'undefined') {
    return;
  }

  const startTime = performance.now();
  
  // Check if cookie consent is blocking API calls
  const hasConsent = (() => {
    try {
      const savedPreferences = localStorage.getItem('packmovego-cookie-preferences');
      if (!savedPreferences) return false;
      const preferences = JSON.parse(savedPreferences);
      return preferences.hasMadeChoice === true;
    } catch (_error) {
      return false;
    }
  })();
  
  const loadTime = performance.now() - startTime;
  
  console.log('🍪 Cookie Consent Performance Analysis:', {
    hasConsent,
    loadTime: `${loadTime.toFixed(2)}ms`,
    optimization: hasConsent ? 'API calls enabled' : 'API calls blocked for faster load',
    benefits: hasConsent ? [
      'Full functionality available',
      'Navigation data loaded',
      'All features accessible'
    ] : [
      'Faster initial page load',
      'No unnecessary network requests',
      'Reduced server load',
      'GDPR compliant',
      'Better user experience'
    ]
  });
  
  return {
    hasConsent,
    loadTime,
    optimizationActive: !hasConsent
  };
};

/**
 * Log performance metrics for cookie consent system
 */
export const logCookieConsentMetrics = () => {
  const metrics = measureCookieConsentPerformance();
  
  if (metrics && metrics.optimizationActive) {
    console.log('🚀 LOAD TIME OPTIMIZATION ACTIVE:', {
      status: 'API calls delayed until consent given',
      benefit: 'Faster initial page load',
      compliance: 'GDPR compliant',
      userExperience: 'Improved'
    });
  } else {
    console.log('⚡ API CALLS ENABLED:', {
      status: 'Consent given - full functionality available',
      navigation: 'Loading normally',
      features: 'All accessible'
    });
  }
  
  return metrics;
}; 