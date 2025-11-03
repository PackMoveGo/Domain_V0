import React, { FC } from 'react';
import { useOfflineStatus } from '../../hook/useOfflineStatus';
import { FormData } from './form.quote';

export interface QuoteFormSectionProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onQuoteSubmit: (data: FormData) => void;
}

const QuoteFormSection: FC<QuoteFormSectionProps> = ({
  formData,
  onChange,
  onSubmit,
  onQuoteSubmit
}) => {
  const { isOnline } = useOfflineStatus();
  
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Get Your Free Quote</h2>
          <p className="text-center text-gray-600 mb-8">Fill out the form and a team member will follow up with you</p>
          
          {!isOnline ? (
            <div className="text-center py-12">
              <div className="text-6xl font-bold text-red-600 mb-4">503</div>
              <p className="text-lg text-gray-600">Service temporarily unavailable. Please try again later.</p>
            </div>
          ) : (
            <>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fromZip" className="block text-sm font-medium text-gray-700 mb-1">Moving From Zip Code</label>
                    <input
                      type="text"
                      id="fromZip"
                      name="fromZip"
                      value={formData.fromZip}
                      onChange={onChange}
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
                      onChange={onChange}
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
                      onChange={onChange}
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
                      onChange={onChange}
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
                      onChange={onChange}
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
                      onChange={onChange}
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
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Submit
                </button>
              </form>
              {isOnline && (
                <p className="text-center text-gray-600 mt-4">Someone from our team will be reaching out soon!</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
QuoteFormSection.displayName = 'QuoteFormSection';

export default QuoteFormSection;