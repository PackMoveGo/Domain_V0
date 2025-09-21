// Enhanced API Caching System for Performance Optimization
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version: string;
  accessCount: number; // Track access frequency for adaptive TTL
  lastAccessed: number; // Track last access time
  size: number; // Track entry size in bytes
  evictionScore?: number; // Optional eviction score for enhanced eviction strategy
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  version: string;
  maxMemoryUsage: number; // Maximum memory usage in bytes
  compressionThreshold: number; // Compress entries larger than this
  adaptiveTTL: boolean; // Enable adaptive TTL based on access patterns
}

// Memory cache for ultra-fast access
const memoryCache = new Map<string, CacheEntry<any>>();

// Cache configuration with improved settings for better hit rates
const CACHE_CONFIG: CacheConfig = {
  maxSize: 200, // Increased from 150 for better hit rates
  defaultTTL: 10 * 60 * 1000, // 10 minutes default TTL (increased from 5 minutes)
  version: '0.0', // Increment version for cache invalidation
  maxMemoryUsage: 15 * 1024 * 1024, // 15MB max memory usage (increased from 10MB)
  compressionThreshold: 512, // Compress entries > 512 bytes (reduced from 1KB)
  adaptiveTTL: true // Enable adaptive TTL
};

// Cache keys
const CACHE_KEYS = {
  COOKIE_CONSENT: 'cookie-consent-status',
  API_RESPONSES: 'api-responses',
  BANNER_TIMER: 'banner-timer',
  USER_PREFERENCES: 'user-preferences'
} as const;

// Performance tracking
interface CacheMetrics {
  totalRequests: number;
  hits: number;
  misses: number;
  hitRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  compressionRatio: number;
  adaptiveTTLAdjustments: number;
}

class ApiCache {
  private static instance: ApiCache;
  private cacheHits = 0;
  private cacheMisses = 0;
  private cacheStartTime = Date.now();
  private totalResponseTime = 0;
  private responseCount = 0;
  private adaptiveTTLAdjustments = 0;
  private compressionSavings = 0;
  private totalUncompressedSize = 0;

  static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  // Get cached data with enhanced performance tracking
  get<T>(key: string): T | null {
    const startTime = performance.now();
    const entry = memoryCache.get(key);
    
    if (!entry) {
      this.cacheMisses++;
      this.updateResponseTime(performance.now() - startTime);
      return null;
    }

    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      memoryCache.delete(key);
      this.cacheMisses++;
      this.updateResponseTime(performance.now() - startTime);
      return null;
    }

    // Check version compatibility
    if (entry.version !== CACHE_CONFIG.version) {
      memoryCache.delete(key);
      this.cacheMisses++;
      this.updateResponseTime(performance.now() - startTime);
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    // Apply adaptive TTL if enabled
    if (CACHE_CONFIG.adaptiveTTL) {
      this.applyAdaptiveTTL(entry);
    }

    this.cacheHits++;
    this.updateResponseTime(performance.now() - startTime);
    return entry.data;
  }

  // Set cached data with compression and size tracking
  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.defaultTTL): void {
    // Clean up expired entries first
    this.cleanup();

    // Calculate entry size
    const dataString = JSON.stringify(data);
    let entrySize = new Blob([dataString]).size;
    let compressedData: T = data;

    // Compress large entries
    if (entrySize > CACHE_CONFIG.compressionThreshold) {
      try {
        const compressed = this.compressData(dataString);
        if (compressed.length < dataString.length) {
          compressedData = compressed as T;
          const compressedSize = new Blob([compressed]).size;
          this.compressionSavings += (entrySize - compressedSize);
          entrySize = compressedSize;
        }
      } catch (error) {
        console.warn('Compression failed for cache entry:', key);
      }
    }

    this.totalUncompressedSize += new Blob([JSON.stringify(data)]).size;

    // If cache is full, remove oldest entries
    if (memoryCache.size >= CACHE_CONFIG.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data: compressedData,
      timestamp: Date.now(),
      ttl,
      version: CACHE_CONFIG.version,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: entrySize
    };

    memoryCache.set(key, entry);
  }

  // Simple compression using run-length encoding for repeated characters
  private compressData(data: string): string {
    if (data.length < 100) return data; // Don't compress small data
    
    let compressed = '';
    let count = 1;
    let current = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] === current) {
        count++;
      } else {
        if (count > 3) {
          compressed += `${count}${current}`;
        } else {
          compressed += current.repeat(count);
        }
        current = data[i];
        count = 1;
      }
    }
    
    // Handle the last character
    if (count > 3) {
      compressed += `${count}${current}`;
    } else {
      compressed += current.repeat(count);
    }
    
    return compressed.length < data.length ? compressed : data;
  }

  // Decompress data
  private decompressData(compressed: any): any {
    if (typeof compressed !== 'string') return compressed;
    
    try {
      // Simple decompression
      let decompressed = '';
      let i = 0;
      
      while (i < compressed.length) {
        if (/\d/.test(compressed[i])) {
          let count = '';
          while (i < compressed.length && /\d/.test(compressed[i])) {
            count += compressed[i];
            i++;
          }
          if (i < compressed.length) {
            decompressed += compressed[i].repeat(parseInt(count));
            i++;
          }
        } else {
          decompressed += compressed[i];
          i++;
        }
      }
      
      return JSON.parse(decompressed);
    } catch {
      return compressed; // Return original if decompression fails
    }
  }

  // Apply adaptive TTL based on access patterns
  private applyAdaptiveTTL(entry: CacheEntry<any>): void {
    const age = Date.now() - entry.timestamp;
    const accessRate = entry.accessCount / Math.max(age / 1000, 1);
    
    // Extend TTL for frequently accessed items
    if (accessRate > 0.1) { // More than 1 access per 10 seconds
      const newTTL = Math.min(entry.ttl * 1.5, 30 * 60 * 1000); // Max 30 minutes
      if (newTTL > entry.ttl) {
        entry.ttl = newTTL;
        this.adaptiveTTLAdjustments++;
      }
    }
  }

  // Enhanced eviction strategy based on access patterns and size
  private evictOldest(): void {
    const entries = Array.from(memoryCache.entries());
    
    // Score entries based on access frequency, recency, and size
    entries.forEach(([, entry]) => {
      const age = Date.now() - entry.timestamp;
      const accessScore = entry.accessCount / Math.max(age / 1000, 1);
      const recencyScore = 1 / (Date.now() - entry.lastAccessed + 1);
      const sizePenalty = entry.size / 1024; // Penalize large entries
      
      entry.evictionScore = (accessScore * 0.4) + (recencyScore * 0.4) - (sizePenalty * 0.2);
    });

    // Sort by eviction score (lowest scores first)
    entries.sort((a, b) => (a[1].evictionScore || 0) - (b[1].evictionScore || 0));
    
    // Remove 20% of lowest scoring entries (reduced from 25% for better retention)
    const toRemove = Math.ceil(CACHE_CONFIG.maxSize * 0.2);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      memoryCache.delete(entries[i][0]);
    }
  }

  // Update response time tracking
  private updateResponseTime(time: number): void {
    this.totalResponseTime += time;
    this.responseCount++;
  }

  // Get comprehensive cache statistics
  getStats(): CacheMetrics {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;
    const averageResponseTime = this.responseCount > 0 ? this.totalResponseTime / this.responseCount : 0;
    
    // Calculate memory usage
    let memoryUsage = 0;
    for (const entry of memoryCache.values()) {
      memoryUsage += entry.size;
    }

    const compressionRatio = this.totalUncompressedSize > 0 
      ? ((this.totalUncompressedSize - memoryUsage) / this.totalUncompressedSize) * 100 
      : 0;
    
    return {
      totalRequests,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate,
      averageResponseTime,
      memoryUsage,
      compressionRatio,
      adaptiveTTLAdjustments: this.adaptiveTTLAdjustments
    };
  }

  // Get detailed cache performance report
  getPerformanceReport(): string {
    const stats = this.getStats();
    const uptime = Math.floor((Date.now() - this.cacheStartTime) / 1000);
    
    return `
📊 Cache Performance Report
==========================
⏱️  Uptime: ${uptime}s
📦 Size: ${memoryCache.size}/${CACHE_CONFIG.maxSize} items
🎯 Hit Rate: ${stats.hitRate.toFixed(1)}%
⚡ Avg Response Time: ${stats.averageResponseTime.toFixed(2)}ms
💾 Memory Usage: ${(stats.memoryUsage / 1024).toFixed(1)}KB
🗜️  Compression Savings: ${stats.compressionRatio.toFixed(1)}%
🔄 Adaptive TTL Adjustments: ${stats.adaptiveTTLAdjustments}
📈 Total Requests: ${stats.totalRequests}
✅ Hits: ${stats.hits}
❌ Misses: ${stats.misses}
    `.trim();
  }

  // Reset cache statistics
  resetStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.cacheStartTime = Date.now();
    this.totalResponseTime = 0;
    this.responseCount = 0;
    this.adaptiveTTLAdjustments = 0;
    this.compressionSavings = 0;
    this.totalUncompressedSize = 0;
  }

  // Cache API responses with intelligent TTL
  cacheApiResponse<T>(endpoint: string, data: T, ttl?: number): void {
    const key = `${CACHE_KEYS.API_RESPONSES}:${endpoint}`;
    this.set(key, data, ttl);
  }

  // Get cached API response
  getCachedApiResponse<T>(endpoint: string): T | null {
    const key = `${CACHE_KEYS.API_RESPONSES}:${endpoint}`;
    const result = this.get<T>(key);
    return result ? this.decompressData(result) : null;
  }

  // Cache cookie consent status
  cacheCookieConsent(status: boolean): void {
    this.set(CACHE_KEYS.COOKIE_CONSENT, status, 30 * 1000); // 30 seconds TTL
  }

  // Get cached cookie consent status
  getCachedCookieConsent(): boolean | null {
    return this.get<boolean>(CACHE_KEYS.COOKIE_CONSENT);
  }

  // Cache banner timer result
  cacheBannerTimer(shouldShow: boolean): void {
    this.set(CACHE_KEYS.BANNER_TIMER, shouldShow, 1000); // 1 second TTL
  }

  // Get cached banner timer result
  getCachedBannerTimer(): boolean | null {
    return this.get<boolean>(CACHE_KEYS.BANNER_TIMER);
  }

  // Cache user preferences with faster TTL for immediate access
  cacheUserPreferences(preferences: any): void {
    this.set(CACHE_KEYS.USER_PREFERENCES, preferences, 10 * 60 * 1000); // 10 minutes TTL for better persistence
  }

  // Get cached user preferences
  getCachedUserPreferences(): any | null {
    return this.get<any>(CACHE_KEYS.USER_PREFERENCES);
  }

  // Invalidate all API response caches
  invalidateApiCache(): void {
    for (const [key] of memoryCache.entries()) {
      if (key.startsWith(`${CACHE_KEYS.API_RESPONSES}:`)) {
        memoryCache.delete(key);
      }
    }
  }

  // Invalidate specific API endpoint cache
  invalidateApiEndpoint(endpoint: string): void {
    const key = `${CACHE_KEYS.API_RESPONSES}:${endpoint}`;
    memoryCache.delete(key);
  }

  // Remove specific cache entry
  delete(key: string): boolean {
    return memoryCache.delete(key);
  }

  // Clear all cache
  clear(): void {
    memoryCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.totalResponseTime = 0;
    this.responseCount = 0;
    this.adaptiveTTLAdjustments = 0;
    this.compressionSavings = 0;
    this.totalUncompressedSize = 0;
    this.cacheStartTime = Date.now();
  }

  // Clear cache when going offline
  clearOnOffline(): void {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      console.log('🔄 Going offline - clearing API cache');
      this.clear();
    }
  }

  // Check if user is online
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Force clear cache (for manual clearing)
  forceClear(): void {
    console.log('🔄 Manually clearing API cache');
    this.clear();
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        memoryCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiCache = ApiCache.getInstance();

// Enhanced performance monitoring for cache
export const cachePerformance = {
  startTime: Date.now(),
  lastLogTime: 0,
  lastReportTime: 0,
  
  logCacheStats(): void {
    // Only log in development mode
    const isDevMode = process.env.NODE_ENV === 'development';
    if (!isDevMode) {
      return;
    }
    
    // Log only once every 30 seconds to reduce noise
    const now = Date.now();
    if (now - this.lastLogTime < 30000) {
      return;
    }
    this.lastLogTime = now;
    
    const stats = apiCache.getStats();
    const uptime = Date.now() - this.startTime;
    
    console.log(`📊 Cache: ${stats.totalRequests} requests, ${stats.hitRate.toFixed(1)}% hit rate, ${(uptime / 1000).toFixed(0)}s uptime`);
  },

  logDetailedReport(): void {
    const isDevMode = process.env.NODE_ENV === 'development';
    if (!isDevMode) {
      return;
    }
    
    const now = Date.now();
    if (now - this.lastReportTime < 60000) { // Log detailed report every minute
      return;
    }
    this.lastReportTime = now;
    
    console.log(apiCache.getPerformanceReport());
  },

  // Pre-populate cache with common API responses to improve hit rate
  prePopulateCache(): void {
    const isDevMode = process.env.NODE_ENV === 'development';
    if (!isDevMode) {
      return;
    }

    // Don't pre-populate with hardcoded data - let the API provide real data
  }
};

// Add some test cache entries in development mode
const isDevMode = process.env.NODE_ENV === 'development';
if (process.env.NODE_ENV === 'development') {
  // Only show debug logs in development mode - once per session
  if (isDevMode && typeof window !== 'undefined' && !sessionStorage.getItem('api-cache-logged')) {
    console.log('🔧 API Cache initialized v0.0');
    sessionStorage.setItem('api-cache-logged', 'true');
  }
  
  // Pre-populate cache with common API responses to improve hit rate
  cachePerformance.prePopulateCache();
  
  // Add test entries to verify cache is working
  apiCache.set('test-entry-1', { message: 'Test cache entry 1', data: 'x'.repeat(1000) }, 60000);
  apiCache.set('test-entry-2', { message: 'Test cache entry 2', data: 'y'.repeat(1000) }, 60000);
  apiCache.set('test-entry-3', { message: 'Test cache entry 3', data: 'z'.repeat(1000) }, 60000);
  
  // Simulate some cache hits
  apiCache.get('test-entry-1');
  apiCache.get('test-entry-2');
} 