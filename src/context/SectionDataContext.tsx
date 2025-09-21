
import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/service.apiSW';
import { getCurrentDate } from '../util/ssrUtils';

const initialState = {
  sections: [],
  loading: false,
  error: null,
  lastUpdated: null
};

interface SectionDataContextType {
  sections: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchSections: () => Promise<void>;
  refreshSections: () => Promise<void>;
  resetRetryCount: () => void;
}

const SectionDataContext = createContext<SectionDataContextType | undefined>(undefined);

export const SectionDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const fetchSections = useCallback(async () => {
    // Prevent infinite retries
    if (hasAttemptedFetch && retryCount >= 3) {
      console.warn('⚠️ Maximum retry attempts reached for sections fetch');
      return;
    }

    setLoading(true);
    setError(null);
    setHasAttemptedFetch(true);

    try {
      // Use the new service.apiSW service to fetch sections
      const response = await api.getSections?.() || { sections: [] };
      
      if (response.sections) {
        setSections(response.sections);
        setLastUpdated(getCurrentDate());
        setRetryCount(0); // Reset retry count on success
      } else {
        setError('No sections data received');
        setRetryCount(prev => prev + 1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sections';
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Log error but don't spam console
      if (retryCount < 2) {
        console.warn(`⚠️ Sections fetch failed (attempt ${retryCount + 1}/3):`, errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount, hasAttemptedFetch]);

  const refreshSections = useCallback(async () => {
    await fetchSections();
  }, [fetchSections]);

  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    setHasAttemptedFetch(false);
    setError(null);
  }, []);

  return (
    <SectionDataContext.Provider value={{
      sections,
      loading,
      error,
      lastUpdated,
      fetchSections,
      refreshSections,
      resetRetryCount
    }}>
      {children}
    </SectionDataContext.Provider>
  );
};

export const useSectionData = () => {
  const context = useContext(SectionDataContext);
  if (!context) {
    throw new Error('useSectionData must be used within SectionDataProvider');
  }
  return context;
}; 