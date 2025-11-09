/**
 * Contact Page API Service
 * 
 * This service handles all API calls needed for the contact page including:
 * - Contact information
 * - Office locations
 * - Contact methods
 * - FAQ data
 * - Business hours
 * 
 * Features:
 * - Centralized API calls for contact page
 * - Data caching for performance
 * - Error handling and fallbacks
 * - Public endpoints (no authentication required)
 */

import { api } from '../service.apiSW';
import { /* handleApiError, */ getFailedEndpoints, has503Errors } from '../../util/apiErrorHandler'; // Reserved for future use

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ContactInfo {
  title: string;
  description: string;
  mainPhone: string;
  mainEmail: string;
  emergencyPhone: string;
  website: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    fullAddress: string;
  };
  phone: string;
  email: string;
  hours?: Record<string, string>;
  services?: string[];
}

export interface ContactMethod {
  id: string;
  title: string;
  description: string;
  primary: string;
  secondary?: string;
  hours?: string;
  icon: string;
  color: string;
}

export interface ContactForm {
  title: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    placeholder?: string;
  }>;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface BusinessHours {
  title: string;
  description: string;
  hours: {
    monday: { open: string; close: string; status: string };
    tuesday: { open: string; close: string; status: string };
    wednesday: { open: string; close: string; status: string };
    thursday: { open: string; close: string; status: string };
    friday: { open: string; close: string; status: string };
    saturday: { open: string; close: string; status: string };
    sunday: { open: string; close: string; status: string };
  };
  emergency: string;
}

export interface ContactPageData {
  contactInfo: ContactInfo;
  officeLocations: OfficeLocation[];
  contactMethods: ContactMethod[];
  contactForm: ContactForm;
  faq: FAQ[];
  businessHours: BusinessHours;
  lastUpdated: string;
}

export interface ContactPageServiceData {
  nav: any;
  contact: any;
  health: any;
  lastUpdated: string;
}

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

class ContactPageCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

const contactPageCache = new ContactPageCache();

// =============================================================================
// API CALL FUNCTIONS
// =============================================================================

/**
 * Get contact information from the API
 */
export const getContactInfo = async (): Promise<ContactInfo> => {
  const cacheKey = 'contact_info';
  const cached = contactPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached contact info data');
    return cached;
  }

  try {
    console.log('🔧 Fetching contact info from API service...');
    const response = await api.getContact() as any;
    
    const contactInfo: ContactInfo = {
      title: response.title || 'Contact Pack Move Go',
      description: response.description || 'Get in touch with us for professional moving services',
      mainPhone: response.mainPhone || '(949) 414-5282',
      mainEmail: response.mainEmail || 'info@packmovego.com',
      emergencyPhone: response.emergencyPhone || '(949) 313-0123',
      website: response.website || 'https://packmovego.com'
    };

    contactPageCache.set(cacheKey, contactInfo);
    console.log('✅ Contact info loaded');
    return contactInfo;
  } catch (error) {
    console.error('❌ Failed to fetch contact info:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Get office locations from the API
 */
export const getOfficeLocations = async (): Promise<OfficeLocation[]> => {
  const cacheKey = 'office_locations';
  const cached = contactPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached office locations data');
    return cached;
  }

  try {
    console.log('🔧 Fetching office locations from API service...');
    const response = await api.getContact() as any;
    const locations = response.locations || response.officeLocations || response || [];
    
    const officeLocations: OfficeLocation[] = locations.map((location: any) => ({
      id: location.id || location._id || `location-${Math.random().toString(36).substr(2, 9)}`,
      name: location.name || 'Main Office',
      type: location.type || 'Main Office',
      address: {
        street: location.address?.street || 'TBA',
        city: location.address?.city || 'Orange County',
        state: location.address?.state || 'CA',
        zip: location.address?.zip || '92602',
        fullAddress: location.address?.fullAddress || 'TBA, Orange County, CA 92602'
      },
      phone: location.phone || '(949) 414-5282',
      email: location.email || 'info@packmovego.com',
      hours: location.hours || {},
      services: location.services || []
    }));

    contactPageCache.set(cacheKey, officeLocations);
    console.log('✅ Office locations loaded:', officeLocations.length);
    return officeLocations;
  } catch (error) {
    console.error('❌ Failed to fetch office locations:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Get contact methods from the API
 */
export const getContactMethods = async (): Promise<ContactMethod[]> => {
  const cacheKey = 'contact_methods';
  const cached = contactPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached contact methods data');
    return cached;
  }

  try {
    console.log('🔧 Fetching contact methods from API service...');
    const response = await api.getContact() as any;
    const methods = response.methods || response.contactMethods || response || [];
    
    const contactMethods: ContactMethod[] = methods.map((method: any) => ({
      id: method.id || method._id || `method-${Math.random().toString(36).substr(2, 9)}`,
      title: method.title || 'Contact Method',
      description: method.description || 'Get in touch with us',
      primary: method.primary || '(949) 414-5282',
      secondary: method.secondary,
      hours: method.hours,
      icon: method.icon || '📞',
      color: method.color || 'bg-blue-600'
    }));

    contactPageCache.set(cacheKey, contactMethods);
    console.log('✅ Contact methods loaded:', contactMethods.length);
    return contactMethods;
  } catch (error) {
    console.error('❌ Failed to fetch contact methods:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Get contact form configuration from the API
 */
export const getContactForm = async (): Promise<ContactForm> => {
  const cacheKey = 'contact_form';
  const cached = contactPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached contact form data');
    return cached;
  }

  try {
    console.log('🔧 Fetching contact form from API service...');
    const response = await api.getContact() as any;
    
    const contactForm: ContactForm = {
      title: response.title || 'Send us a Message',
      description: response.description || 'Fill out the form below and we\'ll get back to you',
      fields: response.fields || []
    };

    contactPageCache.set(cacheKey, contactForm);
    console.log('✅ Contact form loaded');
    return contactForm;
  } catch (error) {
    console.error('❌ Failed to fetch contact form:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Get FAQ data from the API
 */
export const getFAQData = async (): Promise<FAQ[]> => {
  const cacheKey = 'faq_data';
  const cached = contactPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached FAQ data');
    return cached;
  }

  try {
    console.log('🔧 Fetching FAQ from API service...');
    const response = await api.getContact() as any;
    const faqs = response.faq || response.faqs || response || [];
    
    const faqData: FAQ[] = faqs.map((faq: any) => ({
      question: faq.question || 'Frequently Asked Question',
      answer: faq.answer || 'Answer not available'
    }));

    contactPageCache.set(cacheKey, faqData);
    console.log('✅ FAQ data loaded:', faqData.length);
    return faqData;
  } catch (error) {
    console.error('❌ Failed to fetch FAQ data:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Get business hours from the API
 */
export const getBusinessHours = async (): Promise<BusinessHours> => {
  const cacheKey = 'business_hours';
  const cached = contactPageCache.get(cacheKey);
  if (cached) {
    console.log('🔧 Using cached business hours data');
    return cached;
  }

  try {
    console.log('🔧 Fetching business hours from API service...');
    const response = await api.getContact() as any;
    
    const businessHours: BusinessHours = {
      title: response.title || 'Business Hours',
      description: response.description || 'We\'re here to help you move',
      hours: response.hours || {
        monday: { open: 'Closed', close: 'Closed', status: 'closed' },
        tuesday: { open: 'Closed', close: 'Closed', status: 'closed' },
        wednesday: { open: 'Closed', close: 'Closed', status: 'closed' },
        thursday: { open: 'Closed', close: 'Closed', status: 'closed' },
        friday: { open: '8:00 AM', close: '6:00 PM', status: 'open' },
        saturday: { open: '9:00 AM', close: '4:00 PM', status: 'open' },
        sunday: { open: '10:00 AM', close: '3:00 PM', status: 'open' }
      },
      emergency: response.emergency || 'For urgent matters, call our emergency line at (949) 313-0123'
    };

    contactPageCache.set(cacheKey, businessHours);
    console.log('✅ Business hours loaded');
    return businessHours;
  } catch (error) {
    console.error('❌ Failed to fetch business hours:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

// =============================================================================
// CONTACT PAGE DATA FUNCTIONS
// =============================================================================

/**
 * Get contact page data with error handling
 */
export const getContactPageData = async (): Promise<ContactPageServiceData> => {
  try {
    console.log('🚀 Loading contact page data...');
    
    // Start tracking API calls for contact page (this resets previous tracking)
    api.startPageTracking('contact-page');
    
    // Define all routes that will be called for this page
    const contactPageRoutes = ['/v0/nav', '/v0/contact'];
    
    // First check health status - if it fails, all routes are considered 503
    try {
      await api.checkHealth();
    } catch (_healthError) { // Reserved for future use
      // Track all routes as failed since health check failed
      contactPageRoutes.forEach(route => {
        api.trackApiCall(route);
      });
      
      // Show modal with all routes as failed
      api.showApiFailureModal(contactPageRoutes, true);
      
      // Return empty data with 503 status
      return {
        nav: null,
        contact: null,
        health: null,
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Health check passed - proceed with individual route calls
    const [navData, contactData] = await Promise.allSettled([
      api.getNav(),
      api.getContact()
    ]);
    
    // Collect failed endpoints for this page only
    const failedEndpoints: string[] = [];
    let has503Error = false;
    
    // Check each endpoint result
    if (navData.status === 'rejected') {
      failedEndpoints.push('/v0/nav');
      if (navData.reason?.message?.includes('503')) has503Error = true;
    }
    if (contactData.status === 'rejected') {
      failedEndpoints.push('/v0/contact');
      if (contactData.reason?.message?.includes('503')) has503Error = true;
    }
    
    // Show modal only for this page's failed endpoints
    if (failedEndpoints.length > 0) {
      api.showApiFailureModal(failedEndpoints, has503Error);
    }
    
    const result: ContactPageServiceData = {
      nav: navData.status === 'fulfilled' ? navData.value : null,
      contact: contactData.status === 'fulfilled' ? contactData.value : null,
      health: null, // Not needed for contact page
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ Contact page data loaded successfully:', {
      nav: !!result.nav,
      contact: !!result.contact
    });
    
    return result;
  } catch (error) {
    console.error('❌ Failed to load contact page data:', error);
    throw error;
  }
};

/**
 * Check if there are any 503 errors in contact page data
 */
export const hasContactPage503Errors = (): boolean => {
  return has503Errors();
};

/**
 * Get contact page failed endpoints
 */
export const getContactPageFailedEndpoints = (): string[] => {
  return getFailedEndpoints();
};

// =============================================================================
// INDIVIDUAL DATA LOADING FUNCTIONS
// =============================================================================

/**
 * Load contact info data with error handling
 */
export const loadContactInfoData = async () => {
  try {
    console.log('🎯 [LOADER] Loading contact info data...');
    const data = await getContactInfo();
    console.log('✅ [LOADER] Contact info data loaded successfully');
    return { data, error: null, loading: false };
  } catch (error) {
    console.error('❌ [LOADER] Contact info data failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load contact info';
    return { data: null, error: errorMessage, loading: false };
  }
};

/**
 * Load office locations data with error handling
 */
export const loadOfficeLocationsData = async () => {
  try {
    console.log('🎯 [LOADER] Loading office locations data...');
    const data = await getOfficeLocations();
    console.log('✅ [LOADER] Office locations data loaded successfully');
    return { data, error: null, loading: false };
  } catch (error) {
    console.error('❌ [LOADER] Office locations data failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load office locations';
    return { data: null, error: errorMessage, loading: false };
  }
};

/**
 * Load contact methods data with error handling
 */
export const loadContactMethodsData = async () => {
  try {
    console.log('🎯 [LOADER] Loading contact methods data...');
    const data = await getContactMethods();
    console.log('✅ [LOADER] Contact methods data loaded successfully');
    return { data, error: null, loading: false };
  } catch (error) {
    console.error('❌ [LOADER] Contact methods data failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load contact methods';
    return { data: null, error: errorMessage, loading: false };
  }
};

// =============================================================================
// MAIN API FUNCTION
// =============================================================================

/**
 * Get all contact page data from the API
 * This is the main function that should be called to load contact page data
 */
export const API_ContactPage = async (): Promise<ContactPageData> => {
  console.log('🚀 Loading contact page data...');
  
  try {
    // Get consolidated data from the API service
    const consolidatedData = await api.getContactPageData();
    
    // Transform the consolidated data to match our interface
    const contactPageData: ContactPageData = {
      contactInfo: {
        title: consolidatedData.contact?.title || 'Contact Pack Move Go',
        description: consolidatedData.contact?.description || 'Get in touch with us for professional moving services',
        mainPhone: consolidatedData.contact?.mainPhone || '(949) 414-5282',
        mainEmail: consolidatedData.contact?.mainEmail || 'info@packmovego.com',
        emergencyPhone: consolidatedData.contact?.emergencyPhone || '(949) 313-0123',
        website: consolidatedData.contact?.website || 'https://packmovego.com'
      },
      officeLocations: consolidatedData.contact?.locations || consolidatedData.contact?.officeLocations || [],
      contactMethods: consolidatedData.contact?.methods || consolidatedData.contact?.contactMethods || [
        {
          id: 'phone',
          title: 'Call Us',
          description: 'Speak with our team directly',
          primary: '(949) 414-5282',
          hours: 'Mon-Fri 8AM-6PM',
          icon: '📞',
          color: 'bg-blue-600'
        },
        {
          id: 'email',
          title: 'Email Us',
          description: 'Send us a message',
          primary: 'info@packmovego.com',
          icon: '✉️',
          color: 'bg-green-600'
        }
      ],
      contactForm: {
        title: consolidatedData.contact?.contactForm?.title || 'Send us a Message',
        description: consolidatedData.contact?.contactForm?.description || 'Fill out the form below and we\'ll get back to you',
        fields: consolidatedData.contact?.contactForm?.fields || []
      },
      faq: consolidatedData.contact?.faq || consolidatedData.contact?.faqs || [],
      businessHours: {
        title: consolidatedData.contact?.businessHours?.title || 'Business Hours',
        description: consolidatedData.contact?.businessHours?.description || 'We\'re here to help you move',
        hours: consolidatedData.contact?.businessHours?.hours || {
          monday: { open: 'Closed', close: 'Closed', status: 'closed' },
          tuesday: { open: 'Closed', close: 'Closed', status: 'closed' },
          wednesday: { open: 'Closed', close: 'Closed', status: 'closed' },
          thursday: { open: 'Closed', close: 'Closed', status: 'closed' },
          friday: { open: '8:00 AM', close: '6:00 PM', status: 'open' },
          saturday: { open: '9:00 AM', close: '4:00 PM', status: 'open' },
          sunday: { open: '10:00 AM', close: '3:00 PM', status: 'open' }
        },
        emergency: consolidatedData.contact?.businessHours?.emergency || 'For urgent matters, call our emergency line at (949) 313-0123'
      },
      lastUpdated: new Date().toISOString()
    };

    // Transform office locations if available
    if (consolidatedData.contact?.locations || consolidatedData.contact?.officeLocations) {
      const locations = consolidatedData.contact?.locations || consolidatedData.contact?.officeLocations || [];
      contactPageData.officeLocations = locations.map((location: any) => ({
        id: location.id || location._id || `location-${Math.random().toString(36).substr(2, 9)}`,
        name: location.name || 'Main Office',
        type: location.type || 'Main Office',
        address: {
          street: location.address?.street || 'TBA',
          city: location.address?.city || 'Orange County',
          state: location.address?.state || 'CA',
          zip: location.address?.zip || '92602',
          fullAddress: location.address?.fullAddress || 'TBA, Orange County, CA 92602'
        },
        phone: location.phone || '(949) 414-5282',
        email: location.email || 'info@packmovego.com',
        hours: location.hours || {},
        services: location.services || []
      }));
    }

    // Transform contact methods if available
    if (consolidatedData.contact?.methods || consolidatedData.contact?.contactMethods) {
      const methods = consolidatedData.contact?.methods || consolidatedData.contact?.contactMethods || [];
      contactPageData.contactMethods = methods.map((method: any) => ({
        id: method.id || method._id || `method-${Math.random().toString(36).substr(2, 9)}`,
        title: method.title || 'Contact Method',
        description: method.description || 'Get in touch with us',
        primary: method.primary || '(949) 414-5282',
        secondary: method.secondary,
        hours: method.hours,
        icon: method.icon || '📞',
        color: method.color || 'bg-blue-600'
      }));
    }

    // Transform FAQ data if available
    if (consolidatedData.contact?.faq || consolidatedData.contact?.faqs) {
      const faqs = consolidatedData.contact?.faq || consolidatedData.contact?.faqs || [];
      contactPageData.faq = faqs.map((faq: any) => ({
        question: faq.question || 'Frequently Asked Question',
        answer: faq.answer || 'Answer not available'
      }));
    }

    console.log('✅ Contact page data loaded successfully:', {
      contactInfo: !!contactPageData.contactInfo,
      officeLocations: contactPageData.officeLocations.length,
      contactMethods: contactPageData.contactMethods.length,
      contactForm: !!contactPageData.contactForm,
      faq: contactPageData.faq.length,
      businessHours: !!contactPageData.businessHours
    });

    return contactPageData;
  } catch (error) {
    console.error('❌ Failed to load contact page data:', error);
    // Let the error propagate to be handled by the main error handling system
    throw error;
  }
};

/**
 * Comprehensive Contact Page Data Controller with Modal Integration
 * Loads all data needed for the contact page including nav and contact info
 * Uses modal middleware for error handling
 */
export const getComprehensiveContactPageData = async () => {
  console.log('🚀 Loading comprehensive contact page data...');
  
  try {
    // Start tracking API calls for contact page (this resets previous tracking)
    api.startPageTracking('contact-page');
    
    // Define all routes that will be called for this page
    const contactPageRoutes = ['/v0/nav', '/v0/contact'];
    
    // First check health status - if it fails, all routes are considered 503
    try {
      await api.checkHealth();
    } catch (_healthError) { // Reserved for future use
      // Track all routes as failed since health check failed
      contactPageRoutes.forEach(route => {
        api.trackApiCall(route);
      });
      
      // Show modal with all routes as failed
      api.showApiFailureModal(contactPageRoutes, true);
      
      // Return empty data with 503 status
      return {
        nav: null,
        contact: null,
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Health check passed - proceed with individual route calls
    const [navData, contactData] = await Promise.allSettled([
      api.getNav(),
      api.getContact()
    ]);
    
    // Collect failed endpoints for this page only
    const failedEndpoints: string[] = [];
    let has503Error = false;
    
    // Check each endpoint result
    if (navData.status === 'rejected') {
      failedEndpoints.push('/v0/nav');
      if (navData.reason?.message?.includes('503')) has503Error = true;
    }
    if (contactData.status === 'rejected') {
      failedEndpoints.push('/v0/contact');
      if (contactData.reason?.message?.includes('503')) has503Error = true;
    }
    
    // Show modal only for this page's failed endpoints
    if (failedEndpoints.length > 0) {
      api.showApiFailureModal(failedEndpoints, has503Error);
    }
    
    const result = {
      nav: navData.status === 'fulfilled' ? navData.value : null,
      contact: contactData.status === 'fulfilled' ? contactData.value : null,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ Comprehensive contact page data loaded successfully:', {
      nav: !!result.nav,
      contact: !!result.contact,
      failedEndpoints: failedEndpoints
    });
    
    return result;
  } catch (error) {
    console.error('❌ Failed to load comprehensive contact page data:', error);
    throw error;
  }
};

// =============================================================================
// MODAL INTEGRATION FUNCTIONS
// =============================================================================

/**
 * Get the current modal props from the API service
 */
export const getApiFailureModalProps = () => {
  return api.getApiFailureModalProps();
};

/**
 * Get the ApiFailureModal component with middleware integration
 * This function returns the modal component that's managed by the middleware
 */
export const getApiFailureModalComponent = () => {
  return null; // Temporarily disabled for Next.js build
};

/**
 * Get current modal state
 */
export const getModalState = () => {
  return api.getModalState();
};

/**
 * Hide the API failure modal
 */
export const hideApiFailureModal = () => {
  api.hideApiFailureModal();
};

/**
 * Add a listener for modal state changes
 */
export const addModalStateListener = (listener: () => void) => {
  api.addModalStateListener(listener);
};

/**
 * Remove a listener for modal state changes
 */
export const removeModalStateListener = (listener: () => void) => {
  api.removeModalStateListener(listener);
};


// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Clear all cached contact page data
 */
export const clearContactPageCache = (): void => {
  contactPageCache.clear();
  console.log('🧹 Contact page cache cleared');
};

/**
 * Get cached data without making API calls
 */
export const getCachedContactPageData = (): Partial<ContactPageData> | null => {
  return {
    contactInfo: contactPageCache.get('contact_info') || null,
    officeLocations: contactPageCache.get('office_locations') || [],
    contactMethods: contactPageCache.get('contact_methods') || [],
    contactForm: contactPageCache.get('contact_form') || null,
    faq: contactPageCache.get('faq_data') || [],
    businessHours: contactPageCache.get('business_hours') || null
  };
};

/**
 * Check if contact page data is cached and not expired
 */
export const isContactPageDataCached = (): boolean => {
  return contactPageCache.get('contact_info') !== null;
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Main API Functions
  API_ContactPage,
  getComprehensiveContactPageData,
  
  // Individual Data Functions
  getContactInfo,
  getOfficeLocations,
  getContactMethods,
  getContactForm,
  getFAQData,
  getBusinessHours,
  loadContactInfoData,
  loadOfficeLocationsData,
  loadContactMethodsData,
  
  // Cache Management
  clearContactPageCache,
  getCachedContactPageData,
  isContactPageDataCached,
  
  // Modal Integration Functions
  getApiFailureModalProps,
  getApiFailureModalComponent,
  getModalState,
  hideApiFailureModal,
  addModalStateListener,
  removeModalStateListener
};
