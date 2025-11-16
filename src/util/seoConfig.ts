// SEO Configuration for all pages
export interface PageSEOConfig {
  title: string;
  description: string;
  keywords: string;
  image: string;
  url: string;
  type: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

// Base URL for the site
const BASE_URL = 'https://packmovego.com';

// Default SEO configuration
const DEFAULT_SEO: PageSEOConfig = {
  title: 'PackMoveGO - Professional Moving Services',
  description: 'Professional moving services across the country. Get reliable, affordable moving solutions with PackMoveGO.',
  keywords: 'moving services, professional movers, relocation, moving company',
  image: '/images/moving-truck.webp',
  url: BASE_URL,
  type: 'website'
};

// SEO configurations for all pages
export const PAGE_SEO_CONFIGS: Record<string, PageSEOConfig> = {
  // Home Page
  '/': {
    title: 'PackMoveGO - Professional Moving & Packing Services',
    description: 'Expert moving and packing services for residential and commercial moves. Get reliable, efficient, and stress-free moving solutions with PackMoveGO.',
    keywords: 'moving services, packing services, residential moving, commercial moving, professional movers, relocation services',
    image: '/images/moving-truck.webp',
    url: BASE_URL,
    type: 'website'
  },

  // About Page
  '/about': {
    title: 'About PackMoveGO | Professional Moving Company',
    description: 'Learn about PackMoveGO\'s story, our dedicated team of professional movers, and our commitment to providing exceptional moving services.',
    keywords: 'about packmovego, moving company history, professional movers, moving company values, experienced moving team',
    image: '/images/about-us.webp',
    url: `${BASE_URL}/about`,
    type: 'website'
  },

  // Services Page
  '/services': {
    title: 'Moving Services - Residential & Commercial | PackMoveGO',
    description: 'Comprehensive moving services including residential, commercial, long-distance, and specialty moves. Professional packing, loading, and delivery.',
    keywords: 'residential moving, commercial moving, long distance moving, packing services, moving services, professional movers',
    image: '/images/services.webp',
    url: `${BASE_URL}/services`,
    type: 'website'
  },

  // Contact Page
  '/contact': {
    title: 'Contact PackMoveGO - Get Your Free Moving Quote',
    description: 'Contact PackMoveGO for a free moving quote. Our professional team is ready to help with your residential or commercial move.',
    keywords: 'contact packmovego, moving quote, free estimate, moving consultation, customer service',
    image: '/images/contact.webp',
    url: `${BASE_URL}/contact`,
    type: 'website'
  },

  // Blog Page
  '/blog': {
    title: 'Moving Tips & Advice - PackMoveGO Blog',
    description: 'Expert moving tips, packing advice, and relocation guides from PackMoveGO. Learn how to make your move stress-free and efficient.',
    keywords: 'moving tips, packing advice, relocation guide, moving blog, moving checklist',
    image: '/images/blog.webp',
    url: `${BASE_URL}/blog`,
    type: 'website'
  },

  // FAQ Page
  '/faq': {
    title: 'Frequently Asked Questions - PackMoveGO',
    description: 'Find answers to common questions about moving services, pricing, insurance, and more. Get expert advice from PackMoveGO.',
    keywords: 'moving faq, moving questions, moving insurance, moving pricing, moving tips',
    image: '/images/faq.webp',
    url: `${BASE_URL}/faq`,
    type: 'website'
  },

  // Locations Page
  '/locations': {
    title: 'Service Areas - PackMoveGO Moving Services',
    description: 'PackMoveGO provides professional moving services across multiple locations. Find moving services in your area.',
    keywords: 'moving services locations, service areas, local movers, moving company locations',
    image: '/images/locations.webp',
    url: `${BASE_URL}/locations`,
    type: 'website'
  },

  // Moves Page
  '/moves': {
    title: 'Recent Moves & Success Stories - PackMoveGO',
    description: 'See our recent successful moves and customer testimonials. PackMoveGO has helped thousands of families and businesses relocate.',
    keywords: 'recent moves, moving success stories, customer testimonials, moving reviews',
    image: '/images/recent-moves.webp',
    url: `${BASE_URL}/moves`,
    type: 'website'
  },

  // Booking Page
  '/booking': {
    title: 'Book Your Move - PackMoveGO Online Booking',
    description: 'Book your move online with PackMoveGO. Easy scheduling, instant quotes, and professional moving services at your fingertips.',
    keywords: 'book move online, moving booking, schedule move, online moving quote',
    image: '/images/booking.webp',
    url: `${BASE_URL}/booking`,
    type: 'website'
  },

  // Review Page
  '/review': {
    title: 'Write a Review - PackMoveGO Customer Feedback',
    description: 'Share your experience with PackMoveGO. Your feedback helps us improve and helps others choose the right moving company.',
    keywords: 'write review, customer feedback, moving company review, packmovego review',
    image: '/images/review.webp',
    url: `${BASE_URL}/review`,
    type: 'website'
  },

  // Refer Page
  '/refer': {
    title: 'Refer a Friend - PackMoveGO Referral Program',
    description: 'Refer friends and family to PackMoveGO and earn rewards. Share the gift of stress-free moving with your loved ones.',
    keywords: 'refer a friend, referral program, moving referral, earn rewards',
    image: '/images/refer.webp',
    url: `${BASE_URL}/refer`,
    type: 'website'
  },

  // Supplies Page
  '/supplies': {
    title: 'Moving Supplies & Packing Materials - PackMoveGO',
    description: 'High-quality moving supplies and packing materials. Boxes, tape, bubble wrap, and more for a successful move.',
    keywords: 'moving supplies, packing materials, moving boxes, bubble wrap, packing tape',
    image: '/images/supplies.webp',
    url: `${BASE_URL}/supplies`,
    type: 'website'
  },

  // Tips Page
  '/tips': {
    title: 'Moving Tips & Tricks - PackMoveGO Guide',
    description: 'Essential moving tips and tricks to make your relocation smooth and stress-free. Expert advice from PackMoveGO professionals.',
    keywords: 'moving tips, packing tips, relocation advice, moving checklist, moving guide',
    image: '/images/tips.webp',
    url: `${BASE_URL}/tips`,
    type: 'website'
  },

  // Sign In Page
  '/signin': {
    title: 'Sign In - PackMoveGO Customer Portal',
    description: 'Sign in to your PackMoveGO customer portal. Access your moving details, track your move, and manage your account.',
    keywords: 'sign in, customer portal, moving account, track move',
    image: '/images/signin.webp',
    url: `${BASE_URL}/signin`,
    type: 'website'
  },

  // Sign Up Page
  '/signup': {
    title: 'Sign Up - PackMoveGO Customer Portal',
    description: 'Create your PackMoveGO account to track your move, access exclusive offers, and manage your moving services.',
    keywords: 'sign up, create account, moving account, customer portal',
    image: '/images/signup.webp',
    url: `${BASE_URL}/signup`,
    type: 'website'
  },

  // Privacy Page
  '/privacy': {
    title: 'Privacy Policy - PackMoveGO',
    description: 'PackMoveGO privacy policy. Learn how we collect, use, and protect your personal information.',
    keywords: 'privacy policy, data protection, personal information, privacy',
    image: '/images/privacy.webp',
    url: `${BASE_URL}/privacy`,
    type: 'website'
  },

  // Terms Page
  '/terms': {
    title: 'Terms of Service - PackMoveGO',
    description: 'PackMoveGO terms of service. Read our terms and conditions for using our moving services.',
    keywords: 'terms of service, terms and conditions, moving terms, service agreement',
    image: '/images/terms.webp',
    url: `${BASE_URL}/terms`,
    type: 'website'
  },

  // Cookie Opt In Page
  '/opt-in': {
    title: 'Cookie Preferences - PackMoveGO',
    description: 'Manage your cookie preferences and opt out of tracking. PackMoveGO respects your privacy choices.',
    keywords: 'cookie preferences, opt out, privacy settings, tracking preferences',
    image: '/images/cookie.webp',
    url: `${BASE_URL}/opt-in`,
    type: 'website'
  },

  // Sitemap Page
  '/sitemap': {
    title: 'Sitemap - PackMoveGO',
    description: 'Complete sitemap of PackMoveGO website. Find all pages and services easily.',
    keywords: 'sitemap, website map, packmovego pages',
    image: '/images/sitemap.webp',
    url: `${BASE_URL}/sitemap`,
    type: 'website'
  }
};

// Service-specific SEO configurations
export const SERVICE_SEO_CONFIGS: Record<string, PageSEOConfig> = {
  'residential': {
    title: 'Residential Moving Services - PackMoveGO',
    description: 'Professional residential moving services for homes and apartments. Expert packing, loading, and delivery for stress-free moves.',
    keywords: 'residential moving, home moving, apartment moving, house moving, residential movers',
    image: '/images/residential-moving.webp',
    url: `${BASE_URL}/services/residential`,
    type: 'website'
  },

  'commercial': {
    title: 'Commercial Moving Services - PackMoveGO',
    description: 'Professional commercial moving services for offices and businesses. Minimal downtime, secure handling, and efficient relocation.',
    keywords: 'commercial moving, office moving, business moving, commercial movers, office relocation',
    image: '/images/commercial-moving.webp',
    url: `${BASE_URL}/services/commercial`,
    type: 'website'
  },

  'long-distance': {
    title: 'Long Distance Moving Services - PackMoveGO',
    description: 'Reliable long distance moving services across the country. Professional cross-country moves with tracking and insurance.',
    keywords: 'long distance moving, cross country moving, interstate moving, long distance movers',
    image: '/images/long-distance-moving.webp',
    url: `${BASE_URL}/services/long-distance`,
    type: 'website'
  },

  'packing': {
    title: 'Professional Packing Services - PackMoveGO',
    description: 'Professional packing services for safe and efficient moves. Expert packers, quality materials, and careful handling.',
    keywords: 'packing services, professional packing, moving packing, packing company',
    image: '/images/packing-services.webp',
    url: `${BASE_URL}/services/packing`,
    type: 'website'
  }
};

// Location-specific SEO configurations
export const LOCATION_SEO_CONFIGS: Record<string, PageSEOConfig> = {
  'orange-county': {
    title: 'Moving Services in Orange County - PackMoveGO',
    description: 'Professional moving services in Orange County, CA. Local movers serving Irvine, Anaheim, Santa Ana, and surrounding areas.',
    keywords: 'orange county moving, irvine moving, anaheim moving, santa ana moving, orange county movers',
    image: '/images/orange-county-moving.webp',
    url: `${BASE_URL}/locations/orange-county`,
    type: 'website'
  },

  'los-angeles': {
    title: 'Moving Services in Los Angeles - PackMoveGO',
    description: 'Professional moving services in Los Angeles, CA. Reliable movers serving LA County and surrounding areas.',
    keywords: 'los angeles moving, LA moving, LA county moving, los angeles movers',
    image: '/images/los-angeles-moving.webp',
    url: `${BASE_URL}/locations/los-angeles`,
    type: 'website'
  },

  'san-diego': {
    title: 'Moving Services in San Diego - PackMoveGO',
    description: 'Professional moving services in San Diego, CA. Expert movers serving San Diego County and surrounding areas.',
    keywords: 'san diego moving, san diego county moving, san diego movers',
    image: '/images/san-diego-moving.webp',
    url: `${BASE_URL}/locations/san-diego`,
    type: 'website'
  }
};

// Helper function to get SEO config for a path
export function getSEOConfig(pathname: string): PageSEOConfig {
  // Remove trailing slash for consistency
  const cleanPath = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;

  // Check page-specific configs first
  if (PAGE_SEO_CONFIGS[cleanPath]) {
    return PAGE_SEO_CONFIGS[cleanPath];
  }

  // Check service-specific configs
  if (cleanPath.startsWith('/services/')) {
    const service = cleanPath.split('/')[2];
    if (SERVICE_SEO_CONFIGS[service]) {
      return SERVICE_SEO_CONFIGS[service];
    }
  }

  // Check location-specific configs
  if (cleanPath.startsWith('/locations/')) {
    const location = cleanPath.split('/')[2];
    if (LOCATION_SEO_CONFIGS[location]) {
      return LOCATION_SEO_CONFIGS[location];
    }
  }

  // Return default config
  return DEFAULT_SEO;
}

// Helper function to get structured data for a page
export function getStructuredData(config: PageSEOConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "name": "PackMoveGO",
    "description": config.description,
    "url": config.url,
    "logo": "https://packmovego.com/logo.png",
    "image": config.image.startsWith('http') ? config.image : `https://packmovego.com${config.image}`,
    "sameAs": [
      "https://facebook.com/packmovego",
      "https://twitter.com/packmovego",
      "https://instagram.com/packmovego"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-949-414-5282",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressRegion": "CA"
    },
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 33.6846,
        "longitude": -117.8265
      },
      "geoRadius": "50000"
    },
    "priceRange": "$$",
    "openingHours": "Mo-Su 08:00-18:00"
  };
}
