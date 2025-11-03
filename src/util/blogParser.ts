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
    // Use the correct API method
    const data = await api.getBlog() as BlogData;
    return data;
  } catch (error) {
    console.error('Error loading blog data:', error);
    throw new Error('Failed to load blog data');
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