import { logger } from './debug';

export const verifySections = (sections: string[], path: string) => {
  // Only log once per session to reduce noise
  const logKey = 'section-verification-logged';
  if (sessionStorage.getItem(logKey)) {
    return {
      environment: logger.getEnvironment(),
      verificationStatus: logger.getEnvironment() === 'production' ? 'Enabled' : 'Disabled in Development',
      timestamp: new Date().toISOString(),
      sectionsCount: sections.length,
      path
    };
  }
  
  sessionStorage.setItem(logKey, 'true');
  
  const environment = logger.getEnvironment();
  const verificationStatus = environment === 'production' ? 'Enabled' : 'Disabled in Development';

  const result = {
    environment,
    verificationStatus,
    timestamp: new Date().toISOString(),
    sectionsCount: sections.length,
    path
  };

  return result;
}; 