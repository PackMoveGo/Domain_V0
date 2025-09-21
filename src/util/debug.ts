/// <reference types="vite/client" />

import { isClient } from './ssrUtils';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  source?: string;
  timestamp?: boolean;
  sensitive?: boolean;
  force?: boolean;
}

export class Logger {
  private enabled: boolean;
  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  private currentLevel: LogLevel = 'debug';
  private lastLogs: Map<string, number> = new Map();
  private readonly DUPLICATE_THRESHOLD = 1000; // ms
  private readonly MAX_LOG_HISTORY = 100;
  private readonly isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = isClient ? import.meta.env.MODE === 'development' : false;
    this.enabled = this.isDevelopment || (isClient && import.meta.env.VITE_DEBUG === 'true');
  }

  private shouldLog(level: LogLevel, options?: LogOptions): boolean {
    if (!this.enabled) return false;
    if (options?.force) return true;
    
    const currentLevelValue = this.LOG_LEVELS[this.currentLevel];
    const messageLevelValue = this.LOG_LEVELS[level];
    
    return messageLevelValue >= currentLevelValue;
  }

  private isDuplicate(message: string, data?: any): boolean {
    const key = `${message}-${JSON.stringify(data)}`;
    const now = Date.now();
    const lastTime = this.lastLogs.get(key);
    
    if (lastTime && (now - lastTime) < this.DUPLICATE_THRESHOLD) {
      return true;
    }
    
    this.lastLogs.set(key, now);
    
    // Clean up old entries
    if (this.lastLogs.size > this.MAX_LOG_HISTORY) {
      const entries = Array.from(this.lastLogs.entries());
      const sorted = entries.sort((a, b) => b[1] - a[1]);
      this.lastLogs = new Map(sorted.slice(0, this.MAX_LOG_HISTORY));
    }
    
    return false;
  }

  private sanitizeData(data: any, options?: LogOptions): any {
    if (!data) return data;
    
    if (options?.sensitive) {
      return '[SENSITIVE DATA]';
    }
    
    try {
      return JSON.parse(JSON.stringify(data));
    } catch {
      return String(data);
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any, options?: LogOptions): any[] {
    const timestamp = options?.timestamp ? `[${new Date().toISOString()}]` : '';
    const source = options?.source ? `[${options.source}]` : '';
    const prefix = `[${level.toUpperCase()}]${timestamp}${source}`;
    
    const sanitizedData = this.sanitizeData(data, options);
    
    return [prefix, message, ...(sanitizedData ? [sanitizedData] : [])];
  }

  debug(message: string, data?: any, options?: LogOptions) {
    if (this.isDuplicate(message, data)) return;
    if (this.shouldLog('debug', options)) {
      console.debug(...this.formatMessage('debug', message, data, options));
    }
  }

  info(message: string, data?: any, options?: LogOptions) {
    if (this.isDuplicate(message, data)) return;
    if (this.shouldLog('info', options)) {
      console.info(...this.formatMessage('info', message, data, options));
    }
  }

  warn(message: string, data?: any, options?: LogOptions) {
    if (this.isDuplicate(message, data)) return;
    if (this.shouldLog('warn', options)) {
      console.warn(...this.formatMessage('warn', message, data, options));
    }
  }

  error(message: string, data?: any, options?: LogOptions) {
    if (this.isDuplicate(message, data)) return;
    if (this.shouldLog('error', options)) {
      console.error(...this.formatMessage('error', message, data, options));
    }
  }

  group(label: string) {
    if (this.enabled) {
      console.group(`[DEBUG] ${label}`);
    }
  }

  groupEnd() {
    if (this.enabled) {
      console.groupEnd();
    }
  }

  table(data: any) {
    if (this.enabled) {
      console.table(data);
    }
  }

  // Set minimum log level
  setLevel(level: LogLevel) {
    if (this.LOG_LEVELS[level] !== undefined) {
      this.currentLevel = level;
    }
  }

  // Get current environment
  getEnvironment(): string {
    return this.isDevelopment ? 'development' : 'production';
  }
}

// Create and export a singleton instance
const logger = new Logger();
export { logger }; 

// Global debug functions for browser console - SSR SAFE
declare global {
  interface Window {
    clearApiCache: () => void;
    getApiCacheStats: () => void;
    checkOfflineStatus: () => void;
  }
}

// Only add global functions if we're in a browser environment
if (typeof window !== 'undefined') {
  // Clear API cache function (callable from browser console)
  window.clearApiCache = () => {
    try {
      const { apiCache } = require('./apiCache');
      apiCache.forceClear();
      console.log('✅ API cache cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear API cache:', error);
    }
  };

  // Get API cache statistics
  window.getApiCacheStats = () => {
    try {
      const { apiCache } = require('./apiCache');
      const stats = apiCache.getStats();
      console.log('📊 API Cache Statistics:', stats);
    } catch (error) {
      console.error('❌ Failed to get API cache stats:', error);
    }
  };

  // Check offline status
  window.checkOfflineStatus = () => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    console.log(`🌐 Network Status: ${isOnline ? 'Online' : 'Offline'}`);
    console.log(`📡 navigator.onLine: ${typeof navigator !== 'undefined' ? navigator.onLine : 'N/A'}`);
    
    // Test network connectivity
    fetch('/api/health')
      .then(() => {
        console.log('✅ API health check successful');
      })
      .catch(error => {
        console.log('❌ API health check failed:', error.message);
      });
  };
} 