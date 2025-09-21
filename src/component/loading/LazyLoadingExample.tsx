import React from 'react';
import { useLazyServices, useLazyTestimonials, useLazyReviews } from '../../hook/useLazyApiHooks';
import { styles } from '../../styles/common';

export const LazyLoadingExample: React.FC = () => {
  // These hooks will only load data when the component comes into view
  const services = useLazyServices();
  const testimonials = useLazyTestimonials();
  const reviews = useLazyReviews();

  return (
    <div className="space-y-8">
      {/* Services Section - Only loads when scrolled into view */}
      <section ref={services.elementRef} className={styles.section.default}>
        <div className={styles.container}>
          <h2 className={styles.heading.h2}>Our Services</h2>
          
          {!services.hasIntersected && (
            <div className="text-center py-8">
              <p className="text-gray-500">Scroll down to load services...</p>
            </div>
          )}
          
          {services.hasIntersected && services.isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading services...</p>
            </div>
          )}
          
          {services.hasIntersected && services.error && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading services: {services.error}</p>
            </div>
          )}
          
          {services.hasIntersected && services.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.data.services?.map((service: any, index: number) => (
                <div key={index} className={styles.card.default}>
                  <h3 className={styles.heading.h3}>{service.title}</h3>
                  <p className={styles.text.body}>{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section - Only loads when scrolled into view */}
      <section ref={testimonials.elementRef} className={styles.section.default}>
        <div className={styles.container}>
          <h2 className={styles.heading.h2}>Customer Testimonials</h2>
          
          {!testimonials.hasIntersected && (
            <div className="text-center py-8">
              <p className="text-gray-500">Scroll down to load testimonials...</p>
            </div>
          )}
          
          {testimonials.hasIntersected && testimonials.isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading testimonials...</p>
            </div>
          )}
          
          {testimonials.hasIntersected && testimonials.error && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading testimonials: {testimonials.error}</p>
            </div>
          )}
          
          {testimonials.hasIntersected && testimonials.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.data.testimonials?.slice(0, 4).map((testimonial: any, index: number) => (
                <div key={index} className={styles.card.default}>
                  <p className={styles.text.body}>"{testimonial.comment || testimonial.content}"</p>
                  <div className="mt-4">
                    <p className={styles.heading.h3}>{testimonial.name}</p>
                    <p className={styles.text.description}>
                      {testimonial.service || testimonial.role || testimonial.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section - Only loads when scrolled into view */}
      <section ref={reviews.elementRef} className={styles.section.default}>
        <div className={styles.container}>
          <h2 className={styles.heading.h2}>Customer Reviews</h2>
          
          {!reviews.hasIntersected && (
            <div className="text-center py-8">
              <p className="text-gray-500">Scroll down to load reviews...</p>
            </div>
          )}
          
          {reviews.hasIntersected && reviews.isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading reviews...</p>
            </div>
          )}
          
          {reviews.hasIntersected && reviews.error && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading reviews: {reviews.error}</p>
            </div>
          )}
          
          {reviews.hasIntersected && reviews.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.data.reviews?.slice(0, 4).map((review: any, index: number) => (
                <div key={index} className={styles.card.default}>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                  </div>
                  <p className={styles.text.body}>{review.content}</p>
                  <div className="mt-4">
                    <p className={styles.heading.h3}>{review.customerName}</p>
                    <p className={styles.text.description}>{review.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Performance Summary */}
      <section className={styles.section.default}>
        <div className={styles.container}>
          <h2 className={styles.heading.h2}>Performance Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={styles.card.default}>
              <h3 className={styles.heading.h3}>🚀 Faster Initial Load</h3>
              <p className={styles.text.body}>
                API calls are only made when components come into view, reducing initial page load time.
              </p>
            </div>
            <div className={styles.card.default}>
              <h3 className={styles.heading.h3}>💰 Reduced Bandwidth</h3>
              <p className={styles.text.body}>
                Only loads data that users actually see, saving bandwidth and improving performance.
              </p>
            </div>
            <div className={styles.card.default}>
              <h3 className={styles.heading.h3}>🎯 Better UX</h3>
              <p className={styles.text.body}>
                Users see content immediately while data loads in the background when needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}; 