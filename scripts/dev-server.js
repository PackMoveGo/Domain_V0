#!/usr/bin/env node

import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const HTTP_PORT = 5000;  // HTTP port for redirects
const HTTPS_PORT = 5001; // HTTPS port for actual server
const CERT_PATH = resolve(__dirname, '../config/certs');

// Check if certificates exist
const certExists = fs.existsSync(resolve(CERT_PATH, 'localhost.pem')) && 
                   fs.existsSync(resolve(CERT_PATH, 'localhost-key.pem'));

if (!certExists) {
  console.error('❌ SSL certificates not found!');
  console.error('Please generate SSL certificates first:');
  console.error('mkdir -p config/certs');
  console.error('openssl req -x509 -newkey rsa:4096 -keyout config/certs/localhost-key.pem -out config/certs/localhost.pem -days 365 -nodes -subj "/CN=localhost"');
  process.exit(1);
}

// Create Express app
const app = express();

// HTTP to HTTPS redirect middleware
app.use((req, res, next) => {
  // Check if request is coming over HTTP
  const isHttp = req.headers['x-forwarded-proto'] === 'http' || 
                 req.connection.encrypted === false;
  
  if (isHttp) {
    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host.replace(`:${HTTP_PORT}`, `:${HTTPS_PORT}`)}${req.url}`;
    console.log(`🔄 Redirecting HTTP to HTTPS: ${req.url} → ${httpsUrl}`);
    res.redirect(301, httpsUrl);
    return;
  }
  
  // If HTTPS, continue normally
  next();
});

// Error handling for redirect failures
app.use((err, req, res, next) => {
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    console.error('❌ Redirect failed:', err.message);
    res.status(300).json({
      error: 'Redirect failed',
      message: 'Unable to redirect to HTTPS',
      code: err.code,
      timestamp: new Date().toISOString()
    });
    return;
  }
  next(err);
});

// Basic health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    protocol: req.connection.encrypted ? 'https' : 'http',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server for redirects
const httpServer = http.createServer(app);

// Create HTTPS server
const httpsOptions = {
  key: fs.readFileSync(resolve(CERT_PATH, 'localhost-key.pem')),
  cert: fs.readFileSync(resolve(CERT_PATH, 'localhost.pem'))
};

const httpsServer = https.createServer(httpsOptions, app);

// Start servers
httpServer.listen(HTTP_PORT, () => {
  console.log(`🚀 HTTP Server running on http://localhost:${HTTP_PORT}`);
  console.log(`   Redirecting to https://localhost:${HTTPS_PORT}`);
});

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`🔒 HTTPS Server running on https://localhost:${HTTPS_PORT}`);
  console.log(`📝 Access your app at: https://localhost:${HTTPS_PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });
  httpsServer.close(() => {
    console.log('✅ HTTPS server closed');
    process.exit(0);
  });
});

// Error handling
httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${HTTP_PORT} is already in use`);
    process.exit(1);
  }
  console.error('❌ HTTP Server error:', err);
});

httpsServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${HTTPS_PORT} is already in use`);
    process.exit(1);
  }
  console.error('❌ HTTPS Server error:', err);
});
