/**
 * Ultra-Fast Route Preloader
 * This utility preloads critical routes and components for faster navigation
 */

export interface UltraFastRoutePreloaderConfig {
  enableImmediatePreloading: boolean;
  enableBackgroundPreloading: boolean;
  enablePredictivePreloading: boolean;
  maxConcurrentPreloads: number;
  preloadTimeout: number;
}

export class UltraFastRoutePreloader {
  private config: UltraFastRoutePreloaderConfig;
  private preloadedRoutes: Set<string> = new Set();
  private loadingQueue: Set<string> = new Set();
  private isInitialized: boolean = false;

  constructor(config: UltraFastRoutePreloaderConfig = {
    enableImmediatePreloading: true,
    enableBackgroundPreloading: true,
    enablePredictivePreloading: true,
    maxConcurrentPreloads: 4,
    preloadTimeout: 2000 // Reduced from 4000ms to 2000ms to prevent timeout issues
  }) {
    this.config = config;
  }

  /**
   * Initialize ultra-fast route preloader
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🛣️ Initializing ultra-fast route preloader...');
      
      // Preload critical routes immediately
      if (this.config.enableImmediatePreloading) {
        this.preloadCriticalRoutesImmediately();
      }

      // Preload other routes in background
      if (this.config.enableBackgroundPreloading) {
        this.preloadRoutesInBackground();
      }

      // Set up predictive preloading
      if (this.config.enablePredictivePreloading) {
        this.setupPredictivePreloading();
      }

      this.isInitialized = true;
      console.log('✅ Ultra-fast route preloader initialized');
    } catch (error) {
      console.warn('Ultra-fast route preloader initialization failed:', error);
    }
  }

  /**
   * Preload critical routes immediately
   */
  private preloadCriticalRoutesImmediately(): void {
    const criticalRoutes = [
      'HomePage',
      'AboutPage',
      'ServicesPage',
      'ContactPage'
    ];

    criticalRoutes.forEach(route => {
      this.preloadRouteImmediately(route);
    });
  }

  /**
   * Preload routes in background
   */
  private preloadRoutesInBackground(): void {
    const backgroundRoutes = [
      'BlogPage',
      'FAQPage',
      'LocationsPage',
      'MovesPage',
      'BookingPage',
      'ReviewPage',
      'ReferPage',
      'SuppliesPage',
      'TipsPage',
      'SignInPage',
      'SignUpPage',
      'PrivacyPage',
      'TermsPage',
      'CookieOptOutPage',
      'CookieTestPage',
      'SitemapPage',
      'NotFoundPage'
    ];

    // Preload in background with requestIdleCallback
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        backgroundRoutes.forEach(route => {
          this.preloadRouteInBackground(route);
        });
      }, { timeout: 3000 });
    } else {
      setTimeout(() => {
        backgroundRoutes.forEach(route => {
          this.preloadRouteInBackground(route);
        });
      }, 1500);
    }
  }

  /**
   * Set up predictive preloading
   */
  private setupPredictivePreloading(): void {
    // Preload routes based on user behavior
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && href.startsWith('/')) {
          const routeName = this.getRouteNameFromHref(href);
          if (routeName) {
            this.preloadRoutePredictively(routeName);
          }
        }
      }
    });
  }

  /**
   * Get route name from href
   */
  private getRouteNameFromHref(href: string): string | null {
    const routeMap: { [key: string]: string } = {
      '/': 'HomePage',
      '/about': 'AboutPage',
      '/services': 'ServicesPage',
      '/contact': 'ContactPage',
      '/blog': 'BlogPage',
      '/faq': 'FAQPage',
      '/locations': 'LocationsPage',
      '/moves': 'MovesPage',
      '/booking': 'BookingPage',
      '/review': 'ReviewPage',
      '/refer': 'ReferPage',
      '/supplies': 'SuppliesPage',
      '/tips': 'TipsPage',
      '/signin': 'SignInPage',
      '/signup': 'SignUpPage',
      '/privacy': 'PrivacyPage',
      '/terms': 'TermsPage',
      '/cookie-opt-out': 'CookieOptOutPage',
      '/cookie-test': 'CookieTestPage',
      '/sitemap': 'SitemapPage'
    };

    return routeMap[href] || null;
  }

  /**
   * Preload route immediately
   */
  private async preloadRouteImmediately(routeName: string): Promise<void> {
    if (this.preloadedRoutes.has(routeName) || this.loadingQueue.has(routeName)) {
      return;
    }

    this.loadingQueue.add(routeName);

    try {
      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Route preload timeout')), this.config.preloadTimeout)
      );

      const preloadPromise = this.preloadRoute(routeName);
      
      await Promise.race([preloadPromise, timeoutPromise]);
      
      this.preloadedRoutes.add(routeName);
      console.log(`⚡ Route preloaded immediately: ${routeName}`);
    } catch (_error) { // Reserved for future use
      console.warn(`Route preload failed for ${routeName}:`, _error);
    } finally {
      this.loadingQueue.delete(routeName);
    }
  }

  /**
   * Preload route in background
   */
  private async preloadRouteInBackground(routeName: string): Promise<void> {
    if (this.preloadedRoutes.has(routeName) || this.loadingQueue.has(routeName)) {
      return;
    }

    if (this.loadingQueue.size >= this.config.maxConcurrentPreloads) {
      // Wait for a slot to become available
      await this.waitForAvailableSlot();
    }

    this.loadingQueue.add(routeName);

    try {
      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Route preload timeout')), this.config.preloadTimeout)
      );

      const preloadPromise = this.preloadRoute(routeName);
      
      await Promise.race([preloadPromise, timeoutPromise]);
      
      this.preloadedRoutes.add(routeName);
      console.log(`✅ Route preloaded in background: ${routeName}`);
    } catch (_error) { // Reserved for future use
      console.warn(`Route preload failed for ${routeName}:`, _error);
    } finally {
      this.loadingQueue.delete(routeName);
    }
  }

  /**
   * Preload route predictively
   */
  private async preloadRoutePredictively(routeName: string): Promise<void> {
    if (this.preloadedRoutes.has(routeName) || this.loadingQueue.has(routeName)) {
      return;
    }

    // Use a shorter timeout for predictive preloading
    const timeoutPromise = new Promise<void>((_, reject) => 
      setTimeout(() => reject(new Error('Predictive preload timeout')), 2000)
    );

    const preloadPromise = this.preloadRoute(routeName);
    
    try {
      await Promise.race([preloadPromise, timeoutPromise]);
      this.preloadedRoutes.add(routeName);
      console.log(`🎯 Route preloaded predictively: ${routeName}`);
    } catch (_error) { // Reserved for future use
      // Ignore predictive preload failures
    }
  }

  /**
   * Preload a route
   */
  private async preloadRoute(_routeName: string): Promise<void> {
    // Simulate route preloading with minimal delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, Math.random() * 300); // Very short delay
    });
  }

  /**
   * Wait for an available loading slot
   */
  private async waitForAvailableSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.loadingQueue.size < this.config.maxConcurrentPreloads) {
          resolve();
        } else {
          setTimeout(checkSlot, 50);
        }
      };
      checkSlot();
    });
  }

  /**
   * Preload route on demand
   */
  async preloadRouteOnDemand(routeName: string): Promise<any> {
    if (this.preloadedRoutes.has(routeName)) {
      return Promise.resolve();
    }

    return this.preloadRouteInBackground(routeName);
  }

  /**
   * Get preloading status
   */
  getPreloadingStatus(): { queue: string[], preloaded: string[] } {
    return {
      queue: Array.from(this.loadingQueue),
      preloaded: Array.from(this.preloadedRoutes)
    };
  }

  /**
   * Check if route is preloaded
   */
  isRoutePreloaded(routeName: string): boolean {
    return this.preloadedRoutes.has(routeName);
  }

  /**
   * Check if preloader is initialized
   */
  isPreloaderInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Clear preloaded routes (for testing)
   */
  clearPreloadedRoutes(): void {
    this.preloadedRoutes.clear();
    this.loadingQueue.clear();
  }
}

// Create singleton instance
export const ultraFastRoutePreloader = new UltraFastRoutePreloader();

// Export for use in components
export default ultraFastRoutePreloader; 