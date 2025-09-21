import React, { useState } from 'react';
import { useBlog } from '../../hook/useContent';
import { BlogPost, BlogCategory, getFeaturedPosts, searchBlogPosts, getPostsByCategory, getPopularPosts, formatDate, truncateText } from '../../util/blogParser';
import { getCurrentDateISO } from '../../util/ssrUtils';

const BlogWithApi: React.FC = () => {
  const { data: blogData, error, isLoading } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Transform API data to match expected format
  const transformApiData = (apiData: any) => {
    if (!apiData || !Array.isArray(apiData)) return { posts: [], categories: [], tags: [] };
    
    const posts: BlogPost[] = apiData.map((post: any, index: number) => ({
      id: post.id || index,
      title: post.title || post.name || 'Untitled',
      content: post.content || post.body || post.description || '',
      excerpt: post.excerpt || post.summary || '',
      author: post.author || post.writer || 'Unknown',
      publishDate: post.date || post.publishedAt || getCurrentDateISO(),
      readTime: post.readTime || '5 min read',
      category: post.category || post.categoryName || 'General',
      tags: post.tags || post.tagList || [],
      featured: post.featured || false,
      image: post.image || post.coverImage || '',
      slug: post.slug || post.url || `post-${index}`,
      views: post.views || 0,
      likes: post.likes || 0
    }));

    // Extract unique categories
    const categoriesMap = new Map<string, number>();
    posts.forEach(post => {
      const count = categoriesMap.get(post.category) || 0;
      categoriesMap.set(post.category, count + 1);
    });

    const categories: BlogCategory[] = Array.from(categoriesMap.entries()).map(([name, count], index) => ({
      id: `category-${index}`,
      name,
      description: `Posts about ${name}`,
      postCount: count
    }));

    // Extract unique tags
    const tagsSet = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tagsSet.add(tag));
    });

    const tags = Array.from(tagsSet);

    return { posts, categories, tags };
  };

  const { posts: blogPosts, categories, tags } = transformApiData(blogData);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts from API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Blog</h3>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Please check your API connection</p>
        </div>
      </div>
    );
  }

  const featuredPosts = getFeaturedPosts(blogPosts);
  const popularPosts = getPopularPosts(blogPosts, 3);
  
  // Apply filters
  let filteredPosts = blogPosts;
  if (searchTerm) {
    filteredPosts = searchBlogPosts(blogPosts, searchTerm);
  } else if (selectedCategory !== 'all') {
    filteredPosts = getPostsByCategory(blogPosts, selectedCategory);
  } else if (selectedTag !== 'all') {
    filteredPosts = blogPosts.filter(post => post.tags.includes(selectedTag));
  }

  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    ...categories.map(category => ({ id: category.name, name: category.name }))
  ];

  const tagOptions = [
    { id: 'all', name: 'All Tags' },
    ...tags.slice(0, 10).map(tag => ({ id: tag, name: tag }))
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Moving & Packing Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Expert tips, guides, and insights to help make your move successful and stress-free
        </p>
        {blogData && (
          <p className="text-sm text-gray-500 mt-2">
            Powered by API - {blogPosts.length} posts loaded
          </p>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categoryOptions.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tagOptions.map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Posts Section */}
      {!searchTerm && selectedCategory === 'all' && selectedTag === 'all' && featuredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <FeaturedPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Posts Section */}
      {!searchTerm && selectedCategory === 'all' && selectedTag === 'all' && popularPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularPosts.map((post) => (
              <PopularPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* All Posts Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchTerm ? `Search Results for "${searchTerm}"` : 
             selectedCategory !== 'all' ? `${selectedCategory} Posts` :
             selectedTag !== 'all' ? `Posts tagged "${selectedTag}"` : 'All Posts'}
          </h2>
          <span className="text-sm text-gray-600">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
          </span>
        </div>
        
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Need Help with Your Move?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Ready to put these tips into action? Contact Pack Move Go for professional moving and packing services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Free Quote
          </button>
          <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

// Reuse the existing card components from the original Blog.tsx
interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.image && (
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span>{formatDate(post.publishDate)}</span>
          <span className="mx-2">•</span>
          <span>{post.author}</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {truncateText(post.excerpt, 120)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-600 font-medium">
            {post.category}
          </span>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Read More →
          </button>
        </div>
      </div>
    </article>
  );
};

interface FeaturedPostCardProps {
  post: BlogPost;
}

const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({ post }) => {
  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
      {post.image && (
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-8">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>{formatDate(post.publishDate)}</span>
          <span className="mx-2">•</span>
          <span>{post.author}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {truncateText(post.excerpt, 200)}
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Read Full Article
        </button>
      </div>
    </article>
  );
};

interface PopularPostCardProps {
  post: BlogPost;
}

const PopularPostCard: React.FC<PopularPostCardProps> = ({ post }) => {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {post.image && (
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {truncateText(post.excerpt, 80)}
        </p>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Read More →
        </button>
      </div>
    </article>
  );
};

interface CategoryCardProps {
  category: BlogCategory;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {category.name}
      </h3>
      <p className="text-gray-600">
        {category.postCount} post{category.postCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default BlogWithApi; 