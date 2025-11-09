#!/usr/bin/env node

/**
 * Debug Build Script for PackMoveGo
 * This script helps debug Vercel build issues by providing detailed logging
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 PackMoveGo Debug Build Script');
console.log('================================');

// Check environment
console.log('\n📋 Environment Check:');
console.log(`   • Node Version: ${process.version}`);
console.log(`   • NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   • Current Directory: ${process.cwd()}`);
console.log(`   • Script Directory: ${__dirname}`);

// Check if vite is available
console.log('\n🔍 Vite Availability Check:');
try {
  const vitePath = execSync('which vite', { encoding: 'utf8' }).trim();
  console.log(`   ✅ Vite found at: ${vitePath}`);
  } catch (_error) {
    console.log('   ❌ Vite not found in PATH');
  console.log('   🔧 Trying npx vite...');
  try {
    execSync('npx vite --version', { stdio: 'inherit' });
    console.log('   ✅ Vite available via npx');
  } catch (_npxError) {
    console.log('   ❌ Vite not available via npx either');
  }
}

// Check configuration files
console.log('\n📁 Configuration Files Check:');
const configFiles = [
  'package.json',
  'config/vite.config.js',
  'postcss.config.mjs',
  'config/tailwind.config.js',
  'index.html'
];

configFiles.forEach(file => {
  const exists = existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file} ${exists ? 'exists' : 'missing'}`);
});

// Check node_modules
console.log('\n📦 Dependencies Check:');
const nodeModulesExists = existsSync('node_modules');
console.log(`   ${nodeModulesExists ? '✅' : '❌'} node_modules ${nodeModulesExists ? 'exists' : 'missing'}`);

if (nodeModulesExists) {
  try {
    const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
    console.log(`   📋 Project: ${packageJson.name} v${packageJson.version}`);
    console.log(`   🔧 Build script: ${packageJson.scripts.build}`);
  } catch (_error) {
    console.log('   ❌ Could not read package.json');
  }
}

// Try to run the build
console.log('\n🚀 Attempting Build:');
try {
  console.log('   🔧 Running: npm run build');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('   ✅ Build completed successfully!');
} catch (error) {
  console.log('   ❌ Build failed with error code:', error.status);
  console.log('   📝 Error details:', error.message);
}

console.log('\n✨ Debug build script completed');
