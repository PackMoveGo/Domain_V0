import React from 'react';
import { JWT_AUTH } from '../../util/jwtAuth';

const UserDisplay: React.FC = () => {
  const storedUser = JWT_AUTH.getUserInfo();
  const timeUntilExpiration = JWT_AUTH.getTimeUntilExpiration();
  const isExpired = JWT_AUTH.isTokenExpired();
  const needsRefresh = JWT_AUTH.needsRefresh();
  const isAuthenticated = JWT_AUTH.hasToken() && !isExpired;

  // Use stored user info
  const displayUser = storedUser;

  if (!isAuthenticated) {
    return (
      <div className="text-sm text-gray-600">
        Not authenticated
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-green-600">
        ✅ Authenticated as: {displayUser?.email || displayUser?.name || 'Unknown'}
      </div>
      <div className="text-xs text-gray-600">
        Token: {JWT_AUTH.hasToken() ? '✅ Present' : '❌ Missing'}
      </div>
      <div className="text-xs text-gray-600">
        Expired: {isExpired ? '❌ Yes' : '✅ No'}
      </div>
      <div className="text-xs text-gray-600">
        Needs Refresh: {needsRefresh ? '⚠️ Yes' : '✅ No'}
      </div>
      <div className="text-xs text-gray-600">
        Time Left: {timeUntilExpiration !== null ? `${timeUntilExpiration} minutes` : 'Unknown'}
      </div>
      <div className="text-xs text-gray-600">
        User ID: {displayUser?.id || 'Unknown'}
      </div>
      <button
        onClick={() => JWT_AUTH.clearToken()}
        className="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default UserDisplay; 