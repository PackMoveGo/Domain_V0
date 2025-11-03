// Temporarily disabled for Next.js build
export interface ApiAuthConfig {
  isEnabled: boolean;
  frontendKey?: string;
  adminKey?: string;
  legacyKey?: string;
}

export const getApiAuthConfig = (): ApiAuthConfig => {
  return {
    isEnabled: false,
    frontendKey: undefined,
    adminKey: undefined,
    legacyKey: undefined
  };
};