
import React, { useState, useEffect } from 'react';
import { styles } from '../../../styles/common';

interface StatItem {
  number: string;
  label: string;
  icon: string;
}

interface StatisticsProps {
  totalMoves?: number;
  isLoading?: boolean;
  error?: string | null;
}

export default function Statistics({ 
  totalMoves: propTotalMoves, 
  isLoading: propIsLoading, 
  error: propError 
}: StatisticsProps = {}) {
  const [totalMoves, setTotalMoves] = useState<number>(propTotalMoves || 5000);
  const [isLoading, setIsLoading] = useState(propIsLoading || false);
  const [error, setError] = useState<string | null>(propError || null);

  // Update state when props change
  useEffect(() => {
    if (propTotalMoves !== undefined) {
      setTotalMoves(propTotalMoves);
    }
  }, [propTotalMoves]);

  useEffect(() => {
    if (propIsLoading !== undefined) {
      setIsLoading(propIsLoading);
    }
  }, [propIsLoading]);

  useEffect(() => {
    if (propError !== undefined) {
      setError(propError);
    }
  }, [propError]);

  // No API calls - only use props data

  const stats: StatItem[] = [
    {
      number: error && (error.includes('503') || error.includes('Service Unavailable')) 
        ? '503+' 
        : isLoading ? '...' : `${totalMoves.toLocaleString()}+`,
      label: 'Successful Moves',
      icon: '🚚'
    },
    {
      number: '98%',
      label: 'Customer Satisfaction',
      icon: '⭐'
    },
    {
      number: '24/7',
      label: 'Customer Support',
      icon: '📞'
    },
    {
      number: '100%',
      label: 'Licensed & Insured',
      icon: '🛡️'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
      <div className={styles.container}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Our track record speaks for itself. We've helped thousands of families and businesses move with confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                stat.number === '503+' 
                  ? 'text-red-300' 
                  : 'text-white'
              }`}>
                {stat.number}
              </div>
              <div className="text-blue-100 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Statistics.displayName = 'Statistics'; 