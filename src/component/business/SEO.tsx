import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title = 'PackMoveGO - Professional Moving Services',
  description = 'Professional moving services across the country. Get reliable, affordable moving solutions with PackMoveGO.',
  keywords = 'moving services, professional movers, relocation, moving company',
  image = '/og-cover-v2.jpg',
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) => {
  const location = useLocation();
  
  // SSR-safe URL construction
  const getCurrentUrl = () => {
    if (url) return url;
    
    // Server-side: use environment or default
    if (typeof window === 'undefined') {
      return `https://packmovego.com${location.pathname}`;
    }
    
    // Client-side: use window.location
    return `${window.location.origin}${location.pathname}`;
  };
  
  const currentUrl = getCurrentUrl();
  
  // SSR-safe image URL construction
  const getImageUrl = () => {
    if (image.startsWith('http')) return image;
    if (typeof window === 'undefined') {
      return `https://packmovego.com${image}`;
    }
    return `${window.location.origin}${image}`;
  };
  
  const fullImageUrl = getImageUrl();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content={fullImageUrl.endsWith('.jpg') || fullImageUrl.endsWith('.jpeg') ? 'image/jpeg' : 'image/webp'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="PackMoveGO" />
      <meta property="og:locale" content="en_US" />
      {author && <meta property="og:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@packmovego" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          "name": "PackMoveGO",
          "description": description,
          "url": "https://packmovego.com",
          "logo": "https://packmovego.com/logo.png",
          "image": fullImageUrl,
          "sameAs": [
            "https://facebook.com/packmovego",
            "https://twitter.com/packmovego"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-800-PACKMOVE",
            "contactType": "customer service"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
          },
          "serviceArea": {
            "@type": "GeoCircle",
            "geoMidpoint": {
              "@type": "GeoCoordinates",
              "latitude": 40.7128,
              "longitude": -74.0060
            },
            "geoRadius": "50000"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO; 