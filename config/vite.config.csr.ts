import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode, _command }): UserConfig => { // Reserved for future use
  // Load environment variables using Vite's built-in loadEnv
  // Load from config directory where .env files are now located
  // Variables no longer need VITE_ prefix
  const env=loadEnv(mode, __dirname, '');
  
  // Get port from env or use default
  const port=parseInt(env.PORT || process.env.PORT || (mode==='production' ? '5000' : '5001'), 10);
  
  const isProduction=mode==='production';
  
  // Normalize API URL for frontend use (preserves relative paths for proxy)
  const normalizeApiUrl=(value: string | undefined): string => {
    if(!value || typeof value!=='string') return value || 'https://localhost:3000';
    const trimmed=value.split('#')[0].trim();
    // If it's a relative path (starts with /), return as-is (for Vite proxy)
    if(trimmed.startsWith('/')) return trimmed;
    if(/^https?:\/\//i.test(trimmed)) return trimmed;
    if(/^(localhost|127\.)/i.test(trimmed)) return `http://${trimmed}`;
    return `https://${trimmed}`;
  };
  
  // Get the actual backend URL for proxy target (always use full URL, not relative path)
  const getBackendUrl=(): string => {
    const apiUrl=env.API_URL;
    // If using relative path for proxy, default to HTTP localhost:3000
    // Gateway runs over HTTP in dev, even when the Vite dev server itself is HTTPS.
    if(apiUrl && apiUrl.startsWith('/')){
      return 'http://localhost:3000';
    }
    return normalizeApiUrl(apiUrl);
  };
  
  const apiUrl=normalizeApiUrl(env.API_URL);
  const backendUrl=getBackendUrl();
  const devHttps=env.DEV_HTTPS==='true';
  
  // Log proxy configuration in development
  if(mode==='development'){
    console.log('🔧 [Vite Config] Proxy Configuration:');
    console.log(`   • API URL (frontend): ${apiUrl}`);
    console.log(`   • Backend URL (proxy target): ${backendUrl}`);
    console.log(`   • Proxy rule: /api/* -> ${backendUrl}/*`);
    console.log(`   • Port: ${port}`);
  }
  
  return {
    // Tell Vite to load .env files from config directory
    envDir: __dirname,
    
    define: {
      __APP_NAME__: JSON.stringify(env.APP_NAME || 'PackMoveGo'),
      __APP_VERSION__: JSON.stringify(env.APP_VERSION || '0.1.0'),
      // Expose non-VITE-prefixed env vars to the client bundle
      'import.meta.env.MODE': JSON.stringify(env.MODE || mode),
      'import.meta.env.DEV_MODE': JSON.stringify(env.DEV_MODE || env.MODE || mode),
      // Core API configuration
      'import.meta.env.API_URL': JSON.stringify(env.API_URL || '/api'),
      'import.meta.env.API_TIMEOUT': JSON.stringify(env.API_TIMEOUT || '10000'),
      'import.meta.env.API_RETRY_ATTEMPTS': JSON.stringify(env.API_RETRY_ATTEMPTS || '3'),
      'import.meta.env.API_RETRY_DELAY': JSON.stringify(env.API_RETRY_DELAY || '1000'),
      // Cache
      'import.meta.env.CACHE_ENABLED': JSON.stringify(env.CACHE_ENABLED || 'true'),
      'import.meta.env.CACHE_TTL': JSON.stringify(env.CACHE_TTL || '3600'),
      'import.meta.env.CACHE_MAX_SIZE': JSON.stringify(env.CACHE_MAX_SIZE || '100'),
      // API key exposure for gateway authentication (frontend key is public by design)
      'import.meta.env.API_KEY_FRONTEND': JSON.stringify(env.API_KEY_FRONTEND || ''),
      'import.meta.env.API_KEY_ENABLED': JSON.stringify(env.API_KEY_ENABLED || 'false'),
      // Stripe publishable key (safe on frontend)
      'import.meta.env.STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.STRIPE_PUBLISHABLE_KEY || ''),
      // Backwards-compatibility for legacy VITE_ usage
      'import.meta.env.VITE_API_URL': JSON.stringify(env.API_URL || env.VITE_API_URL || '/api'),
      'import.meta.env.VITE_API_KEY_FRONTEND': JSON.stringify(env.API_KEY_FRONTEND || env.VITE_API_KEY_FRONTEND || ''),
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
        babel: {
          plugins: []
        }
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src'),
        '@config': resolve(__dirname, '.'),
      },
    },
    css: {
      postcss: resolve(__dirname, './postcss.config.mjs'),
    },
    experimental: {
      // Memory-optimized loading
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') return { relative: true };
        else return { relative: true };
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'esnext',
      cssMinify: true,
      reportCompressedSize: false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, '../index.html')
        },
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'axios']
          }
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction, // Remove console.log in production
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug', 'console.warn'] : [],
          passes: 2, // Reduced passes for memory efficiency
          unsafe: false, // Disable unsafe optimizations
          hoist_funs: true,
          hoist_vars: true,
          if_return: true,
          inline: true,
          join_vars: true,
          reduce_vars: true,
          sequences: true,
          side_effects: true,
          switches: true,
          toplevel: true,
          typeofs: true,
          unused: true,
        },
        mangle: { toplevel: false, safari10: true }, // Disable top-level mangling for memory efficiency // Optimize for Safari 10+
        format: { comments: false, beautify: false }
      },
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios'],
      exclude: ['@vercel/analytics', '@vercel/speed-insights'],
      force: false,
      esbuildOptions: { target: 'esnext' },
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      pure: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
      target: 'esnext',
      jsx: 'automatic'
    },
    server: {
      port: port,
      host: 'localhost',
      hmr: { 
        overlay: false, // Disable HMR overlay for faster reloads
        // Fix WebSocket connection for HTTPS
        ...(mode==='development' && devHttps ? {
          port: port,
          host: 'localhost',
          protocol: 'wss'
        } : {
          port: port,
          host: 'localhost'
        })
      },
      fs: { strict: false }, // Optimize for faster loading
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`[Vite Proxy] ${req.method} ${req.url} -> ${backendUrl}${req.url?.replace(/^\/api/, '')}`);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`[Vite Proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
            });
            proxy.on('error', (err, req, _res) => {
              console.error(`[Vite Proxy] Error proxying ${req.url}:`, err.message);
            });
          }
        }
      }, // Proxy API calls to backend URL (supports 3000 or 3003 gateway)
      // Optional HTTPS for local dev (enable by setting DEV_HTTPS=true)
      ...(mode==='development' && devHttps ? {
        https: {
          key: fs.readFileSync(resolve(__dirname, './certs/localhost-key.pem')),
          cert: fs.readFileSync(resolve(__dirname, './certs/localhost.pem')),
        }
      } : {}),
    },
    preview: {
      port: port,
      host: 'localhost',
      // Note: preview mode does NOT support proxy configuration
      // Use full gateway URL in .env.production.local instead (API_URL=http://localhost:10000)
      // Enable HTTPS for preview/production builds
      ...(devHttps ? {
        https: {
          key: fs.readFileSync(resolve(__dirname, './certs/localhost-key.pem')),
          cert: fs.readFileSync(resolve(__dirname, './certs/localhost.pem')),
        }
      } : {}),
    }
  }
})
