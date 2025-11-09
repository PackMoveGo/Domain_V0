// Automatic retry for failed requests
export const fetchWithRetry = async (
  url: string, 
  options: RequestInit = {}, 
  maxRetries: number = 3
): Promise<Response> => {
  const delays = [1000, 2000, 4000]; // Exponential backoff
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...options.headers
        }
      });
      
      if (response.ok) {
        return response;
      }
      
      // If it's a server error (5xx), retry
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      // If it's a client error (4xx), don't retry
      return response;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Attempt ${i + 1} failed for ${url}:`, errorMessage);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// Usage example for services using centralized API service
export const getServices = async () => {
  try {
    // Use centralized API service with authentication
    const { api } = await import('../services/service.apiSW');
    return await api.getNav();
  } catch (error) {
    console.error('Failed to fetch services after retries:', error);
    throw error;
  }
};

// Generic API call with retry using centralized API service
export const apiCall = async (endpoint: string, _options: RequestInit = {}) => {
  try {
    // Import here to avoid circular dependency issues
    const { api } = await import('../services/service.apiSW');
    const _endpointPath = endpoint.startsWith('/') ? endpoint : `/v0/${endpoint}`;
    return await api.getNav();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}; 