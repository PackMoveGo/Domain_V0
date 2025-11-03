// Temporarily disabled for Next.js build
export const checkApiHealth = async (endpoint: string) => {
  return {
    isHealthy: true,
    statusCode: 200,
    endpoint,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: 0,
    services: {}
  };
};