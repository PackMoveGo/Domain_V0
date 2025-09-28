import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the dist directory
const distPath = resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = resolve(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Please run "npm run build" first.');
  }
});

// Function to start server with port conflict handling
const startServer = (targetPort) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(targetPort, () => {
      console.log(`🚀 Static file server running at http://localhost:${targetPort}`);
      console.log(`   • Serving files from: ${distPath}`);
      console.log(`   • Mode: production`);
      console.log(`   • Press Ctrl+C to stop`);
      resolve(server);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const newPort = targetPort + 1;
        console.log(`⚠️ Port ${targetPort} is in use, trying port ${newPort}`);
        server.close();
        startServer(newPort).then(resolve).catch(reject);
      } else {
        console.error('❌ Server error:', error);
        reject(error);
      }
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('🛑 Shutting down gracefully...');
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  });
};

// Start the server with the configured port
startServer(port).catch(console.error);
