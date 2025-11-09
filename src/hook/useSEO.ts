import { useMemo } from 'react';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  twitterCard?: string;
  imageWidth?: string;
  imageHeight?: string;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  image: string;
  url: string;
  type: 'website' | 'article' | 'product';
  siteName: string;
  twitterCard: string;
  imageWidth: string;
  imageHeight: string;
  fullImageUrl: string;
  isWebP: boolean;
}

const DEFAULT_SEO_CONFIG: Required<SEOConfig> = {
  title: 'Pack Move Go - Professional Moving & Packing Services',
  description: 'Expert moving and packing services for residential and commercial moves. Get reliable, efficient, and stress-free moving solutions with Pack Move Go.',
  keywords: 'moving services, packing services, residential moving, commercial moving, professional movers, relocation services',
  image: '/moving-truck.webp',
  url: 'https://packmovego.com',
  type: 'website',
  siteName: 'Pack Move Go',
  twitterCard: 'summary_large_image',
  imageWidth: '1920',
  imageHeight: '1080'
};

/**
 * Custom hook for managing SEO metadata
 * @param config - SEO configuration object
 * @returns SEO data object with processed values
 */
export const useSEO = (config: SEOConfig = {}): SEOData => {
  return useMemo(() => {
    // Merge provided config with defaults
    const mergedConfig = { ...DEFAULT_SEO_CONFIG, ...config };
    
    // Process URL to ensure no trailing slash
    const siteUrl = mergedConfig.url.endsWith('/') 
      ? mergedConfig.url.slice(0, -1) 
      : mergedConfig.url;
    
    // Process image URL
    const fullImageUrl = mergedConfig.image.startsWith('http') 
      ? mergedConfig.image 
      : `${siteUrl}${mergedConfig.image}`;
    
    // Check if image is WebP format
    const isWebP = mergedConfig.image.toLowerCase().endsWith('.webp');

    return {
      title: mergedConfig.title,
      description: mergedConfig.description,
      keywords: mergedConfig.keywords,
      image: mergedConfig.image,
      url: mergedConfig.url,
      type: mergedConfig.type,
      siteName: mergedConfig.siteName,
      twitterCard: mergedConfig.twitterCard,
      imageWidth: mergedConfig.imageWidth,
      imageHeight: mergedConfig.imageHeight,
      fullImageUrl,
      isWebP
    };
  }, [config]);
};

/**
 * Hook for page-specific SEO with common defaults
 * @param pageTitle - Page-specific title
 * @param pageDescription - Page-specific description
 * @param pageKeywords - Page-specific keywords
 * @param pageImage - Page-specific image
 * @param pageUrl - Page-specific URL
 * @returns SEO data object
 */
export const usePageSEO = (
  pageTitle?: string,
  pageDescription?: string,
  pageKeywords?: string,
  pageImage?: string,
  pageUrl?: string
) => {
  return useSEO({
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    image: pageImage,
    url: pageUrl
  });
};

/**
 * Hook for service-specific SEO
 * @param serviceName - Name of the service
 * @param serviceDescription - Description of the service
 * @param serviceImage - Image for the service
 * @returns SEO data object
 */
export const useServiceSEO = (
  serviceName: string,
  serviceDescription?: string,
  serviceImage?: string
) => {
  const title = `${serviceName} - Pack Move Go`;
  const description = serviceDescription || `Professional ${serviceName.toLowerCase()} services in Orange County. Get reliable and efficient moving solutions with Pack Move Go.`;
  const keywords = `${serviceName.toLowerCase()}, moving services, orange county, professional movers, ${serviceName.toLowerCase()} company`;
  
  return useSEO({
    title,
    description,
    keywords,
    image: serviceImage
  });
};

/**
 * Hook for location-specific SEO
 * @param locationName - Name of the location
 * @param locationDescription - Description of the location
 * @param locationImage - Image for the location
 * @returns SEO data object
 */
export const useLocationSEO = (
  locationName: string,
  locationDescription?: string,
  locationImage?: string
) => {
  const title = `Moving Services in ${locationName} - Pack Move Go`;
  const description = locationDescription || `Professional moving and packing services in ${locationName}. Get reliable, efficient, and stress-free moving solutions with Pack Move Go.`;
  const keywords = `moving services ${locationName}, packing services ${locationName}, residential moving ${locationName}, commercial moving ${locationName}, professional movers ${locationName}`;
  
  return useSEO({
    title,
    description,
    keywords,
    image: locationImage
  });
}; 