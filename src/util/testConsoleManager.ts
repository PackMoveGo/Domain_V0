// Test script for Console Manager
// This demonstrates the improved console output with deduplication and grouping

import { 
  log, 
  info, 
  warn, 
  error, 
  success, 
  apiCall, 
  navigation, 
  componentRender, 
  performanceReport,
  getSummary 
} from './consoleManager';

// Test function to demonstrate the console manager
export function testConsoleManager() {
  console.group('🧪 Console Manager Test');
  
  // Test basic logging with deduplication
  log('Basic log message');
  log('Basic log message'); // Should be deduplicated
  log('Basic log message'); // Should be deduplicated
  
  // Test different log levels
  info('Info message with data', { key: 'value' });
  warn('Warning message');
  error('Error message');
  success('Success message');
  
  // Test API calls grouping
  apiCall('/v0/nav', '/v0');
  apiCall('/v0/services', '/v0');
  apiCall('/v0/nav', '/v0'); // Should be deduplicated
  
  // Test navigation grouping
  navigation('/about');
  navigation('/services');
  navigation('/about'); // Should be deduplicated
  
  // Test component rendering (should not repeat)
  componentRender('App');
  componentRender('HomePage');
  componentRender('App'); // Should not log again
  
  // Test performance report
  const mockMetrics = {
    fcp: 1200,
    lcp: 2100,
    fid: 85,
    cls: 0.05,
    ttfb: 450,
    domLoad: 1500,
    windowLoad: 1800
  };
  
  const mockRecommendations = [
    'First Contentful Paint is good (<1.5s)',
    'Largest Contentful Paint is good (<2.5s)',
    'First Input Delay is acceptable (<100ms)'
  ];
  
  performanceReport(mockMetrics, mockRecommendations);
  
  // Test summary
  setTimeout(() => {
    getSummary();
    console.groupEnd();
  }, 1000);
}

// Auto-run test in development
if (import.meta.env.VITE_DEV_MODE === 'development') {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(testConsoleManager, 2000);
} 