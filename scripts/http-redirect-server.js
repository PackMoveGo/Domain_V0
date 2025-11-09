#!/usr/bin/env node

/**
 * HTTP to HTTPS Redirect Server
 * 
 * This server listens on HTTP port 5001 and redirects all requests
 * to HTTPS on the same port. It works alongside the Vite dev server
 * which runs on HTTPS port 5001.
 */

import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const HTTP_PORT = 5001;  // HTTP port (same as HTTPS port)
const HTTPS_PORT = 5001; // HTTPS port where Vite dev server runs

// Create HTTP server that redirects to HTTPS
const server = http.createServer((req, res) => {
  // Build HTTPS URL
  const host = req.headers.host || `localhost:${HTTPS_PORT}`;
  const httpsHost = host.replace(`:${HTTP_PORT}`, `:${HTTPS_PORT}`).replace(/^localhost/, 'localhost');
  const httpsUrl = `https://${httpsHost}${req.url}`;
  
  // Log redirect for debugging
  console.log(`🔄 [HTTP→HTTPS] ${req.method} ${req.url} → ${httpsUrl}`);
  
  // Send 301 permanent redirect
  res.writeHead(301, {
    'Location': httpsUrl,
    'Content-Type': 'text/plain'
  });
  res.end(`Redirecting to HTTPS: ${httpsUrl}\n`);
});

// Start HTTP redirect server
server.listen(HTTP_PORT, () => {
  console.log(`🚀 HTTP Redirect Server running on http://localhost:${HTTP_PORT}`);
  console.log(`   All HTTP requests will redirect to https://localhost:${HTTPS_PORT}`);
  console.log(`   Make sure Vite dev server is running on HTTPS port ${HTTPS_PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HTTP redirect server...');
  server.close(() => {
    console.log('✅ HTTP redirect server closed');
    process.exit(0);
  });
});

// Error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${HTTP_PORT} is already in use`);
    console.error(`   Make sure no other process is using port ${HTTP_PORT}`);
    process.exit(1);
  }
  console.error('❌ HTTP Redirect Server error:', err);
  process.exit(1);
});

