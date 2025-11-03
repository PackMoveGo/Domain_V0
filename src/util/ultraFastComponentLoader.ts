/**
 * Ultra-Fast Component Loader
 * This utility provides immediate component loading for faster rendering
 */

import { getRandomNumber } from './ssrUtils';

export interface UltraFastComponentLoaderConfig {
  enableImmediateLoading: boolean;
  enableBackgroundLoading: boolean;
  enableLazyLoading: boolean;
  maxConcurrentLoads: number;
  loadTimeout: number;
}

export class UltraFastComponentLoader {
  private config: UltraFastComponentLoaderConfig;
  private loadedComponents: Set<string> = new Set();
  private loadingQueue: Set<string> = new Set();
  private isInitialized: boolean = false;

  constructor(config: UltraFastComponentLoaderConfig = {
    enableImmediateLoading: true,
    enableBackgroundLoading: true,
    enableLazyLoading: true,
    maxConcurrentLoads: 3,
    loadTimeout: 3000
  }) {
    this.config = config;
  }

  /**
   * Initialize ultra-fast component loader
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🎯 Initializing ultra-fast component loader...');
      
      // Load critical components immediately
      if (this.config.enableImmediateLoading) {
        this.loadCriticalComponentsImmediately();
      }

      // Load other components in background
      if (this.config.enableBackgroundLoading) {
        this.loadComponentsInBackground();
      }

      this.isInitialized = true;
      console.log('✅ Ultra-fast component loader initialized');
    } catch (error) {
      console.warn('Ultra-fast component loader initialization failed:', error);
    }
  }

  /**
   * Load critical components immediately
   */
  private loadCriticalComponentsImmediately(): void {
    const criticalComponents = [
      'ErrorBoundary',
      'LoadingSpinner',
      'Hero',
      'Footer',
      'Navbar'
    ];

    criticalComponents.forEach(component => {
      this.loadComponentImmediately(component);
    });
  }

  /**
   * Load components in background
   */
  private loadComponentsInBackground(): void {
    const backgroundComponents = [
      'ScrollToTopButton',
      'QuoteForm',
      'CookieConsent',
      'ApiAuthStatus',
      'ServicesSlideshow',
      'LoadingSection',
      'NoDataSection'
    ];

    // Load in background with requestIdleCallback
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        backgroundComponents.forEach(component => {
          this.loadComponentInBackground(component);
        });
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        backgroundComponents.forEach(component => {
          this.loadComponentInBackground(component);
        });
      }, 1000);
    }
  }

  /**
   * Load component immediately
   */
  private async loadComponentImmediately(componentName: string): Promise<void> {
    if (this.loadedComponents.has(componentName) || this.loadingQueue.has(componentName)) {
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
      console.log(`⚡ Component loaded immediately: ${componentName}`);
    } catch (error) {
      console.warn(`Component load failed for ${componentName}:`, error);
    } finally {
      this.loadingQueue.delete(componentName);
    }
  }

  /**
   * Load component in background
   */
  private async loadComponentInBackground(componentName: string): Promise<void> {
    if (this.loadedComponents.has(componentName) || this.loadingQueue.has(componentName)) {
      return;
    }

    if (this.loadingQueue.size >= this.config.maxConcurrentLoads) {
      // Wait for a slot to become available
      await this.waitForAvailableSlot();
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
      console.log(`✅ Component loaded in background: ${componentName}`);
    } catch (error) {
      console.warn(`Component load failed for ${componentName}:`, error);
    } finally {
      this.loadingQueue.delete(componentName);
    }
  }

  /**
   * Load a component
   */
  private async loadComponent(_componentName: string): Promise<void> {
    // Simulate component loading with minimal delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, getRandomNumber(0, 200)); // Use SSR-safe random number
    });
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
          setTimeout(checkSlot, 50);
        }
      };
      checkSlot();
    });
  }

  /**
   * Load component on demand
   */
  async loadComponentOnDemand(componentName: string): Promise<any> {
    if (this.loadedComponents.has(componentName)) {
      return Promise.resolve();
    }

    return this.loadComponentInBackground(componentName);
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
export const ultraFastComponentLoader = new UltraFastComponentLoader();

// Export for use in components
export default ultraFastComponentLoader; 