import { getRandomNumber } from './ssrUtils';

export interface NonBlockingLoaderConfig {
  enablePreloading: boolean;
  enableBackgroundLoading: boolean;
  maxConcurrentLoads: number;
  loadTimeout: number;
}

export class NonBlockingLoader {
  private config: NonBlockingLoaderConfig;
  private loadingQueue: Set<string> = new Set();
  private loadedComponents: Set<string> = new Set();
  private isInitialized: boolean = false;

  constructor(config: NonBlockingLoaderConfig = {
    enablePreloading: true,
    enableBackgroundLoading: true,
    maxConcurrentLoads: 3,
    loadTimeout: 10000
  }) {
    this.config = config;
  }

  /**
   * Initialize non-blocking loader
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing non-blocking loader');
      
      // Preload critical components in background
      if (this.config.enablePreloading) {
        this.preloadCriticalComponents();
      }

      this.isInitialized = true;
      console.log('✅ Non-blocking loader initialized');
    } catch (error) {
      console.warn('Non-blocking loader initialization failed:', error);
    }
  }

  /**
   * Preload critical components in background
   */
  private preloadCriticalComponents(): void {
    const criticalComponents = [
      'Footer',
      'ScrollToTopButton',
      'QuoteForm',
      'CookieConsent',
      'ApiAuthStatus'
    ];

    // Load critical components in background
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        criticalComponents.forEach(component => {
          this.preloadComponent(component);
        });
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        criticalComponents.forEach(component => {
          this.preloadComponent(component);
        });
      }, 1000);
    }
  }

  /**
   * Preload a single component
   */
  private async preloadComponent(componentName: string): Promise<void> {
    if (this.loadingQueue.has(componentName) || this.loadedComponents.has(componentName)) {
      return;
    }

    this.loadingQueue.add(componentName);

    try {
      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Component load timeout')), this.config.loadTimeout)
      );

      const loadPromise = this.loadComponent(componentName);
      
      await Promise.race([loadPromise, timeoutPromise]);
      
      this.loadedComponents.add(componentName);
      console.log(`✅ Component preloaded: ${componentName}`);
    } catch (error) {
      console.warn(`Component preload failed for ${componentName}:`, error);
    } finally {
      this.loadingQueue.delete(componentName);
    }
  }

  /**
   * Load a component without blocking
   */
  private async loadComponent(_componentName: string): Promise<void> {
    // This is a placeholder - in a real implementation, you would load the actual component
    // For now, we'll simulate the loading process
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, getRandomNumber(0, 1000)); // Random delay to simulate loading
    });
  }

  /**
   * Load component on demand
   */
  async loadComponentOnDemand(componentName: string): Promise<any> {
    if (this.loadedComponents.has(componentName)) {
      return Promise.resolve();
    }

    if (this.loadingQueue.size >= this.config.maxConcurrentLoads) {
      // Wait for a slot to become available
      await this.waitForAvailableSlot();
    }

    return this.preloadComponent(componentName);
  }

  /**
   * Wait for an available loading slot
   */
  private async waitForAvailableSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.loadingQueue.size < this.config.maxConcurrentLoads) {
          resolve();
        } else {
          setTimeout(checkSlot, 100);
        }
      };
      checkSlot();
    });
  }

  /**
   * Get loading status
   */
  getLoadingStatus(): { queue: string[], loaded: string[] } {
    return {
      queue: Array.from(this.loadingQueue),
      loaded: Array.from(this.loadedComponents)
    };
  }

  /**
   * Check if component is loaded
   */
  isComponentLoaded(componentName: string): boolean {
    return this.loadedComponents.has(componentName);
  }

  /**
   * Check if loader is initialized
   */
  isLoaderInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Clear loaded components (for testing)
   */
  clearLoadedComponents(): void {
    this.loadedComponents.clear();
    this.loadingQueue.clear();
  }
}

// Create singleton instance
export const nonBlockingLoader = new NonBlockingLoader();

// Export for use in components
export default nonBlockingLoader; 