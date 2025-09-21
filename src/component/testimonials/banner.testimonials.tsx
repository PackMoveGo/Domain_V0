
import { useState, useEffect, useCallback } from 'react';
import { styles } from "../../styles/common";
import { useLazyTestimonials } from '../../hook/useLazyApiHooks';

interface Testimonial {
  id: number;
  name: string;
  comment?: string;
  content?: string;
  service?: string;
  role?: string;
  location?: string;
  image?: string;
  rating?: number;
  date?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  isLoading?: boolean;
  error?: string | null;
}

const AUTO_ROTATE_INTERVAL = 5000; // 5 seconds

export default function Testimonials({ 
  testimonials: propTestimonials, 
  isLoading: propIsLoading, 
  error: propError 
}: TestimonialsProps = {}) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Use lazy loading hook for testimonials (only if no props provided)
  const { 
    data, 
    error, 
    isLoading, 
    hasIntersected, 
    elementRef 
  } = useLazyTestimonials();
  
  // Use props if provided, otherwise use hook data
  const testimonials = propTestimonials || (data?.testimonials || []) as Testimonial[];
  const isLoadingData = propIsLoading !== undefined ? propIsLoading : isLoading;
  const errorData = propError !== undefined ? propError : error;

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto-rotation effect
  useEffect(() => {
    if (isPaused || testimonials.length === 0) return;
    const interval = setInterval(nextTestimonial, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [nextTestimonial, isPaused, testimonials.length]);

  // Show loading state when component is in view but data is loading
  if (hasIntersected && isLoadingData) {
    return (
      <div ref={elementRef as any} className={`${styles.section.default} bg-gray-50`}>
        <div className={styles.container}>
          <div className="text-center mb-12">
            <h2 className={styles.heading.h2}>What Our Customers Say</h2>
            <p className={styles.text.description}>
              Don't just take our word for it. Here's what our satisfied customers have to say about their moving experience with us.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading testimonials...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if API call failed
  if (hasIntersected && errorData) {
    return (
      <div ref={elementRef as any} className={`${styles.section.default} bg-gray-50`}>
        <div className={styles.container}>
          <div className="text-center mb-12">
            <h2 className={styles.heading.h2}>What Our Customers Say</h2>
            <p className={styles.text.description}>
              Don't just take our word for it. Here's what our satisfied customers have to say about their moving experience with us.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="text-yellow-600 text-4xl mr-3">⚠️</div>
                <h3 className="text-lg font-semibold text-yellow-800">Testimonials Temporarily Unavailable</h3>
              </div>
              <p className="text-yellow-700 mb-4">
                We're experiencing technical difficulties loading our services. Please contact us directly for information about our coverage areas.
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
        </div>
      </div>
    );
  }

  // Show empty state if no testimonials available
  if (hasIntersected && testimonials.length === 0) {
    return (
      <div ref={elementRef as any} className={`${styles.section.default} bg-gray-50`}>
        <div className={styles.container}>
          <div className="text-center mb-12">
            <h2 className={styles.heading.h2}>What Our Customers Say</h2>
            <p className={styles.text.description}>
              Don't just take our word for it. Here's what our satisfied customers have to say about their moving experience with us.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="text-center text-gray-500">
              <p>No testimonials available at this time.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show placeholder when component is not yet in view
  if (!hasIntersected) {
    return (
      <div ref={elementRef as any} className={`${styles.section.default} bg-gray-50`}>
        <div className={styles.container}>
          <div className="text-center mb-12">
            <h2 className={styles.heading.h2}>What Our Customers Say</h2>
            <p className={styles.text.description}>
              Don't just take our word for it. Here's what our satisfied customers have to say about their moving experience with us.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="text-yellow-600 text-4xl mr-3">⚠️</div>
                <h3 className="text-lg font-semibold text-yellow-800">Testimonials Temporarily Unavailable</h3>
              </div>
              <p className="text-yellow-700 mb-4">
                We're experiencing technical difficulties loading our services. Please contact us directly for information about our coverage areas.
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
        </div>
      </div>
    );
  }

  return (
    <div ref={elementRef as any} className={`${styles.section.default} bg-gray-50`}>
      <div className={styles.container}>
        <div className="text-center mb-12">
          <h2 className={styles.heading.h2}>What Our Customers Say</h2>
          <p className={styles.text.description}>
            Don't just take our word for it. Here's what our satisfied customers have to say about their moving experience with us.
          </p>
          
          {/* Form Temporarily Unavailable Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <div className="text-yellow-600 text-2xl mr-2">⚠️</div>
              <h3 className="text-lg font-semibold text-yellow-800">Form Temporarily Unavailable</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              Our contact form is currently experiencing technical difficulties. Please use one of the alternative contact methods below.
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

        <div className="max-w-3xl mx-auto">
          <div className="relative"
               onMouseEnter={() => setIsPaused(true)}
               onMouseLeave={() => setIsPaused(false)}>
            {/* Desktop Navigation Arrows */}
            <div className="absolute inset-y-0 -left-5 -right-5 hidden md:flex items-center justify-between pointer-events-none z-10">
              <button
                onClick={prevTestimonial}
                className={`${styles.button.secondary} flex items-center justify-center w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0 pointer-events-auto transform -translate-x-2`}
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextTestimonial}
                className={`${styles.button.secondary} flex items-center justify-center w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0 pointer-events-auto transform translate-x-2`}
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id || index}
                className={
                  `transition-all duration-500 ease-in-out ${index === currentTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 absolute top-0 left-0 right-0'}`
                }
              >
                <div className={`${styles.card.default} min-h-[200px]`}>
                  <div className="h-[120px] overflow-y-auto mb-4">
                    "{testimonial.comment || testimonial.content}"
                  </div>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0">
                      {testimonial.image && (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className={styles.heading.h3}>
                        {testimonial.name}
                      </div>
                      <div className={styles.text.description}>
                        {testimonial.service || testimonial.role || testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Navigation Buttons */}
            <div className="flex justify-center gap-20 md:hidden mt-6">
              <button
                onClick={prevTestimonial}
                className={`${styles.button.secondary} flex items-center justify-center w-12 h-12 rounded-full shadow-md hover:shadow-lg active:shadow-inner transition-all duration-200`}
                aria-label="Previous testimonial"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextTestimonial}
                className={`${styles.button.secondary} flex items-center justify-center w-12 h-12 rounded-full shadow-md hover:shadow-lg active:shadow-inner transition-all duration-200`}
                aria-label="Next testimonial"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  index === currentTestimonial ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add displayName for React DevTools
Testimonials.displayName = 'Testimonials'; 