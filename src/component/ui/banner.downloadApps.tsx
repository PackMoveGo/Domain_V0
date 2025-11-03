import React from 'react';

const DownloadApps: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">📱</div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Our Mobile App
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Manage your moves on the go with our mobile app. Book services, track your move, 
            and get real-time updates right from your phone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">App Features</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span>Instant quotes and booking</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span>Real-time move tracking</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span>Photo inventory management</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Download Now</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a 
                href="#" 
                className="flex items-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                  <div className="text-xs text-yellow-600 font-bold">COMING SOON!!!</div>
                </div>
              </a>
              
              <a 
                href="#" 
                className="flex items-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                  <div className="text-xs text-yellow-600 font-bold">COMING SOON!!!</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">Available for iOS and Android devices</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Learn More About Our App
          </button>
        </div>
      </div>
    </div>
  );
};

// Add displayName for React DevTools
DownloadApps.displayName = 'DownloadApps';

export default DownloadApps; 