import React from 'react';
import { formatPhoneNumber } from '../../../util/contactParser';

interface BusinessHours {
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

interface ContactInfo {
  emergencyPhone: string;
}

interface BusinessHoursProps {
  businessHours: BusinessHours;
  contactInfo: ContactInfo;
  isLoading?: boolean;
  error?: string | null;
}

const BusinessHoursSection: React.FC<BusinessHoursProps> = ({ 
  businessHours, 
  contactInfo,
  isLoading, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-64"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
            <div className="space-y-3">
              {[...Array(7)].map((_, index) => (
                <div key={index} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-40"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg p-8">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">Unable to load business hours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{businessHours.title}</h2>
      <p className="text-gray-600 mb-6">{businessHours.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Regular Hours</h3>
          <div className="space-y-3">
            {Object.entries(businessHours.hours || {}).map(([day, hours]: [string, any]) => (
              <div key={day} className="flex justify-between">
                <span className="capitalize text-gray-700">{day}</span>
                <span className={`font-medium ${hours?.status === 'closed' ? 'text-red-600' : 'text-gray-900'}`}>
                  {hours?.open === 'Closed' ? 'Closed' : `${hours?.open || 'TBA'} - ${hours?.close || 'TBA'}`}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Emergency Support</h3>
          <p className="text-gray-600 mb-4">{businessHours.emergency}</p>
          <a
            href={`tel:${contactInfo.emergencyPhone}`}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-block"
          >
            Call Emergency Line
          </a>
        </div>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
BusinessHoursSection.displayName = 'BusinessHoursSection';

export default BusinessHoursSection;
