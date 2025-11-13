
import React, { useState /* , useEffect */ } from 'react'; // useEffect reserved for future use
import { useNavigate } from 'react-router-dom';
import { useApiStatus } from '../../hook/useApiStatus';
import { api } from '../../services/service.apiSW';

export interface FormData {
  fromZip: string;
  toZip: string;
  moveDate: string;
  rooms: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface QuoteFormProps {
  onSubmit?: (data: FormData) => void;
}

export default function QuoteForm({ onSubmit }: QuoteFormProps) {
  const navigate = useNavigate();
  const { isOnline } = useApiStatus();
  const [formData, setFormData] = useState<FormData>({
    fromZip: '',
    toZip: '',
    moveDate: '',
    rooms: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
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
        setFormData({
          fromZip: '',
          toZip: '',
          moveDate: '',
          rooms: '',
          firstName: '',
          lastName: '',
          phone: '',
          email: ''
        });
        console.log('✅ Quote submitted successfully:', response);
        
        // Show success message for 3 seconds, then navigate
        setTimeout(() => {
          navigate('/booking');
        }, 3000);
      } else {
        setSubmitError(response.message || 'Failed to submit quote request');
      }
    } catch (error) {
      console.error('❌ Quote submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit quote. Please try again or call us directly.');
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
                <div>
                  <label htmlFor="fromZip" className="block text-sm font-medium text-gray-700 mb-1">Moving From Zip Code</label>
                  <input
                    type="text"
                    id="fromZip"
                    name="fromZip"
                    value={formData.fromZip}
                    onChange={handleChange}
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
                  <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                  <input
                    type="text"
                    id="rooms"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
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
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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