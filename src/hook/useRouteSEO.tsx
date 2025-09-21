import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSEOConfig, getStructuredData } from '../util/seoConfig';
import SEO from '../component/business/SEO';

/**
 * Hook that automatically applies SEO based on the current route
 * This hook should be used in the main App component or layout
 */
export function useRouteSEO() {
  const location = useLocation();
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Get SEO config for current path
    const seoConfig = getSEOConfig(location.pathname);
    
    // Update document title
    document.title = seoConfig.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seoConfig.description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seoConfig.keywords);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', seoConfig.title);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', seoConfig.description);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', seoConfig.url);
    }
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      const fullImageUrl = seoConfig.image.startsWith('http') 
        ? seoConfig.image 
        : `https://packmovego.com${seoConfig.image}`;
      ogImage.setAttribute('content', fullImageUrl);
    }
    
    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', seoConfig.title);
    }
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', seoConfig.description);
    }
    
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      const fullImageUrl = seoConfig.image.startsWith('http') 
        ? seoConfig.image 
        : `https://packmovego.com${seoConfig.image}`;
      twitterImage.setAttribute('content', fullImageUrl);
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', seoConfig.url);
    }
    
    // Update structured data
    const structuredData = getStructuredData(seoConfig);
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
    
  }, [location.pathname]);
}

/**
 * Component that automatically applies SEO based on the current route
 * This component should be placed in the main App component
 */
export function RouteSEO() {
  const location = useLocation();
  const seoConfig = getSEOConfig(location.pathname);
  
  // Use a key to ensure the component re-renders when the route changes
  return <SEO key={location.pathname} {...seoConfig} />;
}

/**
 * Hook that returns SEO config for the current route
 * Useful for components that need to know the current page's SEO data
 */
export function useCurrentSEO() {
  const location = useLocation();
  return getSEOConfig(location.pathname);
}
