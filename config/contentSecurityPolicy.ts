export const contentSecurityPolicyDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Remove 'unsafe-inline' and 'unsafe-eval' for production
    'https://va.vercel-scripts.com',
    'https://vitals.vercel-analytics.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'" // Consider removing this too
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:'
  ],
  'connect-src': [
    "'self'",
    'https://va.vercel-scripts.com',
    'https://vitals.vercel-analytics.com',
    'https://api.packmovego.com'
    // Remove localhost for production
  ],
  'font-src': [
    "'self'",
    'data:'
  ],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': []
};

export const generateContentSecurityPolicy = (isProduction: boolean) => {
  // Add development-specific directives
  const directives = {
    ...contentSecurityPolicyDirectives,
    'connect-src': [
      ...contentSecurityPolicyDirectives['connect-src'],
      ...(isProduction ? [] : ['ws://localhost:*', 'wss://localhost:*', 'http://localhost:*'])
    ]
  };

  return Object.entries(directives)
    .map(([key, value]) => `${key} ${value.join(' ')}`)
    .join('; ');
};
