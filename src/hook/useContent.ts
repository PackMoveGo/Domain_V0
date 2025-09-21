/**
 * Simplified Content Hook
 * 
 * This hook provides a simple interface for loading data from service APIs.
 * The actual data loading logic is handled by the individual service classes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useCookiePreferences } from '../context/CookiePreferencesContext';
import { api } from '../services/service.apiSW';
import { handleApiError } from '../util/apiErrorHandler';

// Import individual data loaders from service APIs
import { 
  loadServicesData,
  loadTestimonialsData,
  loadRecentMovesData
} from '../services/public/service.homePageAPI';

import {
  loadCompanyInfoData,
  loadTeamMembersData,
  loadStatisticsData
} from '../services/public/service.aboutPageAPI';

import {
  loadContactInfoData,
  loadOfficeLocationsData,
  loadContactMethodsData
} from '../services/public/service.contactPageAPI';

export const useContent = (contentType: string) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cookiePreferences = useCookiePreferences();

  const fetchContent = useCallback(async () => {
    if (!cookiePreferences.hasMadeChoice || cookiePreferences.hasOptedOut) {
      setError('Cookie consent required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      
      // Use individual data loaders from service APIs
      switch (contentType) {
        case 'homepage':
          console.log('🎯 [HOOK] useContent - Loading home page data...');
          // For homepage, we'll use the consolidated API
          const homeData = await api.getHomePageData();
          result = { data: homeData, error: null, loading: false };
          break;
        case 'services':
          result = await loadServicesData();
          break;
        case 'testimonials':
          result = await loadTestimonialsData();
          break;
        case 'recent-moves':
          result = await loadRecentMovesData();
          break;
        case 'about':
          console.log('🎯 [HOOK] useContent - Loading about page data...');
          const aboutData = await api.getAboutPageData();
          result = { data: aboutData, error: null, loading: false };
          break;
        case 'contact':
          console.log('🎯 [HOOK] useContent - Loading contact page data...');
          const contactData = await api.getContactPageData();
          result = { data: contactData, error: null, loading: false };
          break;
        case 'company-info':
          result = await loadCompanyInfoData();
          break;
        case 'team-members':
          result = await loadTeamMembersData();
          break;
        case 'statistics':
          result = await loadStatisticsData();
          break;
        case 'contact-info':
          result = await loadContactInfoData();
          break;
        case 'office-locations':
          result = await loadOfficeLocationsData();
          break;
        case 'contact-methods':
          result = await loadContactMethodsData();
          break;
        // Fallback to direct API calls for other content types
        case 'blog':
          result = { data: await api.getBlog(), error: null, loading: false };
          break;
        case 'reviews':
          result = { data: await api.getReviews(), error: null, loading: false };
          break;
        case 'locations':
          result = { data: await api.getLocations(), error: null, loading: false };
          break;
        case 'supplies':
          result = { data: await api.getSupplies(), error: null, loading: false };
          break;
        case 'referral':
          result = { data: await api.getReferral(), error: null, loading: false };
          break;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }

      setContent(result.data);
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
      
      // Use centralized error handling
      handleApiError(err, contentType, {
        context: 'useContent Hook',
        showModal: true,
        logError: true
      });
    } finally {
      setLoading(false);
    }
  }, [contentType, cookiePreferences.hasMadeChoice, cookiePreferences.hasOptedOut]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, loading, error, refetch: fetchContent };
};

// Hook to check API health
export const useApiHealth = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.checkHealth();
      setHealth(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check API health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return { 
    health, 
    loading, 
    isLoading: loading, 
    error, 
    refetch: checkHealth 
  };
};

// Individual content hooks for backward compatibility
export const useBlog = () => {
  const result = useContent('blog');
  return {
    data: result.content,
    content: result.content,
    isLoading: result.loading,
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  };
};

export const useServices = () => {
  const result = useContent('services');
  return {
    data: result.content,
    content: result.content,
    isLoading: result.loading,
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  };
};

export const useTestimonials = () => {
  const result = useContent('testimonials');
  return {
    data: result.content,
    content: result.content,
    isLoading: result.loading,
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  };
};

export const useLocations = () => {
  const result = useContent('locations');
  return {
    data: result.content,
    content: result.content,
    isLoading: result.loading,
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  };
};

// =============================================================================
// HOME PAGE SPECIFIC HOOKS (Using Service APIs)
// =============================================================================

/**
 * Hook for home page data using service API
 */
export const useHomePageData = () => {
  const result = useContent('homepage');
  return {
    data: result.content,
    content: result.content,
    isLoading: result.loading,
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  };
};

/**
 * Hook for services data using service API
 */
export const useHomePageServices = () => {
  const result = useContent('services');
  return {
    data: result.content,
    content: result.content,
    isLoading: result.loading,
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  };
};

/**
 * Hook for testimonials data using service API
 */
export const useHomePageTestimonials = () => {
  const result = useContent('testimonials');
  return {
    data: result.content,
    content: result.content,
    isLoading: result.loading,
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  };
};

/**
 * Hook for recent moves data using service API
 */
export const useHomePageRecentMoves = () => {
  const result = useContent('recent-moves');
  return {
    data: result.content,
    content: result.content,
    isLoading: result.loading,
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  };
};