import React from 'react';

const ScrollingBanner: React.FC = () => {
  const bannerText = "Opening January 1st in Orange County create an account to be added to mailing list for lifetime 10% OFF";
  
  // Create separator and repeated text for seamless loop
  const separator = ' • ';
  const fullText = bannerText + separator;

  return (
    <div className="w-full bg-orange-500 text-white py-2 overflow-hidden relative z-50">
      <div className="flex animate-scroll-banner whitespace-nowrap">
        {/* First set of text */}
        <span className="text-sm font-medium px-4 inline-block">
          {fullText}
        </span>
        {/* Second set of text for seamless loop */}
        <span className="text-sm font-medium px-4 inline-block">
          {fullText}
        </span>
        {/* Third set to ensure smooth transition */}
        <span className="text-sm font-medium px-4 inline-block">
          {fullText}
        </span>
      </div>
      
      <style>{`
        @keyframes scroll-banner {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-scroll-banner {
          animation: scroll-banner 25s linear infinite;
          display: inline-flex;
        }
      `}</style>
    </div>
  );
};

export default ScrollingBanner;

