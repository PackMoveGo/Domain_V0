/**
 * Logger Utility with Deduplication
 * 
 * Prevents duplicate console logs within a short time window.
 * Useful for high-frequency logs that fire multiple times for the same operation.
 */

interface LogEntry {
  message: string;
  timestamp: number;
}

class Logger {
  private logHistory: Map<string, LogEntry> = new Map();
  private readonly dedupeWindow: number = 1000; // 1 second
  private readonly maxHistorySize: number = 100;
  private reduceLogging: boolean = false;

  constructor() {
    // Check if we should reduce logging
    if (typeof window !== 'undefined') {
      const env = (import.meta as any).env || import.meta.env || {};
      this.reduceLogging = env.REDUCE_LOGGING === 'true' || env.MODE === 'production';
    }
  }

  /**
   * Clean up old log entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.logHistory.entries()) {
      if (now - entry.timestamp > this.dedupeWindow) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.logHistory.delete(key));

    // If history is too large, remove oldest entries
    if (this.logHistory.size > this.maxHistorySize) {
      const sortedEntries = Array.from(this.logHistory.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.logHistory.size - this.maxHistorySize);
      toRemove.forEach(([key]) => this.logHistory.delete(key));
    }
  }

  /**
   * Generate a key for deduplication from log message and optional context
   */
  private getLogKey(message: string, context?: any): string {
    if (context) {
      // For objects, create a stable key from important properties
      if (typeof context === 'object') {
        const contextStr = JSON.stringify(context, Object.keys(context).sort());
        return `${message}:${contextStr}`;
      }
      return `${message}:${context}`;
    }
    return message;
  }

  /**
   * Check if this log should be displayed (not a duplicate)
   */
  private shouldLog(key: string): boolean {
    const now = Date.now();
    const entry = this.logHistory.get(key);

    if (!entry) {
      // New log, add to history
      this.logHistory.set(key, { message: key, timestamp: now });
      this.cleanup();
      return true;
    }

    // Check if enough time has passed
    if (now - entry.timestamp > this.dedupeWindow) {
      // Update timestamp and allow log
      entry.timestamp = now;
      return true;
    }

    // Duplicate within time window, skip
    return false;
  }

  /**
   * Debug log (only in development, with deduplication)
   */
  debug(message: string, ...args: any[]): void {
    if (this.reduceLogging) return;
    
    const isDev = typeof window === 'undefined' 
      ? process.env.NODE_ENV !== 'production'
      : (import.meta.env?.MODE || 'development') === 'development';
    
    if (!isDev) return;

    const key = this.getLogKey(message, args.length > 0 ? args[0] : undefined);
    if (this.shouldLog(key)) {
      console.log(message, ...args);
    }
  }

  /**
   * Info log (with deduplication)
   */
  info(message: string, ...args: any[]): void {
    if (this.reduceLogging) return;
    
    const key = this.getLogKey(message, args.length > 0 ? args[0] : undefined);
    if (this.shouldLog(key)) {
      console.info(message, ...args);
    }
  }

  /**
   * Warn log (always shown, no deduplication for warnings)
   */
  warn(message: string, ...args: any[]): void {
    console.warn(message, ...args);
  }

  /**
   * Error log (always shown, no deduplication for errors)
   */
  error(message: string, ...args: any[]): void {
    console.error(message, ...args);
  }

  /**
   * Log without deduplication (for important one-time logs)
   */
  logOnce(message: string, ...args: any[]): void {
    if (this.reduceLogging) return;
    console.log(message, ...args);
  }

  /**
   * Clear log history
   */
  clear(): void {
    this.logHistory.clear();
  }
}

// Export singleton instance
export const logger = new Logger();

// Also export class for testing
export { Logger };

