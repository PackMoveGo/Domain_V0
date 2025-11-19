/**
 * Static Fallback Data
 * 
 * This file contains static fallback content that will be displayed
 * when the API is unavailable (503 errors). This ensures the website
 * remains functional and informative even when the backend is down.
 */

import { ServiceData, TestimonialData, RecentMove, HomePageServiceData } from '../services/public/service.homePageAPI';

/**
 * Fallback services data
 * Core services that PackMoveGo offers
 */
export const FALLBACK_SERVICES: ServiceData[] = [
  {
    id: 'residential-moving',
    title: 'Residential Moving',
    description: 'Professional residential moving services for homes and apartments. We handle everything from packing to delivery with care and precision.',
    price: null,
    duration: 'Varies by distance',
    icon: 'home',
    link: '/services/residential'
  },
  {
    id: 'commercial-moving',
    title: 'Commercial Moving',
    description: 'Efficient office and business relocation services. Minimize downtime with our experienced commercial moving team.',
    price: null,
    duration: 'Varies by size',
    icon: 'briefcase',
    link: '/services/commercial'
  },
  {
    id: 'long-distance-moving',
    title: 'Long Distance Moving',
    description: 'Reliable long-distance moving services across state lines. Safe and secure transportation for your belongings.',
    price: null,
    duration: 'Varies by distance',
    icon: 'truck',
    link: '/services/long-distance'
  },
  {
    id: 'packing-services',
    title: 'Packing Services',
    description: 'Expert packing services using high-quality materials. We ensure your items are properly protected during transit.',
    price: null,
    duration: 'Varies by volume',
    icon: 'box',
    link: '/services/packing'
  },
  {
    id: 'storage-solutions',
    title: 'Storage Solutions',
    description: 'Secure storage facilities for short-term or long-term needs. Climate-controlled options available.',
    price: null,
    duration: 'Flexible terms',
    icon: 'warehouse',
    link: '/services/storage'
  },
  {
    id: 'packing-supplies',
    title: 'Packing Supplies',
    description: 'High-quality moving boxes, tape, bubble wrap, and other packing materials. Available for purchase or rental.',
    price: null,
    duration: 'Same day pickup',
    icon: 'package',
    link: '/supplies'
  }
];

/**
 * Fallback testimonials data
 * Sample customer testimonials to display when API is unavailable
 */
export const FALLBACK_TESTIMONIALS: TestimonialData[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    comment: 'Excellent service from start to finish! The team was professional, careful, and efficient. Highly recommend PackMoveGo for any moving needs.',
    service: 'Residential Moving',
    location: 'Orange County, CA',
    rating: 5,
    date: '2024-01-15'
  },
  {
    id: 2,
    name: 'Michael Chen',
    comment: 'Moved our entire office without any downtime. The commercial moving team was organized and handled all our equipment with care.',
    service: 'Commercial Moving',
    location: 'Los Angeles, CA',
    rating: 5,
    date: '2024-01-10'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    comment: 'Long-distance move was seamless. They kept us updated throughout the journey and everything arrived in perfect condition.',
    service: 'Long Distance Moving',
    location: 'San Diego, CA',
    rating: 5,
    date: '2024-01-05'
  },
  {
    id: 4,
    name: 'David Thompson',
    comment: 'The packing service was outstanding. They wrapped everything carefully and nothing was damaged. Worth every penny!',
    service: 'Packing Services',
    location: 'Irvine, CA',
    rating: 5,
    date: '2023-12-28'
  }
];

/**
 * Fallback recent moves data
 * Sample recent moves to display when API is unavailable
 */
export const FALLBACK_RECENT_MOVES: RecentMove[] = [
  {
    id: 'move-1',
    customerName: 'Sarah J.',
    customerInitials: 'SJ',
    moveDate: '2024-01-15',
    fromLocation: 'Irvine, CA',
    toLocation: 'Los Angeles, CA',
    moveType: 'Residential',
    status: 'completed',
    rating: 5,
    isVerified: true
  },
  {
    id: 'move-2',
    customerName: 'Michael C.',
    customerInitials: 'MC',
    moveDate: '2024-01-10',
    fromLocation: 'Orange County, CA',
    toLocation: 'San Diego, CA',
    moveType: 'Commercial',
    status: 'completed',
    rating: 5,
    isVerified: true
  },
  {
    id: 'move-3',
    customerName: 'Emily R.',
    customerInitials: 'ER',
    moveDate: '2024-01-05',
    fromLocation: 'Los Angeles, CA',
    toLocation: 'Phoenix, AZ',
    moveType: 'Long Distance',
    status: 'completed',
    rating: 5,
    isVerified: true
  }
];

/**
 * Fallback total moves count
 * A reasonable default number for display purposes
 */
export const FALLBACK_TOTAL_MOVES = 1000;

/**
 * Complete fallback home page data
 * Structured to match HomePageServiceData interface
 */
export const FALLBACK_HOME_PAGE_DATA: HomePageServiceData = {
  nav: null,
  services: FALLBACK_SERVICES,
  authStatus: null,
  testimonials: FALLBACK_TESTIMONIALS,
  recentMoves: FALLBACK_RECENT_MOVES,
  totalMoves: FALLBACK_TOTAL_MOVES,
  lastUpdated: new Date().toISOString()
};

/**
 * Check if we should use fallback data
 * Returns true when API has failed with 503 error or when data is null/undefined
 */
export const shouldUseFallback = (
  data: any,
  statusCode?: number,
  error?: string | null
): boolean => {
  // Use fallback if status code is 503
  if (statusCode === 503) {
    return true;
  }
  
  // Use fallback if error indicates 503
  if (error && (error.includes('503') || error.includes('Service Unavailable'))) {
    return true;
  }
  
  // Use fallback if data is null/undefined (API completely failed)
  if (!data) {
    return true;
  }
  
  // Use fallback if data has 503 error flag
  if (data && typeof data === 'object' && (data as any).is503Error) {
    return true;
  }
  
  return false;
};

