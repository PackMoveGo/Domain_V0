/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // App directory is now stable in Next.js 13+
  },
  
  // Move experimental options to root level
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'packmovego.com'],
    unoptimized: true, // For static exports if needed
  },
  
  // Output configuration
  output: 'standalone', // For production deployment
  
  // Disable static optimization to avoid build errors
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack configuration if needed
    return config;
  },
  
  // Redirects and rewrites
  async redirects() {
    return [
      // Add any redirects here
    ];
  },
  
  async rewrites() {
    return [
      // Add any rewrites here
    ];
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  
  // Trailing slash configuration
  trailingSlash: false,
  
  // PoweredByHeader
  poweredByHeader: false,
  
  // Compress
  compress: true,
  
  // Dev indicator
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
