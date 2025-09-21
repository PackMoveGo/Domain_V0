// Offline Monitor Utility
// Monitors network status and clears API cache when going offline

import { apiCache } from './apiCache';

class OfflineMonitor {
  private static instance: OfflineMonitor;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(isOnline: boolean) => void> = [];

  static getInstance(): OfflineMonitor {
    if (!OfflineMonitor.instance) {
      OfflineMonitor.instance = new OfflineMonitor();
    }
    return OfflineMonitor.instance;
  }

  constructor() {
    // Only setup event listeners on client-side
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleOnlineStatusChange(false);
    });

    // Also check periodically in case events don't fire
    setInterval(() => {
      const currentOnlineStatus = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (currentOnlineStatus !== this.isOnline) {
        this.handleOnlineStatusChange(currentOnlineStatus);
      }
    }, 5000); // Check every 5 seconds
  }

  private handleOnlineStatusChange(isOnline: boolean): void {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;

    console.log(`🌐 Network status changed: ${isOnline ? 'Online' : 'Offline'}`);

    if (wasOnline && !isOnline) {
      // Going offline - clear API cache
      console.log('🔄 Going offline - clearing API cache to prevent stale data');
      apiCache.forceClear();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(isOnline));
  }

  // Subscribe to online/offline status changes
  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current online status
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Force clear cache manually
  clearCache(): void {
    console.log('🔄 Manually clearing API cache');
    apiCache.forceClear();
  }

  // Check if we should show offline message
  shouldShowOfflineMessage(): boolean {
    return !this.isOnline;
  }
}

// Export singleton instance
export const offlineMonitor = OfflineMonitor.getInstance();

// Export the class for testing
export { OfflineMonitor }; 