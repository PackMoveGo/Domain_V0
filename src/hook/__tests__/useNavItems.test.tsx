import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavItems } from '../useNavItems';

// Mock the API service
jest.mock('../../services/service.apiSW', () => ({
  api: {
    getNav: jest.fn()
  }
}));

// Mock the API error handler
jest.mock('../../util/apiErrorHandler', () => ({
  handleApiError: jest.fn()
}));

describe('useNavItems Hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock window.dispatchEvent
    window.dispatchEvent = jest.fn();
  });

  it('should handle 503 errors silently with fallback navigation', async () => {
    const { api } = require('../../services/service.apiSW');
    
    // Mock 503 error
    const error503 = new Error('Service Unavailable');
    error503.message = '503 Service Unavailable';
    api.getNav.mockRejectedValueOnce(error503);

    const { result } = renderHook(() => useNavItems());

    // Wait for the hook to process the error
    await act(async () => {
      // Wait for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify that no API failure event was dispatched (handled by 503 simulation)
    expect(window.dispatchEvent).not.toHaveBeenCalled();

    // Verify error state
    expect(result.current.error).toBe('Navigation temporarily unavailable (503)');
    expect(result.current.items).toEqual([]);
  });

  it('should handle network errors with fallback navigation', async () => {
    const { api } = require('../../services/service.apiSW');
    
    // Mock network error
    const networkError = new Error('Failed to fetch');
    api.getNav.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useNavItems());

    // Wait for the hook to process the error
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify that no API failure event was dispatched (handled by API service)
    expect(window.dispatchEvent).not.toHaveBeenCalled();

    // Verify fallback navigation items are set
    expect(result.current.items).toEqual([
      { id: 'home', path: '/', label: 'Home' },
      { id: 'about', path: '/about', label: 'About' },
      { id: 'contact', path: '/contact', label: 'Contact' },
      { id: 'blog', path: '/blog', label: 'Blog' }
    ]);
  });

  it('should not trigger API failure event for non-network errors', async () => {
    const { api } = require('../../services/service.apiSW');
    
    // Mock a non-network error
    const validationError = new Error('Invalid data format');
    api.getNav.mockRejectedValueOnce(validationError);

    const { result } = renderHook(() => useNavItems());

    // Wait for the hook to process the error
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify that no API failure event was dispatched
    expect(window.dispatchEvent).not.toHaveBeenCalled();

    // Verify fallback navigation items are still set
    expect(result.current.items).toEqual([
      { id: 'home', path: '/', label: 'Home' },
      { id: 'about', path: '/about', label: 'About' },
      { id: 'contact', path: '/contact', label: 'Contact' },
      { id: 'blog', path: '/blog', label: 'Blog' }
    ]);
  });
});
