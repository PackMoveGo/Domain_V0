import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig(({ mode, command }): UserConfig => {
  // Load environment variables from .env file
  const loadEnvFile = (filePath: string): Record<string, string> => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const env: Record<string, string> = {};
      
      fileContent.split('\n').forEach(line => {
        if (!line.trim() || line.trim().startsWith('#')) {
          return;
        }
        
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length && key.trim()) {
          let value = valueParts.join('=').trim();
          
          if (value.includes('#')) {
            value = value.split('#')[0].trim();
          }
          
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          if (value && value !== '') {
            env[key.trim()] = value;
          }
        }
      });
      
      return env;
    } catch (error) {
      console.warn(`Could not load environment file: ${filePath}`);
      return {};
    }
  };

  const nodeEnv = process.env.NODE_ENV || 'development';
  const envPath = resolve(__dirname, `.env.${nodeEnv}.local`);
  const envVars = loadEnvFile(envPath);
  
  // Log environment loading for debugging
  console.log('🔧 Loading environment from:', envPath);
  console.log('🔧 DEV_HTTPS value:', envVars.DEV_HTTPS);
  
  let port;
  if (envVars.PORT) {
    port = parseInt(envVars.PORT);
  } else if (envVars.NODE_ENV === 'production') {
    port = 5000;
  } else {
    port = 5001;
  }

  const isProduction = envVars.NODE_ENV === 'production';
  
  const normalizeApiUrl = (value: string | undefined): string => {
    if (!value || typeof value !== 'string') return value || '';
    const trimmed = value.split('#')[0].trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^(localhost|127\.)/i.test(trimmed)) return `http://${trimmed}`;
    return `https://${trimmed}`;
  };
  
  const apiUrl = normalizeApiUrl(envVars.API_URL)
  const skipBackendCheck = envVars.SKIP_BACKEND_CHECK || 'false';
  const enableDevTools = envVars.ENABLE_DEV_TOOLS !== undefined 
    ? envVars.ENABLE_DEV_TOOLS 
    : (envVars.NODE_ENV === 'development' ? 'true' : 'false');
  const reduceLogging = envVars.REDUCE_LOGGING || 'false';
  const devMode = envVars.NODE_ENV || mode;
  
  // Dynamic environment variable logging (terminal only)
  const logEnvironmentVariables = () => {
    console.log('🔧 Environment Configuration Loaded:');
    
    // Define all possible environment variables from both files
    const allEnvVars = {
      'NODE_ENV': envVars.NODE_ENV || 'not set',
      'DEV_HTTPS': envVars.DEV_HTTPS || 'not set',
      'HOST': envVars.HOST || 'not set',
      'PORT': envVars.PORT || 'not set',
      'SKIP_BACKEND_CHECK': envVars.SKIP_BACKEND_CHECK || 'not set',
      'API_URL': apiUrl || 'not set',
      'JWT_SECRET': envVars.JWT_SECRET ? '***hidden***' : 'not set',
      'JWT_EXPIRES_IN': envVars.JWT_EXPIRES_IN || 'not set',
      'JWT_REFRESH_EXPIRES_IN': envVars.JWT_REFRESH_EXPIRES_IN || 'not set',
      'CORS_ORIGIN': envVars.CORS_ORIGIN || 'not set',
      'CORS_CREDENTIALS': envVars.CORS_CREDENTIALS || 'not set',
      'REDUCE_LOGGING': reduceLogging,
      'ENABLE_DEV_TOOLS': enableDevTools,
      'API_TIMEOUT': envVars.API_TIMEOUT || 'not set',
      'API_RETRY_ATTEMPTS': envVars.API_RETRY_ATTEMPTS || 'not set',
      'API_RETRY_DELAY': envVars.API_RETRY_DELAY || 'not set',
      'CACHE_ENABLED': envVars.CACHE_ENABLED || 'not set',
      'CACHE_TTL': envVars.CACHE_TTL || 'not set',
      'CACHE_MAX_SIZE': envVars.CACHE_MAX_SIZE || 'not set',
      'API_KEY_ENABLED': envVars.API_KEY_ENABLED || 'not set',
      'API_KEY_FRONTEND': envVars.API_KEY_FRONTEND ? '***hidden***' : 'not set',
      'API_KEY_ADMIN': envVars.API_KEY_ADMIN ? '***hidden***' : 'not set',
      'SIGNIN_HOST': envVars.SIGNIN_HOST || 'not set'
    };

    // Log only variables that are set (not 'not set')
    Object.entries(allEnvVars).forEach(([key, value]) => {
      if (value !== 'not set') {
        console.log(`   • ${key}: ${value}`);
      }
    });
  };

  // Log environment variables on startup
  logEnvironmentVariables();
  
  return {
    define: {
      __APP_NAME__: JSON.stringify(envVars.APP_NAME || 'PackMoveGo'),
      __APP_VERSION__: JSON.stringify(envVars.APP_VERSION || '0.1.0'),
      'process.env': JSON.stringify({
        NODE_ENV: devMode,
        HOST: envVars.HOST,
        API_URL: apiUrl,
        PORT: port.toString(),
        SKIP_BACKEND_CHECK: skipBackendCheck,
        API_TIMEOUT: envVars.API_TIMEOUT,
        API_RETRY_ATTEMPTS: envVars.API_RETRY_ATTEMPTS,
        API_RETRY_DELAY: envVars.API_RETRY_DELAY,
        CACHE_ENABLED: envVars.CACHE_ENABLED,
        CACHE_TTL: envVars.CACHE_TTL,
        CACHE_MAX_SIZE: envVars.CACHE_MAX_SIZE,
        REDUCE_LOGGING: reduceLogging,
        ENABLE_DEV_TOOLS: enableDevTools,
        API_KEY_FRONTEND: envVars.API_KEY_FRONTEND,
        JWT_SECRET: envVars.JWT_SECRET,
        JWT_EXPIRES_IN: envVars.JWT_EXPIRES_IN,
        JWT_REFRESH_EXPIRES_IN: envVars.JWT_REFRESH_EXPIRES_IN,
        CORS_ORIGIN: envVars.CORS_ORIGIN,
        CORS_CREDENTIALS: envVars.CORS_CREDENTIALS
      })
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
      host: true,
      hmr: { 
        overlay: false, // Disable HMR overlay for faster reloads
        // Fix WebSocket connection for HTTPS
        ...(mode === 'development' && envVars.DEV_HTTPS === 'true' ? {
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
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }, // Proxy API calls to API_URL (supports 3000 or 3003 gateway)
      // Optional HTTPS for local dev (enable by setting DEV_HTTPS=true)
      ...(mode === 'development' && envVars.DEV_HTTPS === 'true' ? {
        https: {
          key: fs.readFileSync('./config/certs/localhost-key.pem'),
          cert: fs.readFileSync('./config/certs/localhost.pem'),
        }
      } : {}),
    }
  }
})
