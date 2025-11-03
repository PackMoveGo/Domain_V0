import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Section {
  id: string;
  name: string;
  content: string;
}

interface SectionDataContextType {
  sections: Section[];
  loading: boolean;
  error: string | null;
  fetchSections: () => Promise<void>;
}

const SectionDataContext = createContext<SectionDataContextType | undefined>(undefined);

export const useSectionData = () => {
  const context = useContext(SectionDataContext);
  if (!context) {
    throw new Error('useSectionData must be used within a SectionDataProvider');
  }
  return context;
};

interface SectionDataProviderProps {
  children: ReactNode;
}

export const SectionDataProvider: React.FC<SectionDataProviderProps> = ({ children }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      // Temporarily disabled for Next.js build
      setSections([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  const value: SectionDataContextType = {
    sections,
    loading,
    error,
    fetchSections,
  };

  return (
    <SectionDataContext.Provider value={value}>
      {children}
    </SectionDataContext.Provider>
  );
};