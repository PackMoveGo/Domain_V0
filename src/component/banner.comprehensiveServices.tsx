import React from 'react';
import { styles } from '../styles/common';

interface ComprehensiveServicesProps {
  className?: string;
}

export default function ComprehensiveServices({ className = '' }: ComprehensiveServicesProps) {
  return (
    <div className={`${styles.section.default} ${className}`}>
      <div className={styles.container}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Comprehensive Services</h2>
            <p className="text-lg text-gray-600">
              From packing to unpacking, we handle every aspect of your move
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-600 mb-4">Residential Moving</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Local and long-distance moves
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Apartment and house relocations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Packing and unpacking services
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Furniture disassembly and assembly
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-600 mb-4">Commercial Moving</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Office relocations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Equipment and machinery moving
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  After-hours moving services
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Storage solutions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ComprehensiveServices.displayName = 'ComprehensiveServices';
