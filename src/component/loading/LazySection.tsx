import React, { useEffect } from 'react';
import { useIntersectionObserver } from '../../hook/useIntersectionObserver';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface LazySectionProps {
  sectionId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  preload?: boolean;
  className?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({
  sectionId,
  children,
  fallback,
  preload = false,
  className = ''
}) => {
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // No API calls - just show content when ready
  const shouldShow = preload || hasIntersected;

  // Show fallback while not ready
  if (!shouldShow) {
    return (
      <div ref={elementRef as any} className={`lazy-section ${className}`}>
        {fallback || <LoadingSpinner />}
      </div>
    );
  }

  // Show children when ready
  return (
    <div ref={elementRef as any} className={`lazy-section ${className}`}>
      {children}
    </div>
  );
}; 