import React from 'react';

interface OurStoryProps {
  // Add any props if needed in the future
}

const OurStory: React.FC<OurStoryProps> = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Founded in Orange County, Pack Move Go began with a simple mission: to make moving stress-free and reliable for families and businesses.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">From Local Roots to Regional Excellence</h3>
              <p className="text-gray-700 mb-4">
                What started as a small local moving company has grown into Orange County's trusted partner for all moving needs. Our journey began with a commitment to exceptional service and has evolved into a comprehensive moving solution.
              </p>
              <p className="text-gray-700 mb-4">
                We understand that moving is more than just transporting boxes—it's about helping families and businesses transition to new chapters in their lives. That's why we've built our reputation on reliability, care, and personalized service.
              </p>
              <p className="text-gray-700">
                Today, we serve the entire Orange County area with the same dedication and attention to detail that we had when we first started.
              </p>
            </div>
            <div className="bg-blue-100 p-8 rounded-lg">
              <h4 className="text-xl font-semibold text-blue-800 mb-4">Our Growth</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Started as a local moving service
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Expanded to serve all of Orange County
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Added commercial moving services
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Became the region's most trusted moving company
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Add displayName for React DevTools
OurStory.displayName = 'OurStory';

export default OurStory;
