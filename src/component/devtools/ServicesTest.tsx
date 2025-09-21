import React from 'react';
import BackendConnectionTest from './BackendConnectionTest';

const ServicesTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Services Test Page
          </h1>
          <p className="text-gray-600">
            This page is used for testing services and backend connections.
          </p>
        </div>
        
        <BackendConnectionTest />
      </div>
    </div>
  );
};

export default ServicesTest;
