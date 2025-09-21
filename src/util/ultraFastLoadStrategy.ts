/**
 * Ultra-Fast Loading Strategy
 * Implements aggressive optimizations for maximum loading speed
 */

interface LoadStrategy {
  enableParallelLoading: boolean;
  enablePreloading: boolean;
  enableCaching: boolean;
  enableCompression: boolean;
  maxConcurrentRequests: number;
}

export class UltraFastLoadStrategy {
  private static instance: UltraFastLoadStrategy;
  private isInitialized = false;


  // private config: LoadStrategy;
  private loadedResources = new Set<string>();
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(_config: LoadStrategy = {
    enableParallelLoading: true,
    enablePreloading: true,
    enableCaching: true,
    enableCompression: true,
    maxConcurrentRequests: 6
  }) {
    // this.config = config;
  }

  static getInstance(): UltraFastLoadStrategy {
    if (!UltraFastLoadStrategy.instance) {
      UltraFastLoadStrategy.instance = new UltraFastLoadStrategy();
    }
    return UltraFastLoadStrategy.instance;
  }

  /**
   * Initialize ultra-fast loading strategy
   */
  initialize(): void {
    if (this.isInitialized) return;

    performance.mark('ultra-fast-strategy-start');

    // Optimize resource loading
    this.optimizeResourceLoading();
    
    // Optimize network requests
    this.optimizeNetworkRequests();
    
    // Optimize caching
    this.optimizeCaching();
    
    // Preload critical resources
    this.preloadCriticalResources();

    this.isInitialized = true;
    performance.mark('ultra-fast-strategy-end');
    performance.measure('ultra-fast-strategy-time', 'ultra-fast-strategy-start', 'ultra-fast-strategy-end');
  }

  /**
   * Optimize resource loading
   */
  private optimizeResourceLoading(): void {
    // Optimize image loading
    this.optimizeImageLoading();
    
    // Optimize script loading
    this.optimizeScriptLoading();
    
    // Optimize CSS loading
    this.optimizeCSSLoading();
  }

  /**
   * Optimize image loading
   */
  private optimizeImageLoading(): void {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Preload critical images
    const criticalImages = [
      '/moving-truck.webp',
      '/images/favicon/favicon-32x32.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      (link as any).fetchPriority = 'high';
      document.head.appendChild(link);
    });
  }

  /**
   * Optimize script loading
   */
  private optimizeScriptLoading(): void {
    // Optimize script loading with async/defer
    document.querySelectorAll('script[src]').forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      if (!scriptElement.async && !scriptElement.defer) {
        scriptElement.async = true;
      }
    });

    // Preload critical scripts
    const criticalScripts = [
      '/src/main.tsx',
      '/src/App.tsx'
    ];

    criticalScripts.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      (link as any).fetchPriority = 'high';
      document.head.appendChild(link);
    });
  }

  /**
   * Optimize CSS loading
   */
  private optimizeCSSLoading(): void {
    // Inline critical CSS
    const criticalCSS = `
      body { margin: 0; padding: 0; }
      #root { min-height: 100vh; }
      .loading-spinner { animation: spin 0.6s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);

    // Preload CSS files
    const cssFiles = [
      '/src/styles/index.css'
    ];

    cssFiles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
  }

  /**
   * Optimize network requests
   */
  private optimizeNetworkRequests(): void {
    // Implement request deduplication and caching
    const originalFetch = window.fetch;
    const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    
    window.fetch = async function(...args) {
      const url = args[0];
      const requestKey = typeof url === 'string' ? url : 'unknown';
      
      // Check if request is already pending
      const pendingRequest = UltraFastLoadStrategy.getInstance().pendingRequests.get(requestKey);
      if (pendingRequest) {
        return pendingRequest;
      }

      // Check cache first for API requests
      if (typeof url === 'string' && url.includes('/api/')) {
        const cached = memoryCache.get(url);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          return Promise.resolve(new Response(JSON.stringify(cached.data)));
        }
      }

      // Create new request
      const requestPromise = originalFetch.apply(this, args).then(async (response) => {
        // Cache successful API responses
        if (typeof url === 'string' && url.includes('/api/') && response.ok) {
          try {
            const data = await response.clone().json();
            memoryCache.set(url, {
              data,
              timestamp: Date.now(),
              ttl: 5 * 60 * 1000 // 5 minutes
            });
          } catch (parseError) {
            // If JSON parsing fails, don't cache and don't throw
            console.warn('Failed to parse API response as JSON:', parseError);
          }
        }
        return response;
      }).catch((error) => {
        // Handle network errors gracefully
        console.warn('Network request failed:', error);
        throw error;
      });
      
      UltraFastLoadStrategy.getInstance().pendingRequests.set(requestKey, requestPromise);
      
      // Clean up when request completes
      requestPromise.finally(() => {
        UltraFastLoadStrategy.getInstance().pendingRequests.delete(requestKey);
      });

      return requestPromise;
    };
  }

  /**
   * Optimize caching
   */
  private optimizeCaching(): void {
    // Caching is now handled in optimizeNetworkRequests to avoid conflicts
    console.log('💾 Caching optimized');
  }

  /**
   * Preload critical resources
   */
  private preloadCriticalResources(): void {
    // Preload fonts
    const fontLinks = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    fontLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });

    // Disable API preloading to prevent connection errors
    console.log('🚀 API preloading disabled to prevent connection issues');
  }

  /**
   * Load resource with optimization
   */
  async loadResource(url: string, options: RequestInit = {}): Promise<Response> {
    // Check cache first
    const cached = this.loadedResources.has(url);
    if (cached) {
      return new Response('Cached', { status: 200 });
    }

    // Load with optimization
    const response = await fetch(url, {
      ...options,
      headers: {
        'Cache-Control': 'max-age=3600',
        ...options.headers
      }
    });

    // Mark as loaded
    this.loadedResources.add(url);
    return response;
  }

  /**
   * Preload resource
   */
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type;
    link.href = url;
          (link as any).fetchPriority = 'high';
    document.head.appendChild(link);
  }

  /**
   * Get loading performance metrics
   */
  getPerformanceMetrics(): { loadedResources: number; pendingRequests: number; strategyTime: number } {
    const metrics = performance.getEntriesByName('ultra-fast-strategy-time')[0] as PerformanceMeasure;
    return {
      loadedResources: this.loadedResources.size,
      pendingRequests: this.pendingRequests.size,
      strategyTime: metrics ? metrics.duration : 0
    };
  }

  /**
   * Check if resource is loaded
   */
  isResourceLoaded(url: string): boolean {
    return this.loadedResources.has(url);
  }

  /**
   * Get loaded resources
   */
  getLoadedResources(): string[] {
    return Array.from(this.loadedResources);
  }

  /**
   * Clear loaded resources
   */
  clearLoadedResources(): void {
    this.loadedResources.clear();
  }


}

// Export singleton instance
export const ultraFastLoadStrategy = UltraFastLoadStrategy.getInstance();

// Export for use in components
export default ultraFastLoadStrategy; 