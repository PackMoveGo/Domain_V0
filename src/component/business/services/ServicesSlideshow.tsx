import React, { useState, useEffect, useCallback } from "react";
import type { ServiceData } from "../../../util/serviceParser";
import { useNavigate } from "react-router-dom";
// import { styles } from "../../../styles/common"; // Reserved for future use
// import { api } from "../../../services/service.apiSW"; // Reserved for future use

const AUTO_ROTATE_INTERVAL = 5e3;

// Helper function to extract display values from objects
function getDisplay(val: any) {
  if (!val) return '';
  if (typeof val === 'object' && val.display) return val.display;
  if (typeof val === 'object') return JSON.stringify(val); // Fallback for objects without display
  return String(val);
}
interface ServicesSlideshowProps {
  services: ServiceData[];
}

export default function ServicesSlideshow({ services }: ServicesSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const navigate = useNavigate();

  // Debug logging in development only; ignore expected object fields and arrays
  useEffect(() => {
    if (!services || services.length === 0) return;
    const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'development';
    if (!isDev) return;

    const allowedObjectKeys = new Set(['price', 'duration', 'availability', 'meta']);

    services.forEach((service: ServiceData, index: number) => {
      if (service && typeof service === 'object') {
          Object.entries(service as unknown as Record<string, unknown>).forEach(([key, value]) => {
          if (value && typeof value === 'object') {
            if (Array.isArray(value)) return; // arrays are expected for fields like features
            if (allowedObjectKeys.has(key)) return; // these are expected to be objects
            console.debug(`Service ${index} has object value for key "${key}":`, value);
          }
        });
      }
    });
  }, [services]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % services.length);
  }, [services.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + services.length) % services.length);
  }, [services.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (!isAutoRotating || services.length <= 1) return;

    const interval = setInterval(nextSlide, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isAutoRotating, nextSlide, services.length]);

  const handleServiceClick = (service: ServiceData) => {
    if (service.link) {
      navigate(service.link);
    } else if (service.id) {
      navigate(`/services/${service.id}`);
    } else {
      navigate('/services');
    }
  };

  if (!services || services.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg font-medium">No services available</p>
          <p className="text-gray-500 text-sm mt-2">Please check back later</p>
        </div>
      </div>
    );
  }

  const currentService: ServiceData = services[currentIndex];

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Main Service Display */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-300">
        {/* Auto-rotate toggle */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white hover:shadow-lg transition-all duration-200 border border-gray-200"
          title={isAutoRotating ? "Pause auto-rotation" : "Resume auto-rotation"}
        >
          <span className="text-lg">
            {isAutoRotating ? "⏸️" : "▶️"}
          </span>
        </button>

        {/* Navigation arrows */}
        {services.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white hover:shadow-lg transition-all duration-200 border border-gray-200"
              title="Previous service"
            >
              <span className="text-xl font-bold text-gray-700">‹</span>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white hover:shadow-lg transition-all duration-200 border border-gray-200"
              title="Next service"
            >
              <span className="text-xl font-bold text-gray-700">›</span>
            </button>
          </>
        )}

        {/* Service Content */}
        <div
          className="cursor-pointer group"
          onClick={() => handleServiceClick(currentService)}
        >
          <div className="flex flex-col">
            {/* Service Icon */}
            <div className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex items-center justify-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              
              <div className="relative z-10">
                <div className="text-7xl lg:text-8xl mb-4 filter drop-shadow-lg">
                  {typeof currentService.icon === 'object' ? "🛠️" : (currentService.icon || "🛠️")}
                </div>
                <div className="text-white/80 text-sm font-medium text-center">
                  Professional Service
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="w-full p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {getDisplay(currentService.title) || 'Untitled Service'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {getDisplay(currentService.description) || 'No description available'}
                </p>
                
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                  {currentService.price && (
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
                      <span className="mr-2">💰</span>
                      {getDisplay(currentService.price)}
                    </div>
                  )}
                  {currentService.duration && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
                      <span className="mr-2">⏱️</span>
                      {getDisplay(currentService.duration)}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const serviceId = currentService.id || getDisplay(currentService.title).toLowerCase().replace(/\s+/g, '-');
                      const serviceName = encodeURIComponent(getDisplay(currentService.title));
                      navigate(`/booking?serviceId=${serviceId}&serviceName=${serviceName}`);
                    }}
                    className="group-hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform"
                  >
                    <span className="flex items-center">
                      Book Now
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceClick(currentService);
                    }}
                    className="group-hover:scale-105 bg-gray-600 border-2 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-700 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform"
                  >
                    <span className="flex items-center">
                      Learn More
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dots Indicator */}
      {services.length > 1 && (
        <div className="flex justify-center mt-8 space-x-3">
          {services.map((_, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 scale-125 shadow-lg"
                  : "bg-gray-300 hover:bg-gray-400 hover:scale-110"
              }`}
              title={`Go to service ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Enhanced Service Counter */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            Service <span className="text-blue-600 font-bold">{currentIndex + 1}</span> of <span className="text-gray-900 font-bold">{services.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
} 