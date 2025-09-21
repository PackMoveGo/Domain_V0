import { api } from './service.apiSW';

export class AuthService {
  static async login(email: string, password: string) {
    return await api.login(email, password);
  }

  static async logout() {
    return await api.logout();
  }

  static async checkAuthStatus() {
    return await api.checkAuthStatus();
  }

  static isAuthenticated() {
    return api.isAuthenticated();
  }

  static getUser() {
    return api.getUser();
  }

  static getUserInfo() {
    return api.getUser();
  }

  static getAuthHeaders() {
    return api.getAuthHeaders();
  }

  static async refreshToken() {
    // This would typically call a refresh endpoint
    return await api.checkAuthStatus();
  }

  static async makeAuthenticatedRequest(endpoint: string) {
    // This would make an authenticated request
    return await api.getNav();
  }

  static getApiConfig() {
    return api.getConfig();
  }

  static getTimeUntilExpiration() {
    // This would calculate time until token expiration
    return '30'; // Placeholder
  }
} 