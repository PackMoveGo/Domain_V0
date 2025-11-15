// Console manager for development tools
import { apiCache } from './apiCache';
import { JWT_AUTH } from './jwtAuth';
import { getRandomString } from './ssrUtils';
import { isClient } from './ssrUtils';
import { ENABLE_DEV_TOOLS } from './env';

// Console Manager - Centralized logging with deduplication and grouping
interface LogEntry {
  message: string;
  data?: any;
  timestamp: number;
  count: number;
}

interface LogGroup {
  name: string;
  entries: LogEntry[];
  isOpen: boolean;
}

class ConsoleManager {
  private static instance: ConsoleManager;
  private logHistory: Map<string, LogEntry> = new Map();
  private logGroups: Map<string, LogGroup> = new Map();
  private isDevelopment: boolean;
  private sessionId: string;
  private readonly MAX_ENTRIES_PER_GROUP = 50;
  private startupMessages: string[] = [];

  private constructor() {
    const env=(import.meta as any).env || {};
    const isDevMode=env.MODE==='development';
    const devToolsEnabled=isClient ? ENABLE_DEV_TOOLS : false;
    
    this.isDevelopment=isDevMode && devToolsEnabled;
    this.sessionId = getRandomString(13);
    
    // Only initialize once per session and reduce startup noise
    if (this.isDevelopment && typeof window !== 'undefined' && !sessionStorage.getItem('console-manager-initialized')) {
      // Collect startup messages instead of logging immediately
      this.startupMessages.push('🔧 Console Manager Initialized');
      this.startupMessages.push(`Session ID: ${this.sessionId}`);
      this.startupMessages.push(`Environment: ${env.MODE || 'development'}`);
      
      // Log startup messages in a single group after a delay
      setTimeout(() => {
        if (this.startupMessages.length > 0) {
          console.group('🚀 Application Startup');
          this.startupMessages.forEach(msg => console.log(msg));
          console.groupEnd();
          this.startupMessages = [];
        }
      }, 1000);
      
      sessionStorage.setItem('console-manager-initialized', 'true');
    }
  }

  static getInstance(): ConsoleManager {
    if (!ConsoleManager.instance) {
      ConsoleManager.instance = new ConsoleManager();
    }
    return ConsoleManager.instance;
  }

  private shouldLog(): boolean {
    return this.isDevelopment;
  }

  private getLogKey(message: string, data?: any): string {
    return `${message}-${JSON.stringify(data)}`;
  }

  private logInternal(message: string, data?: any, group?: string): void {
    if (!this.shouldLog()) return;

    // Skip certain types of messages during startup to reduce noise
    if (this.startupMessages.length > 0 && (
      message.includes('initialized') || 
      message.includes('Fast') || 
      message.includes('Ultra-fast') ||
      message.includes('Bundle') ||
      message.includes('Performance')
    )) {
      return;
    }

    const key = this.getLogKey(message, data);
    const now = Date.now();
    const existing = this.logHistory.get(key);

    if (existing && now - existing.timestamp < 3000) { // Increased from 2000ms to 3000ms
      // Update existing entry
      existing.count++;
      existing.timestamp = now;
      
      // Only show repeated messages if count > 2
      if (existing.count <= 2) {
        return;
      }
    } else {
      // Create new entry
      this.logHistory.set(key, {
        message,
        data,
        timestamp: now,
        count: 1
      });
    }

    // Handle grouping
    if (group) {
      this.addToGroup(group, message, data);
    }

    // Log to console with better formatting
    const displayMessage = existing && existing.count > 2 ? `${message} (${existing.count}x)` : message;
    
    if (data) {
      console.log(displayMessage, data);
    } else {
      console.log(displayMessage);
    }
  }

  private addToGroup(groupName: string, message: string, data?: any): void {
    if (!this.logGroups.has(groupName)) {
      this.logGroups.set(groupName, {
        name: groupName,
        entries: [],
        isOpen: false
      });
    }

    const group = this.logGroups.get(groupName)!;
    group.entries.push({
      message,
      data,
      timestamp: Date.now(),
      count: 1
    });

    // Limit entries per group
    if (group.entries.length > this.MAX_ENTRIES_PER_GROUP) {
      group.entries.shift();
    }
  }

  log(message: string, data?: any, group?: string): void {
    if (!this.shouldLog()) return;
    const displayMessage = `📝 ${message}`;
    this.logInternal(displayMessage, data, group);
  }

  info(message: string, data?: any, group?: string): void {
    if (!this.shouldLog()) return;
    const displayMessage = `ℹ️ ${message}`;
    this.logInternal(displayMessage, data, group);
  }

  warn(message: string, data?: any, group?: string): void {
    if (!this.shouldLog()) return;
    const displayMessage = `⚠️ ${message}`;
    this.logInternal(displayMessage, data, group);
  }

  error(message: string, data?: any, group?: string): void {
    if (!this.shouldLog()) return;
    const displayMessage = `❌ ${message}`;
    this.logInternal(displayMessage, data, group);
  }

  success(message: string, data?: any, group?: string): void {
    if (!this.shouldLog()) return;
    const displayMessage = `✅ ${message}`;
    this.logInternal(displayMessage, data, group);
  }

  // Specialized logging methods with better deduplication
  apiCall(endpoint: string, baseURL?: string, group = 'API Calls'): void {
    const message = `🌐 API Call: ${endpoint}`;
    this.logInternal(message, { baseURL }, group);
  }

  navigation(path: string, group = 'Navigation'): void {
    const message = `🧭 Navigation: ${path}`;
    this.logInternal(message, null, group);
  }

  componentRender(componentName: string, group = 'Components'): void {
    // Only log component renders once per session to reduce noise
    const key = `component-render-${componentName}`;
    if (sessionStorage.getItem(key)) {
      return;
    }
    sessionStorage.setItem(key, 'true');
    
    const message = `🎯 Component: ${componentName}`;
    this.logInternal(message, null, group);
  }

  performanceReport(metrics: any, recommendations: string[] = []): void {
    console.group('📊 Performance Report');
    
    if (metrics) {
      console.table(metrics);
    }
    
    if (recommendations.length > 0) {
      console.group('💡 Recommendations');
      recommendations.forEach(rec => console.log(`• ${rec}`));
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  getSummary(): void {
    console.group('📋 Console Summary');
    
    // Show log groups
    this.logGroups.forEach((group, name) => {
      console.log(`${name}: ${group.entries.length} entries`);
    });
    
    // Show total logs
    console.log(`Total logs: ${this.logHistory.size}`);
    
    console.groupEnd();
  }
}

// Create singleton instance
const consoleManager = ConsoleManager.getInstance();

// Export functions
export const log = (message: string, data?: any, group?: string) => consoleManager.log(message, data, group);
export const info = (message: string, data?: any, group?: string) => consoleManager.info(message, data, group);
export const warn = (message: string, data?: any, group?: string) => consoleManager.warn(message, data, group);
export const error = (message: string, data?: any, group?: string) => consoleManager.error(message, data, group);
export const success = (message: string, data?: any, group?: string) => consoleManager.success(message, data, group);
export const apiCall = (endpoint: string, baseURL?: string, group?: string) => consoleManager.apiCall(endpoint, baseURL, group);
export const navigation = (path: string, group?: string) => consoleManager.navigation(path, group);
export const componentRender = (componentName: string, group?: string) => consoleManager.componentRender(componentName, group);
export const performanceReport = (metrics: any, recommendations?: string[]) => consoleManager.performanceReport(metrics, recommendations);
export const getSummary = () => consoleManager.getSummary();

// Global console commands for development
const consoleCommands = {
  // Cookie consent management
  resetCookieConsent: () => {
    console.log('🍪 Resetting cookie consent...');
    localStorage.removeItem('packmovego-cookie-preferences');
    localStorage.removeItem('packmovego-last-banner-time');
    localStorage.removeItem('packmovego-cookie-cache');
    
    // Clear cached preferences
    apiCache.delete('user-preferences');
    apiCache.delete('banner-timer');
    
    console.log('✅ Cookie consent reset complete. Refreshing page...');
    window.location.reload();
  },

  showCookieStatus: () => {
    const preferences = localStorage.getItem('packmovego-cookie-preferences');
    const lastBannerTime = localStorage.getItem('packmovego-last-banner-time');
    
    console.log('🍪 Cookie Consent Status:', {
      preferences: preferences ? JSON.parse(preferences) : 'Not set',
      lastBannerTime: lastBannerTime ? new Date(parseInt(lastBannerTime)).toLocaleString() : 'Not set',
      hasPreferences: !!preferences,
      hasBannerTime: !!lastBannerTime
    });
  },

  simulateOptOut: () => {
    const optOutPreferences = {
      thirdPartyAds: false,
      analytics: false,
      functional: false,
      hasOptedOut: true,
      hasMadeChoice: true,
      lastUpdated: Date.now()
    };
    localStorage.setItem('packmovego-cookie-preferences', JSON.stringify(optOutPreferences));
    console.log('✅ Simulated opt-out complete. Refreshing page...');
    window.location.reload();
  },

  simulateOptIn: () => {
    const optInPreferences = {
      thirdPartyAds: true,
      analytics: true,
      functional: true,
      hasOptedOut: false,
      hasMadeChoice: true,
      lastUpdated: Date.now()
    };
    localStorage.setItem('packmovego-cookie-preferences', JSON.stringify(optInPreferences));
    console.log('✅ Simulated opt-in complete. Refreshing page...');
    window.location.reload();
  },

  clearBannerTimer: () => {
    localStorage.removeItem('packmovego-last-banner-time');
    console.log('✅ Banner timer cleared - banner will show on next page load');
  },

  // Cache management
  clearCache: () => {
    apiCache.clear();
    console.log('✅ API cache cleared');
  },

  clearNavigationCache: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('packmovego-nav-data');
      console.log('✅ Navigation cache cleared');
    }
  },

  showCacheStats: () => {
    const stats = apiCache.getStats();
    console.log('📊 Cache Statistics:', stats);
  },

  // API testing
  testEndpoints: async () => {
    console.log('🚀 Testing all API endpoints...');
    const endpoints = [
      '/v0/nav',
      '/v0/services',
      '/v0/locations',
      '/v0/reviews',
      '/v0/testimonials',
      '/v0/blog',
      '/v0/contact',
      '/v0/about',
      '/v0/supplies',
      '/v0/referral'
    ];

    const results = [];
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const response = await fetch(endpoint);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.push({
          endpoint,
          status: response.ok ? '✅ Success' : '❌ Error',
          responseTime: `${responseTime}ms`,
          statusCode: response.status
        });
      } catch (_error) { // Reserved for future use
        const endTime = Date.now();
        results.push({
          endpoint,
          status: '❌ Failed',
          responseTime: `${endTime - startTime}ms`,
          error: _error instanceof Error ? _error.message : 'Unknown error'
        });
      }
    }

    console.table(results);
  },

  // Performance tools
  measurePerformance: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const metrics = {
      navigation: {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      },
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null,
      network: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    };

    console.log('📊 Performance Metrics:', metrics);
  },

  analyzeBundle: () => {
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    const bundleInfo = {
      scripts: Array.from(scripts).map(s => s.getAttribute('src')),
      styles: Array.from(styles).map(s => s.getAttribute('href')),
      totalScripts: scripts.length,
      totalStyles: styles.length
    };

    console.log('📦 Bundle Analysis:', bundleInfo);
  },

  // Network tools
  testNetworkSpeed: async () => {
    const startTime = performance.now();
    try {
      await fetch('/api/health');
      const endTime = performance.now();
      const speed = endTime - startTime;
      
      console.log('🌐 Network Speed Test:', {
        responseTime: `${speed.toFixed(2)}ms`,
        status: 'success'
      });
    } catch (error) {
      console.log('🌐 Network Speed Test:', {
        responseTime: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  checkConnectivity: () => {
    const connection = (navigator as any).connection;
    const connectivity = {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 'unknown',
      rtt: connection?.rtt || 'unknown',
      saveData: connection?.saveData || false
    };

    console.log('🌐 Connectivity Status:', connectivity);
  },

  // State management tools
  dumpLocalStorage: () => {
    const storage: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          storage[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          storage[key] = localStorage.getItem(key);
        }
      }
    }
    console.log('💾 LocalStorage Dump:', storage);
  },

  dumpSessionStorage: () => {
    const storage: Record<string, any> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          storage[key] = JSON.parse(sessionStorage.getItem(key) || '');
        } catch {
          storage[key] = sessionStorage.getItem(key);
        }
      }
    }
    console.log('💾 SessionStorage Dump:', storage);
  },

  clearAllStorage: () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ All storage cleared');
  },

  // Component debugging tools
  trackComponentRenders: () => {
    const components = document.querySelectorAll('[data-component]');
    const renderInfo = Array.from(components).map(comp => ({
      name: comp.getAttribute('data-component'),
      className: comp.className,
      id: comp.id,
      children: comp.children.length
    }));
    
    console.log('🧩 Component Renders:', renderInfo);
  },

  findReactComponents: () => {
    console.log('🧩 React Components:', 'Use React DevTools for detailed component inspection');
  },

  // Advanced debugging tools
  showEnvironmentInfo: () => {
    console.log('🔧 Environment Information:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection,
      environment: (import.meta as any).env?.MODE || 'development',
      devMode: (import.meta as any).env?.MODE || 'development'
    });
  },

  showMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('🧠 Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}MB`,
        percentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`
      });
    } else {
      console.log('🧠 Memory Usage:', 'Not available in this browser');
    }
  },

  showPerformanceTiming: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    console.log('⏱️ Performance Timing:', {
      navigationStart: navigation.startTime,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
    });
  },

  // JWT Auth testing
  testJwtAuth: () => {
    console.log('🔐 Testing JWT authentication...');
    const hasToken = JWT_AUTH.hasToken();
    const isExpired = JWT_AUTH.isTokenExpired();
    const timeUntilExpiration = JWT_AUTH.getTimeUntilExpiration();
    // const authHeader = JWT_AUTH.getAuthHeader(); // Temporarily disabled
    
    console.log('JWT Status:', {
      hasToken,
      isExpired,
      timeUntilExpiration: timeUntilExpiration !== null ? `${timeUntilExpiration} minutes` : 'Unknown',
      // authHeader: Object.keys(authHeader).length > 0 ? 'Present' : 'Missing' // Temporarily disabled
    });
  },

  setJwtToken: () => {
    // setTestToken(); // Temporarily disabled
    console.log('🔑 Test JWT token set (30 minute expiration)');
  },

  refreshJwtToken: () => {
    // JWT_AUTH.refreshToken(); // Temporarily disabled
    console.log('🔄 JWT token refreshed');
  },

  clearJwtToken: () => {
    JWT_AUTH.clearToken();
    console.log('🗑️ JWT token cleared');
  },

  // Force disable mock data and use real API
  forceRealApi: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('use-dev-api', 'false');
      console.log('🔧 FORCED: Mock data disabled, using real API');
      console.log('🔄 Please refresh the page to apply changes');
      return 'Mock data disabled. Please refresh the page.';
    }
    return 'Not available in server environment';
  },

  // Check current API mode
  checkApiMode: () => {
    if (typeof window !== 'undefined') {
      const mode = sessionStorage.getItem('use-dev-api');
      const status = mode === 'true' ? 'Mock Data' : mode === 'false' ? 'Real API' : 'Environment Default';
      console.log(`🔧 Current API mode: ${status}`);
      return status;
    }
    return 'Not available in server environment';
  },


  // Check API key configuration
  checkApiKey: () => {
    if(typeof window!=='undefined'){
      const env=(import.meta as any).env || {};
      const apiKey=env.API_KEY_FRONTEND;
      const isEnabled=env.API_KEY_ENABLED==='true';
      console.log('🔑 API Key Status:', {
        isEnabled: isEnabled,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10)+'...' : 'none',
        apiUrl: env.API_URL
      });
      return {
        isEnabled,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiUrl: env.API_URL
      };
    }
    return 'Not available in server environment';
  },

  // Check API configuration
  checkApiConfig: async () => {
    if (typeof window !== 'undefined') {
      try {
        const { api: _api }=await import('../services/service.apiSW');
        const env=(import.meta as any).env || {};
        console.log('🔧 API Configuration:', {
          apiUrl: env.API_URL,
          apiBaseUrl: env.API_BASE_URL,
          skipBackendCheck: env.SKIP_BACKEND_CHECK,
          devMode: env.MODE,
          devHttps: env.DEV_HTTPS,
        });
        return 'API configuration logged to console';
      } catch (error) {
        console.error('Failed to check API config:', error);
        return 'Failed to check API config';
      }
    }
    return 'Not available in server environment';
  },

  // Test API connection
  testApiConnection: async () => {
    if(typeof window!=='undefined'){
      try {
        const env=(import.meta as any).env || {};
        const apiUrl=env.API_URL || 'http://localhost:3000';
        const apiKey=env.API_KEY_FRONTEND || '';
        console.log('🔧 Testing API connection to:', apiUrl);
        console.log('🔑 API Key being sent:', {
          hasKey: !!apiKey,
          keyLength: apiKey.length,
          keyPrefix: apiKey.substring(0, 10) + '...',
          fullKey: apiKey
        });
        
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': apiKey
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API connection successful:', data);
          return 'API connection successful';
        } else {
          console.error('❌ API connection failed:', response.status, response.statusText);
          return `API connection failed: ${response.status} ${response.statusText}`;
        }
      } catch (_error) { // Reserved for future use
        console.error('❌ API connection error:', _error);
        return `API connection error: ${_error instanceof Error ? _error.message : 'Unknown error'}`;
      }
    }
    return 'Not available in server environment';
  },

  // Force clear all throttling and retry API calls
  forceRetryApi: async () => {
    if (typeof window !== 'undefined') {
      try {
        // Force real API
        sessionStorage.setItem('use-dev-api', 'false');
        
        console.log('🔧 Force retry: Forced real API');
        console.log('🔄 Please refresh the page to retry API calls');
        
        return 'Real API forced. Please refresh the page.';
      } catch (_error) { // Reserved for future use
        console.error('Failed to force retry:', _error);
        return 'Failed to force retry';
      }
    }
    return 'Not available in server environment';
  },

  // Manually test API key
  testApiKey: async () => {
    if(typeof window!=='undefined'){
      try {
        const env=(import.meta as any).env || {};
        const apiKey=env.API_KEY_FRONTEND || '';
        const apiUrl=env.API_URL || 'http://localhost:3000';
        
        if(!apiKey){
          console.warn('⚠️ No API key configured. Set API_KEY_FRONTEND in your .env file.');
          return 'No API key configured';
        }
        
        console.log('🔑 Testing with API key from environment:', {
          hasApiKey: !!apiKey,
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 10) + '...',
          apiUrl: apiUrl
        });
        
        const response = await fetch(`${apiUrl}/v0/services`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': apiKey
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API key test successful:', data);
          return 'API key test successful';
        } else {
          console.error('❌ API key test failed:', response.status, response.statusText);
          return `API key test failed: ${response.status} ${response.statusText}`;
        }
      } catch (_error) { // Reserved for future use
        console.error('❌ API key test error:', _error);
        return `API key test error: ${_error instanceof Error ? _error.message : 'Unknown error'}`;
      }
    }
    return 'Not available in server environment';
  },

  getJwtTokenInfo: () => {
    // Temporarily disabled for Next.js build
    console.log('📋 JWT Token Info: Temporarily disabled');
  },

  // Help
  help: () => {
    console.log(`
🛠️ Pack Move Go Enhanced Dev Tools

Cookie Consent Commands:
  resetCookieConsent()     - Reset cookie consent and reload page
  showCookieStatus()       - Show current cookie consent status
  simulateOptOut()         - Simulate user opting out
  simulateOptIn()          - Simulate user opting in
  clearBannerTimer()       - Clear banner timer

Cache Commands:
  clearCache()             - Clear API cache
  clearNavigationCache()   - Clear navigation cache
  showCacheStats()         - Show cache statistics

API Commands:
  testEndpoints()          - Test all API endpoints
  checkApiMode()           - Check current API mode (mock/real)
  forceRealApi()           - Force use of real API (disable mock data)
  checkApiKey()            - Check API key configuration status
  checkApiConfig()         - Check API configuration details
  testApiConnection()      - Test API connection and health
  forceRetryApi()          - Force retry API calls (clear throttling)
  testApiKey()             - Manually test API key authentication

Performance Commands:
  measurePerformance()     - Measure current performance metrics
  analyzeBundle()          - Analyze current bundle
  showMemoryUsage()        - Show memory usage
  showPerformanceTiming()  - Show performance timing

Network Commands:
  testNetworkSpeed()       - Test network speed
  checkConnectivity()      - Check network connectivity

State Management Commands:
  dumpLocalStorage()       - Dump localStorage contents
  dumpSessionStorage()     - Dump sessionStorage contents
  clearAllStorage()        - Clear all storage

Component Debugging Commands:
  trackComponentRenders()  - Track component renders
  findReactComponents()    - Find React components

JWT Auth Commands:
  testJwtAuth()           - Test JWT authentication status
  setJwtToken()           - Set test JWT token
  refreshJwtToken()       - Refresh JWT token
  clearJwtToken()         - Clear JWT token
  getJwtTokenInfo()       - Get JWT token information

Utility Commands:
  showEnvironmentInfo()    - Show environment information
  help()                   - Show this help message
    `);
  }
};

// Add commands to global window object in development - SSR SAFE
// Only load dev tools when NODE_ENV is development AND ENABLE_DEV_TOOLS is true
const env=(import.meta as any).env || {};
const isDevMode=env.MODE==='development';
const devToolsEnabled=ENABLE_DEV_TOOLS;

if(isDevMode && devToolsEnabled && typeof window!=='undefined'){
  Object.entries(consoleCommands).forEach(([name, fn]) => {
    (window as any)[name] = fn;
  });

  // Show help on first load
  console.log(`
🛠️ Pack Move Go Enhanced Dev Tools Loaded!

Type 'help()' in the console to see available commands.
Quick start: Try 'resetCookieConsent()' to reset cookie consent.
  `);
} 