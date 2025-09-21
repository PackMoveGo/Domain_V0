// Backend Status Test Utility
// This script provides functions to test and demonstrate backend status monitoring

import { apiMonitor, showBackendStatus } from './apiHealthMonitor';
import { log, info, warn, error, success } from './consoleManager';

/**
 * Test backend status monitoring functionality
 */
export const testBackendStatus = async () => {
  log('🧪 Starting Backend Status Test...');
  
  try {
    // Test 1: Check current status
    info('Test 1: Checking current backend status');
    const status = apiMonitor.getDetailedStatus();
    if (status) {
      success('✅ Status retrieved successfully');
      console.table({
        'Online': status.isOnline,
        'Response Time': `${status.responseTime.toFixed(2)}ms`,
        'Environment': status.environment,
        'Last Check': new Date(status.lastCheck).toLocaleTimeString()
      });
    } else {
      warn('⚠️ No status available yet');
    }

    // Test 2: Manual health check
    info('Test 2: Performing manual health check');
    const isHealthy = await apiMonitor.checkHealth();
    if (isHealthy) {
      success('✅ Backend is healthy');
    } else {
      error('❌ Backend health check failed');
    }

    // Test 3: Display detailed status
    info('Test 3: Displaying detailed status');
    showBackendStatus();

    // Test 4: Get status summary
    info('Test 4: Getting status summary');
    const summary = apiMonitor.getStatusSummary();
    log('Status Summary:', summary);

    success('🎉 Backend status test completed!');
    
  } catch (err) {
    error('❌ Backend status test failed:', err);
  }
};

/**
 * Continuous monitoring test
 */
export const startContinuousMonitoring = (duration: number = 30000) => {
  log(`🔄 Starting continuous monitoring for ${duration / 1000} seconds...`);
  
  const interval = setInterval(() => {
    const status = apiMonitor.getDetailedStatus();
    if (status) {
      const indicator = status.isOnline ? '✅' : '❌';
      log(`${indicator} Backend: ${status.isOnline ? 'Online' : 'Offline'} | Response: ${status.responseTime.toFixed(0)}ms`);
    }
  }, 5000);

  setTimeout(() => {
    clearInterval(interval);
    success('✅ Continuous monitoring completed');
  }, duration);
};

/**
 * Performance test
 */
export const testBackendPerformance = async () => {
  log('⚡ Testing backend performance...');
  
  const tests = 5;
  const results: number[] = [];
  
  for (let i = 0; i < tests; i++) {
    const startTime = performance.now();
    await apiMonitor.checkHealth();
    const endTime = performance.now();
    results.push(endTime - startTime);
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const avgResponseTime = results.reduce((a, b) => a + b, 0) / results.length;
  const minResponseTime = Math.min(...results);
  const maxResponseTime = Math.max(...results);
  
  console.group('📊 Performance Test Results');
  console.table({
    'Average Response Time': `${avgResponseTime.toFixed(2)}ms`,
    'Minimum Response Time': `${minResponseTime.toFixed(2)}ms`,
    'Maximum Response Time': `${maxResponseTime.toFixed(2)}ms`,
    'Tests Performed': tests
  });
  console.groupEnd();
  
  if (avgResponseTime < 500) {
    success('✅ Performance is excellent');
  } else if (avgResponseTime < 1000) {
    warn('⚠️ Performance is acceptable');
  } else {
    error('❌ Performance needs improvement');
  }
};

/**
 * Environment information display
 */
export const showEnvironmentInfo = () => {
  log('🌍 Environment Information');
  
  console.group('Environment Variables');
  console.table({
    'VITE_DEV_MODE': import.meta.env.VITE_DEV_MODE,
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'SKIP_BACKEND_CHECK': import.meta.env.SKIP_BACKEND_CHECK,
    'NODE_ENV': process.env.NODE_ENV
  });
  console.groupEnd();
  
  console.group('Browser Information');
  console.table({
    'User Agent': navigator.userAgent,
    'Online': navigator.onLine,
    'Platform': navigator.platform,
    'Language': navigator.language
  });
  console.groupEnd();
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).testBackendStatus = testBackendStatus;
  (window as any).startContinuousMonitoring = startContinuousMonitoring;
  (window as any).testBackendPerformance = testBackendPerformance;
  (window as any).showEnvironmentInfo = showEnvironmentInfo;
  
  // Auto-run environment info on load
  setTimeout(() => {
    if (import.meta.env.VITE_DEV_MODE === 'development') {
      log('🔧 Backend Status Test Utilities loaded');
      log('Available commands: testBackendStatus(), startContinuousMonitoring(), testBackendPerformance(), showEnvironmentInfo()');
    }
  }, 1000);
} 