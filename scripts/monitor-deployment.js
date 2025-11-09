#!/usr/bin/env node

/**
 * Vercel Deployment Monitor for PackMoveGo
 * Helps monitor deployment status and provides useful links
 */

import { execSync } from 'child_process';
// import { existsSync } from 'fs'; // Reserved for future use

console.log('🚀 PackMoveGo Vercel Deployment Monitor');
console.log('=======================================');

// Get the current git commit hash
try {
  const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  console.log(`📋 Current Commit: ${commitHash}`);
} catch (_error) { // Reserved for future use
  console.log('⚠️  Could not get commit hash');
}

// Get the remote URL
try {
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  console.log(`🔗 Repository: ${remoteUrl}`);
} catch (_error) { // Reserved for future use
  console.log('⚠️  Could not get remote URL');
}

console.log('\n📊 Deployment Links:');
console.log('===================');
console.log('🌐 Vercel Dashboard:');
console.log('   https://vercel.com/pack-move-go-frontend/packmovego.com');
console.log('');
console.log('📝 Build Logs:');
console.log('   https://vercel.com/pack-move-go-frontend/packmovego.com/logs');
console.log('');
console.log('🌍 Live Site:');
console.log('   https://packmovego.com');
console.log('');
console.log('🔧 Function Logs:');
console.log('   https://vercel.com/pack-move-go-frontend/packmovego.com/functions');

console.log('\n🔍 Deployment Status Check:');
console.log('==========================');

// Check if we can access the live site
console.log('🌐 Checking live site availability...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" https://packmovego.com', { 
    encoding: 'utf8',
    timeout: 10000 
  });
  
  if (response.trim() === '200') {
    console.log('   ✅ Live site is responding (HTTP 200)');
  } else {
    console.log(`   ⚠️  Live site responded with HTTP ${response.trim()}`);
  }
} catch (_error) { // Reserved for future use
  console.log('   ❌ Could not reach live site (may be deploying)');
}

console.log('\n📋 What to Monitor:');
console.log('==================');
console.log('1. ✅ Build Process: Check if the custom build script runs successfully');
console.log('2. ✅ CSS Generation: Verify that CSS files are being generated');
console.log('3. ✅ Asset Loading: Ensure all assets load properly');
console.log('4. ✅ API Connectivity: Test API calls to https://api.packmovego.com');
console.log('5. ✅ Performance: Check if the site loads quickly');

console.log('\n🔧 Debugging Commands:');
console.log('=====================');
console.log('• Local Build Test: npm run debug:build');
console.log('• Production Build Test: npm run debug:vercel');
console.log('• Check Vercel CLI: npx vercel --version');

console.log('\n📞 If Issues Persist:');
console.log('=====================');
console.log('1. Check Vercel build logs for detailed error messages');
console.log('2. Verify environment variables are set correctly');
console.log('3. Test the build locally with: npm run debug:vercel');
console.log('4. Check if all dependencies are properly installed');

console.log('\n✨ Deployment monitoring ready!');
console.log('Monitor the Vercel dashboard for real-time updates.');
