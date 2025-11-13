import { api } from '../services/service.apiSW';
import { SearchResult } from './search';

export interface ApiSearchResult {
  type: 'service' | 'location' | 'review' | 'blog' | 'supply';
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  rating?: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  total: number;
  results: ApiSearchResult[];
}

/**
 * Search across all content types using the API
 */
export async function searchContent(query: string, type?: string, limit: number = 10): Promise<SearchResult[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    console.log('🔍 Searching API for:', query, { type, limit });
    
    const response = await api.search(query, type, limit);
    
    // Handle different response formats
    let results: ApiSearchResult[] = [];
    
    if (response && response.results && Array.isArray(response.results)) {
      results = response.results;
      console.log('✅ Search results loaded:', results.length);
    } else if (response && response.success && response.data && Array.isArray(response.data)) {
      results = response.data;
      console.log('✅ Search results loaded from wrapped response');
    } else {
      console.warn('⚠️ Unexpected search response format:', response);
      return [];
    }
    
    // Convert API results to SearchResult format
    const searchResults: SearchResult[] = results.map(result => ({
      title: result.title,
      path: result.url || `/${result.type}#${result.id}`,
      description: result.description || ''
    }));
    
    console.log('📊 Converted search results:', searchResults.length);
    
    return searchResults;
  } catch (error) {
    console.error('❌ Error searching content:', error);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Search specific content type
 */
export async function searchServices(query: string, limit: number = 10): Promise<SearchResult[]> {
  return searchContent(query, 'service', limit);
}

export async function searchLocations(query: string, limit: number = 10): Promise<SearchResult[]> {
  return searchContent(query, 'location', limit);
}

export async function searchReviews(query: string, limit: number = 10): Promise<SearchResult[]> {
  return searchContent(query, 'review', limit);
}

export async function searchBlog(query: string, limit: number = 10): Promise<SearchResult[]> {
  return searchContent(query, 'blog', limit);
}

export async function searchSupplies(query: string, limit: number = 10): Promise<SearchResult[]> {
  return searchContent(query, 'supply', limit);
}

