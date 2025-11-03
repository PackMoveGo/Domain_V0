import { apiCache } from './apiCache';

export interface FastLoadConfig {
  enableImmediateLoad: boolean;
  checkCookiesFirst: boolean;
  backgroundApiFetch: boolean;
  cacheTimeout: number;
  preloadCriticalResources: boolean;
  enableServiceWorker: boolean;
}

export class FastLoadStrategy {
  private config: FastLoadConfig;
  private hasConsent: boolean = false;
  private isInitialized: boolean = false;
  // private preloadedResources: Set<string> = new Set();

  constructor(config: FastLoadConfig = {
    enableImmediateLoad: true,
    checkCookiesFirst: true,
    backgroundApiFetch: false, // Disabled to reduce memory usage
    cacheTimeout: 300000, // 5 minutes
    preloadCriticalResources: false, // Disabled to reduce memory usage
    enableServiceWorker: false // Disabled to reduce memory usage
  }) {
    this.config = config;
  }

  /**
   * Initialize fast loading strategy
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start performance measurement
      performance.mark('fast-load-start');

      // Check cookies first for consent
      if (this.config.checkCookiesFirst) {
        this.hasConsent = await this.checkCookieConsent();
      }

      // Load cached data immediately if available
      if (this.config.enableImmediateLoad) {
        await this.loadCachedData();
      }

      // Only start background API fetch if explicitly enabled and consent is given
      if (this.config.backgroundApiFetch && this.hasConsent) {
        this.startBackgroundFetch();
      }

      this.isInitialized = true;
      performance.mark('fast-load-end');
      performance.measure('fast-load-time', 'fast-load-start', 'fast-load-end');
    } catch (error) {
      console.warn('Fast load strategy initialization failed:', error);
    }
  }

  /**
   * Preload critical resources
   */
  // private preloadCriticalResources(): void {
  //   const criticalResources = [
  //     '/src/styles/index.css',
  //     // '/src/component/LoadingSpinner.tsx', // Removed to prevent preload warnings
  //     '/src/component/ErrorBoundary.tsx'
  //   ];

  //   criticalResources.forEach(resource => {
  //     if (!this.preloadedResources.has(resource)) {
  //       this.preloadResource(resource);
  //       this.preloadedResources.add(resource);
  //     }
  //   });
  // }

  /**
   * Preload a single resource
   */
  // private preloadResource(resource: string): void {
  //   const link = document.createElement('link');
  //   link.rel = 'preload';
  //   link.as = resource.endsWith('.css') ? 'style' : 'script';
  //   link.href = resource;
  //   document.head.appendChild(link);
  // }

  /**
   * Enable service worker for caching
   */
  // private enableServiceWorker(): void {
  //   // Service worker registration disabled to prevent conflicts
  //   console.log('Service Worker registration disabled');
  // }

  /**
   * Check if user has given cookie consent
   */
  private async checkCookieConsent(): Promise<boolean> {
    try {
      const savedPreferences = localStorage.getItem('packmovego-cookie-preferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        return preferences.hasMadeChoice === true;
      }
      return false;
    } catch (error) {
      console.warn('Cookie consent check failed:', error);
      return false;
    }
  }

  /**
   * Load cached data immediately
   */
  private async loadCachedData(): Promise<void> {
    try {
      console.log('🚀 Loading cached data immediately');
      
      // Load from localStorage first
      const cachedData = this.loadFromLocalStorage();
      if (cachedData) {
        window.dispatchEvent(new CustomEvent('cachedDataLoaded', { detail: cachedData }));
      }

      // Load from sessionStorage
      const sessionData = this.loadFromSessionStorage();
      if (sessionData) {
        window.dispatchEvent(new CustomEvent('sessionDataLoaded', { detail: sessionData }));
      }

      // Trigger cache load events
      window.dispatchEvent(new CustomEvent('cachedDataLoaded'));
    } catch (error) {
      console.warn('Cache loading failed:', error);
    }
  }

  /**
   * Load data from localStorage
   */
  private loadFromLocalStorage(): any {
    try {
      const cached = localStorage.getItem('app-cache');
      if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();
        if (data.timestamp && (now - data.timestamp) < this.config.cacheTimeout) {
          return data.data;
        }
      }
    } catch (error) {
      console.warn('localStorage cache loading failed:', error);
    }
    return null;
  }

  /**
   * Load data from sessionStorage
   */
  private loadFromSessionStorage(): any {
    try {
      const cached = sessionStorage.getItem('app-session-cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('sessionStorage cache loading failed:', error);
    }
    return null;
  }

  /**
   * Start background API fetch (minimal version)
   */
  private startBackgroundFetch(): void {
    // Only fetch essential endpoints to reduce memory usage
    const essentialEndpoints = ['nav', 'services'];
    
    // Use requestIdleCallback for background processing
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.fetchEssentialEndpoints(essentialEndpoints);
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.fetchEssentialEndpoints(essentialEndpoints);
      }, 2000);
    }
  }

  /**
   * Fetch essential endpoints only
   */
  private async fetchEssentialEndpoints(endpoints: string[]): Promise<void> {
    try {
      console.log('🔄 Starting essential API fetch');
      
      // Fetch only essential endpoints with timeout
      const promises = endpoints.map(endpoint => 
        this.fetchEndpointInBackground(endpoint, true)
      );

      await Promise.allSettled(promises);
      
      console.log('✅ Essential API fetch completed');
      window.dispatchEvent(new CustomEvent('essentialDataLoaded'));
    } catch (error) {
      console.warn('Essential API fetch failed:', error);
    }
  }

  /**
   * Fetch single endpoint in background
   */
  private async fetchEndpointInBackground(endpoint: string, isHighPriority: boolean = false): Promise<void> {
    try {
      // Import API service dynamically to avoid blocking
      const { api } = await import('../services/service.apiSW');
      
      // Use a timeout to prevent hanging requests
      const timeout = isHighPriority ? 3000 : 5000;
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      );

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
        const fetchPromise = apiMethod();
        await Promise.race([fetchPromise, timeoutPromise]);
        console.log(`✅ Background fetch completed for ${endpoint}`);
      }
    } catch (error) {
      console.warn(`Background fetch failed for ${endpoint}:`, error);
    }
  }

  /**
   * Get current consent status
   */
  getConsentStatus(): boolean {
    return this.hasConsent;
  }

  /**
   * Check if strategy is initialized
   */
  isStrategyInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Force refresh data
   */
  async forceRefresh(): Promise<void> {
    console.log('🔄 Force refreshing data');
    apiCache.clear();
    localStorage.removeItem('app-cache');
    sessionStorage.removeItem('app-session-cache');
    await this.fetchEssentialEndpoints(['nav', 'services']);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMeasure | null {
    try {
      return performance.getEntriesByName('fast-load-time')[0] as PerformanceMeasure;
    } catch (error) {
      return null;
    }
  }
}

// Create singleton instance
export const fastLoadStrategy = new FastLoadStrategy();

// Export for use in components
export default fastLoadStrategy; 