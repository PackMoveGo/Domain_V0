
import React, { useState /* , useEffect */ } from 'react'; // useEffect reserved for future use
import { useNavigate } from 'react-router-dom';
import { useApiStatus } from '../../hook/useApiStatus';
import { api } from '../../services/service.apiSW';
import { useServicesData } from '../../util/serviceParser';

export interface FormData {
  fromZip: string;
  toZip: string;
  moveDate: string;
  rooms: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  serviceId?: string;
}

interface QuoteFormProps {
  onSubmit?: (data: FormData) => void;
}

export default function QuoteForm({ onSubmit }: QuoteFormProps) {
  const navigate = useNavigate();
  const { isOnline } = useApiStatus();
  const { services } = useServicesData();
  
  // Load cached form data from localStorage
  const loadCachedFormData = (): FormData => {
    try {
      const cached = localStorage.getItem('quoteFormData');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 24 hours old
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached form data:', error);
    }
    return {
    fromZip: '',
    toZip: '',
    moveDate: '',
    rooms: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    serviceId: ''
    };
  };
  
  const [formData, setFormData] = useState<FormData>(loadCachedFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  // Check quote submission limit on mount
  React.useEffect(() => {
    const checkLimit = async () => {
      try {
        const response = await api.checkQuoteLimit();
        if (response && response.success) {
          setCanSubmit(response.canSubmit);
          if (!response.canSubmit) {
            setRateLimitMessage(response.message || 'You have already submitted a quote recently');
          }
        }
      } catch (error) {
        console.warn('Failed to check quote limit:', error);
        // Allow submission if check fails
        setCanSubmit(true);
      }
    };
    
    checkLimit();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let newFormData = { ...formData };
    
    // Handle zip code validation - only allow 5 digits
    if (name === 'fromZip' || name === 'toZip') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 5) {
        newFormData[name] = digitsOnly;
      } else {
        return; // Don't update if exceeds 5 digits
      }
    }
    // Handle phone number formatting - (XXX) XXX-XXXX
    else if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        let formatted = digitsOnly;
        if (digitsOnly.length >= 3) {
          formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
        }
        if (digitsOnly.length >= 6) {
          formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
        }
        newFormData[name] = formatted;
      } else {
        return; // Don't update if exceeds 10 digits
      }
    }
    // Handle rooms - only numbers, max 50
    else if (name === 'rooms') {
      const numValue = parseInt(value) || '';
      if (numValue === '' || (numValue >= 1 && numValue <= 50)) {
        newFormData[name] = value;
      } else {
        return; // Don't update if invalid
      }
    } else {
      newFormData[name] = value;
    }
    
    setFormData(newFormData);
    
    // Cache form data to localStorage
    try {
      localStorage.setItem('quoteFormData', JSON.stringify({
        data: newFormData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache form data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Check rate limit before submitting
    if (!canSubmit) {
      setSubmitError(rateLimitMessage || 'You can only submit a quote once every 3 days');
      return;
    }
    
    // Call the onSubmit prop if provided
    if (onSubmit) {
      onSubmit(formData);
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit to MongoDB-backed API
      const response = await api.submitQuote(formData);
      
      if (response.success) {
        setSubmitSuccess(true);
        setCanSubmit(false); // Prevent resubmission
        setRateLimitMessage('You can submit another quote in 3 days');
        
        // Clear cached form data on successful submission
        try {
          localStorage.removeItem('quoteFormData');
        } catch (error) {
          console.warn('Failed to clear cached form data:', error);
        }
        
        setFormData({
          fromZip: '',
          toZip: '',
          moveDate: '',
          rooms: '',
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          serviceId: ''
        });
        console.log('✅ Quote submitted successfully:', response);
        
        // Show success message for 3 seconds, then navigate
        setTimeout(() => {
          navigate('/booking');
        }, 3000);
      } else {
        setSubmitError(response.message || 'Failed to submit quote request');
      }
    } catch (error: any) {
      console.error('❌ Quote submission error:', error);
      
      // Extract detailed error message
      let errorMsg = 'Failed to submit quote. Please try again or call us directly.';
      
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      // If there's a response with errors array, show those
      if (error.errors && Array.isArray(error.errors)) {
        errorMsg = error.errors.join('. ');
      }
      
      // Check if it's a rate limit error (429)
      if (errorMsg.includes('3 days') || errorMsg.includes('429')) {
        setCanSubmit(false);
        setRateLimitMessage(errorMsg);
      }
      
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Get Your Free Quote</h2>
          <p className="text-center text-gray-600 mb-8">Fill out the form and a team member will follow up with you</p>
          
          {submitSuccess ? (
            <div className="text-center py-12">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quote Request Submitted!</h3>
              <p className="text-lg text-gray-600 mb-4">Thank you! We'll contact you soon with your free quote.</p>
              <p className="text-sm text-gray-500">Redirecting to booking page...</p>
            </div>
          ) : !isOnline ? (
            <div className="text-center py-12">
              <div className="text-6xl font-bold text-red-600 mb-4">503</div>
              <p className="text-lg text-gray-600">Service temporarily unavailable. Please try again later.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services && services.length > 0 && (
                  <div className="md:col-span-2">
                    <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Needed <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="serviceId"
                      name="serviceId"
                      value={formData.serviceId || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a Service</option>
                      {services.map((service) => {
                        const serviceTitle = typeof service.title === 'object' && service.title?.display 
                          ? service.title.display 
                          : typeof service.title === 'string' 
                          ? service.title 
                          : 'Untitled Service';
                        const serviceId = service.id || serviceTitle.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <option key={serviceId} value={serviceId}>
                            {serviceTitle}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <label htmlFor="fromZip" className="block text-sm font-medium text-gray-700 mb-1">
                    Moving From Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fromZip"
                    name="fromZip"
                    value={formData.fromZip}
                    onChange={handleChange}
                    placeholder="92660"
                    maxLength={5}
                    pattern="\d{5}"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="toZip" className="block text-sm font-medium text-gray-700 mb-1">Moving to Zip Code</label>
                  <input
                    type="text"
                    id="toZip"
                    name="toZip"
                    value={formData.toZip}
                    onChange={handleChange}
                    placeholder="92660"
                    maxLength={5}
                    pattern="\d{5}"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="moveDate" className="block text-sm font-medium text-gray-700 mb-1">Moving Date</label>
                  <input
                    type="date"
                    id="moveDate"
                    name="moveDate"
                    value={formData.moveDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Rooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="rooms"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    placeholder="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    minLength={2}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(949) 555-1234"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            </form>
          )}
          
          {!submitSuccess && isOnline && (
            <p className="text-center text-gray-600 mt-4">Someone from our team will be reaching out soon!</p>
          )}
        </div>
      </div>
    </section>
  );
}

// Add displayName for React DevTools
QuoteForm.displayName = 'QuoteForm'; 