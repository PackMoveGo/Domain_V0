'use client'

import React, { useState, useEffect, useRef } from 'react';
import { cachePerformance } from '../../util/apiCache';
import { apiCache } from '../../util/apiCache';

interface CacheStats {
  totalRequests: number;
  hits: number;
  misses: number;
  hitRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  compressionRatio: number;
  adaptiveTTLAdjustments: number;
}

export const CachePerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('cache-performance-position');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (e) {
        console.warn('Failed to parse saved cache performance position');
      }
    }
  }, []);

  // Save position to localStorage
  const savePosition = (pos: { x: number; y: number }) => {
    localStorage.setItem('cache-performance-position', JSON.stringify(pos));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 250;
      const maxY = window.innerHeight - 150;
      
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      const newPosition = { x: boundedX, y: boundedY };
      setPosition(newPosition);
      savePosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    // Only show in development mode
    const isDevMode = import.meta.env.VITE_DEV_MODE === 'development';
    if (isDevMode) {
      setIsVisible(true);
      
      // Update stats every 30 seconds instead of 5 to reduce noise
      const updateStats = () => {
        const currentStats = apiCache.getStats();
        setStats({
          totalRequests: currentStats.totalRequests,
          hits: currentStats.hits,
          misses: currentStats.misses,
          hitRate: currentStats.hitRate,
          averageResponseTime: currentStats.averageResponseTime,
          memoryUsage: currentStats.memoryUsage,
          compressionRatio: currentStats.compressionRatio,
          adaptiveTTLAdjustments: currentStats.adaptiveTTLAdjustments
        });
        // Only log cache stats every 30 seconds
        cachePerformance.logCacheStats();
      };

      // Initial update
      updateStats();
      
      // Set up interval - reduced frequency
      const interval = setInterval(updateStats, 30000); // 30 seconds instead of 5

      return () => clearInterval(interval);
    }
  }, []);

  // Don't render anything in production
  const isDevMode = process.env.NODE_ENV === 'development';
  if (!isDevMode || !isVisible) {
    return null;
  }

  return (
    <div
      ref={dragRef}
      className={`fixed z-50 transition-all duration-200 ${
        isCollapsed ? 'w-8 h-8' : 'w-64'
      }`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {isCollapsed ? (
        // Collapsed state - just a small tab
        <div 
          className="bg-black bg-opacity-90 hover:bg-opacity-100 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-lg"
          onClick={() => setIsCollapsed(false)}
          title="📊 Cache Performance (Dev Only)"
        >
          📊
        </div>
      ) : (
        // Expanded state - full controls
        <div className="bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm shadow-lg">
          {/* Drag handle */}
          <div className="font-bold mb-2 flex justify-between items-center">
            <span>Cache Performance (Dev Only)</span>
            <div className="flex gap-1">
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-gray-400 hover:text-white text-xs px-1"
                title="Minimize"
              >
                −
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                {showDetails ? 'Hide' : 'Details'}
              </button>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Hit Rate:</span>
              <span className={stats?.hitRate && stats.hitRate > 70 ? 'text-green-400' : stats?.hitRate && stats.hitRate > 50 ? 'text-yellow-400' : 'text-red-400'}>
                {stats?.hitRate ? `${stats.hitRate.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Requests:</span>
              <span>{stats?.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Hits:</span>
              <span className="text-green-400">{stats?.hits || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Misses:</span>
              <span className="text-red-400">{stats?.misses || 0}</span>
            </div>
            
            {showDetails && (
              <>
                <div className="border-t border-gray-600 my-2 pt-2">
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span>{stats?.averageResponseTime ? `${stats.averageResponseTime.toFixed(2)}ms` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory:</span>
                    <span>{stats?.memoryUsage ? `${(stats.memoryUsage / 1024).toFixed(1)}KB` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compression:</span>
                    <span className="text-blue-400">
                      {stats?.compressionRatio ? `${stats.compressionRatio.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adaptive TTL:</span>
                    <span className="text-purple-400">{stats?.adaptiveTTLAdjustments || 0}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-3 space-y-1">
            <button
              onClick={() => {
                const currentStats = apiCache.getStats();
                setStats({
                  totalRequests: currentStats.totalRequests,
                  hits: currentStats.hits,
                  misses: currentStats.misses,
                  hitRate: currentStats.hitRate,
                  averageResponseTime: currentStats.averageResponseTime,
                  memoryUsage: currentStats.memoryUsage,
                  compressionRatio: currentStats.compressionRatio,
                  adaptiveTTLAdjustments: currentStats.adaptiveTTLAdjustments
                });
                cachePerformance.logCacheStats();
              }}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs mr-2"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                cachePerformance.logDetailedReport();
              }}
              className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs"
            >
              Detailed Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add displayName for React DevTools
CachePerformanceMonitor.displayName = 'CachePerformanceMonitor';

export default CachePerformanceMonitor; 