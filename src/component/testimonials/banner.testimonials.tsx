import React from 'react';
import Testimonial from './Testimonial';

interface TestimonialsProps {
  testimonials?: any[];
  isLoading?: boolean;
  error?: string | null;
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials, isLoading, error }) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state (including 503 errors)
  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Service Temporarily Unavailable
              </h3>
              <p className="text-yellow-700 mb-6">
                We're experiencing technical difficulties loading our services. Please contact us directly for information about our coverage areas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:(949) 414-5282"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Call Us: (949) 414-5282
                </a>
                <a
                  href="mailto:info@packmovego.com"
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
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

  // Handle empty testimonials
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 mb-8">No testimonials available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render testimonials
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about our moving services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote || testimonial.text || testimonial.content || 'Great service!'}
              author={testimonial.author || testimonial.name || testimonial.customer}
              role={testimonial.role || testimonial.title || testimonial.location}
              rating={testimonial.rating || testimonial.stars || 5}
            />
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <div className="bg-blue-600 text-white rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Ready to Experience Great Service?</h3>
            <p className="mb-6">Join our satisfied customers and let us help you with your next move.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/booking"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Free Quote
              </a>
              <a
                href="/contact"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;