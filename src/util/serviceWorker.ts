/**
 * Service Worker Registration
 * Handles registration and lifecycle of the service worker
 */

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator;

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.log('Service Worker not supported');
      return null;
    }

    // Service worker registration disabled to prevent conflicts
    console.log('Service Worker registration disabled');
    return null;
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.isSupported || !this.registration) {
      return false;
    }

    try {
      const unregistered = await this.registration.unregister();
      if (unregistered) {
        console.log('Service Worker unregistered successfully');
        this.registration = null;
      }
      return unregistered;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Check if service worker is active
   */
  isActive(): boolean {
    return this.registration?.active !== undefined;
  }

  /**
   * Get the service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Show update notification to user
   */
  // private showUpdateNotification(): void {
  //   // You can implement a custom notification here
  //   console.log('New version available. Please refresh the page.');
    
  //   // Example: Show a toast notification
  //   if ('Notification' in window && Notification.permission === 'granted') {
  //     new Notification('PackMoveGo Update', {
  //       body: 'A new version is available. Please refresh the page.',
  //       icon: '/images/favicon/favicon-32x32.png'
  //     });
  //   }
  // }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message: any): Promise<void> {
    if (!this.registration?.active) {
      console.warn('Service Worker not active');
      return;
    }

    try {
      await this.registration.active.postMessage(message);
    } catch (error) {
      console.error('Failed to send message to Service Worker:', error);
    }
  }

  /**
   * Check if the app is running from cache
   */
  isFromCache(): boolean {
    return !navigator.onLine || 
           (this.registration?.active !== undefined && !navigator.serviceWorker.controller);
  }

  /**
   * Get cache status
   */
  async getCacheStatus(): Promise<{ static: number; dynamic: number }> {
    if (!this.isSupported) {
      return { static: 0, dynamic: 0 };
    }

    try {
      const staticCache = await caches.open('static-v1');
      const dynamicCache = await caches.open('dynamic-v1');
      
      const staticKeys = await staticCache.keys();
      const dynamicKeys = await dynamicCache.keys();

      return {
        static: staticKeys.length,
        dynamic: dynamicKeys.length
      };
    } catch (error) {
      console.error('Failed to get cache status:', error);
      return { static: 0, dynamic: 0 };
    }
  }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

export default serviceWorkerManager; 