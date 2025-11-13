import { api } from '../services/service.apiSW';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  featured: boolean;
  image: string;
  slug: string;
  views: number;
  likes: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  description: string;
  postCount: number;
}

export interface BlogData {
  blogPosts: BlogPost[];
  categories: BlogCategory[];
  tags: string[];
}

export async function fetchBlogData(): Promise<BlogData> {
  try {
    console.log('🚀 Fetching blog data from API...');
    
    // Use the API method
    const response = await api.getBlog();
    console.log('📡 Blog API response:', response);
    console.log('📡 Response type:', typeof response);
    console.log('📡 Response keys:', response ? Object.keys(response) : 'null/undefined');
    
    // Handle different response formats
    let blogPosts: BlogPost[] = [];
    let categories: BlogCategory[] = [];
    let tags: string[] = [];
    
    if (response && response.blogPosts && response.categories && response.tags) {
      blogPosts = Array.isArray(response.blogPosts) ? response.blogPosts : [];
      categories = Array.isArray(response.categories) ? response.categories : [];
      tags = Array.isArray(response.tags) ? response.tags : [];
      console.log('✅ Blog data loaded successfully');
    } else if (response && response.success && response.data) {
      blogPosts = Array.isArray(response.data.blogPosts) ? response.data.blogPosts : [];
      categories = Array.isArray(response.data.categories) ? response.data.categories : [];
      tags = Array.isArray(response.data.tags) ? response.data.tags : [];
      console.log('✅ Blog data loaded from wrapped response');
    } else if (response && response.posts) {
      // Handle alternative format
      blogPosts = Array.isArray(response.posts) ? response.posts : [];
      categories = Array.isArray(response.categories) ? response.categories : [];
      tags = Array.isArray(response.tags) ? response.tags : [];
      console.log('✅ Blog data loaded from alternative format');
    } else {
      // Return empty data structure instead of throwing error
      console.warn('⚠️ No blog data found, returning empty structure');
      return {
        blogPosts: [],
        categories: [],
        tags: []
      };
    }
    
    console.log('📊 Final blog data:', {
      blogPostsCount: blogPosts.length,
      categoriesCount: categories.length,
      tagsCount: tags.length
    });
    
    return {
      blogPosts,
      categories,
      tags
    };
  } catch (error) {
    console.error('❌ Error loading blog data:', error);
    // Check if this is a 503 error
    if (error instanceof Error && (error as any).is503Error) {
      // Return empty data instead of throwing
      console.warn('⚠️ 503 error detected, returning empty blog data');
      return {
        blogPosts: [],
        categories: [],
        tags: []
      };
    }
    // Return empty data for other errors too
    console.warn('⚠️ Blog API error, returning empty data');
    return {
      blogPosts: [],
      categories: [],
      tags: []
    };
  }
}

export function getFeaturedPosts(posts: BlogPost[]): BlogPost[] {
  if (!posts || !Array.isArray(posts)) {
    return [];
  }
  return posts.filter(post => post.featured);
}

export function getPostsByCategory(posts: BlogPost[], category: string): BlogPost[] {
  if (!posts || !Array.isArray(posts)) {
    return [];
  }
  return posts.filter(post => post.category === category);
}

export function getPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  if (!posts || !Array.isArray(posts)) {
    return [];
  }
  return posts.filter(post => post.tags && Array.isArray(post.tags) && post.tags.includes(tag));
}

export function searchBlogPosts(posts: BlogPost[], searchTerm: string): BlogPost[] {
  const searchResults: BlogPost[] = [];
  const term = searchTerm.toLowerCase();
  
  if (!posts || !Array.isArray(posts)) {
    return searchResults;
  }
  
  posts.forEach(post => {
    if (
      post.title.toLowerCase().includes(term) ||
      post.excerpt.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.author.toLowerCase().includes(term) ||
      post.category.toLowerCase().includes(term) ||
      (post.tags && Array.isArray(post.tags) && post.tags.some(tag => tag.toLowerCase().includes(term)))
    ) {
      searchResults.push(post);
    }
  });
  
  return searchResults;
}

export function getPopularPosts(posts: BlogPost[], limit: number = 5): BlogPost[] {
  if (!posts || !Array.isArray(posts)) {
    return [];
  }
  return posts
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export function getRecentPosts(posts: BlogPost[], limit: number = 5): BlogPost[] {
  if (!posts || !Array.isArray(posts)) {
    return [];
  }
  return posts
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
} 