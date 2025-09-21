import React, { useState, useEffect, useRef, useCallback } from 'react';
import { log, info, warn, error } from '../../util/consoleManager';

// Development mode check
const isDevMode = typeof window !== 'undefined' && (
  process.env.NODE_ENV === 'development' || 
  import.meta.env?.VITE_DEV_MODE === 'development'
);

// Development API override function - ALWAYS USE REAL API
function getDevApiData(endpoint: string): any {
  // Always use real API - no mock data support
  return null;
}

// Export the function
export { getDevApiData };

// Hook to check if we should use development data
export const useDevApiOverride = () => {
  const [shouldUseDevData, setShouldUseDevData] = useState(() => 
    isDevMode && typeof window !== 'undefined' && sessionStorage.getItem('use-dev-api') === 'true'
  );
  
  // Listen for storage changes to update state (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      const newValue = isDevMode && typeof window !== 'undefined' && sessionStorage.getItem('use-dev-api') === 'true';
      setShouldUseDevData(newValue);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const enableDevApi = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('use-dev-api', 'true');
      setShouldUseDevData(true);
      console.log('🔧 enableDevApi called - setting shouldUseDevData to true');
    }
  }, []);

  const disableDevApi = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('use-dev-api', 'false');
      setShouldUseDevData(false);
      console.log('🔧 disableDevApi called - setting shouldUseDevData to false');
    }
  }, []);

  const useLocalApi = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('use-dev-api', 'local');
      setShouldUseDevData(false);
      info('🔧 Using local API configuration from .env.local');
    }
  }, []);

  const resetToEnvHierarchy = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('use-dev-api');
      setShouldUseDevData(false);
      info('🔧 Reset to .env hierarchy: .env.local > .env.development > .env.global > .env');
    }
  }, []);

  return {
    shouldUseDevData,
    enableDevApi,
    disableDevApi,
    useLocalApi,
    resetToEnvHierarchy,
    isDevMode
  };
};

// Movable Development API override component
export const DevApiOverride: React.FC = () => {
  const { shouldUseDevData, enableDevApi, disableDevApi, useLocalApi, resetToEnvHierarchy, isDevMode } = useDevApiOverride();
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load saved position from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('dev-api-override-position');
      if (savedPosition) {
        try {
          const pos = JSON.parse(savedPosition);
          setPosition(pos);
        } catch (e) {
          console.warn('Failed to parse saved position:', e);
        }
      }
    }
  }, []);

  // Save position to localStorage
  const savePosition = useCallback((pos: { x: number; y: number }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dev-api-override-position', JSON.stringify(pos));
    }
  }, []);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === dragRef.current || (dragRef.current && dragRef.current.contains(e.target as Node))) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      e.preventDefault();
    }
  }, [position]);

  // Handle drag move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      
      // Keep within viewport bounds
      const boundedX = Math.max(0, Math.min(window.innerWidth - 200, newX));
      const boundedY = Math.max(0, Math.min(window.innerHeight - 100, newY));
      
      const newPosition = { x: boundedX, y: boundedY };
      setPosition(newPosition);
      savePosition(newPosition);
    }
  }, [isDragging, savePosition]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isDevMode) {
    return null;
  }

  return (
    <div
      ref={dragRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg select-none"
      style={{
        left: position.x,
        top: position.y,
        width: isCollapsed ? '40px' : '200px',
        height: isCollapsed ? '40px' : 'auto',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-lg">
        <span className="text-xs font-semibold text-gray-700">
          {isCollapsed ? '🔧' : 'Dev API Override'}
        </span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          {isCollapsed ? '📖' : '📕'}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="p-2 space-y-2">
          <div className="text-xs text-gray-600 mb-2">
            <strong>API Mode:</strong> Real API Only
          </div>
          
          <div className="space-y-1">
            <div className="w-full text-xs px-2 py-1 rounded bg-green-100 text-green-800 text-center">
              ✓ Real API (Mock data disabled)
            </div>
            
            <button
              onClick={useLocalApi}
              className="w-full text-xs px-2 py-1 rounded bg-gray-100 text-gray-600"
            >
              Local API
            </button>
            
            <button
              onClick={resetToEnvHierarchy}
              className="w-full text-xs px-2 py-1 rounded bg-gray-100 text-gray-600"
            >
              Reset
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <div>Drag to move</div>
            <div>Click to toggle</div>
          </div>
        </div>
      )}
    </div>
  );
};

