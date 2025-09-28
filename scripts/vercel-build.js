#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Vercel build process...');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  console.log('📦 Building client-side bundle...');
  execSync('npx vite build --config config/vite.config.js', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('🔧 Building server-side bundle...');
  execSync('npx vite build --ssr src/entry-server.jsx --config config/vite.config.js --outDir dist/server', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  // Verify the builds
  const distPath = path.join(__dirname, '..', 'dist');
  const serverPath = path.join(distPath, 'server');
  
  if (!fs.existsSync(distPath)) {
    throw new Error('Client build failed: dist directory not found');
  }
  
  if (!fs.existsSync(serverPath)) {
    throw new Error('Server build failed: dist/server directory not found');
  }
  
  console.log('✅ Vercel build completed successfully!');
  console.log('📁 Build output:');
  console.log(`   • Client: ${distPath}`);
  console.log(`   • Server: ${serverPath}`);
  
} catch (error) {
  console.error('❌ Vercel build failed:', error.message);
  process.exit(1);
}
