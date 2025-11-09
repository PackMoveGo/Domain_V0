/**
 * Lightweight Performance Monitor
 * Optimized for memory efficiency
 */

interface PerformanceMetrics {
  totalRequests: number;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isInitialized = false;
  private metrics: PerformanceMetrics;

  constructor() {
    this.metrics = {
      totalRequests: 0,
      loadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance monitor
   */
  initialize(): void {
    if (this.isInitialized) return;

    performance.mark('performance-monitor-start');

    // Monitor Core Web Vitals only
    this.monitorCoreWebVitals();

    this.isInitialized = true;
    performance.mark('performance-monitor-end');
    performance.measure('performance-monitor-time', 'performance-monitor-start', 'performance-monitor-end');
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorCoreWebVitals(): void {
    // Monitor First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            const paintEntry = entry as PerformancePaintTiming;
            if (paintEntry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = paintEntry.startTime;
              console.log(`🎨 First Contentful Paint: ${paintEntry.startTime.toFixed(0)}ms`);
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }

    // Monitor DOM Content Loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = performance.now();
      console.log(`📄 DOM Content Loaded: ${this.metrics.domContentLoaded.toFixed(0)}ms`);
    });

    // Monitor Load event
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now();
      console.log(`🚀 Page Load Complete: ${this.metrics.loadTime.toFixed(0)}ms`);
    });

    console.log('📊 Lightweight performance monitoring initialized');
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): string {
    const report = `
🚀 Lightweight Performance Report
================================

⏱️ Timing Metrics:
   DOM Content Loaded: ${this.metrics.domContentLoaded.toFixed(0)}ms
   Load Time: ${this.metrics.loadTime.toFixed(0)}ms
   First Contentful Paint: ${this.metrics.firstContentfulPaint.toFixed(0)}ms

📊 Memory Optimized:
   Reduced monitoring overhead
   Minimal data collection
   Efficient resource usage
    `.trim();

    return report;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Log performance report
   */
  logPerformanceReport(): void {
    console.log(this.getPerformanceReport());
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMeasure | null {
    try {
      return performance.getEntriesByName('performance-monitor-time')[0] as PerformanceMeasure;
    } catch (_error) { // Reserved for future use
      return null;
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export for use in components
export default performanceMonitor; 