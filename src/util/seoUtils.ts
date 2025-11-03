export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const updateDocumentHead = (seoData: SEOData) => {
  // Update title
  if (seoData.title) {
    document.title = seoData.title;
  }

  // Helper function to update or create meta tag
  const updateMetaTag = (name: string, content: string, property?: string) => {
    const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
    let metaTag = document.querySelector(selector) as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      if (property) {
        metaTag.setAttribute('property', property);
      } else {
        metaTag.setAttribute('name', name);
      }
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  };

  // Update basic meta tags
  if (seoData.description) {
    updateMetaTag('description', seoData.description);
    updateMetaTag('og:description', seoData.description, 'og:description');
    updateMetaTag('twitter:description', seoData.description, 'twitter:description');
  }

  if (seoData.keywords) {
    updateMetaTag('keywords', seoData.keywords);
  }

  if (seoData.title) {
    updateMetaTag('og:title', seoData.title, 'og:title');
    updateMetaTag('twitter:title', seoData.title, 'twitter:title');
  }

  if (seoData.image) {
    updateMetaTag('og:image', seoData.image, 'og:image');
    updateMetaTag('twitter:image', seoData.image, 'twitter:image');
  }

  if (seoData.url) {
    updateMetaTag('og:url', seoData.url, 'og:url');
    updateMetaTag('twitter:url', seoData.url, 'twitter:url');
  }

  if (seoData.type) {
    updateMetaTag('og:type', seoData.type, 'og:type');
  }
};

export const getDefaultSEOData = (): SEOData => ({
  title: 'PackMoveGo - Professional Moving Services',
  description: 'Professional moving services with reliable, efficient, and affordable solutions for your relocation needs.',
  keywords: 'moving services, relocation, professional movers, packing services',
  image: '/images/moving-truck.webp',
  url: 'https://packmovego.com',
  type: 'website'
}); 