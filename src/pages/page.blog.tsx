
import { useState, useEffect, useCallback } from 'react';
import { fetchBlogData, BlogPost, BlogCategory } from '../util/blogParser';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import Layout from '../component/layout/Layout';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import Blog from '../component/pages/Blog';

// Cache for loaded blog data
let blogCache: { blogPosts: BlogPost[]; categories: BlogCategory[]; tags: string[] } | null = null;

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!blogCache);
  const [error, setError] = useState<string | null>(null);
  const { getSectionProps } = useGiveSectionId();



  const loadBlogData = useCallback(async () => {
    if (blogCache) {
      setBlogPosts(blogCache.blogPosts);
      setCategories(blogCache.categories);
      setTags(blogCache.tags);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const blogData = await fetchBlogData();
      blogCache = blogData;
      setBlogPosts(blogData.blogPosts);
      setCategories(blogData.categories);
      setTags(blogData.tags);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load blog posts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogData();
  }, [loadBlogData]);

  return (
    <Layout forceHideSearch={false}>
      <SEO 
        title="Moving & Packing Blog - Pack Move Go"
        description="Expert moving tips, packing guides, and insights to help make your move successful and stress-free. Learn from the professionals at Pack Move Go."
        keywords="moving tips, packing guide, moving blog, moving advice, packing tips, moving checklist, moving with kids, moving company blog"
        url="https://packmovego.com/blog"
        image="/og-cover-v2.jpg"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Blog Section */}
        <section {...getSectionProps('blog')}>
          <ErrorBoundary>
            <Blog blogPosts={blogPosts} categories={categories} tags={tags} isLoading={isLoading} error={error} />
          </ErrorBoundary>
        </section>
      </div>
    </Layout>
  );
};

export default BlogPage; 