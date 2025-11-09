// JWT Authentication Utilities
// This file provides JWT authentication utilities for development and debugging

import { api } from '../services/service.apiSW';

// JWT Authentication interface for development tools
export const JWT_AUTH = {
  // Get user information from stored token
  getUserInfo: () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return null;
      
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id || payload.sub,
        email: payload.email,
        name: payload.name,
        exp: payload.exp
      };
    } catch (error) {
      console.warn('Failed to decode JWT token:', error);
      return null;
    }
  },

  // Check if token exists
  hasToken: () => {
    return !!localStorage.getItem('jwt_token');
  },

  // Check if token is expired
  isTokenExpired: () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return true;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (_error) { // Reserved for future use
      return true;
    }
  },

  // Get time until token expiration in minutes
  getTimeUntilExpiration: () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = payload.exp - currentTime;
      
      return Math.max(0, Math.floor(timeLeft / 60));
    } catch (_error) { // Reserved for future use
      return null;
    }
  },

  // Check if token needs refresh
  needsRefresh: () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return true;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = payload.exp - currentTime;
      
      // Consider refresh needed if less than 5 minutes left
      return timeLeft < 300;
    } catch (_error) { // Reserved for future use
      return true;
    }
  },

  // Get authentication status
  getAuthStatus: () => {
    return {
      hasToken: JWT_AUTH.hasToken(),
      isExpired: JWT_AUTH.isTokenExpired(),
      needsRefresh: JWT_AUTH.needsRefresh(),
      timeUntilExpiration: JWT_AUTH.getTimeUntilExpiration(),
      userInfo: JWT_AUTH.getUserInfo()
    };
  },

  // Clear stored token
  clearToken: () => {
    localStorage.removeItem('jwt_token');
    console.log('🔐 JWT token cleared');
  }
};

// Set test token for development
export const setTestToken = (token: string) => {
  localStorage.setItem('jwt_token', token);
  console.log('🔐 Test JWT token set');
};

// Test JWT authentication
export const testJwtAuth = async () => {
  try {
    const status = JWT_AUTH.getAuthStatus();
    console.log('🔐 JWT Authentication Status:', status);
    
    // Test API authentication
    const authStatus = await api.checkAuthStatus();
    console.log('🔐 API Authentication Status:', authStatus);
    
    return {
      success: true,
      localStatus: status,
      apiStatus: authStatus
    };
  } catch (error) {
    console.error('🔐 JWT Authentication Test Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
