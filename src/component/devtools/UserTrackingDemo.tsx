import React, { useState, useEffect } from 'react';
import { useUserTracking, useTrackUserAction, useTrackEngagement, useTrackLocation } from '../../hook/useUserTracking';

interface UserTrackingDemoProps {
  serverUrl: string;
}

export const UserTrackingDemo: React.FC<UserTrackingDemoProps> = ({ serverUrl }) => {
  const [userInfo, setUserInfo] = useState({ userId: '', email: '', role: '' });
  const [analytics, setAnalytics] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize user tracking
  const {
    setUserInfo: setTrackingUserInfo,
    trackCustomEvent,
    getAnalytics,
    isInitialized
  } = useUserTracking({
    serverUrl,
    enableLocation: true,
    enableInteractions: true,
    enablePing: true,
    debug: true
  });

  // Get specific tracking hooks
  const {
    trackClick,
    trackFormSubmit,
    trackVideoPlay,
    trackDownload
  } = useTrackUserAction();

  const {
    trackScroll,
    trackTimeOnPage
  } = useTrackEngagement();

  const {
    getCurrentLocation
  } = useTrackLocation();

  // Update analytics display
  useEffect(() => {
    const interval = setInterval(() => {
      const currentAnalytics = getAnalytics();
      setAnalytics(currentAnalytics);
      setIsConnected(currentAnalytics.sessionId ? true : false);
    }, 1000);

    return () => clearInterval(interval);
  }, [getAnalytics]);

  const handleSetUserInfo = () => {
    if (userInfo.userId) {
      setTrackingUserInfo(userInfo.userId, userInfo.email, userInfo.role);
    }
  };

  const handleTrackCustomEvent = () => {
    trackCustomEvent('demo_event', {
      category: 'demo',
      action: 'button_click',
      label: 'demo_button'
    });
  };

  const handleTrackVideoPlay = () => {
    trackVideoPlay('demo_video_123', {
      videoTitle: 'Demo Video',
      duration: 120
    });
  };

  const handleTrackDownload = () => {
    trackDownload('demo_file.pdf', {
      fileSize: '2.5MB',
      fileType: 'pdf'
    });
  };

  const handleTrackScroll = () => {
    trackScroll(75, {
      page: window.location.pathname,
      scrollDirection: 'down'
    });
  };

  const handleTrackTimeOnPage = () => {
    trackTimeOnPage(30000, {
      page: window.location.pathname,
      engagement: 'high'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔍 User Tracking System Demo
        </h1>

        {/* Connection Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Connected to Server' : 'Disconnected'}
          </div>
          {isInitialized && (
            <span className="ml-4 text-sm text-gray-600">
              Session ID: {analytics?.sessionId?.substring(0, 20)}...
            </span>
          )}
        </div>

        {/* User Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">👤 Set User Info</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="User ID"
                value={userInfo.userId}
                onChange={(e) => setUserInfo(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={userInfo.email}
                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Role"
                value={userInfo.role}
                onChange={(e) => setUserInfo(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSetUserInfo}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Set User Info
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">📍 Location Status</h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Permission:</span> {analytics?.locationPermission || 'unknown'}
              </p>
              {analytics?.location && (
                <div className="text-sm">
                  <p><span className="font-medium">Latitude:</span> {analytics.location.latitude}</p>
                  <p><span className="font-medium">Longitude:</span> {analytics.location.longitude}</p>
                  <p><span className="font-medium">Accuracy:</span> {analytics.location.accuracy}m</p>
                </div>
              )}
              <button
                onClick={() => getCurrentLocation()}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Get Current Location
              </button>
            </div>
          </div>
        </div>

        {/* Tracking Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🖱️ Click Tracking</h3>
            <button
              onClick={() => trackClick('demo-button', { category: 'demo' })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Track Click
            </button>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📝 Form Tracking</h3>
            <button
              onClick={() => trackFormSubmit('demo-form', { formType: 'contact' })}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Track Form Submit
            </button>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🎬 Video Tracking</h3>
            <button
              onClick={handleTrackVideoPlay}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
            >
              Track Video Play
            </button>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📥 Download Tracking</h3>
            <button
              onClick={handleTrackDownload}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
            >
              Track Download
            </button>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📜 Scroll Tracking</h3>
            <button
              onClick={handleTrackScroll}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Track Scroll
            </button>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">⏱️ Time Tracking</h3>
            <button
              onClick={handleTrackTimeOnPage}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Track Time on Page
            </button>
          </div>
        </div>

        {/* Custom Events */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎯 Custom Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleTrackCustomEvent}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Track Custom Event
            </button>
            <button
              onClick={() => trackCustomEvent('page_view', { page: '/demo' })}
              className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
            >
              Track Page View
            </button>
          </div>
        </div>

        {/* Analytics Display */}
        {analytics && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">📊 Live Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Page Views</p>
                <p className="text-gray-600">{analytics.pageViews?.length || 0}</p>
              </div>
              <div>
                <p className="font-medium">Interactions</p>
                <p className="text-gray-600">{analytics.interactionCount || 0}</p>
              </div>
              <div>
                <p className="font-medium">Session Duration</p>
                <p className="text-gray-600">
                  {Math.round((Date.now() - (analytics.sessionStart || Date.now())) / 1000)}s
                </p>
              </div>
              <div>
                <p className="font-medium">Last Activity</p>
                <p className="text-gray-600">
                  {Math.round((Date.now() - (analytics.lastActivity || Date.now())) / 1000)}s ago
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTrackingDemo; 