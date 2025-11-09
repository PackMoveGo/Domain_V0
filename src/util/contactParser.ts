import { api } from '../services/service.apiSW';
import { getCurrentDate } from './ssrUtils';

export interface ContactInfo {
  title: string;
  description: string;
  mainPhone: string;
  mainEmail: string;
  emergencyPhone: string;
  website: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
}

export interface OfficeHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OfficeLocation {
  id: number;
  name: string;
  type: string;
  address: Address;
  phone: string;
  email: string;
  hours: OfficeHours;
  services: string[];
  coordinates: Coordinates;
}

export interface ContactMethod {
  id: number;
  title: string;
  description: string;
  icon: string;
  primary: string;
  secondary: string;
  hours: string;
  color: string;
}

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options?: FormFieldOption[];
}

export interface ContactForm {
  title: string;
  description: string;
  fields: FormField[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface BusinessHour {
  open: string;
  close: string;
  status: string;
}

export interface BusinessHours {
  title: string;
  description: string;
  hours: {
    monday: BusinessHour;
    tuesday: BusinessHour;
    wednesday: BusinessHour;
    thursday: BusinessHour;
    friday: BusinessHour;
    saturday: BusinessHour;
    sunday: BusinessHour;
  };
  emergency: string;
}

export interface ContactData {
  contactInfo: ContactInfo;
  officeLocations: OfficeLocation[];
  contactMethods: ContactMethod[];
  contactForm: ContactForm;
  faq: FAQ[];
  businessHours: BusinessHours;
}

export async function fetchContactData(): Promise<ContactData> {
  try {
    // Use the correct API method
    const data = await api.getContact() as ContactData;
    return data;
  } catch (error) {
    console.error('Error loading contact data:', error);
    
    // Check if it's a 503 error and throw it to be handled by the page
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      throw error;
    }
    
    console.log('🔄 Using fallback contact data for development');
    
    // Return fallback data for other errors
    return getFallbackContactData();
  }
}

// Fallback contact data for development when API is not available
function getFallbackContactData(): ContactData {
  return {
    contactInfo: {
      title: 'Contact Pack Move Go',
      description: 'Get in touch with us for professional moving services in Orange County. We\'re here to help make your move smooth and stress-free.',
      mainPhone: '(949) 414-5282',
      mainEmail: 'info@packmovego.com',
      emergencyPhone: '(949) 313-0123',
      website: 'https://packmovego.com'
    },
    officeLocations: [
      {
        id: 1,
        name: 'Main Office',
        type: 'Headquarters',
        address: {
          street: '1369 Adams Ave',
          city: 'Costa Mesa',
          state: 'CA',
          zip: '92626',
          fullAddress: '1369 Adams Ave, Costa Mesa, CA 92626'
        },
        phone: '(949) 313-0123',
        email: 'info@packmovego.com',
        coordinates: {
          lat: 33.6846,
          lng: -117.8265
        },
        hours: {
          monday: '8:00 AM - 6:00 PM',
          tuesday: '8:00 AM - 6:00 PM',
          wednesday: '8:00 AM - 6:00 PM',
          thursday: '8:00 AM - 6:00 PM',
          friday: '8:00 AM - 6:00 PM',
          saturday: '9:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        services: ['Local Moving', 'Long Distance', 'Packing']
      },
      {
        id: 2,
        name: 'Santa Ana Branch',
        type: 'Service Center',
        address: {
          street: 'TBA',
          city: 'Santa Ana',
          state: 'CA',
          zip: '92701',
          fullAddress: 'TBA, Santa Ana, CA 92701'
        },
        phone: 'TBA',
        email: 'santana@packmovego.com',
        coordinates: {
          lat: 33.7455,
          lng: -117.8677
        },
        hours: {
          monday: 'TBA',
          tuesday: 'TBA',
          wednesday: 'TBA',
          thursday: 'TBA',
          friday: 'TBA',
          saturday: 'TBA',
          sunday: 'TBA'
        },
        services: ['Local Moving', 'Packing', 'Furniture Assembly', 'Storage']
      }
    ],
    contactMethods: [
      {
        id: 1,
        title: 'Call Us',
        description: 'Speak with our moving specialists',
        icon: '📞',
        color: 'bg-blue-600',
        primary: '(949) 414-5282',
        secondary: 'Mon-Fri 8AM-6PM',
        hours: 'Available 7 days a week'
      },
      {
        id: 2,
        title: 'Email Us',
        description: 'Send us a detailed message',
        icon: '✉️',
        color: 'bg-green-600',
        primary: 'info@packmovego.com',
        secondary: 'We respond within 2 hours',
        hours: '24/7 support'
      },
      {
        id: 3,
        title: 'Visit Us',
        description: 'Come to our office',
        icon: '🏢',
        color: 'bg-purple-600',
        primary: 'TBA',
        secondary: 'Location coming soon',
        hours: 'Contact us for hours'
      },
      {
        id: 4,
        title: 'Emergency',
        description: 'Urgent moving needs',
        icon: '🚨',
        color: 'bg-red-600',
        primary: '(949) 313-0123',
        secondary: '24/7 emergency line',
        hours: 'Always available'
      }
    ],
    contactForm: {
      title: 'Send us a Message',
      description: 'Fill out the form below and we\'ll get back to you within 2 hours',
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Enter your full name',
          required: true
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'Enter your email address',
          required: true
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          placeholder: 'Enter your phone number',
          required: true
        },
        {
          name: 'moveType',
          label: 'Type of Move',
          type: 'select',
          placeholder: 'Select move type',
          required: true,
          options: [
            { value: 'local', label: 'Local Move' },
            { value: 'long-distance', label: 'Long Distance Move' },
            { value: 'commercial', label: 'Commercial Move' },
            { value: 'storage', label: 'Storage' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          name: 'moveDate',
          label: 'Preferred Move Date',
          type: 'date',
          placeholder: 'Select your preferred date',
          required: false
        },
        {
          name: 'message',
          label: 'Additional Details',
          type: 'textarea',
          placeholder: 'Tell us about your moving needs, special requirements, or any questions you have...',
          required: false
        }
      ]
    },
    faq: [
      {
        question: 'How much does a move cost?',
        answer: 'Our pricing depends on several factors including distance, size of your home, and services needed. We provide free, no-obligation quotes to give you an accurate estimate.'
      },
      {
        question: 'How far in advance should I book?',
        answer: 'We recommend booking at least 2-4 weeks in advance, especially during peak moving season (May-September). However, we can often accommodate last-minute moves.'
      },
      {
        question: 'Do you provide packing services?',
        answer: 'Yes! We offer full packing services, partial packing, or you can pack yourself. Our professional packers use high-quality materials to ensure your belongings are safe.'
      },
      {
        question: 'Are you licensed and insured?',
        answer: 'Absolutely. We are fully licensed and insured. We carry comprehensive liability insurance and workers\' compensation to protect you and your belongings.'
      },
      {
        question: 'What areas do you serve?',
        answer: 'We serve all of Orange County and surrounding areas. We also provide long-distance moving services throughout California and beyond.'
      },
      {
        question: 'Do you offer storage solutions?',
        answer: 'Yes, we have partnerships with secure storage facilities and can help coordinate storage for your belongings if needed during your move.'
      }
    ],
    businessHours: {
      title: 'Business Hours',
      description: 'We\'re here to help you move',
      hours: {
        monday: { open: 'Closed', close: 'Closed', status: 'closed' },
        tuesday: { open: 'Closed', close: 'Closed', status: 'closed' },
        wednesday: { open: 'Closed', close: 'Closed', status: 'closed' },
        thursday: { open: 'Closed', close: 'Closed', status: 'closed' },
        friday: { open: '8:00 AM', close: '6:00 PM', status: 'open' },
        saturday: { open: '9:00 AM', close: '4:00 PM', status: 'open' },
        sunday: { open: '10:00 AM', close: '3:00 PM', status: 'open' }
      },
      emergency: 'For urgent matters, call our emergency line at (949) 313-0123'
    }
  };
}

// Utility functions for contact page
export function formatPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return 'N/A';
  }
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format as +X (XXX) XXX-XXXX for 11 digits
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function validateContactForm(formData: Record<string, string>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!formData || typeof formData !== 'object') {
    return {
      isValid: false,
      errors: { general: 'Invalid form data' }
    };
  }
  
  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!formData.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (formData.phone && !/^[+]?[1-9]\d{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (!formData.serviceType?.trim()) {
    errors.serviceType = 'Please select a service type';
  }
  
  if (!formData.subject?.trim()) {
    errors.subject = 'Subject is required';
  }
  
  if (!formData.message?.trim()) {
    errors.message = 'Message is required';
  } else if (formData.message.length < 10) {
    errors.message = 'Message must be at least 10 characters long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function getCurrentBusinessStatus(): { isOpen: boolean; nextOpen: string; currentDay: string } {
  try {
    const now = getCurrentDate();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Business is closed Monday-Thursday, open Friday-Sunday
    const isOpen = currentDay === 'friday' || currentDay === 'saturday' || currentDay === 'sunday';
    
    // Determine next open time
    let nextOpen = 'Contact us for hours';
    if (currentDay === 'monday' || currentDay === 'tuesday' || currentDay === 'wednesday' || currentDay === 'thursday') {
      nextOpen = 'Friday 8:00 AM';
    } else if (currentDay === 'friday') {
      nextOpen = 'Saturday 9:00 AM';
    } else if (currentDay === 'saturday') {
      nextOpen = 'Sunday 10:00 AM';
    } else if (currentDay === 'sunday') {
      nextOpen = 'Friday 8:00 AM';
    }
    
    return { 
      isOpen, 
      nextOpen, 
      currentDay 
    };
  } catch (error) {
    console.warn('Error getting current business status:', error);
    return { 
      isOpen: false, 
      nextOpen: 'Contact us for hours', 
      currentDay: 'unknown' 
    };
  }
}

export function generateGoogleMapsUrl(address: string): string {
  if (!address || typeof address !== 'string') {
    return 'https://www.google.com/maps';
  }
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

export function generateDirectionsUrl(fromAddress: string, toAddress: string): string {
  if (!toAddress || typeof toAddress !== 'string') {
    return 'https://www.google.com/maps';
  }
  const encodedFrom = encodeURIComponent(fromAddress || '');
  const encodedTo = encodeURIComponent(toAddress);
  return `https://www.google.com/maps/dir/${encodedFrom}/${encodedTo}`;
}