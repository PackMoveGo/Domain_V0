import { api } from '../services/service.apiSW';

export interface SearchResult {
  title: string;
  path: string;
  description: string;
  type?: string;
  category?: string;
}

/**
 * Search content using the backend API
 * @param query - Search query string
 * @param type - Optional type filter (service, location, review, blog, supply, all)
 * @param limit - Maximum number of results to return
 * @returns Promise of search results
 */
export async function searchContent(
  query: string, 
  type?: string, 
  limit: number = 10
): Promise<SearchResult[]> {
  const normalizedQuery = query.trim();
  
  if (!normalizedQuery) return [];

  try {
    console.log('🔍 Searching for:', { query: normalizedQuery, type, limit });
    
    // Call the API search endpoint
    const response = await api.search(normalizedQuery, type, limit);
    
    if (response && response.results && Array.isArray(response.results)) {
      // Transform API results to SearchResult format
      return response.results.map((result: any) => ({
        title: result.title || 'Untitled',
        path: result.url || result.path || '#',
        description: result.description || '',
        type: result.type,
        category: result.category
      }));
    }
    
    console.warn('⚠️ Search returned no results or invalid format');
    return [];
  } catch (error) {
    console.error('❌ Search error:', error);
    // Return empty array on error rather than throwing
    return [];
  }
} 