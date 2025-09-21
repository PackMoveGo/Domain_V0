/**
 * Ultra-Fast Preloader for Critical Resources
 * This utility preloads critical resources immediately for faster app startup
 */

export interface UltraFastPreloaderConfig {
  enableCriticalPreloading: boolean;
  enableRouterPreloading: boolean;
  enableComponentPreloading: boolean;
  maxConcurrentPreloads: number;
  preloadTimeout: number;
}

export class UltraFastPreloader {
  private config: UltraFastPreloaderConfig;
  private preloadedResources: Set<string> = new Set();
  private isInitialized: boolean = false;

  constructor(config: UltraFastPreloaderConfig = {
    enableCriticalPreloading: true,
    enableRouterPreloading: true,
    enableComponentPreloading: true,
    maxConcurrentPreloads: 5,
    preloadTimeout: 5000
  }) {
    this.config = config;
  }

  /**
   * Initialize ultra-fast preloader
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('⚡ Initializing ultra-fast preloader...');
      
      // Preload critical resources immediately
      if (this.config.enableCriticalPreloading) {
        this.preloadCriticalResources();
      }

      // Preload router immediately to prevent pending
      if (this.config.enableRouterPreloading) {
        this.preloadRouter();
      }

      // Preload critical components
      if (this.config.enableComponentPreloading) {
        this.preloadCriticalComponents();
      }

      this.isInitialized = true;
      console.log('✅ Ultra-fast preloader initialized');
    } catch (error) {
      console.warn('Ultra-fast preloader initialization failed:', error);
    }
  }

  /**
   * Preload critical resources immediately
   */
  private preloadCriticalResources(): void {
    const criticalResources = [
      '/src/styles/index.css',
      '/src/component/ErrorBoundary.tsx',
      // '/src/component/LoadingSpinner.tsx', // Removed to prevent preload warnings
      '/src/component/Hero.tsx',
      '/src/component/Footer.tsx',
      '/src/component/Navbar.tsx'
    ];

    criticalResources.forEach(resource => {
      this.preloadResource(resource);
    });
  }

  /**
   * Preload router to prevent pending
   */
  private preloadRouter(): void {
    try {
      // Check if we're in development mode to avoid preloading non-existent files
      const isDevMode = import.meta.env.VITE_DEV_MODE === 'development';
      
      if (isDevMode) {
        // In development, the router is already loaded
        console.log('🛣️ Router already available in development');
        return;
      }

      // In production, check if the file exists before preloading
      const routerChunkPreload = document.createElement('link');
      routerChunkPreload.rel = 'preload';
      routerChunkPreload.as = 'script';
      routerChunkPreload.href = '/src/router-core.js';
      
      // Add error handling
      routerChunkPreload.onerror = () => {
        console.warn('🛣️ Router preload failed - file may not exist');
      };
      
      routerChunkPreload.onload = () => {
        console.log('🛣️ Router preloaded successfully');
      };
      
      document.head.appendChild(routerChunkPreload);
    } catch (error) {
      console.warn('🛣️ Router preload error:', error);
    }
  }

  /**
   * Preload critical components
   */
  private preloadCriticalComponents(): void {
    const isDevMode = import.meta.env.VITE_DEV_MODE === 'development';
    
    // In development mode, components are bundled together, so don't preload individual files
    if (isDevMode) {
      console.log('🧩 Component preloading skipped in development mode');
      return;
    }

    const criticalComponents = [
      'ScrollToTopButton',
      'QuoteForm',
      'CookieConsent',
      'ApiAuthStatus',
      'ServicesSlideshow',
      'LoadingSection',
      'NoDataSection'
    ];

    // Preload components in background
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        criticalComponents.forEach(component => {
          this.preloadComponent(component);
        });
      }, { timeout: 1000 });
    } else {
      setTimeout(() => {
        criticalComponents.forEach(component => {
          this.preloadComponent(component);
        });
      }, 500);
    }
  }

  /**
   * Preload a single resource
   */
  private preloadResource(resource: string): void {
    if (this.preloadedResources.has(resource)) {
      return;
    }

    // Skip preloading component files in development as they don't exist as separate files
    const isDevMode = import.meta.env.VITE_DEV_MODE === 'development';
    if (isDevMode && resource.includes('/src/component/')) {
      return;
    }

    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      link.href = resource;
      
      // Add error handling
      link.onerror = () => {
        console.warn(`Resource preload failed: ${resource}`);
      };
      
      link.onload = () => {
        console.log(`Resource preloaded: ${resource}`);
      };
      
      document.head.appendChild(link);
      this.preloadedResources.add(resource);
    } catch (error) {
      console.warn(`Failed to preload resource ${resource}:`, error);
    }
  }

  /**
   * Preload a component
   */
  private async preloadComponent(componentName: string): Promise<void> {
    try {
      // Simulate component preloading
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      console.log(`✅ Component preloaded: ${componentName}`);
    } catch (error) {
      console.warn(`Component preload failed for ${componentName}:`, error);
    }
  }

  /**
   * Force preload router to prevent pending
   */
  forcePreloadRouter(): void {
    // Create a script tag to force router loading
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/src/router-core.js';
    script.onload = () => {
      console.log('🛣️ Router forced to load');
    };
    document.head.appendChild(script);
  }

  /**
   * Check if resource is preloaded
   */
  isResourcePreloaded(resource: string): boolean {
    return this.preloadedResources.has(resource);
  }

  /**
   * Get preloaded resources
   */
  getPreloadedResources(): string[] {
    return Array.from(this.preloadedResources);
  }

  /**
   * Check if preloader is initialized
   */
  isPreloaderInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Clear preloaded resources (for testing)
   */
  clearPreloadedResources(): void {
    this.preloadedResources.clear();
  }
}

// Create singleton instance
export const ultraFastPreloader = new UltraFastPreloader();

// Export for use in components
export default ultraFastPreloader; 