
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { logger } from '../util/debug';

const isProduction = process.env.NODE_ENV === 'production';

interface SectionVerificationState {
  isTampered: boolean;
  showWarning: boolean;
  verificationDetails: any;
  lastVerified: number | null;
}

interface SectionVerificationContextType extends SectionVerificationState {
  verifySections: (sections: string[], path: string) => Promise<void>;
  dismissWarning: () => void;
}

const initialState: SectionVerificationState = {
  isTampered: false,
  showWarning: false,
  verificationDetails: null,
  lastVerified: null
};

const SectionVerificationContext = createContext<SectionVerificationContextType | undefined>(undefined);

export const useSectionVerification = () => {
  const context = useContext(SectionVerificationContext);
  if (!context) {
    throw new Error('useSectionVerification must be used within a SectionVerificationProvider');
  }
  return context;
};

interface SectionVerificationProviderProps {
  children: ReactNode;
}

export const SectionVerificationProvider: React.FC<SectionVerificationProviderProps> = ({ children }) => {
  const [state, setState] = useState<SectionVerificationState>(initialState);



  const verifySections = useCallback(async (sections: string[], path: string) => {
    try {
      // Skip verification in production since the backend endpoint doesn't exist
      // This was causing 405 errors on /api/verify-sections
      if (isProduction) {
        return;
      }



      // NOTE: This API call is commented out because the backend doesn't have this endpoint
      // If you want to implement section verification, add this endpoint to your backend
      /*
      const response = await fetch('/api/verify-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections, path }),
      });

      const data = await response.json();
      logger.debug('Verification response:', data);

      setState(prev => ({
        ...prev,
        isTampered: !data.isValid,
        showWarning: !data.isValid,
        verificationDetails: data.details,
        lastVerified: Date.now()
      }));

      if (!data.isValid) {
        logger.warn('Section verification failed:', data.details);
      }
      */
    } catch (error) {
      logger.error('Section verification error:', error);
      // Don't update state on network errors
    } finally {
      logger.groupEnd();
    }
  }, []);

  const dismissWarning = useCallback(() => {
    setState(prev => ({
      ...prev,
      showWarning: false
    }));
  }, []);

  const value = {
    ...state,
    verifySections,
    dismissWarning
  };

  return (
    <SectionVerificationContext.Provider value={value}>
      {children}
    </SectionVerificationContext.Provider>
  );
}; 