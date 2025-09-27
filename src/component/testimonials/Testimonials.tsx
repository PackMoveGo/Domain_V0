import React from 'react';

interface TestimonialsProps {
  testimonials?: any;
  isLoading?: boolean;
  error?: string | null;
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials, isLoading, error }) => {
  // Temporarily disabled for Next.js build
  return <div>Testimonials temporarily disabled</div>;
};

export default Testimonials;
