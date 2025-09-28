// User Tracking System for React Application
// Optimized for memory efficiency

interface UserTrackerConfig {
  serverUrl: string;
  enableLocation?: boolean;
  enableInteractions?: boolean;
  enablePing?: boolean;
  pingInterval?: number;
  maxQueueSize?: number;
  debug?: boolean;
}

interface UserInfo {
  userId?: string;
  email?: string;
  role?: string;
  sessionId?: string;
}

interface InteractionData {
  type: string;
  category?: string;
  action?: string;
  element?: string;
  page?: string;
  timestamp: number;
  data?: any;
}

interface AnalyticsData {
  sessionId: string;
  userId?: string;
  email?: string;
  role?: string;
  pageViews: string[];
  interactions: InteractionData[];
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenSize: string;
    language: string;
    timezone: string;
  };
  sessionStart: number;
  lastActivity: number;
  interactionCount: number;
  locationPermission?: string;
  location?: any;
}

class UserTracker {
  private static instance: UserTracker;
  private config: UserTrackerConfig;
  private userInfo: UserInfo = {};
  private analytics: AnalyticsData;
  private interactionQueue: InteractionData[] = [];
  private isInitialized = false;

  private constructor() {
    this.config = {
      serverUrl: '',
      enableLocation: false, // Disabled to reduce memory usage
      enableInteractions: false, // Disabled to reduce memory usage
      enablePing: false, // Disabled to reduce memory usage
      pingInterval: 30000,
      maxQueueSize: 50, // Reduced to save memory
      debug: false
    };

    this.analytics = {
      sessionId: this.generateSessionId(),
      pageViews: [],
      interactions: [],
      deviceInfo: this.getDeviceInfo(),
      sessionStart: Date.now(),
      lastActivity: Date.now(),
      interactionCount: 0
    };
  }

  static getInstance(): UserTracker {
    if (!UserTracker.instance) {
      UserTracker.instance = new UserTracker();
    }
    return UserTracker.instance;
  }

  init(serverUrl: string, config: Partial<UserTrackerConfig> = {}): void {
    if (this.isInitialized) {
      this.log('UserTracker already initialized');
      return;
    }

    this.config = { ...this.config, ...config, serverUrl };
    this.isInitialized = true;

    this.log('Initializing UserTracker...');
    
    // Production SSR optimization - disable tracking in production SSR
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      this.log('UserTracker disabled for production SSR');
      return;
    }
    
    // Note: Page view tracking is handled by UserTrackingProvider's auto-tracking logic
    // No need to track page view during initialization

    this.log('UserTracker initialized successfully');
  }

  setUserInfo(userId: string, email?: string, role?: string): void {
    this.userInfo = { userId, email, role };
    this.analytics.userId = userId;
    this.analytics.email = email;
    this.analytics.role = role;

    this.log('User info set:', this.userInfo);
  }

  trackPageView(page: string, fromPage?: string): void {
    const pageView = {
      page,
      fromPage,
      timestamp: Date.now()
    };

    this.analytics.pageViews.push(page);
    this.updateLastActivity();

    this.log('Page view tracked:', pageView);
  }

  trackInteraction(type: string, data: any = {}): void {
    const interaction: InteractionData = {
      type,
      category: data.category,
      action: data.action,
      element: data.element,
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
      timestamp: Date.now(),
      data
    };

    this.analytics.interactions.push(interaction);
    this.analytics.interactionCount++;
    this.updateLastActivity();

    // Add to queue for batch processing
    this.interactionQueue.push(interaction);
    this.processInteractionQueue();

    this.log('Interaction tracked:', interaction);
  }

  getAnalytics(): AnalyticsData {
    return { ...this.analytics };
  }

  private processInteractionQueue(): void {
    if (this.interactionQueue.length >= this.config.maxQueueSize!) {
      // Clear queue to prevent memory leaks
      this.interactionQueue = [];
    }
  }

  private updateLastActivity(): void {
    this.analytics.lastActivity = Date.now();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getDeviceInfo() {
    // SSR Safety Check
    if (typeof window === 'undefined') {
      return {
        userAgent: 'SSR',
        platform: 'SSR',
        screenSize: '0x0',
        language: 'en-US',
        timezone: 'UTC'
      };
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[UserTracker]', ...args);
    }
  }

  // Public methods for manual tracking
  static trackCustomEvent(eventName: string, data: any = {}): void {
    const tracker = UserTracker.getInstance();
    tracker.trackInteraction(eventName, data);
  }

  static trackPageView(page: string, fromPage?: string): void {
    const tracker = UserTracker.getInstance();
    tracker.trackPageView(page, fromPage);
  }

  static setUserInfo(userId: string, email?: string, role?: string): void {
    const tracker = UserTracker.getInstance();
    tracker.setUserInfo(userId, email, role);
  }

  static getAnalytics(): AnalyticsData {
    const tracker = UserTracker.getInstance();
    return tracker.getAnalytics();
  }

  // Cleanup method
  destroy(): void {
    this.isInitialized = false;
    this.interactionQueue = [];
    this.log('UserTracker destroyed');
  }
}

// Export singleton instance
export const userTracker = UserTracker.getInstance();

// Export static methods for easy access
export const UserTrackerAPI = {
  init: (serverUrl: string, config?: Partial<UserTrackerConfig>) => 
    userTracker.init(serverUrl, config),
  setUserInfo: (userId: string, email?: string, role?: string) => 
    userTracker.setUserInfo(userId, email, role),
  trackPageView: (page: string, fromPage?: string) => 
    userTracker.trackPageView(page, fromPage),
  trackInteraction: (type: string, data?: any) => 
    userTracker.trackInteraction(type, data),
  getAnalytics: () => userTracker.getAnalytics(),
  destroy: () => userTracker.destroy()
};

export default UserTrackerAPI; 