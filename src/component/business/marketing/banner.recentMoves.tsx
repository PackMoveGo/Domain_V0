
import React, { useState, useEffect } from 'react';
import { styles } from '../../../styles/common';

interface RecentMove {
  id: string;
  customerName: string;
  customerInitials: string;
  moveDate: string;
  fromLocation: string;
  toLocation: string;
  moveType: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  rating?: number;
  testimonial?: string;
  isVerified: boolean;
}

interface RecentMovesProps {
  recentMoves?: RecentMove[];
  isLoading?: boolean;
  error?: string | null;
}

// No fallback data - show error message instead

export default function RecentMoves({ 
  recentMoves: propRecentMoves, 
  isLoading: propIsLoading, 
  error: propError 
}: RecentMovesProps = {}) {
  const [recentMoves, setRecentMoves] = useState<RecentMove[]>(propRecentMoves || []);
  const [isLoading, setIsLoading] = useState<boolean>(propIsLoading || true);
  const [_error, setError] = useState<string | null>(propError || null); // Reserved for future use

  // Update state when props change
  useEffect(() => {
    if (propRecentMoves !== undefined) {
      setRecentMoves(propRecentMoves);
    }
  }, [propRecentMoves]);

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getLocationString = (fromLocation: string, toLocation: string) => {
    return `${fromLocation} → ${toLocation}`;
  };

  if (isLoading) {
    return (
      <div className={`${styles.section.default} bg-gray-50`}>
        <div className={styles.container}>
          <div className="text-center mb-16">
            <h2 className={styles.heading.h2}>Recent Successful Moves</h2>
            <p className={`${styles.text.body} max-w-3xl mx-auto`}>
              Loading recent moves...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${styles.card.default} animate-pulse`}>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.section.default} bg-gray-50`}>
      <div className={styles.container}>
        <div className="text-center mb-16">
          <h2 className={styles.heading.h2}>Recent Successful Moves</h2>
          <p className={`${styles.text.body} max-w-3xl mx-auto`}>
            See what our customers are saying about their recent moves with us.
          </p>
        </div>
        
        {recentMoves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentMoves.map((move) => (
              <div key={move.id} className={`${styles.card.default} hover:shadow-lg transition-shadow duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {move.moveType}
                  </span>
                  <span className="text-gray-500 text-sm">{formatDate(move.moveDate)}</span>
                </div>
                
                <h3 className={`${styles.heading.h3} mb-2`}>
                  {getLocationString(move.fromLocation, move.toLocation)}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {move.rating && renderStars(move.rating)}
                    {move.rating && (
                      <span className="ml-2 text-sm text-gray-600">({move.rating}/5)</span>
                    )}
                  </div>
                  {move.isVerified && (
                    <span className="text-green-500 text-xs font-medium">✓ Verified</span>
                  )}
                </div>
                
                {move.testimonial && (
                  <p className={`${styles.text.description} italic`}>
                    "{move.testimonial}"
                  </p>
                )}
                
                <div className="mt-3 text-sm text-gray-500">
                  Customer: {move.customerName}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="text-yellow-600 text-4xl mr-3">⚠️</div>
                <h3 className="text-lg font-semibold text-yellow-800">Recent Moves Temporarily Unavailable</h3>
              </div>
              <p className="text-yellow-700 mb-4">
                Our Recent Moves is currently experiencing technical difficulties. Please use one of the alternative contact methods below.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:(949) 414-5282"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Call Us: (949) 414-5282
                </a>
                <a
                  href="mailto:info@packmovego.com"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
                >
                  Email Us: info@packmovego.com
                </a>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mt-12">
          <button className={`${styles.button.secondary} mr-4`}>
            View All Reviews
          </button>
          <button className={`${styles.button.primary}`}>
            Book Your Move
          </button>
        </div>
      </div>
    </div>
  );
}

RecentMoves.displayName = 'RecentMoves'; 