import React from 'react';

interface HeroAboutProps {
  // Add any props if needed in the future
}

const HeroAbout: React.FC<HeroAboutProps> = () => {
  return (
    <section className="bg-blue-600 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">About Pack Move Go</h1>
          <p className="text-xl mb-8">
            Pack Move Go is a dedicated moving company in Orange County committed to helping people move in and out and transport their belongings. 
            Our team is passionate about providing excellent customer service and making the moving process as smooth as possible. 
            We pride ourselves on being reliable and efficient, and we treat our customers' belongings with the utmost care and respect.
          </p>
        </div>
      </div>
    </section>
  );
};

// Add displayName for React DevTools
HeroAbout.displayName = 'HeroAbout';

export default HeroAbout;
