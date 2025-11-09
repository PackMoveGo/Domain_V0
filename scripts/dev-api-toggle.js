#!/usr/bin/env node

/**
 * Development API Override Toggle Script
 * 
 * This script helps toggle the development API override feature
 * which enables mock data instead of trying to connect to a backend server.
 * 
 * Usage:
 *   node scripts/dev-api-toggle.js enable   # Enable mock data
 *   node scripts/dev-api-toggle.js disable  # Disable mock data (use real API)
 *   node scripts/dev-api-toggle.js status   # Check current status
 */

// const fs = require('fs'); // Reserved for future use
// const path = require('path'); // Reserved for future use

const SESSION_STORAGE_KEY = 'use-dev-api';
const SCRIPT_NAME = 'dev-api-toggle.js';

function showHelp() {
  console.log(`
🔧 Development API Override Toggle Script

Usage:
  node scripts/${SCRIPT_NAME} <command>

Commands:
  enable   - Enable development API override (use mock data)
  disable  - Disable development API override (use real API)
  status   - Show current status
  help     - Show this help message

Description:
  This script helps manage the development API override feature.
  When enabled, the frontend will use mock data instead of trying
  to connect to a backend server, preventing 404/500 errors during development.

Examples:
  node scripts/${SCRIPT_NAME} enable
  node scripts/${SCRIPT_NAME} status
  node scripts/${SCRIPT_NAME} disable
`);
}

function getStatus() {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const isEnabled = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    return isEnabled;
  }
  
  // For Node.js environment, we can't directly access sessionStorage
  // So we'll provide instructions
  console.log('📋 Status check requires browser environment');
  console.log('   Open browser console and run:');
  console.log(`   sessionStorage.getItem('${SESSION_STORAGE_KEY}')`);
  console.log('   Returns "true" if enabled, "false" or null if disabled');
  return null;
}

function enableDevApi() {
  console.log('🔧 Enabling development API override...');
  console.log('');
  console.log('📋 To enable in browser, run this in the console:');
  console.log(`   sessionStorage.setItem('${SESSION_STORAGE_KEY}', 'true')`);
  console.log('   location.reload()');
  console.log('');
  console.log('✅ Development API override will be enabled after page reload');
  console.log('   The app will use mock data instead of trying to connect to backend');
}

function disableDevApi() {
  console.log('🔧 Disabling development API override...');
  console.log('');
  console.log('📋 To disable in browser, run this in the console:');
  console.log(`   sessionStorage.setItem('${SESSION_STORAGE_KEY}', 'false')`);
  console.log('   location.reload()');
  console.log('');
  console.log('✅ Development API override will be disabled after page reload');
  console.log('   The app will try to connect to the real backend API');
}

function showStatus() {
  console.log('📋 Development API Override Status');
  console.log('=====================================');
  
  const _status = getStatus();
  
  console.log('');
  console.log('🔧 Current Configuration:');
  console.log(`   Session Storage Key: ${SESSION_STORAGE_KEY}`);
  console.log('   Environment: Development mode only');
  console.log('');
  
  console.log('📋 Available Mock Endpoints:');
  console.log('   • /auth/status - Authentication status');
  console.log('   • /v0/nav - Navigation data');
  console.log('   • /v0/services - Services list');
  console.log('   • /v0/testimonials - Customer testimonials');
  console.log('   • /v0/referral - Referral data');
  console.log('   • /v0/blog - Blog posts');
  console.log('   • /v0/reviews - Customer reviews');
  console.log('   • /v0/locations - Service locations');
  console.log('   • /v0/supplies - Moving supplies');
  console.log('   • /v0/about - About page data');
  console.log('   • /v0/contact - Contact information');
  console.log('   • /health - Health check');
  console.log('');
  
  console.log('📋 To check current status in browser:');
  console.log(`   sessionStorage.getItem('${SESSION_STORAGE_KEY}')`);
  console.log('');
  
  console.log('📋 To toggle in browser:');
  console.log('   Enable:  sessionStorage.setItem("use-dev-api", "true"); location.reload()');
  console.log('   Disable: sessionStorage.setItem("use-dev-api", "false"); location.reload()');
}

// Main script logic
function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'enable':
      enableDevApi();
      break;
      
    case 'disable':
      disableDevApi();
      break;
      
    case 'status':
      showStatus();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.log('❌ Unknown command:', command);
      console.log('');
      showHelp();
      process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  SESSION_STORAGE_KEY,
  getStatus,
  enableDevApi,
  disableDevApi,
  showStatus
};

