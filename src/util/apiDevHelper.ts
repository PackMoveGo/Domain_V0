// API Development Helper - Only active when VITE_DEV_MODE=development
const isDevMode = import.meta.env.VITE_DEV_MODE === 'development';

// Check if we should use development data
export const shouldUseDevData = (): boolean => {
  return isDevMode && sessionStorage.getItem('use-dev-api') === 'true';
};

// Clear rate limiting data for development testing
export const clearRateLimitingData = (): void => {
  if (!isDevMode) return;
  
  // Clear all rate limiting session storage
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.startsWith('last-request-') || key.startsWith('api-'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
  console.log('🔧 Rate limiting data cleared for development testing');
};

// Get development data for specific endpoints
export const getDevData = (endpoint: string): any => {
  if (!shouldUseDevData()) {
    return null;
  }

  const mockData = {
    navigation: [
      { id: 'home', title: 'Home', path: '/' },
      { id: 'services', title: 'Services', path: '/services' },
      { id: 'about', title: 'About', path: '/about' },
      { id: 'contact', title: 'Contact', path: '/contact' },
      { id: 'blog', title: 'Blog', path: '/blog' }
    ],
    services: [
      {
        id: 'residential-move',
        title: 'Residential Moving',
        description: 'Complete residential moving services with professional packing and unpacking.',
        duration: '2-6 hours',
        price: 'Starting at $299',
        icon: '🏠'
      },
      {
        id: 'commercial-move',
        title: 'Commercial Moving',
        description: 'Professional commercial relocation services for businesses of all sizes.',
        duration: '4-8 hours',
        price: 'Starting at $499',
        icon: '🏢'
      },
      {
        id: 'packing-service',
        title: 'Packing Services',
        description: 'Professional packing and unpacking services with all materials included.',
        duration: '3-5 hours',
        price: 'Starting at $199',
        icon: '📦'
      }
    ],
    testimonials: [
      {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Residential Customer',
        content: 'Amazing service! The team was professional, on time, and very careful with our belongings. Highly recommend!',
        rating: 5,
        date: '2024-01-15'
      },
      {
        id: 2,
        name: 'Mike Chen',
        role: 'Commercial Customer',
        content: 'Excellent commercial moving service. They handled our office relocation efficiently and with minimal disruption.',
        rating: 5,
        date: '2024-01-10'
      },
      {
        id: 3,
        name: 'Lisa Rodriguez',
        role: 'Residential Customer',
        content: 'Stress-free move! The packing service was thorough and everything arrived safely. Great value for money.',
        rating: 5,
        date: '2024-01-08'
      }
    ]
  };

  switch (endpoint) {
    case '/v0/nav':
    case '/api/v0/nav':
      return { navigation: mockData.navigation };
    
    case '/v0/services':
    case '/api/v0/services':
      return { services: mockData.services };
    
    case '/v0/testimonials':
    case '/api/v0/testimonials':
      return { testimonials: mockData.testimonials };
    
    case '/health':
    case '/api/health':
      return {
        status: 'ok',
        environment: 'development',
        serverPort: '3000',
        uptime: 1000,
        timestamp: new Date().toISOString(),
        memory: {
          rss: 25000000,
          heapTotal: 250000000,
          heapUsed: 240000000,
          external: 40000000,
          arrayBuffers: 20000000
        },
        database: { connected: false, status: 'disconnected' },
        requests: { total: 50, errors: 5, avgResponseTime: 3 }
      };
    
    default:
      return null;
  }
};

// Enable development mode
export const enableDevMode = (): void => {
  if (isDevMode) {
    sessionStorage.setItem('use-dev-api', 'true');
    console.log('🔧 Development API mode enabled');
  }
};

// Disable development mode
export const disableDevMode = (): void => {
  if (isDevMode) {
    sessionStorage.setItem('use-dev-api', 'false');
    console.log('🔧 Development API mode disabled');
  }
}; 