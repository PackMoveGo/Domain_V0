/**
 * Service API - Public API
 * 
 * This service handles service-related API calls that don't require authentication.
 * Used for displaying services on the public website.
 */

// import { Request, Response, NextFunction } from 'express'; // Reserved for future use
import { api } from '../service.apiSW';
import { handleApiError } from '../../util/apiErrorHandler';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  price: string;
  priceRange?: {
    min: number;
    max: number;
  };
  features: string[];
  benefits: string[];
  category: string;
  isPopular: boolean;
  isAvailable: boolean;
  estimatedDuration: string;
  requirements: string[];
  included: string[];
  notIncluded: string[];
  images?: string[];
  faqs?: {
    question: string;
    answer: string;
  }[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: ServiceItem[];
  order: number;
}

// =============================================================================
// SERVICE API FUNCTIONS
// =============================================================================

/**
 * Get all services
 */
export const getAllServices = async (): Promise<ServiceItem[]> => {
  try {
    console.log('🔧 Fetching all services from public API...');
    const response = await api.makeRequest('/v0/services') as any;
    
    const services: ServiceItem[] = response.services?.map((service: any) => ({
      id: service.id || service._id,
      name: service.name || service.title,
      description: service.description || service.fullDescription,
      shortDescription: service.shortDescription || service.short_description || service.description,
      icon: service.icon || 'truck',
      price: service.price || 'Contact for pricing',
      priceRange: service.priceRange ? {
        min: service.priceRange.min || service.price_range?.min,
        max: service.priceRange.max || service.price_range?.max
      } : undefined,
      features: service.features || service.benefits || [],
      benefits: service.benefits || service.advantages || [],
      category: service.category || service.service_type || 'general',
      isPopular: service.isPopular || service.is_popular || false,
      isAvailable: service.isAvailable !== false,
      estimatedDuration: service.estimatedDuration || service.estimated_duration || 'Varies',
      requirements: service.requirements || service.prerequisites || [],
      included: service.included || service.includes || [],
      notIncluded: service.notIncluded || service.not_included || service.excludes || [],
      images: service.images || [],
      faqs: service.faqs?.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer
      })) || []
    })) || [];

    console.log('✅ Services loaded:', services.length);
    return services;
  } catch (error) {
    console.error('❌ Failed to fetch services:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Services API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/services', {
        context: 'Services API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Services temporarily unavailable (503)');
    }
    
    return [];
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (serviceId: string): Promise<ServiceItem | null> => {
  try {
    console.log('🔧 Fetching service by ID:', serviceId);
    const response = await api.makeRequest(`/v0/services/${serviceId}`) as any;
    
    if (!response.service) return null;

    const service: ServiceItem = {
      id: response.service.id || response.service._id,
      name: response.service.name || response.service.title,
      description: response.service.description || response.service.fullDescription,
      shortDescription: response.service.shortDescription || response.service.short_description || response.service.description,
      icon: response.service.icon || 'truck',
      price: response.service.price || 'Contact for pricing',
      priceRange: response.service.priceRange ? {
        min: response.service.priceRange.min || response.service.price_range?.min,
        max: response.service.priceRange.max || response.service.price_range?.max
      } : undefined,
      features: response.service.features || response.service.benefits || [],
      benefits: response.service.benefits || response.service.advantages || [],
      category: response.service.category || response.service.service_type || 'general',
      isPopular: response.service.isPopular || response.service.is_popular || false,
      isAvailable: response.service.isAvailable !== false,
      estimatedDuration: response.service.estimatedDuration || response.service.estimated_duration || 'Varies',
      requirements: response.service.requirements || response.service.prerequisites || [],
      included: response.service.included || response.service.includes || [],
      notIncluded: response.service.notIncluded || response.service.not_included || response.service.excludes || [],
      images: response.service.images || [],
      faqs: response.service.faqs?.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer
      })) || []
    };

    console.log('✅ Service loaded:', service.name);
    return service;
  } catch (error) {
    console.error('❌ Failed to fetch service:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Service by ID API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/services', {
        context: 'Service by ID API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Service temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/services', {
      context: 'Service by ID API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return null;
  }
};

/**
 * Get services by category
 */
export const getServicesByCategory = async (category: string): Promise<ServiceItem[]> => {
  try {
    console.log('🔧 Fetching services by category:', category);
    const response = await api.makeRequest(`/v0/services/category/${category}`) as any;
    
    const services: ServiceItem[] = response.services?.map((service: any) => ({
      id: service.id || service._id,
      name: service.name || service.title,
      description: service.description || service.fullDescription,
      shortDescription: service.shortDescription || service.short_description || service.description,
      icon: service.icon || 'truck',
      price: service.price || 'Contact for pricing',
      priceRange: service.priceRange ? {
        min: service.priceRange.min || service.price_range?.min,
        max: service.priceRange.max || service.price_range?.max
      } : undefined,
      features: service.features || service.benefits || [],
      benefits: service.benefits || service.advantages || [],
      category: service.category || service.service_type || 'general',
      isPopular: service.isPopular || service.is_popular || false,
      isAvailable: service.isAvailable !== false,
      estimatedDuration: service.estimatedDuration || service.estimated_duration || 'Varies',
      requirements: service.requirements || service.prerequisites || [],
      included: service.included || service.includes || [],
      notIncluded: service.notIncluded || service.not_included || service.excludes || [],
      images: service.images || [],
      faqs: service.faqs?.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer
      })) || []
    })) || [];

    console.log('✅ Services by category loaded:', services.length);
    return services;
  } catch (error) {
    console.error('❌ Failed to fetch services by category:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Services by category API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/services/category', {
        context: 'Services by Category API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Services by category temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/services/category', {
      context: 'Services by Category API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get service categories
 */
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    console.log('🔧 Fetching service categories...');
    const response = await api.makeRequest('/v0/services/categories') as any;
    
    const categories: ServiceCategory[] = response.categories?.map((category: any) => ({
      id: category.id || category._id,
      name: category.name || category.title,
      description: category.description,
      icon: category.icon || 'folder',
      services: category.services?.map((service: any) => ({
        id: service.id || service._id,
        name: service.name || service.title,
        description: service.description,
        shortDescription: service.shortDescription || service.short_description || service.description,
        icon: service.icon || 'truck',
        price: service.price || 'Contact for pricing',
        priceRange: service.priceRange ? {
          min: service.priceRange.min || service.price_range?.min,
          max: service.priceRange.max || service.price_range?.max
        } : undefined,
        features: service.features || service.benefits || [],
        benefits: service.benefits || service.advantages || [],
        category: service.category || service.service_type || 'general',
        isPopular: service.isPopular || service.is_popular || false,
        isAvailable: service.isAvailable !== false,
        estimatedDuration: service.estimatedDuration || service.estimated_duration || 'Varies',
        requirements: service.requirements || service.prerequisites || [],
        included: service.included || service.includes || [],
        notIncluded: service.notIncluded || service.not_included || service.excludes || [],
        images: service.images || [],
        faqs: service.faqs?.map((faq: any) => ({
          question: faq.question,
          answer: faq.answer
        })) || []
      })) || [],
      order: category.order || 0
    })) || [];

    console.log('✅ Service categories loaded:', categories.length);
    return categories;
  } catch (error) {
    console.error('❌ Failed to fetch service categories:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Service categories API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/services/categories', {
        context: 'Service Categories API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Service categories temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/services/categories', {
      context: 'Service Categories API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

/**
 * Get popular services
 */
export const getPopularServices = async (limit: number = 6): Promise<ServiceItem[]> => {
  try {
    console.log('🔧 Fetching popular services...');
    const response = await api.makeRequest(`/v0/services/popular?limit=${limit}`) as any;
    
    const services: ServiceItem[] = response.services?.map((service: any) => ({
      id: service.id || service._id,
      name: service.name || service.title,
      description: service.description || service.fullDescription,
      shortDescription: service.shortDescription || service.short_description || service.description,
      icon: service.icon || 'truck',
      price: service.price || 'Contact for pricing',
      priceRange: service.priceRange ? {
        min: service.priceRange.min || service.price_range?.min,
        max: service.priceRange.max || service.price_range?.max
      } : undefined,
      features: service.features || service.benefits || [],
      benefits: service.benefits || service.advantages || [],
      category: service.category || service.service_type || 'general',
      isPopular: true,
      isAvailable: service.isAvailable !== false,
      estimatedDuration: service.estimatedDuration || service.estimated_duration || 'Varies',
      requirements: service.requirements || service.prerequisites || [],
      included: service.included || service.includes || [],
      notIncluded: service.notIncluded || service.not_included || service.excludes || [],
      images: service.images || [],
      faqs: service.faqs?.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer
      })) || []
    })) || [];

    console.log('✅ Popular services loaded:', services.length);
    return services;
  } catch (error) {
    console.error('❌ Failed to fetch popular services:', error);
    
    // Check if it's a 503 error and handle it appropriately
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      console.warn('⚠️ Popular services API returned 503 - Service Unavailable');
      handleApiError(error, '/v0/services/popular', {
        context: 'Popular Services API',
        showModal: false, // Let page controllers handle modal display
        logError: true
      });
      throw new Error('Popular services temporarily unavailable (503)');
    }
    
    // Handle other errors with modal
    handleApiError(error, '/v0/services/popular', {
      context: 'Popular Services API',
      showModal: false, // Let page controllers handle modal display
      logError: true
    });
    
    return [];
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getAllServices,
  getServiceById,
  getServicesByCategory,
  getServiceCategories,
  getPopularServices
};
