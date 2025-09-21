import React from 'react';
import { BlogPost, BlogCategory } from '../../util/blogParser';

interface BlogProps {
  blogPosts: BlogPost[];
  categories: BlogCategory[];
  tags: string[];
  isLoading: boolean;
  error: string | null;
}

const Blog: React.FC<BlogProps> = ({ blogPosts, categories, tags, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-gray-600">Latest moving tips and insights</p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-800">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
                <p className="text-blue-600 text-sm mt-2">{category.postCount} posts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog Posts */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Latest Posts</h2>
        {blogPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No blog posts available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                {post.image && (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{post.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt || post.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                    <span className="text-sm text-blue-600 font-medium">Read More</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
