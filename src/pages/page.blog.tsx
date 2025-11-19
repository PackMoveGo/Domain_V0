
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { fetchBlogData, BlogPost, BlogCategory } from '../util/blogParser';
import { useGiveSectionId } from '../hook/useGiveSectionId';
import SEO from '../component/business/SEO';
import ErrorBoundary from '../component/ui/feedback/ErrorBoundary';
import Blog from '../component/pages/page.Blog';

// Lazy load QuoteForm
const QuoteForm = lazy(() => import('../component/forms/form.quote'));

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
      // fetchBlogData now returns empty data instead of throwing, so this should rarely be hit
      // But handle it gracefully if it does
      console.warn('⚠️ Blog data loading error:', err);
      // Don't set error - let the component render with empty data
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogData();
  }, [loadBlogData]);

  return (
    <div>
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

        {/* Quote Form Section */}
        <section {...getSectionProps('quote-form')}>
          <ErrorBoundary>
            <Suspense fallback={
              <div className="py-16 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading Quote Form...</p>
                </div>
              </div>
            }>
              <QuoteForm />
            </Suspense>
          </ErrorBoundary>
        </section>
      </div>
    </div>
  );
};

export default BlogPage; 