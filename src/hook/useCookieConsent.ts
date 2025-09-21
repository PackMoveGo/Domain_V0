import { useCookiePreferences } from '../context/CookiePreferencesContext';

export const useCookieConsent = () => {
  const { hasConsent, isWaitingForConsent, isApiBlocked } = useCookiePreferences();
  
  return {
    hasConsent,
    isWaitingForConsent,
    isApiBlocked,
  };
};

