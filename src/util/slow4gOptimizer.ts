import { apiCache } from './apiCache';

export class Slow4GOptimizer {
  private isInitialized: boolean = false;

  /**
   * Initialize optimizations for slow 4G connections
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing slow 4G optimizations');

      // Preload critical data
      await this.preloadCriticalData();

      // Optimize images
      this.optimizeImages();

      // Add resource hints
      this.addResourceHints();

      // Optimize for slow connections
      this.optimizeForSlowConnection();

      this.isInitialized = true;
      console.log('✅ Slow 4G optimizations initialized');
    } catch (error) {
      console.warn('Slow 4G optimization initialization failed:', error);
    }
  }

  /**
   * Preload critical data
   */
  private async preloadCriticalData(): Promise<void> {
    const criticalData = ['nav', 'services'];
    
    try {
      await Promise.allSettled(
        criticalData.map(endpoint => this.fetchInBackground(endpoint))
      );
    } catch (error) {
      console.warn('Critical data preload failed:', error);
    }
  }

  /**
   * Fetch data in background
   */
  private async fetchInBackground(endpoint: string): Promise<void> {
    try {
      const { api } = await import('../services/service.apiSW');
      
      // Map endpoint names to API methods
      const endpointMap: { [key: string]: () => Promise<any> } = {
        'nav': api.getNav,
        'services': api.getServices,
        'testimonials': () => api.makeRequest('/v0/testimonials'),
        'locations': api.getLocations,
        'reviews': api.getReviews,
        'supplies': api.getSupplies,
        'blog': api.getBlog,
        'contact': api.getContact,
        'about': api.getAbout,
        'referral': api.getReferral
      };

      const apiMethod = endpointMap[endpoint];
      if (apiMethod) {
        const data = await apiMethod();
        if (data) {
          apiCache.cacheApiResponse(endpoint, data, 300000); // 5 minutes TTL
        }
      }
    } catch (error) {
      console.warn(`Background fetch failed for ${endpoint}:`, error);
    }
  }

  /**
   * Optimize images for slow connections
   */
  private optimizeImages(): void {
    // Set up intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      this.setupImageLazyLoading();
    }

    // Preload critical images
    this.preloadCriticalImages();
  }

  /**
   * Set up image lazy loading
   */
  private setupImageLazyLoading(): void {
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
      rootMargin: '50px'
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Preload critical images
   */
  private preloadCriticalImages(): void {
    const criticalImages = [
      '/moving-truck.webp',
      '/images/favicon/favicon.ico'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  /**
   * Add resource hints for faster loading
   */
  private addResourceHints(): void {
    // Get API URL from environment configuration
    const apiUrl = typeof __API_URL__ !== 'undefined' ? __API_URL__ : 
                   (typeof process !== 'undefined' && process.env ? process.env.VITE_API_URL : 
                   (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : 
                   'http://localhost:3000'));

    const hints = [
      { rel: 'dns-prefetch', href: apiUrl },
      { rel: 'preconnect', href: apiUrl },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' }
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }

  /**
   * Optimize for slow connections
   */
  private optimizeForSlowConnection(): void {
    // Reduce image quality for slow connections
    this.reduceImageQuality();
    
    // Disable non-critical features
    this.disableNonCriticalFeatures();
  }

  /**
   * Reduce image quality for slow connections
   */
  private reduceImageQuality(): void {
    const style = document.createElement('style');
    style.textContent = `
      img {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Disable non-critical features for slow connections
   */
  private disableNonCriticalFeatures(): void {
    // Disable animations
    document.documentElement.style.setProperty('--animation-duration', '0s');
    
    // Reduce transition duration
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
  }

  /**
   * Get connection speed
   */
  getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'slow';
      } else if (connection.effectiveType === '3g') {
        return 'medium';
      }
    }
    return 'fast';
  }

  /**
   * Check if optimizations are initialized
   */
  isOptimized(): boolean {
    return this.isInitialized;
  }
}

// Create singleton instance
export const slow4gOptimizer = new Slow4GOptimizer();

// Export for use in components
export default slow4gOptimizer; 